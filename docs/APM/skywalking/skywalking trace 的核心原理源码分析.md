## 核心概率

> 本文不聊 skywalking 字节码相关的实现，主要聊核心 trace的透传设计



## 核心数据模型

- `TraceSegment`（Segment 实例）：单线程内连续执行的一段 Span 集合。一个线程在一个 RPC/HTTP 请求处理过程中，对应一个 TraceSegment

- AbstractSpan（节点）：

    - EntrySpan：请求入口（如 Controller、MQ Consumer）。

    - LocalSpan：本地方法（如 Service 层的普通方法）。

    - ExitSpan：出口调用（如 Feign 客户端、JDBC 数据库查询、Redis 操作）

- SegmentRef（跨界指针）：关联不同 Segment（跨线程或跨服务）的纽带，保存了父 Segment 的 TraceId、SegmentId 和 SpanId

## Trace 收集机制

### 单线程收集


SkyWalking 的单线程收集逻辑，本质上就是一个基于 ThreadLocal 的显式栈（Stack）状态机

它的核心入口是 ContextManager，内部维护了一个 

`ThreadLocal<AbstractTracerContext>`


```java
// ContextManager.java (核心伪代码)
public class ContextManager {
    // 绑定当前线程的 TracingContext
    private static ThreadLocal<AbstractTracerContext> CONTEXT = new ThreadLocal<>();
    
    // ...
}
```

#### 入栈：createSpan（创建节点）

当方法被触发时（例如进入 UserService#getUser）：

```java
// TracingContext.java (核心收集逻辑)
public abstract class TracingContext implements AbstractTracerContext {
    private TraceSegment segment;                    // 当前线程的 Segment
    private LinkedList<AbstractSpan> activeSpanStack; // 活跃 Span 栈
    private int spanIdGenerator = 0;                  // Span ID 计数器

    @Override
    public AbstractSpan createLocalSpan(String operationName) {
        // 1. 获取栈顶当前的 Span，作为父节点
        AbstractSpan parentSpan = peek();
        int parentSpanId = parentSpan == null ? -1 : parentSpan.getSpanId();

        // 2. 创建新的 Span
        AbstractSpan span = new LocalSpan(spanIdGenerator++, parentSpanId, operationName);
        
        // 3. 将新 Span 压入栈顶，并存入 Segment
        push(span);
        segment.archive(span);
        
        return span;
    }
}
```

#### 出栈与归档：stopSpan（方法结束）

当方法执行完毕退出时：

```java
@Override
public boolean stopSpan(AbstractSpan span) {
    AbstractSpan activeSpan = peek();
    
    // 校验出栈顺序，确保栈顶是当前正在结束的 Span
    if (activeSpan == span) {
        // 1. 计算耗时
        span.finish(segment);
        // 2. 弹出栈顶
        pop();
    }

    // 3. 关键判断：当栈变空时，说明最外层入口方法已执行完毕！
    if (activeSpanStack.isEmpty()) {
        // 将整个 Segment 标记为完成，并推送到无锁队列（DataCarrier）异步上报
        this.finish();
        return true; 
    }
    return false;
}
```

## 核心 Trace 传递机制（跨线程与跨网络）

第一步：主线程“拍照”（capture）
主线程在提交任务前，调用 ContextManager.capture()

```java
// ContextManager.java
public static ContextSnapshot capture() {
    AbstractTracerContext context = CONTEXT.get();
    // 拍照：复制当前主线程的 TraceId、SegmentId、当前栈顶的 SpanId
    return context.capture(); 
}
```