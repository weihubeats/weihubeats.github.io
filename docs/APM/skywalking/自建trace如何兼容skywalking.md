## 背景

早期项目使用的`trace`是`skywalking`

后续新项目使用自研的`trace`组件


旧项目暂时没空下掉`skywalking`接入新的`trace`组件

导致出现的问题是


A服务 -> B服务 -> C服务 -> D服务


总的调用链路如下

A服务使用`skywalking`进行`trace`传递到B服务

B服务也使用`skywalking`进行`trace`传递

B服务调用C服务，C服务没有接入`skywalking`

C服务使用新的`trace`组件进行`trace`传递

这时候c服务这里的`trace`就会断开

## 为什么trace会断开

核心原因就是`skywalking`中`trace`透传的方式和自建`trace`传递规则不同

`skywalking`通过`sw8`进行`trace`

而自建`trace`是通过别的请求头进行透传，所以自建`trace`在获取`skywalking`透传过来的`sw8`不会进行解析，导致`trace`断开

简单说法就是请求头变了

## 如何兼容


兼容方式也比较简单

我们在C服务获取`trace`的时候先从请求头获取，如果获取不到则兼容从`skywalking`中获取


比如我们的`HttpTracer` 原先的`trace`伪代码为

```java
String traceId = request.getHeader(ContextContainer.X_TRACE_ID);
```

原先是通过请求头获取

为了兼容`skywalking`，我们首先新增一个工具类

```java
@Slf4j
public class SkyWalkingAccessor {

    private static boolean skyWalkingPresent;

    private static Method traceIdMethod;

    private static Method spanIdMethod;

    static {
        try {
            Class<?> clazz = Class.forName("org.apache.skywalking.apm.toolkit.trace.TraceContext");
            traceIdMethod = clazz.getMethod("traceId");
            spanIdMethod = clazz.getMethod("spanId");
            skyWalkingPresent = true;
            log.info("SkyWalking Toolkit found. Tracer will support SkyWalking context propagation.");
        } catch (Throwable e) {
            log.debug("SkyWalking Toolkit not found. Fallback to internal trace generation.");
            skyWalkingPresent = false;
        }
    }

    /**
     * 获取 SkyWalking TraceId
     */
    public static String getTraceId() {
        if (!skyWalkingPresent) {
            return null;
        }
        try {
            String tid = (String) traceIdMethod.invoke(null);
            if (isValid(tid)) {
                return tid;
            }
        } catch (Exception e) {
            // 忽略异常，降级处理
        }
        return null;
    }

    /**
     * 获取 SkyWalking 当前 SpanId
     */
    public static String getSpanId() {
        if (!skyWalkingPresent) {
            return null;
        }
        try {
            Object result = spanIdMethod.invoke(null);
            if (result instanceof Integer) {
                int spanId = (Integer) result;
                if (spanId > -1) {
                    return String.valueOf(spanId);
                }
            }
        } catch (Exception e) {
            // 忽略异常
        }
        return null;
    }

    private static boolean isValid(String tid) {
        return StrUtil.isNotBlank(tid) && !"Ignored_Trace".equals(tid) && !"N/A".equals(tid);
    }
}
```

> 工具类为了不依赖`apm-toolkit-trace` jar，所以采用反射调用


然后原先的获取`traceId`的代码改造成如下方式

```java
            // 0. 从请求头提取 trace_id
            String traceId = request.getHeader(ContextContainer.X_TRACE_ID);

            // 兼容 SkyWalking: 如果 Header 没有，尝试从 SW 获取
            if (StrUtil.isBlank(traceId)) {
                traceId = SkyWalkingAccessor.getTraceId();
            }
```

## 使用

业务使用方式很简单

1. 引入依赖

```xml
<dependency>
    <groupId>org.apache.skywalking</groupId>
    <artifactId>apm-toolkit-trace</artifactId>
    <version>xxxx</version>
 </dependency>
```

2. 升级基础组件jar 版本

## 是否可以出一个jar帮忙引入apm-toolkit-trace依赖


这里实际上可以单独出一个模块比如叫`xxx-skywalking-adapt`

这样业务使用就无需手动引用`apm-toolkit-trace`依赖

直接将原先的依赖替换成`xxx-skywalking-adapt`即可

但是需要注意风险的是

如果是业务自己引入`apm-toolkit-trace`依赖，需要业务自己负责。

将`apm-toolkit-trace`依赖直接引入基础组件，需要基础组件的人负责


## 进阶方案 自己解析sw8请求头

`skywalking`的请求头是标准的协议，解析起来也不费劲

解析代码

```java
@Slf4j
public class Sw8Parser {

    private static final String HEADER_DELIMITER = "-";

    private static final int SW8_PART_COUNT = 8;

    public static final String HEADER_SW8 = "sw8";

    /**
     * 解析 sw8 头获取 TraceId
     * sw8 格式: Sample-TraceId-ParentTraceSegmentId-ParentSpanId-...
     * 所有字符串类型的字段都是 Base64 编码的
     */
    public static String getTraceId(String sw8Header) {
        if (StrUtil.isBlank(sw8Header)) {
            return null;
        }
        try {
            String[] parts = sw8Header.split(HEADER_DELIMITER);
            if (parts.length < SW8_PART_COUNT) {
                return null;
            }
            // 索引 1 是 TraceId，经过 Base64 编码
            String base64TraceId = parts[1];
            return new String(Base64.getDecoder().decode(base64TraceId), StandardCharsets.UTF_8);
        } catch (Exception e) {
            log.warn("Failed to parse sw8 traceId: {}", sw8Header);
            return null;
        }
    }

    /**
     * 解析 sw8 头获取 ParentSpanId
     */
    public static String getParentSpanId(String sw8Header) {
        if (StrUtil.isBlank(sw8Header)) {
            return null;
        }
        try {
            String[] parts = sw8Header.split(HEADER_DELIMITER);
            if (parts.length < SW8_PART_COUNT) {
                return null;
            }
            // 索引 3 是 ParentSpanId，直接是整数，没有 Base64
            return parts[3];
        } catch (Exception e) {
            return null;
        }
    }
}

```

## 总结

1. 新旧Trace组件共存导致链路断开的问题，核心原因是“透传协议不兼容”（请求头不一致）。

2. 解决这类问题的核心思路是“兼容适配”——让新组件能识别老组件的协议，实现上下文的平滑传递