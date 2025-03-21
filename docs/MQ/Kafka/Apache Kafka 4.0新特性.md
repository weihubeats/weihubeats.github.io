>大家好，这里是**小奏**,觉得文章不错可以关注公众号**小奏技术**


## 背景
在2025年3月18日宣布发布`Apache Kafka` `4.0.0`版本

`Apache Kafka` `4.0.0` 是` Kafka`的一个重要里程碑，标志着其架构的重大转变。

标志着第一个完全不使用`Apache ZooKeeper`的主要版本

默认运行在`KRaft`模式下，简化了`Kafka`的部署和管理。

消除了维护单独`ZooKeeper`集成的复杂性。这一更改显著降低了运营开销，增强了可扩展性，并简化了管理任务

## 核心改动

改动包含`Kafka Broker`, `Controller`, `Producer`, `Consumer`和`Admin Client`

### KIP-848 消费者组性能优化

自`Apache Kafka 4.0.0`起，下一代消费者再平衡协议（KIP-848）正式发布（Generally Available, GA）。

该协议通过完全增量化的设计，不再依赖全局同步屏障，从而显著缩短了再平衡时间，同时提升了消费者组的可扩展性并简化了消费者的实现逻辑。

使用新协议的消费者组现称为消费者组（Consumer Groups），而使用旧协议的组称为经典组（Classic Groups）。

需注意，经典组仍可通过旧协议组成消费者组。



改进点|	旧协议（Classic）|	新协议（KIP-848）
:--:|--:|:--:|
再平衡机制|	全局同步屏障（所有消费者暂停等待协调器指令）|	增量式协调（消费者异步提交状态）
时间开销|	O(N)（N为消费者数量）|	O(1)（仅需局部协调）
资源占用|	高（需维护完整的组成员列表）	|低（仅维护必要元数据）
容错能力|	弱（单个消费者故障触发全组再平衡）|	强（故障影响范围局部化）
扩展性|	支持数百消费者|	支持数万消费者


`server`默认开启新协议

`consumer`必须通过设置`group.protocol=consumer`

详细说明参数[consumer_rebalance_protocol](https://kafka.apache.org/40/documentation.html#consumer_rebalance_protocol):https://kafka.apache.org/40/documentation.html#consumer_rebalance_protocol

### KIP-890 事务服务端防御机制

改进降低了生产者（Producer）发生故障时出现“僵尸事务”（Zombie Transactions）的概率

- 僵尸事务：当生产者因崩溃或网络故障无法提交或回滚事务时，事务协调器（Transaction Coordinator）可能残留未完成的事务状态，占用资源并可能引发数据不一致1。

- 旧客户端兼容性：旧版客户端在处理事务验证阶段返回的`NETWORK_EXCEPTION` 错误时，可能误判为致命错误，导致事务管理器进入不可恢复状态1。

2. 第二阶段的核心改进

1. 服务端事务验证增强

-   在生产者发送 Produce 和 TxnOffsetCommit 请求时，服务端主动与事务协调器验证事务状态，确保事务处于活跃或可提交状态，避免处理已失效的事务请求1。

- 新增错误转换逻辑，将网络异常（如 NETWORK_EXCEPTION）映射为客户端可重试的错误类型，提升旧客户端兼容性1。

2. 增量式错误处理

  - 网络超时与连接中断：若验证请求超时或连接中断，服务端返回可重试错误，而非直接终止事务。

- 并发控制优化：当多个验证请求并发时（如相同事务的 AddPartitionsToTxn 请求），通过错误码引导客户端重试，避免竞争条件1。

3. 僵尸事务检测与清理

- 服务端通过心跳超时机制检测僵尸事务，自动将其标记为终止状态，释放相关资源。

- 生产者恢复后，通过事务 ID 和纪元（Epoch）验证合法性，防止旧事务干扰新事务

详细说明参考[transaction_protocol](https://kafka.apache.org/40/documentation.html#transaction_protocol):https://kafka.apache.org/40/documentation.html#transaction_protocol

### KIP-932 Kafka 队列功能（早期预览版）

通过引入**共享群组（Share Group）** 的概念，支持基于 Kafka 主题的协作式消费模式。

KIP-932 并未直接在`Kafka`中新增“队列”这一数据结构，而是通过扩展现有主题的消费机制来满足队列场景的需求。

共享群组的功能类似于其他消息系统中的“持久化共享订阅”（Durable Shared Subscription）


### KIP-966：合格领导者副本（预览版）

`KIP-966` 在 `Kafka` `4.0` 中首次引入**合格领导者副本（Eligible Leader Replicas, ELR）** 的预览功能。ELR 是 ISR（In-Sync Replicas，同步副本）的子集，保证其数据完整性达到高水位线（High-Watermark）。ELR 可安全用于领导者选举，避免数据丢失

详细说明可以参考[eligible_leader_replicas](https://kafka.apache.org/40/documentation.html#eligible_leader_replicas)

### KIP-996：预投票机制

`KRaft`模式下，节点可能因瞬时网络问题（如 GC 暂停）误判领导者失联，触发不必要的选举，导致：

集群波动：频繁领导者切换影响吞吐量

元数据竞争：多个节点同时发起选举引发脑裂风险

2. 预投票机制原理

1. 预投票阶段：
节点感知领导者失联后，先向其他节点发送预投票请求（携带自身日志最新偏移量）

接收节点检查请求者日志是否足够新（避免落后副本成为领导者）

2. 正式选举：

- 仅当获得多数预投票认可后，节点才发起正式选举

- 否则进入冷却期（election.backoff.ms）

### KIP-1076：客户端应用指标（KIP-714 扩展）

KIP-714 允许集群管理员通过插件直接从`Broker`收集客户端指标，但仅覆盖 Kafka 原生客户端（生产者、消费者、Admin）。

KIP-1076 扩展此功能，支持嵌入式客户端（如 `Kafka Streams`）上报应用级指标，实现端到端性能监控。

### KIP-1106：消费者客户端支持基于时长的偏移重置

新增`auto.offset.reset.duration` 配置，允许消费者在无初始偏移量或偏移量失效时，从指定时间点（如 24 小时前）开始消费，避免全量数据重处理。

### KIP-1043：消费者组管理增强

针对`KIP-848`（新消费者组）和 `KIP-932`（共享组）引入的组类型，更新 `kafka-groups.sh` 工具以支持查看所有组类型，修复 `Admin API` 的兼容性问题。

### KIP-1102：客户端主动重引导机制

客户端在元数据超时未更新或收到服务端错误码（如 `FENCED_INSTANCE_ID`）时，主动触发重引导，解决旧机制中元数据过时导致的阻塞问题。

### KIP-896：移除旧版客户端协议API

首次移除了旧的协议 API 版本。

用户在将 Java 客户端（包括 Connect 和 Streams）升级到 4.0 版本之前，应确保`broker`版本为`2.1`或更高。

同样，用户在将`broker`升级到`4.0`版本之前，应确保其 Java 客户端版本为`2.1`或更高

### KIP-1124：明确客户端升级路径

定义 Kafka 客户端、Streams 和 Connect 到 4.0 的升级步骤，强制阅读以避免升级风险。

### KIP-653：升级至 Log4j2

日志框架迁移到`Log4j2`，提供 `log4j-transform-cli` 自动转换旧配置，但部分特性受限（如自定义 Appender）。

### KIP-724：弃用消息格式 v0/v1

自 Kafka 3.0 弃用的消息格式`v0`和`v1` 

在 4.0 中彻底移除，仅支持`v2+`。

### KIP-750 & KIP-1013：Java版本支持变更


- `Kafka Clients `和` Kafka Streams`需`JDK11+`

- `broker`、`Connect`和工具需`JDK17+`

### KIP-1030：配置项默认值优化

调整多个配置的默认值（如`num.io.threads` 根据 CPU 核数动态设置），提升开箱即用体验。


## 总结

总的来说改动还挺多，最核心的改动还是默认使用`KRaft`模式运行。

`Kafka Streams`和`Kafka Connect`也有一些改动，具体参考官网吧

## 参考

- https://archive.apache.org/dist/kafka/4.0.0/RELEASE_NOTES.html
- https://kafka.apache.org/blog