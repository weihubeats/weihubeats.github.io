
## 配置

```yaml
spring:
  kafka:
    bootstrap-servers: localhost:9092
    
    # --- 生产者配置 ---
    producer:
      # Key 依然使用 String
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      # Value 使用 Spring 提供的 JsonSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
      properties:
        # (可选) 如果不想在消息头中携带类信息，可以关闭
        spring.json.add.type.headers: true 

    # --- 消费者配置 ---
    consumer:
      group-id: json-group
      # Key 使用 String
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      # 【关键】Value 使用 ErrorHandlingDeserializer，防止坏数据卡死
      value-deserializer: org.springframework.kafka.support.serializer.ErrorHandlingDeserializer
      properties:
        # 指定被 ErrorHandlingDeserializer 委托的真实反序列化器
        spring.deserializer.value.delegate.class: org.springframework.kafka.support.serializer.JsonDeserializer
        
        # 【安全设置】信任的包路径。如果你的 Producer 和 Consumer 包名不同，建议设为 '*'
        spring.json.trusted.packages: "*"
        
        # 当反序列化后的对象没有某个字段时，是否报错（false表示忽略未知字段）
        spring.json.use.type.headers: false

```

生产者代码 (发送对象)

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class JsonProducerService {

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    public void sendUserEvent(UserEvent event) {
        // 直接发送对象，Spring 会根据配置自动将其序列化为 JSON
        kafkaTemplate.send("user-event-topic", event.getUserId(), event);
        System.out.println("已发送用户事件: " + event);
    }
}
```

消费者代码 (接收对象 + 死信队列)

```java
import org.springframework.kafka.annotation.DltHandler;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.annotation.RetryableTopic;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.retry.annotation.Backoff;
import org.springframework.stereotype.Service;

@Service
public class JsonConsumerService {

    /**
     * 正常消费逻辑
     * Spring 会自动将 JSON 反序列化为 UserEvent 对象
     */
    @RetryableTopic(attempts = "3", backoff = @Backoff(delay = 1000))
    @KafkaListener(topics = "user-event-topic", groupId = "json-group")
    public void consumeUserEvent(UserEvent event) {
        System.out.println("接收到对象: " + event.toString());

        // 模拟业务异常
        if ("ERROR_USER".equals(event.getUserId())) {
            throw new RuntimeException("模拟业务处理失败");
        }
    }

    /**
     * 死信队列 (DLQ) 处理逻辑
     * 当重试 3 次依然失败，或者反序列化彻底失败时，进入这里
     */
    @DltHandler
    public void handleDlt(UserEvent event, @Header(KafkaHeaders.RECEIVED_TOPIC) String topic) {
        // 这里可以直接拿到对象，存库或告警
        System.err.println("对象进入死信队列: " + event);
        System.err.println("来源 Topic: " + topic);
    }
}
```