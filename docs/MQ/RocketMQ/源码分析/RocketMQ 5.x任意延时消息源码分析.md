> 这里是**小奏**,觉得文章不错可以关注公众号**小奏技术**，文章首发。拒绝营销号，拒绝标题党


## RocketMQ版本
- 5.1.0

## 背景

之前我们分析了`RocketMQ 5.x固定等级延时消息源码分析`

今天来分析`RocketMQ` 5.x新增的任意时间的延时消息


## 使用

```java
        DefaultMQProducer producer = new DefaultMQProducer(producerGroup);
        producer.setNamesrvAddr(namesrvAddr);
        try {
            producer.start();
        } catch (MQClientException e) {
            throw new RuntimeException(e);
        }

        Message msg = new Message(TOPIC /* Topic */,
                TAG /* Tag */,
                ("Hello RocketMQ " + i).getBytes(RemotingHelper.DEFAULT_CHARSET) /* Message body */
        );
        // 设置消息延迟投递时间为 10 秒后
        msg.setDelayTimeMs(10000);
        producer.send(msg);
```

当然我们也可以通过`setDeliverTimeMs`设置绝对时间进行投递，比如

```java
        DefaultMQProducer producer = new DefaultMQProducer(producerGroup);
        producer.setNamesrvAddr(namesrvAddr);
        try {
            producer.start();
        } catch (MQClientException e) {
            throw new RuntimeException(e);
        }

        Message msg = new Message(TOPIC /* Topic */,
                TAG /* Tag */,
                ("Hello RocketMQ " + i).getBytes(RemotingHelper.DEFAULT_CHARSET) /* Message body */
        );
        // 设置消息在指定的时间戳投递，例如 10 分钟后的某个时间点
        long deliverTime = System.currentTimeMillis() + 10 * 60 * 1000; 
        message.setDeliverTimeMs(deliverTime);
        producer.send(msg);

```