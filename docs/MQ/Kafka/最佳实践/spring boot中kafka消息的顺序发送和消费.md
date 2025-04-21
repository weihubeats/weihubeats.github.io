
## 核心依赖


```xml
    <dependency>
        <groupId>org.springframework.kafka</groupId>
        <artifactId>spring-kafka</artifactId>
    </dependency>

```


## 配置

```yaml
spring:
  kafka:
    bootstrap-servers: kafka1:9092,kafka2:9092,kafka3:9092
    
    # 生产者配置
    producer:
      # 序列化配置
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.apache.kafka.common.serialization.StringSerializer
      # 可靠性配置
      acks: all
      retries: 3
      properties:
        # 确保顺序性的关键配置
        max.in.flight.requests.per.connection: 1
        # 性能优化配置
        batch.size: 16384
        linger.ms: 5
        buffer.memory: 33554432
    
    # 消费者配置
    consumer:
      # 反序列化配置
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      # 消费者组ID
      group-id: order-consumer-group
      # 偏移量提交配置
      enable-auto-commit: false
      auto-offset-reset: earliest
      # 批量拉取配置
      max-poll-records: 100
      # 会话超时配置
      properties:
        max.poll.interval.ms: 300000
        session.timeout.ms: 30000
        heartbeat.interval.ms: 10000
    
    # 监听器配置
    listener:
      # 手动提交模式
      ack-mode: MANUAL_IMMEDIATE
      # 并发配置
      type: single
      concurrency: 3

# 自定义配置
app:
  kafka:
    order-topic: order-topic

```

核心配置

- max.in.flight.requests.per.connection: 客户端在单个连接上能够发送但尚未收到服务器响应的请求数量。简单来说，它决定了每个连接的最大未确认请求数.如果需要消息的顺序，必须设置为1.如果大于1，消息进行重试会出现乱序


## 生产者实现

```java
package com.example.kafka.producer;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;
import org.springframework.util.concurrent.ListenableFuture;
import org.springframework.util.concurrent.ListenableFutureCallback;

@Service
@Slf4j
public class OrderedMessageProducer {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final String orderTopic;
    
    public OrderedMessageProducer(
            KafkaTemplate<String, String> kafkaTemplate,
            @Value("${app.kafka.order-topic}") String orderTopic) {
        this.kafkaTemplate = kafkaTemplate;
        this.orderTopic = orderTopic;
    }
    
    /**
     * 发送顺序消息 - 使用业务键作为消息key确保分区顺序
     * @param orderKey 业务键(如订单ID)
     * @param message 消息内容
     * @return 发送结果Future
     */
    public ListenableFuture<SendResult<String, String>> sendOrderedMessage(String orderKey, String message) {
        ListenableFuture<SendResult<String, String>> future = kafkaTemplate.send(orderTopic, orderKey, message);
        
        future.addCallback(new ListenableFutureCallback<SendResult<String, String>>() {
            @Override
            public void onSuccess(SendResult<String, String> result) {
                log.info("消息发送成功: topic={}, key={}, partition={}, offset={}", 
                         result.getRecordMetadata().topic(),
                         orderKey,
                         result.getRecordMetadata().partition(),
                         result.getRecordMetadata().offset());
            }
            
            @Override
            public void onFailure(Throwable ex) {
                log.error("消息发送失败: key={}, message={}", orderKey, message, ex);
            }
        });
        
        return future;
    }
}
```

## 消费者实现

```java
package com.example.kafka.consumer;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.TopicPartition;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.annotation.TopicPartition;
import org.springframework.kafka.listener.ConsumerSeekAware;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
@Service
@Slf4j
public class OrderMessageConsumer implements ConsumerSeekAware {
    // 记录处理状态，生产环境应考虑使用限制大小的缓存
    private final Map<String, String> processedOrderStatus = new ConcurrentHashMap<>();
    
    /**
     * 监听订单主题消息
     * Spring Kafka会确保同一分区的消息依次分发给同一个实例的同一线程处理
     */
    @KafkaListener(
            topics = "${app.kafka.order-topic}",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void consumeOrderMessage(ConsumerRecord<String, String> record, Acknowledgment ack) {
        String orderKey = record.key();
        String message = record.value();
        
        try {
            log.info("收到订单消息: partition={}, offset={}, key={}, value={}",
                    record.partition(), record.offset(), orderKey, message);
            
            // 处理消息 - 这里实现您的业务逻辑
            processOrderMessage(orderKey, message);
            
            // 完成后手动确认
            ack.acknowledge();
            
            log.info("订单消息处理完成: key={}", orderKey);
        } catch (Exception e) {
            // 生产环境应该有更完善的异常处理逻辑
            log.error("处理订单消息异常: key={}", orderKey, e);
            
            // 这里可以选择不确认，让消息重新消费 
            // 或者记录到死信队列，取决于业务需求
            // ack.nack(Duration.ofMillis(5000)); // 延迟5秒后重试
        }
    }
    
    private void processOrderMessage(String orderKey, String message) {
        // 处理业务逻辑
        // 在这里实现分区内消息的有序处理
        
        // 模拟处理耗时
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        // 记录处理状态
        processedOrderStatus.put(orderKey, message);
    }
    @Override
    public void onPartitionsAssigned(Map<TopicPartition, Long> assignments, ConsumerSeekCallback callback) {
        // 可选：分区分配时的回调处理
        log.info("分区已分配: {}", assignments);
    }
    @Override
    public void registerSeekCallback(ConsumerSeekCallback callback) {
        // 可选：注册seek回调
    }
    @Override
    public void onIdleContainer(Map<TopicPartition, Long> assignments, ConsumerSeekCallback callback) {
        // 可选：容器空闲时的回调
    }
}

```


## 高级实现

```java
package com.example.kafka.config;

import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.listener.ContainerProperties;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class KafkaConsumerConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;
    
    @Value("${spring.kafka.consumer.group-id}")
    private String groupId;
    
    @Bean
    public ConsumerFactory<String, String> consumerFactory() {
        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, groupId);
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, false);
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        props.put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, 100);
        props.put(ConsumerConfig.MAX_POLL_INTERVAL_MS_CONFIG, 300000);
        props.put(ConsumerConfig.SESSION_TIMEOUT_MS_CONFIG, 30000);
        props.put(ConsumerConfig.HEARTBEAT_INTERVAL_MS_CONFIG, 10000);
        
        return new DefaultKafkaConsumerFactory<>(props);
    }
    
    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, String> kafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, String> factory = new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory());
        
        // 配置手动确认模式
        factory.getContainerProperties().setAckMode(ContainerProperties.AckMode.MANUAL_IMMEDIATE);
        
        // 配置并发性 - 关键设置
        // 每个分区分配一个线程处理，保证分区内顺序消费
        factory.setConcurrency(3); // 应等于或小于分区数
        
        // 可选：消息批处理
        factory.setBatchListener(false);
        
        // 可选：消息过滤器
        // factory.setRecordFilterStrategy(record -> false); // 返回true表示过滤
        
        return factory;
    }
}
```


```java
package com.example.kafka.config;

import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.listener.ContainerProperties;
import org.springframework.kafka.listener.KafkaMessageListenerContainer;

import java.util.HashMap;
import java.util.Map;

@Configuration
@Slf4j
public class AdvancedKafkaConsumerConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;
    
    @Value("${spring.kafka.consumer.group-id}")
    private String groupId;
    
    /**
     * 特定分区的消费者工厂
     */
    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, String> partitionAwareListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, String> factory = new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory());
        factory.getContainerProperties().setAckMode(ContainerProperties.AckMode.MANUAL_IMMEDIATE);
        
        // 关键设置：每个消费者实例单线程处理
        factory.setConcurrency(1);
        
        // 设置消息监听器创建的自定义回调
        factory.setContainerCustomizer(container -> {
            container.getContainerProperties().setConsumerRebalanceListener(new OrderedRebalanceListener());
            
            // 可添加其他自定义逻辑，如监控或日志记录
            if (container instanceof KafkaMessageListenerContainer) {
                log.info("配置消息监听容器: {}", container);
            }
        });
        
        return factory;
    }
    
    @Bean
    public ConsumerFactory<String, String> consumerFactory() {
        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, groupId);
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, false);
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        
        // 分区分配策略 - 可选配置
        // props.put(ConsumerConfig.PARTITION_ASSIGNMENT_STRATEGY_CONFIG, "org.apache.kafka.clients.consumer.RoundRobinAssignor");
        
        return new DefaultKafkaConsumerFactory<>(props);
    }
}

```

## 特定分区监听

```java
@Service
@Slf4j
public class PartitionSpecificConsumer {
    /**
     * 监听指定分区的消息
     */
    @KafkaListener(
            topicPartitions = @TopicPartition(
                    topic = "${app.kafka.order-topic}",
                    partitions = {"0", "1", "2"}
            ),
            containerFactory = "partitionAwareListenerContainerFactory"
    )
    public void listenToPartition(ConsumerRecord<String, String> record, Acknowledgment ack) {
        try {
            log.info("分区专用消费者接收到消息: partition={}, offset={}, key={}", 
                    record.partition(), record.offset(), record.key());
            
            // 处理消息
            processMessage(record);
            
            // 手动确认
            ack.acknowledge();
        } catch (Exception e) {
            log.error("处理特定分区消息失败", e);
            // 可以选择不确认或延迟确认
        }
    }
    
    private void processMessage(ConsumerRecord<String, String> record) {
        // 实现业务逻辑
        String key = record.key();
        String value = record.value();
        
        // 处理逻辑
        log.info("处理订单消息: key={}, value={}", key, value);
        
        // 模拟处理时间
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}

```