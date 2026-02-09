
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


## JVM 配置调优

Kafka 基于 JVM 运行，不合理的 JVM 配置会直接引发 GC 抖动、内存溢出等问题，AutoMQ 参考 LinkedIn 高负载集群（60 broker、50k 分区、800k msg/sec）给出最优配置：

```bash
# 堆内存（固定大小避免动态扩容）
-Xmx6g -Xms6g
# 元空间配置（稳定内存占用）
-XX:MetaspaceSize=96m -XX:MinMetaspaceFreeRatio=50 -XX:MaxMetaspaceFreeRatio=80
# G1GC 策略（低停顿、高吞吐）
-XX:+UseG1GC -XX:MaxGCPauseMillis=20 -XX:InitiatingHeapOccupancyPercent=35 -XX:G1HeapRegionSize=16M
-XX:+ExplicitGCInvokesConcurrent
```

- 堆内存：不建议超过 8GB，过大的堆会增加 G1GC 停顿时间；6GB 是经验证的高负载集群最优值（LinkedIn 集群 90% GC 停顿仅 21ms，Young GC < 1 次 / 秒）。

- JDK 版本：优先选择 Java 11/17（Java 8/11 已标记废弃，Kafka 4.0 移除支持）；启用 TLS 时，Java 11+ 性能提升显著（含 G1GC、CRC32C、紧凑字符串等优化）

## 硬件与操作系统调优（底层保障）



## 参考

- https://github.com/AutoMQ/automq/wiki/Kafka-Performance-Tuning:-Tips-&-Best-Practices