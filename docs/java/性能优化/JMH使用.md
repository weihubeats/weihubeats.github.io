
## JMH简介

JMH (Java Microbenchmark Harness) 是 OpenJDK 团队开发的一个用于构建、运行和分析 Java 以及其他基于 JVM 语言的微基准测试（Microbenchmark）的工具。

它是一个专业的、高度精密的框架，旨在帮助开发者在 `JVM` 上准确地测量代码的性能

## 为什么需要JMH进行微基准测试

在 `JVM` 上进行准确的微基准测试非常困难，直接使用`System.nanoTime()` 或者简单的循环并不能得到可靠的性能测试结果

这主要是因为`JVM`在运行时会进行大量的优化，这些优化可能会极大地影响测量的准确性：

1. `JIT (Just-In-Time)` 编译器： `JVM` 会根据代码的执行情况进行即时编译，将热点代码编译成机器码以提高性能。这个过程本身需要时间，而且编译后的代码行为与解释执行时可能不同。简单的计时可能无法区分解释执行时间和编译后执行时间。

2. 死代码消除 (Dead Code Elimination)： 如果你的测试代码计算了一个结果，但这个结果在测试方法中没有被使用或返回，JIT 编译器可能会认为这段计算是“死代码”而将其完全优化掉，导致你测量的结果是零开销。

3. 常量折叠 (Constant Folding) 和逃逸分析 (Escape Analysis)： `JVM` 能够识别出在编译时就能确定的常量，或者确定对象不会逃逸出当前方法/线程，从而进行优化，例如将多次计算变为一次，或者在栈上分配对象而非堆上

4. 垃圾回收 (Garbage Collection)： GC 暂停会影响你性能测试

5. 分支预测 (Branch Prediction) 和缓存效应 (Cache Effects)： 这些底层硬件和操作系统层面的因素也会影响代码的执行速度，并且难以在简单的测试中控制。

6. 方法内联 (Method Inlining): 小方法可能会被`JIT`直接嵌入到调用它的地方，消除方法调用的开销。

7. 预热 (Warmup): `JVM` 和 `JIT` 编译器需要时间来“热身”，识别热点并进行优化。在优化完成之前测量的性能数据是不稳定的，不能代表代码在“完全优化”状态下的性能。

`JMH` 的目的就是通过精心设计的机制来应对这些挑战，提供一个相对可控和准确的环境来测量微小代码片段的性能

一些开源项目为了检验性能都会进行性能测试


## JMH 特性

- 处理`JVM`优化： 通过预热、运行多次迭代、防止死代码消除等方式，最大程度地减少`JIT`、`GC` 等因素对测量结果的影响。

- 多种测试模式： 支持吞吐量、平均时间、采样时间等多种性能指标测量。

- 状态管理： 允许定义和管理测试中使用的状态（数据），并控制状态的范围（Benchmark、Group、Thread）。

- 参数化测试： 支持通过`@Param` 注解使用不同的参数值运行同一基准测试方法。

- 控制运行环境： 可以控制线程数、JVM 分叉 (Fork) 数等，以模拟不同的并发场景和隔离测试。

- 丰富的输出： 提供详细的测试结果报告，包括得分、误差、单位等。

## JMH GitHub地址

https://github.com/openjdk/jmh

## 常用注解介绍



### @Benchmark

作用：标记一个方法作为基准测试方法。JMH 会自动发现、运行并测量所有被 `@Benchmark` 注解标记的 public 方法（通常在带有 @State 注解的类中）

用法：直接放在方法声明前。方法通常没有参数，或者只接收 @State 对象作为参数

```java
@Benchmark
public int myBenchmarkMethod() {
    // 需要测试性能的代码块
    return 1 + 1; 
}
```

### @BenchmarkMode

- 作用：定义基准测试的模式，即你想要测量的性能指标类型。可以作用于**类或方法**上。类级别的设置是默认值，方法级别的设置会覆盖类级别的设置

- 可选值：
    - Mode.Throughput: 测量单位时间内操作完成的次数。例如，ops/sec (operations per second)。适用于衡量系统的处理能力
    - Mode.AverageTime：测量每次操作执行的平均时间。例如，ns/op (nanoseconds per operation)。适用于衡量单个操作的开销
    - Mode.SampleTime：测量操作时间的分布情况，可以得到中位数、百分位数等。适用于了解操作延迟的分布，识别长尾延迟
    - Mode.SingleShotTime：测量代码执行单次（或指定次数）的的总时间。不进行循环，主要用于测试初始化开销或不适合重复执行的代码
    - Mode.All: 同时运行所有模式
- 用法：`@BenchmarkMode(Mode.AverageTime)` 或 `@BenchmarkMode({Mode.Throughput, Mode.AverageTime})`

### @OutputTimeUnit

- 作用：指定基准测试结果报告中使用的时间单位。作用于类或方法上
- 可选值：
    - TimeUnit.NANOSECONDS：纳秒。
    - TimeUnit.MICROSECONDS：微秒。
    - TimeUnit.MILLISECONDS：毫秒。
    - TimeUnit.SECONDS：秒。
- 用法：`@OutputTimeUnit(TimeUnit.NANOSECONDS)`


#### @State

- 作用：定义测试的状态（测试中用到的数据）。
- 可选值：
    - Scope.Benchmark：所有线程共享一个状态实例。
    - Scope.Thread：每个线程有自己的状态实例。
    - Scope.Group：每个线程组有自己的状态实例。

- 用法：@State(Scope.Thread)。

### @Setup

- 作用：定义基准测试的状态对象。测试中需要用到的可变数据（如对象、集合、连接等）应该放在一个带有 @State 注解的类中。JMH 会负责创建和管理这些状态对象的实例

- 可选范围 (Scope)：

- `Scope.Benchmark`: 同一个基准测试的所有线程共享同一个状态实例。适用于测试需要共享资源或全局状态的场景。
- `Scope.Thread`: 每个执行基准测试的线程都拥有自己的独立状态实例。这是最常用的范围，适用于测试线程本地的性能，避免线程间的干扰。
- `Scope.Group`: (较少用) 每个线程组共享一个状态实例


- 用法：加在初始化方法上。

### @TearDown

- 作用：标记一个方法在测试结束后运行，用于清理资源。

- 用法：加在清理方法上。



### @Warmup

- 作用：在这个阶段，JMH 运行你的基准测试代码，但不记录性能数据。目的是让 JVM 完成 JIT 编译、加载类、进行各种优化等，使得后续的测量阶段在稳定的“热”状态下进行
- 可选值：
    - iterations：预热迭代次数。
    - time：每轮预热迭代持续的时间
    - timeUnit：time 的时间单位（如 TimeUnit.SECONDS）
    - batchSize: 每轮迭代中执行操作的次数（默认是 1）

- 用法：`@Warmup(iterations = 5, time = 1, timeUnit = TimeUnit.SECONDS)`

### @Measurement

- 作用：配置测量阶段。在这个阶段，JMH 运行你的基准测试代码并记录性能数据。这些数据用于计算最终的得分
- 可选值：同@Warmup。
- 用法：`@Measurement(iterations = 5, time = 1, timeUnit = TimeUnit.SECONDS)`  表示进行 5 次测量迭代，每次迭代持续 1 秒

### @Fork

- 作用：指定运行基准测试的独立 JVM 进程数量。每个 Fork 会在一个全新的 JVM 进程中运行完整的 Warmup 和 Measurement 阶段。这有助于隔离不同基准测试之间的影响，避免 JVM 级别的状态（如系统属性、类加载器）相互干扰
- 用法：`@Fork(1)` 表示只在一个 JVM 进程中运行。`@Fork(value = 2, jvmArgs = "-Xmx1g")` 表示在两个 JVM 进程中运行，并为每个进程设置 JVM 参数。对于准确的微基准测试，通常建议 @Fork(1) 或更多，以确保隔离性。@Fork(0) 可以用于调试，它在当前 JVM 进程中运行，但不推荐用于正式测量

### @Threads

- 作用：指定运行基准测试的线程数。这对于测试并发性能非常有用

- 用法：`@Threads(1)` 表示单线程运行。`@Threads(4)` 表示使用 4 个线程同时运行基准测试方法。默认值是可用处理器的数量

```java
@State(Scope.Thread)
public static class ParamState {

    @Param({"10", "100", "1000"}) // 定义参数值列表
    public int size; // JMH 会将列表中的值注入到这个字段

    public int[] data;

    @Setup(Level.Trial)
    public void setup() {
        data = new int[size];
        // 初始化 data...
    }
}

@Benchmark
public int testParam(ParamState state) {
    // 使用 state.size 和 state.data 进行测试
    return state.data.length;
}
```

### @Param

- 作用： 参数化基准测试。允许同一个基准测试方法使用不同的输入参数值运行多次。这对于比较不同参数值对性能的影响非常方便

- 用法：@Param 注解标记 @State 类中的字段。JMH 会为 @Param 指定的每一个值运行一次完整的基准测试 Trial (Warmup + Measurement)

## 实战

### 添加依赖


```xml
        <dependency>
            <groupId>org.openjdk.jmh</groupId>
            <artifactId>jmh-core</artifactId>
            <version>1.36</version>
        </dependency>
        <dependency>
            <groupId>org.openjdk.jmh</groupId>
            <artifactId>jmh-generator-annprocess</artifactId>
            <version>1.36</version>
        </dependency>

```

### 简单示例


这里我们以测试加法和乘法的简单基准测试进行演示

```java
import org.openjdk.jmh.annotations.*;
import org.openjdk.jmh.runner.Runner;
import org.openjdk.jmh.runner.RunnerException;
import org.openjdk.jmh.runner.options.Options;
import org.openjdk.jmh.runner.options.OptionsBuilder;

import java.util.concurrent.TimeUnit;

@State(Scope.Thread) // 定义状态范围为线程：每个测试线程拥有独立的状态实例
@BenchmarkMode(Mode.AverageTime) // 测试模式：测量每次操作的平均执行时间
@OutputTimeUnit(TimeUnit.NANOSECONDS) // 输出时间单位：结果将以纳秒为单位显示
@Warmup(iterations = 5, time = 1, timeUnit = TimeUnit.SECONDS) // 预热配置：进行5次预热迭代，每次持续1秒
@Measurement(iterations = 5, time = 1, timeUnit = TimeUnit.SECONDS) // 测量配置：进行5次测量迭代，每次持续1秒
@Fork(1) // Fork配置：在1个独立的JVM进程中运行测试
@Threads(1) // Threads配置：使用1个线程运行测试（默认也是可用核数）
public class SimpleBenchmark {

    // ------ State (状态) ------
    // 将测试中需要用到的变量或对象定义在这里
    private int a;
    private int b;

    // ------ Setup (初始化) ------
    // @Setup 方法用于在测试开始前初始化状态
    // Level.Trial 表示在整个测试 Trial (Warmup + Measurement) 开始前执行一次
    @Setup(Level.Trial)
    public void setup() {
        System.out.println("Executing setup..."); // 可选：打印信息看 setup 何时执行
        a = 5; // 初始化变量 a
        b = 10; // 初始化变量 b
    }

    // ------ TearDown (清理) ------
    // @TearDown 方法用于在测试结束后进行清理
    // Level.Trial 表示在整个测试 Trial 结束后执行一次
    @TearDown(Level.Trial)
    public void teardown() {
        System.out.println("Executing teardown..."); // 可选：打印信息看 teardown 何时执行
        // 在这个简单例子中没有需要清理的资源，但复杂的测试可能需要关闭连接、文件等
    }

    // ------ Benchmarks (基准测试方法) ------

    @Benchmark // 标记这个方法是一个基准测试方法
    public int testAddition() {
        // 这是我们要测量性能的代码块：简单的加法
        // 返回结果有助于防止JMH优化掉整个计算（死代码消除）
        return a + b;
    }

    @Benchmark // 标记另一个基准测试方法
    public int testMultiplication() {
        // 这是我们要测量性能的代码块：简单的乘法
        // 返回结果有助于防止JMH优化掉整个计算
        return a * b;
    }

    // ------ Main Method (运行入口) ------
    // 用于启动 JMH Runner
    public static void main(String[] args) throws RunnerException {
        // 使用 OptionsBuilder 构建 JMH 运行选项
        Options opt = new OptionsBuilder()
            // 指定要运行的基准测试类，可以使用正则表达式
            // .include(SimpleBenchmark.class.getSimpleName()) // 精确匹配当前类
            .include(".*" + SimpleBenchmark.class.getSimpleName() + ".*") // 使用正则表达式匹配包含类名的任何方法
            // 可以通过这里覆盖注解中的配置，或者添加更多配置
            // .threads(2)
            // .forks(2)
            // .warmupIterations(3)
            // .measurementIterations(3)
            .build();

        // 创建并运行 JMH Runner
        new Runner(opt).run();
    }
}

```

输出信息

```java
Benchmark                           Mode  Cnt  Score   Error  Units
SimpleBenchmark.testAddition        avgt    5  0.559 ± 0.022  ns/op
SimpleBenchmark.testMultiplication  avgt    5  0.582 ± 0.233  ns/op
```

- Benchmark: 基准测试方法的名称 (类名.方法名)

- Mode：测试模式 (avgt 表示 AverageTime)

- Cnt：测量迭代的次数 (对应 @Measurement 的 iterations)

- Score： JMH 计算出的得分
    - 如果 Mode 是 AverageTime (avgt)，Score 是每次操作的平均时间
    - 如果 Mode 是 Throughput (thrpt)，Score 是每单位时间的平均操作次数

- Error：得分的置信区间误差 (通常是 99.9% 置信区间)。得分 ± Error 是得分可能落入的范围。误差越小，结果越稳定

- Units： 得分的单位
    - ns/op: 每次操作纳秒 (AverageTime)
    - ops/s: 每秒操作次数 (Throughput)
    - 其他单位取决于 @OutputTimeUnit 和 @BenchmarkMode



在上面的例子中，testAddition 的平均耗时是 0.628 纳秒/操作，testMultiplication 是 0.623 纳秒/操作。误差值给出了结果的可信度范围。在这个例子中，加法和乘法操作的性能非常接近，且都非常快（微秒甚至纳秒级别）


### 并发测试

下面的例子演示`Scope.Thread` 和 `Scope.Benchmark` 的区别，

以及 `@Threads` 的用法。我们将测试一个简单的计数器，看看在单线程和多线程下，使用不同`Scope` 的状态类有什么表现


```java
@State(Scope.Benchmark) // 默认 Scope，这里显式指定
@BenchmarkMode(Mode.Throughput) // 测试吞吐量：每秒执行的操作次数
@OutputTimeUnit(TimeUnit.SECONDS) // 输出单位：秒
@Warmup(iterations = 5, time = 1, timeUnit = TimeUnit.SECONDS)
@Measurement(iterations = 5, time = 1, timeUnit = TimeUnit.SECONDS)
@Fork(1)
public class StateScopeBenchmark {

    // --- State with Scope.Benchmark ---
    // 所有线程共享同一个 BenchmarkState 实例
    @State(Scope.Benchmark)
    public static class BenchmarkState {
        int counter = 0;
        AtomicInteger atomicCounter = new AtomicInteger(0);

        @Setup(Level.Trial)
        public void setup() {
            System.out.println("BenchmarkState Setup executed.");
            counter = 0;
            atomicCounter.set(0);
        }
    }

    // --- State with Scope.Thread ---
    // 每个线程拥有自己的 ThreadState 实例
    @State(Scope.Thread)
    public static class ThreadState {
        int counter = 0;

        @Setup(Level.Trial) // 注意这里 Level.Trial 对于 Scope.Thread 意味着每个线程在其 Trial 开始前执行一次
        public void setup() {
            System.out.println("ThreadState Setup executed by thread: " + Thread.currentThread().getName());
            counter = 0;
        }
    }

    // --- Benchmarks ---

    // 测试共享状态下的非同步计数器 (在多线程下会有问题)
    @Benchmark
    @Threads(4) // 使用4个线程运行此基准测试
    public int testSharedNonSyncCounter(BenchmarkState state) {
        // 在多线程下，这个操作是线程不安全的
        return state.counter++;
    }

    // 测试共享状态下的 AtomicInteger (线程安全)
    @Benchmark
    @Threads(4) // 使用4个线程运行此基准测试
    public int testSharedAtomicCounter(BenchmarkState state) {
        // AtomicInteger 提供了原子操作，是线程安全的
        return state.atomicCounter.getAndIncrement();
    }

    // 测试线程本地状态下的计数器 (天然线程安全)
    @Benchmark
    @Threads(4) // 使用4个线程运行此基准测试
    public int testThreadLocalCounter(ThreadState state) {
        // 每个线程有自己的 state 实例，操作自己的 counter，所以是线程安全的
        return state.counter++;
    }

    // 单线程运行共享状态的非同步计数器 (模拟单线程场景)
    @Benchmark
    @Threads(1) // 单线程运行
    public int testSharedNonSyncCounterSingleThread(BenchmarkState state) {
        return state.counter++;
    }


    // --- Main Method ---
    public static void main(String[] args) throws RunnerException {
        Options opt = new OptionsBuilder()
            .include(".*" + StateScopeBenchmark.class.getSimpleName() + ".*")
            .build();

        new Runner(opt).run();
    }
}
```

输出信息

```java
Benchmark                                                  Mode  Cnt           Score           Error  Units
StateScopeBenchmark.testSharedAtomicCounter               thrpt    5    44293326.270 ±   2074444.276  ops/s
StateScopeBenchmark.testSharedNonSyncCounter              thrpt    5  1258488879.438 ±  76233314.786  ops/s
StateScopeBenchmark.testSharedNonSyncCounterSingleThread  thrpt    5  1237277018.268 ± 431280040.241  ops/s
StateScopeBenchmark.testThreadLocalCounter                thrpt    5  5088064568.105 ± 597463435.932  ops/s
```

> 这里的模式是Mode.Throughput，吞吐量模式，`Score`越高，代表性能越强

- testSharedAtomicCounter 在多线程下操作共享的 AtomicInteger，它提供了原子递增操作。性能最低，因为原子操作需要使用CPU的原子指令，会导致线程间的协调开销

- testSharedNonSyncCounter 在多线程 (@Threads(4)) 下操作共享的非同步 counter。性能虽然高，但是结果是不正确的，因为线程间的竞争会导致计数不准确

- testSharedNonSyncCounterSingleThread 在单线程下操作共享的非同步 counter，性能与多线程非同步版本相似，因为单线程不需要同步机制

- testThreadLocalCounter 在多线程下操作线程本地的 counter，每个线程互不影响

### 参数化测试

```java
import org.openjdk.jmh.annotations.*;
import org.openjdk.jmh.runner.Runner;
import org.openjdk.jmh.runner.RunnerException;
import org.openjdk.jmh.runner.options.Options;
import org.openjdk.jmh.runner.options.OptionsBuilder;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.Random;

@State(Scope.Thread) // 每个线程拥有自己的状态实例
@BenchmarkMode(Mode.AverageTime) // 测量平均时间
@OutputTimeUnit(TimeUnit.MICROSECONDS) // 输出单位：微秒
@Warmup(iterations = 5, time = 1, timeUnit = TimeUnit.SECONDS)
@Measurement(iterations = 5, time = 1, timeUnit = TimeUnit.SECONDS)
@Fork(1)
@Threads(1) // 单线程测试，避免线程竞争对列表操作性能的影响
public class ParameterizedBenchmark {

    // --- State with @Param ---
    @State(Scope.Thread)
    public static class ListState {
        // 使用 @Param 定义参数，JMH 会自动为每个参数值运行一次完整的测试
        @Param({"100", "1000", "10000"}) // 测试列表大小为 100, 1000, 10000 的情况
        public int listSize; // 参数值会被注入到这个字段

        private List<Integer> list;
        private int elementToFind; // 用于 contains 操作的元素

        @Setup(Level.Trial)
        public void setup() {
            System.out.println("Setting up list with size: " + listSize);
            list = new ArrayList<>(listSize);
            Random random = new Random(12345); // 使用固定种子保证可重复性

            for (int i = 0; i < listSize; i++) {
                list.add(random.nextInt()); // 填充随机整数
            }
            // 选择一个可能在列表中的元素进行查找
            elementToFind = list.get(listSize / 2);
        }

        @TearDown(Level.Trial)
        public void teardown() {
            list = null;
        }
    }

    // --- Benchmarks ---

    @Benchmark
    public boolean testListContains(ListState state) {
        // 测试 ArrayList 的 contains 方法性能
        // state.listSize 会根据 @Param 的值变化
        // state.list 是根据当前的 listSize 构建的列表
        return state.list.contains(state.elementToFind);
    }

    // --- Main Method ---
    public static void main(String[] args) throws RunnerException {
        Options opt = new OptionsBuilder()
                .include(".*" + ParameterizedBenchmark.class.getSimpleName() + ".*")
                // 可以通过命令行参数指定要运行的参数，例如 -p listSize=100
                // .param("listSize", "100")
                .build();

        new Runner(opt).run();
    }
}
```

### 不同BenchmarkMode

```java
@State(Scope.Thread)
@Warmup(iterations = 5, time = 1, timeUnit = TimeUnit.SECONDS)
@Measurement(iterations = 5, time = 1, timeUnit = TimeUnit.SECONDS)
@Fork(1)
@Threads(1)
public class ModeBenchmark {

    private int value = 0;

    // --- Benchmarks ---

    @Benchmark
    @BenchmarkMode(Mode.AverageTime) // 测量每次操作的平均时间
    @OutputTimeUnit(TimeUnit.NANOSECONDS)
    public int testAverageTime() {
        // 简单的递增操作
        return value++;
    }

    @Benchmark
    @BenchmarkMode(Mode.Throughput) // 测量每秒操作次数
    @OutputTimeUnit(TimeUnit.SECONDS) // 结果单位是 ops/s
    public int testThroughput() {
        // 简单的递增操作
        return value++;
    }

    // --- Main Method ---
    public static void main(String[] args) throws RunnerException {
        Options opt = new OptionsBuilder()
            .include(".*" + ModeBenchmark.class.getSimpleName() + ".*")
            .build();

        new Runner(opt).run();
    }
}
```

- `testAverageTime` 使用 `Mode.AverageTime`，结果单位是 ns/op (纳秒/操作)。得分越低越好。

- `testThroughput` 使用 `Mode.Throughput`，结果单位是 ops/s (操作/秒)。得分越高越好

## 总结

JMH 是一个强大而专业的微基准测试工具，它能够帮助我们克服`JVM`优化带来的挑战，获取更准确的代码性能数据。

不过可以看到`JMH`的使用相对来说还是比较复杂的，想要写出合适的性能测试代码也是不容易的

如果早期对JMH不熟悉我们也可以多参考一些开源项目写的JMH程序。

比如我们可以参考[jackson](https://github.com/FasterXML/jackson-benchmarks)的性能测试代码，jackson单独提供了一个jackson-benchmarks进行性能测试，非常多的性能测试代码供我们学习研究

注意的高性能队列`disruptor`也有大量`JMH`测试代码，我们可以去学习
- [disruptor](https://github.com/LMAX-Exchange/disruptor/blob/master/src/jmh/java/com/lmax/disruptor/ArrayAccessBenchmark.java)

我们还需要注意微基准测试环境非常脆弱，任何微小的改动或外部干扰都可能影响结果。运行基准测试时，尽量在一个干净、稳定的环境中进行


## 参考

- https://github.com/openjdk/jmh
- https://github.com/FasterXML/jackson-benchmarks
- https://github.com/openmessaging/benchmark
- https://github.com/LMAX-Exchange/disruptor/tree/master/src/jmh/java/com/lmax/disruptor