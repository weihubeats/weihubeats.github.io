
## 删除消费者

```shell
./kafka-consumer-groups.sh --bootstrap-server kafka-xiaozou-001.xiaozou.com:9092,kafka-xiaozou-002.xiaozou.com.com:9092,kafka-xiaozou-003.xiaozou.com.com:9092 --delete --group xiaozou_group

```

## 查看消费者状态

```shell
./kafka-consumer-groups.sh --bootstrap-server kafka-xiaozou.com:9092 --describe --group <your-consumer-group-id>
```

## 查询消息

```sehll
bin/kafka-console-consumer.sh --bootstrap-server --bootstrap-server kafka-xiaozou-001.xiaozou.com:9092,kafka-xiaozou-002.xiaozou.com.com:9092,kafka-xiaozou-003.xiaozou.com.com:9092  --topic your-topic --from-beginning --property print.key=true --property key.separator=:
```