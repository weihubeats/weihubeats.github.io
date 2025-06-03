## 背景

随着 `JDK 21`的发布，虚拟线程已经成为正式发布过能耐(Virtual Threads)。

- https://openjdk.org/jeps/444



所以今天我们来初体验下`Spring Boot`项目下虚拟线程的使用，并通过基准测试对比其与传统平台线程池在处理模拟I/O密集型任务时的行为和性能表现


## 版本

为确保实验环境的一致性，我们采用以下技术栈：

- JDK: 21 (确保使用已正式发布虚拟线程的版本)
- Spring Boot: 3.4.1



```xml
    <properties>
        <maven.compiler.source>21</maven.compiler.source>
        <maven.compiler.target>21</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <spring-boot.version>3.4.1</spring-boot.version>
    </properties>

```


## 线程池、虚拟线程配置

为了在Spring Boot应用中使用不同类型的线程执行器，我们进行如下配置：



```java
@Configuration
public class ThreadConfig {

    @Bean(name = "virtualThreadExecutor")
    public AsyncTaskExecutor virtualThreadExecutor() {
        return new TaskExecutorAdapter(Executors.newVirtualThreadPerTaskExecutor());
    }

    @Bean
    public TaskExecutor applicationTaskExecutor() {
        return new SimpleAsyncTaskExecutor("virtual-thread-") {{
            setVirtualThreads(true);
        }};
    }

    // 配置传统平台线程池
    @Bean(name = "platformThreadExecutor")
    public ThreadPoolTaskExecutor platformThreadExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(10);
        executor.setMaxPoolSize(20);
        executor.setQueueCapacity(Integer.MAX_VALUE);
        executor.setThreadNamePrefix("platform-task-");
        executor.setAllowCoreThreadTimeOut(true);
        executor.initialize();
        return executor;
    }
}

```

## 任务执行

首先我们编写一个模拟需要耗时执行的任务



```java
    private CompletableFuture<String> executeTask(int taskId, long delayMillis, String threadType) {
        long start = System.currentTimeMillis();
        try {
            // 模拟I/O阻塞（如网络请求、数据库访问等
            TimeUnit.MILLISECONDS.sleep(delayMillis);
            long end = System.currentTimeMillis();
            String result = String.format("Task %d completed by %s thread in %d ms",
                taskId, threadType, (end - start));
            return CompletableFuture.completedFuture(result);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return CompletableFuture.failedFuture(e);
        }
    }
```

## 线程池执行任务

```java
    @Async("platformThreadExecutor")
    public CompletableFuture<String> executeWithPlatformThread(int taskId, long delayMillis) {
        return executeTask(taskId, delayMillis, "platform");
    }
```

## 虚拟线程执行的任务

```java
    @Async("virtualThreadExecutor")
    public CompletableFuture<String> executeWithVirtualThread(int taskId, long delayMillis) {
        return executeTask(taskId, delayMillis, "virtual");
    }
```

`service`完整代码

```java
@Service
public class TaskService {

    // 使用虚拟线程执行的任务
    @Async("virtualThreadExecutor")
    public CompletableFuture<String> executeWithVirtualThread(int taskId, long delayMillis) {
        return executeTask(taskId, delayMillis, "virtual");
    }

    // 使用平台线程执行的任务
    @Async("platformThreadExecutor")
    public CompletableFuture<String> executeWithPlatformThread(int taskId, long delayMillis) {
        return executeTask(taskId, delayMillis, "platform");
    }

    // 模拟I/O阻塞操作
    private CompletableFuture<String> executeTask(int taskId, long delayMillis, String threadType) {
        long start = System.currentTimeMillis();
        try {
            // 模拟I/O阻塞（如网络请求、数据库访问等
            TimeUnit.MILLISECONDS.sleep(delayMillis);
            long end = System.currentTimeMillis();
            String result = String.format("Task %d completed by %s thread in %d ms",
                taskId, threadType, (end - start));
            return CompletableFuture.completedFuture(result);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return CompletableFuture.failedFuture(e);
        }
    }

}
```

##  性能测试代码

为了客观评估两种线程模型的性能差异，我们使用`JMH`（Java Microbenchmark Harness）进行基准测试。



```java
@State(Scope.Benchmark) // 测试状态在整个基准测试期间共享 (每个参数组合的Fork内)
@BenchmarkMode(Mode.AverageTime)  // 测量平均执行时间
@OutputTimeUnit(TimeUnit.MILLISECONDS) // 结果以毫秒为单位显示
@Fork(value = 2, warmups = 1) // 创建2个独立的JVM进程运行测试, 每个fork有1次预热fork (JMH的预热fork，非我们的warmup iterations)
@Warmup(iterations = 5, time = 1, timeUnit = TimeUnit.SECONDS) // 执行5次预热迭代，每次至少1秒
@Measurement(iterations = 5, time = 1, timeUnit = TimeUnit.SECONDS) // 测试时执行5次迭代，每次至少1秒
public class ThreadBenchmark {

    private ConfigurableApplicationContext context;
    private TaskService taskService;

    @Param({"100", "500"}) // 任务数量变量
    private int taskCount;

    @Param({"10", "20"}) // 每个任务的延迟时间 (ms)
    private long delayMillis;

    @Setup(Level.Trial) // 每个参数组合的测试开始前执行（包括所有warmup和measurement迭代）
    public void setup() {
        // 确保 Spring Boot 应用以正确的配置启动
        // 对于不同的测试参数，这会重新启动应用
        context = SpringApplication.run(VirtualThreadApplication.class);
        taskService = context.getBean(TaskService.class);
        System.out.println(String.format("Setup complete for taskCount=%d, delayMillis=%d", taskCount, delayMillis));
    }

    @TearDown(Level.Trial) // 每个参数组合的测试结束后执行
    public void tearDown() {
        if (context != null) {
            context.close();
        }
        System.out.println(String.format("TearDown complete for taskCount=%d, delayMillis=%d", taskCount, delayMillis));
    }

    @Benchmark
    public void platformThreads() {
        runTasks(false);
    }

    @Benchmark
    public void virtualThreads() {
        runTasks(true);
    }

    private void runTasks(boolean useVirtualThreads) {
        List<CompletableFuture<String>> futures = new ArrayList<>(taskCount);

        for (int i = 0; i < taskCount; i++) {
            CompletableFuture<String> future = useVirtualThreads ?
                taskService.executeWithVirtualThread(i, delayMillis) :
                taskService.executeWithPlatformThread(i, delayMillis);
            futures.add(future);
        }

        // 等待所有任务完成
        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
    }

    public static void main(String[] args) throws RunnerException {
        Options opt = new OptionsBuilder()
            .include(ThreadBenchmark.class.getSimpleName())
            // .output("benchmark_results.txt") // 可选：将结果输出到文件
            // .resultFormat(ResultFormatType.JSON) // 可选：结果格式
            .build();
        new Runner(opt).run();
    }
}

```


## 测试结果

- 测试机器
    - mac m1 16GB 8核


结果

```
Benchmark                        (delayMillis)  (taskCount)  Mode  Cnt      Score      Error  Units
ThreadBenchmark.platformThreads             10          100  avgt    4   1203.867 ±   66.124  ms/op
ThreadBenchmark.platformThreads             10          500  avgt    4   6277.386 ± 1035.555  ms/op
ThreadBenchmark.platformThreads             20          100  avgt    4   2344.135 ±  209.667  ms/op
ThreadBenchmark.platformThreads             20          500  avgt    4  11826.263 ±  607.184  ms/op
ThreadBenchmark.virtualThreads              10          100  avgt    4   1221.704 ±  129.822  ms/op
ThreadBenchmark.virtualThreads              10          500  avgt    4   5932.579 ±  229.471  ms/op
ThreadBenchmark.virtualThreads              20          100  avgt    4   2369.526 ±  392.578  ms/op
ThreadBenchmark.virtualThreads              20          500  avgt    4  11701.008 ±  563.251  ms/op
```
### 结果分析
### 1

`delayMillis = 10ms, taskCount = 100`:

- 平台线程: 1203.867 ms/op

- 虚拟线程: 1221.704 ms/op

两者性能非常接近，差异在误差范围内。平台线程池（最大20线程）处理100个10ms的任务，理论最短时间为 (100/20) * 10ms = 50ms。

实际远高于此，表明Spring @Async、CompletableFuture管理及任务分发等固定开销显著

### 2
delayMillis = 10ms, taskCount = 500:

- 平台线程: 6277.386 ms/op
- 虚拟线程: 5932.579 ms/op

虚拟线程在此场景下表现出约 5.5% 的性能优势。 平台线程池（最大20线程）处理500个10ms的任务，理论最短时间为 (500/20) * 10ms = 250ms。

此时，由于任务周转快（10ms延迟短）且数量多，平台线程池的并发限制（20个）和任务排队效应更为突出。虚拟线程能够更好地应对这种并发压力，因为它不受限于少量平台线程的直接绑定

### 3

delayMillis = 20ms, taskCount = 100:

- 平台线程: 2344.135 ms/op
- 虚拟线程: 2369.526 ms/op

性能再次非常接近。平台线程池理论最短时间为 (100/20) * 20ms = 100ms。与10ms延迟场景类似，固定开销仍然是总耗时的重要组成部分。

### 4

`delayMillis = 20ms, taskCount = 500`:

- 平台线程: 11826.263 ms/op
- 虚拟线程: 11701.008 ms/op

虚拟线程略快，但优势微乎其微（约1%）。平台线程池理论最短时间为 (500/20) * 20ms = 500ms。

当单个任务的阻塞时间增长（20ms），该阻塞时间本身在总耗时中的比重增加。

虽然平台线程池仍在大量排队，但相对而言，20ms的阻塞时间使得线程池限制带来的额外等待时间占总体的比例，相较于10ms延迟的场景有所下降。


## 为何虚拟线程的优势在此次测试中表现不一


### 平台线程池的限制与任务特性交互

- 我们的平台线程池最大并发为20。当taskCount（如500）远大于20时，大量任务会在平台线程池的队列中等待。

- 当delayMillis较短（10ms）且taskCount较高（500）时，任务周转快，队列堆积和线程竞争的效果被放大，此时虚拟线程通过其高并发能力展现出优势。

- 当delayMillis较长（20ms），单个任务的阻塞时间成为总耗时的主要部分。即使虚拟线程能更快地“接受”所有任务，但最终执行仍需等待阻塞结束。此时，如果固定开销也较大，平台线程池的排队所带来的额外耗时占总耗时的比例可能相对减小，导致与虚拟线程的差距缩小。

### 固定开销的主导作用

如前所述，测试中观察到的显著固定开销（远超sleep时间的部分）可能会掩盖线程模型本身的差异。如果这部分开销在两种模型下都差不多，那么只有当线程本身成为极端瓶颈时，虚拟线程的优势才能凸显。

### 虚拟线程的适用场景

虚拟线程的核心优势在于以极低的成本创建和管理大量（成千上万甚至数百万）并发的阻塞型任务。在本次测试中，最大任务量为500，虽然也对平台线程池（最大20）造成了压力，但可能还未达到能让虚拟线程的“数量级”优势完全碾压的程度。


## 如何进一步发挥虚拟线程的潜力

要在基准测试中更清晰地观察虚拟线程的优势，可以考虑：

1. 极大增加并发任务量 (taskCount)：例如，尝试 5000, 10000, 50000 等。

2. 测试更长的阻塞时间 (delayMillis)：观察在例如 100ms, 500ms 甚至数秒的阻塞下，两种模型的表现。

3. 模拟更真实的I/O操作：使用实际的网络调用或文件I/O代替Thread.sleep()，虽然这会引入更多变量，但也更贴近真实场景。

4. 关注资源消耗：除了执行时间，还可以关注测试过程中的内存占用、CPU利用率（尤其是载体线程池的CPU利用率），虚拟线程在这些方面通常有优势。


## 测试的局限性

由于本次次数仅在本地mac进行测试，也没有真实的业务场景进行测试。

所以本次性能测试仅供参考


## 总结


本次我们基于Spring Boot和JDK 21的JMH性能评测显示：

- 在低并发或固定开销占比较大的场景下，虚拟线程与配置合理的平台线程池（即使并发数有限）性能表现可能非常接近

- 当并发任务数量显著增加，特别是当任务的阻塞时间相对较短，导致平台线程池因并发数限制而产生大量排队时，虚拟线程开始展现出其处理高并发I/O密集型任务的优势（如在500任务、10ms延迟场景下约5.5%的提升）。

- 然而，如果单任务阻塞时间较长，或者系统中存在较大的固定任务处理开销，虚拟线程的优势可能会被削弱。
