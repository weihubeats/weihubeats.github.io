
## 为什么Netty会存在内存泄漏


在Java里面普通变成我们都是让JVM自动取垃圾回收(GC)，但是一旦用了`Netty`

为什么内存泄漏就成了我们需要重点关注的问题？

Netty 为了追求极致性能而采用的**堆外内存（Direct Memory）和内存池（Memory Pool）**技术

JVM 的堆内存是一个自动化管理的仓库，有垃圾回收员（GC）定期清理。

而 Netty 的内存池则像一个高性能的自助式仓库，你需要自己去前台（Allocator）借用一个储物柜（ByteBuf），用完后必须亲自归还钥匙（调用 `release()` 方法）。

如果你只借不还，储物柜就会被一直占用，最终导致整个仓库没有可用的储物柜。

这就是 `Netty` 中的内存泄漏——忘记释放通过内存池申请的`ByteBuf`。


## 内存泄漏检测核心实现

为了帮助开发者快速定位这些“有借无还”的`ByteBuf`，Netty 提供了一个强大的内置工具——`ResourceLeakDetector`（资源泄漏检测器）

`ResourceLeakDetector`的核心原理就是通过`DefaultResourceLeak` (弱引用)实现的

### 创建ByteBuf并进行包装跟踪

当一个被池化的`ByteBuf` 被创建时，`ResourceLeakDetector` 会为它创建一个对应的“哨兵”——`DefaultResourceLeak`（弱引用），并将这个“哨兵”注册到一个监控队列（ReferenceQueue）中

比如我们通过`PooledByteBufAllocator`创建`ByteBuf`对象的时候都会调用`toLeakAwareBuffer`方法，将`AbstractByteBuf`进行包装`XXLeakAwareByteBuf`(`SimpleLeakAwareByteBuf`或`AdvancedLeakAwareByteBuf`)

```java
    @Override
    protected ByteBuf newHeapBuffer(int initialCapacity, int maxCapacity) {
        PoolThreadCache cache = threadCache.get();
        PoolArena<byte[]> heapArena = cache.heapArena;

        final AbstractByteBuf buf;
        if (heapArena != null) {
            buf = heapArena.allocate(cache, initialCapacity, maxCapacity);
        } else {
            buf = PlatformDependent.hasUnsafe() ?
                    new UnpooledUnsafeHeapByteBuf(this, initialCapacity, maxCapacity) :
                    new UnpooledHeapByteBuf(this, initialCapacity, maxCapacity);
            onAllocateBuffer(buf, false, false);
        }
        return toLeakAwareBuffer(buf);
    }

    @Override
    protected ByteBuf newDirectBuffer(int initialCapacity, int maxCapacity) {
        PoolThreadCache cache = threadCache.get();
        PoolArena<ByteBuffer> directArena = cache.directArena;

        final AbstractByteBuf buf;
        if (directArena != null) {
            buf = directArena.allocate(cache, initialCapacity, maxCapacity);
        } else {
            buf = PlatformDependent.hasUnsafe() ?
                    UnsafeByteBufUtil.newUnsafeDirectByteBuf(this, initialCapacity, maxCapacity) :
                    new UnpooledDirectByteBuf(this, initialCapacity, maxCapacity);
            onAllocateBuffer(buf, false, false);
        }
        return toLeakAwareBuffer(buf);
    }

```

而`toLeakAwareBuffer(buf)`方法实际调用的就是`ResourceLeakDetector.track(T obj)`方法。

对`buf`进行包装的逻辑实际在`track(T obj)`方法

```java
    protected static ByteBuf toLeakAwareBuffer(ByteBuf buf) {
        ResourceLeakTracker<ByteBuf> leak;
        switch (ResourceLeakDetector.getLevel()) {
            case SIMPLE:
                leak = AbstractByteBuf.leakDetector.track(buf);
                if (leak != null) {
                    buf = new SimpleLeakAwareByteBuf(buf, leak);
                }
                break;
            case ADVANCED:
            case PARANOID:
                leak = AbstractByteBuf.leakDetector.track(buf);
                if (leak != null) {
                    buf = new AdvancedLeakAwareByteBuf(buf, leak);
                }
                break;
            default:
                break;
        }
        return buf;
    }
```

这里根据不同的采样率返回的可能是`SimpleLeakAwareByteBuf`或者`AdvancedLeakAwareByteBuf`

`AdvancedLeakAwareByteBuf`对象是继承`SimpleLeakAwareByteBuf`的

`SimpleLeakAwareByteBuf`中有有一个属性`ResourceLeakTracker<ByteBuf> leak`

```java
class SimpleLeakAwareByteBuf extends WrappedByteBuf {
   // 需要被探测的普通  ByteBuf
   private final ByteBuf trackedByteBuf;
   // ByteBuf 的弱引用 DefaultResourceLeak
   final ResourceLeakTracker<ByteBuf> leak;

   SimpleLeakAwareByteBuf(ByteBuf wrapped, ResourceLeakTracker<ByteBuf> leak) {
        this(wrapped, wrapped, leak);
    }

   SimpleLeakAwareByteBuf(ByteBuf wrapped, ByteBuf trackedByteBuf, ResourceLeakTracker<ByteBuf> leak) {
        super(wrapped);
        this.trackedByteBuf = ObjectUtil.checkNotNull(trackedByteBuf, "trackedByteBuf");
        this.leak = ObjectUtil.checkNotNull(leak, "leak");
    }
}
```

`leak`是`ByteBuf` 的弱引用,因为`ResourceLeakTracker`接口的默认实现是`DefaultResourceLeak`，继承了`WeakReference`

```java
    private static final class DefaultResourceLeak<T>
            extends WeakReference<Object> implements ResourceLeakTracker<T>, ResourceLeak 
```


### ByteBuf正常释放


当这个`ByteBuf`使用完成后会调用`release`进行释放,`release`方法会调用`closeLeak`方法关闭内存泄漏检测

```java
    @Override
    public boolean release(int decrement) {
        // // 引用计数为 0 
        if (super.release(decrement)) {
            // 关闭内存泄露的探测
            closeLeak();
            return true;
        }
        return false;
    }

    private void closeLeak() {
        // Close the ResourceLeakTracker with the tracked ByteBuf as argument. This must be the same that was used when
        // calling DefaultResourceLeak.track(...).
        boolean closed = leak.close(trackedByteBuf);
        assert closed;
    }
```

我们来看看`close`方法具体做了什么

- io.netty.util.ResourceLeakDetector.DefaultResourceLeak#close()

```java
        @Override
        public boolean close() {
            if (allLeaks.remove(this)) {
                // Call clear so the reference is not even enqueued.
                clear();
                headUpdater.set(this, null);
                return true;
            }
            return false;
        }
```

close就是将`DefaultResourceLeak` 从`allLeaks` 集合中删除，因为`allLeaks` 中保存的全部都是未被释放的`trackedByteBuf` 对应的 `DefaultResourceLeak `

然后调用`io.netty.util.ResourceLeakDetector.DefaultResourceLeak#close()`断开 `DefaultResourceLeak` 与 `trackedByteBuf` 的弱引用关联

`clone`方法中的`clear`实际还是调用的`java.lang.ref.Reference#clear`方法

断开弱引用关联后，当  `trackedByteBuf` 被 GC 之后，JVM 将不会把 `DefaultResourceLeak` 放入到  `_reference_pending_list` 中

会将 `DefaultResourceLeak` 与 `trackedByteBuf` 一起回收。这样一来，`refQueue` 中不会出现这个 `DefaultResourceLeak` ，`ResourceLeakDetector` 也就不会错误地探测到它了




###  ByteBuf非正常释放(内存泄漏)

如果`SimpleLeakAwareByteBuf`忘记释放，那么它对应的`DefaultResourceLeak` 就会一直停留在`allLeaks` 集合中

当 `SimpleLeakAwareByteBuf` 被 GC 之后，JVM 就会将 `DefaultResourceLeak` 放入到 `_reference_pending_list` 中

随后唤醒`ReferenceHandler` 线程将 `DefaultResourceLeak` 从 `_reference_pending_list` 中转移到 `refQueue`


当下一次内存分配的时候，如果命中内存泄露采样检测的概率，那么 `ResourceLeakDetector` 就会从 `refQueue` 中将收集到的所有 `DefaultResourceLeak` 挨个摘下，并判断它们是否仍然停留在 `allLeaks` 中。

如果仍然在 `allLeaks` 中，就说明该  `DefaultResourceLeak` 对应的 `ByteBuf` 发生了内存泄露，而具体的泄露路径就保存在 `DefaultResourceLeak` 栈中，最后将泄露路径以 `ERROR` 的日志级别打印出来。

```java
    private void reportLeak() {
        if (!needReport()) {
            clearRefQueue();
            return;
        }

        // Detect and report previous leaks.
        for (;;) {
            DefaultResourceLeak ref = (DefaultResourceLeak) refQueue.poll();
            if (ref == null) {
                break;
            }

            if (!ref.dispose()) {
                continue;
            }

            // 当探测到 ByteBuf 发生内存泄露之后，这里会获取 ByteBuf 相关的访问堆栈 
            String records = ref.getReportAndClearRecords();
            if (reportedLeaks.add(records)) {
                if (records.isEmpty()) {
                    reportUntracedLeak(resourceType);
                } else {
                    reportTracedLeak(resourceType, records);
                }

                LeakListener listener = leakListener;
                if (listener != null) {
                    listener.onLeak(resourceType, records);
                }
            }
        }
    }
```


`WeakReference`(弱引用)+ `ReferenceQueue`(引用队列)是很常见的资源回收使用方式

> `WeakReference`(弱引用)+ 或者 `PhantomReference`(虚引用)都可以实现资源回收，两者有什么区别呢？
> 感兴趣可以自己百度搜索


## 内存泄漏检测使用


Netty如果想要开启内存泄漏检测只需要使用如下代码
- 代码中设置

```java
        ResourceLeakDetector.setLevel(ResourceLeakDetector.Level.PARANOID);

```

- 系统属性设置

```java
        System.setProperty("io.netty.leakDetection.level", "PARANOID");
```

- JVM启动参数

```shell
-Dio.netty.leakDetection.level=paranoid
```

> 这是最推荐的方式，因为它无需修改代码，可以灵活地在不同环境中开启或关闭

## 频率

内存泄漏的采样间隔是128.意味着大约每 128 个对象中会挑选 1 个进行监控。

可以通过 JVM 参数 `-Dio.netty.leakDetection.samplingInterval` 来设置内存泄露探测的采样间隔

```java
public class ResourceLeakDetector<T> {

  static final int SAMPLING_INTERVAL;

  private static final String PROP_SAMPLING_INTERVAL = "io.netty.leakDetection.samplingInterval";

  private static final int DEFAULT_SAMPLING_INTERVAL = 128;

  SAMPLING_INTERVAL = SystemPropertyUtil.getInt(PROP_SAMPLING_INTERVAL, DEFAULT_SAMPLING_INTERVAL);
}

```

>  PARANOID 级别则会无视这个间隔，对每一个对象都进行监控


## 内存泄漏检测等级

主要是通过`ResourceLeakDetector.Level`这个枚举控制的


等级|说明|采样率|性能影响|适用场景
:--:|:--:|:--:|:--:|:--:
DISABLED|完全关闭泄漏检测功能|0%|无|生产环境中对性能有极高要求，且确信没有内存泄漏问题
SIMPLE|仅报告是否发生了泄漏，不提供详细的创建和泄漏位置|1%|极小|生产环境中需要基本泄漏检测但又不希望影响性能
ADVANCED|报告泄漏并提供资源创建时的堆栈跟踪信息|1%|小|默认设置，适合大多数生产环境
PARANOID|报告泄漏并提供完整的堆栈跟踪信息|100%|显著|开发和测试环境，特别是在调试内存泄漏问题时



## 测试验证


### 泄漏验证

```java
    public static final int _1MB = 1024 * 1024;
    public static final int _17MB = 17 * _1MB;

    private ScheduledExecutorService scheduledExecutorService;

    @BeforeEach
    public void init() {
        ResourceLeakDetector.setLevel(ResourceLeakDetector.Level.PARANOID);

        // 创建定时任务监控直接内存使用情况
        scheduledExecutorService = Executors.newSingleThreadScheduledExecutor();
        scheduledExecutorService.scheduleAtFixedRate(() -> {
            // 注意: 对于池化分配器，release()只是将内存归还到池中，不代表总内存会立即下降
            String s = PooledByteBufAllocator.DEFAULT.metric().toString();
            System.out.println("---[监控] Netty 内存池状态: " + s + " ---");
        }, 0, 1, TimeUnit.SECONDS);
    }

    @AfterEach
    public void cleanup() {
        // 测试结束后关闭调度器
        if (scheduledExecutorService != null && !scheduledExecutorService.isShutdown()) {
            scheduledExecutorService.shutdown();
            try {
                if (!scheduledExecutorService.awaitTermination(2, TimeUnit.SECONDS)) {
                    scheduledExecutorService.shutdownNow();
                }
            } catch (InterruptedException e) {
                scheduledExecutorService.shutdownNow();
                Thread.currentThread().interrupt();
            }
        }
    }

    /**
     * 统一的ByteBuf分配方法
     */
    private ByteBuf allocate(int capacity) {
        System.out.println("--> 开始分配ByteBuf (" + capacity / _1MB + "MB)");
        ByteBuf buffer = PooledByteBufAllocator.DEFAULT.directBuffer(capacity, Integer.MAX_VALUE);
        System.out.println("--> 成功分配ByteBuf: " + buffer);
        return buffer;
    }


    @Test
    public void testLeak_ShouldReportLeak() throws InterruptedException {
        for (int i = 0; i < 5; i++) {
            System.out.println("\n--- 第" + (i + 1) + "次分配 ---");
            // 分配后，buf变量在循环结束后就失去引用，GC会回收它
            // 由于没有release，ResourceLeakDetector会报告泄漏
            ByteBuf buf = allocate(_17MB);
            System.gc();
            TimeUnit.SECONDS.sleep(1);
        }
    }

```

运行测试用例会打印如下信息

```java
22:12:06.055 [main] ERROR io.netty.util.ResourceLeakDetector - LEAK: ByteBuf.release() was not called before it's garbage-collected. See https://netty.io/wiki/reference-counted-objects.html for more information.
Recent access records: 
Created at:
	io.netty.buffer.PooledByteBufAllocator.newDirectBuffer(PooledByteBufAllocator.java:402)
	io.netty.buffer.AbstractByteBufAllocator.directBuffer(AbstractByteBufAllocator.java:187)
	com.xiaozou.MyLeakTest.allocate(MyLeakTest.java:59)
```

可以看到出现内存泄漏后打印了完整的堆栈信息

### 正常验证

如果我们正常释放`ByteBuf`，则不会打印内存泄漏log

```java
    @Test
    public void testLeak_ShouldReleaseCorrectly() throws InterruptedException {
        System.out.println("=== 测试场景2: 正确释放ByteBuf (不期望看到LEAK日志) ===");
        for (int i = 0; i < 5; i++) {
            System.out.println("\n--- 第" + (i + 1) + "次分配并释放 ---");
            ByteBuf buf = allocate(_17MB);
            System.out.println("释放ByteBuf: " + buf);
            buf.release(); // 正确释放资源
        }

        System.out.println("\n分配和释放完成，等待观察内存情况...");
        System.gc();
        TimeUnit.SECONDS.sleep(3);
    }
```

## 总结

`Netty`的内存检测机制需要手动通过参数`-Dio.netty.leakDetection.level=paranoid`开启设置检测等级

内存泄漏检测必须等到`ByteBuf` 被 GC 之后，内存泄露才能探测的到

## 参考

- https://www.cnblogs.com/binlovetech/p/18531611