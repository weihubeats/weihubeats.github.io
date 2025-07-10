
## 背景

`Netty`借鉴jem实现了自己的内存池管理

如果内存池化在使用过程中不归还就会导致内存泄漏

`Netty`为了方便用户排查内存泄漏问题，提供了泄漏检查机制


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

## 内存泄漏检测等级

主要是通过`ResourceLeakDetector.Level`这个枚举控制的


等级|说明|采样率|性能影响|适用场景
:--:|:--:|:--:|:--:|:--:
DISABLED|完全关闭泄漏检测功能|0%|无|生产环境中对性能有极高要求，且确信没有内存泄漏问题
SIMPLE|仅报告是否发生了泄漏，不提供详细的创建和泄漏位置|1%|极小|生产环境中需要基本泄漏检测但又不希望影响性能
ADVANCED|报告泄漏并提供资源创建时的堆栈跟踪信息|1%|小|默认设置，适合大多数生产环境
PARANOID|报告泄漏并提供完整的堆栈跟踪信息|100%|显著|开发和测试环境，特别是在调试内存泄漏问题时

## 测试验证

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
	com.cider.MyLeakTest.allocate(MyLeakTest.java:59)
```

可以看到出现内存泄漏后打印了完整的堆栈信息



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