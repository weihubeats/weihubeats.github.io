
## 吞吐与延迟的权衡

调优没有银弹，通常需要在两个目标中做取舍

- 低延迟 (Latency): 消息从生产到消费越快越好（适合实时交易、IM）。

- 高吞吐 (Throughput): 单位时间内处理的消息越多越好（适合日志分析、离线数仓）


## 监控指标 (Observability)

调优后，首先需要观察的就是各个指标变化，才能看出调整后的效果如何

主要观察的指标有如下四大类


### Broker Metrics

网络吞吐量、磁盘 I/O 速率、请求延迟、CPU 利用率、内存使用情况和副本不足的分区

### Producer Metrics

请求延迟、确认延迟、错误率和重试率

### Consumer Metrics 

消费者延迟、获取速率、获取延迟、提交延迟和重新平衡频率

### System Metrics

 CPU 负载、内存使用情况、磁盘 I/O、网络带宽和 JVM 指标（垃圾回收时间、堆内存使用情况）


 ## Broker优化

Broker 是集群的骨架，这里的配置通常需要重启生效。

### 网络与 I/O 线程

- 参数: num.network.threads (处理网络请求) 和 num.io.threads (处理磁盘读写)

- 建议: 根据 CPU 核数调整。如果 CPU 较强，适当增加这些线程数可以提升并发处理能力

### Socket Buffer

- 参数: socket.send.buffer.bytes 和 socket.receive.buffer.bytes。

- 建议: 对于高吞吐网络环境，应该调大这两个值，以匹配网卡（NIC）的缓冲区大小，防止 TCP 缓冲区成为瓶颈

### 日志段 (Log Segments)

- 参数: log.segment.bytes。

- 原理: Kafka 把数据切分成一个个文件（Segment）。

- 建议: 较大的 Segment 意味着文件句柄打开得更少，但清理过期数据时粒度会变粗。

## Consumer 端优化

消费端的瓶颈通常在于处理逻辑慢或拉取配置不当。

### Fetch Configuration (拉取配置)

- 参数: fetch.min.bytes。

- 作用: 告诉 Broker：“如果数据太少，先别给我，攒够了这么多字节再返回”。

- 建议: 调大该值可以减少消费者和 Broker 之间的请求次数（减少网络 RTT），提升有效吞吐

### 并发消费

- 策略: 一个 Partition 只能被同一个消费组里的一个消费者线程消费。

- 建议: 如果 Topic 有 10 个分区，你可以启动 10 个消费者线程来实现最大并发。如果消费者太少（比如 1 个），它就要一个人干 10 个分区的活

### Rebalancing (重平衡)

- 痛点: 频繁的重平衡会导致消费暂停（STW）。

- 参数: 调整 session.timeout.ms 和 heartbeat.interval.ms，避免因为短暂的网络抖动或 GC 停顿导致消费者被误判下线。


## 基础设施与硬件 (硬指标)

### 磁盘选择 (HDD vs SSD)

结论: 强烈推荐 SSD。

原因: 虽然 Kafka 主要是顺序写（HDD 也不慢），但在高并发场景下，多个 Topic 同时写入会导致磁头频繁跳跃（从顺序写退化为随机写）。此外，Log Compaction（日志压缩）和冷读（追赶历史数据）非常依赖随机 I/O 性能，SSD 有巨大优势。


### 分区策略 (Partitioning)

误区: 分区不是越多越好。

- 建议:

    - 太少: 限制了并发度（消费者数量受限）。

    - 太多: 导致 Broker 文件句柄爆炸，且 Leader 选举变慢。

最佳实践: 根据预估的吞吐量来规划分区数，通常建议单 Broker 的分区总数不要超过几千个。

## JVM

### 追求高吞吐 (High Throughput):

推荐: Parallel GC (-XX:+UseParallelGC)

### 追求低延迟 (Low Latency):

推荐: G1 GC (-XX:+UseG1GC)

### 追求极低停顿 (Minimal Pauses):

推荐: ZGC 或 Shenandoah

### 明确禁止:

CMS (已废弃，不建议使用)


- 堆内存：不建议超过 8GB，过大的堆会增加 G1GC 停顿时间；6GB 是经验证的高负载集群最优值（LinkedIn 集群 90% GC 停顿仅 21ms，Young GC < 1 次 / 秒）。

- JDK 版本：优先选择 Java 11/17（Java 8/11 已标记废弃，Kafka 4.0 移除支持）；启用 TLS 时，Java 11+ 性能提升显著（含 G1GC、CRC32C、紧凑字符串等优化）

## 总结

1. 硬件上: 能用 SSD 就别用 HDD。

2. 生产端: 无论如何都要把 `batch.size` 调大，把 `linger.ms` 设为非 0。

3. 消费端: 增加并行度，减少不必要的请求交互。

4. 架构上: 不要盲目增加分区数，根据吞吐量按需扩容


## 参考

- https://github.com/AutoMQ/automq/wiki/Kafka-Performance-Tuning:-Tips-&-Best-Practices