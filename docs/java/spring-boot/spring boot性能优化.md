## 性能瓶颈

- 线程池饱和：默认的 Tomcat 连接器已达到极限
- 数据库连接竞争：HikariCP 配置未针对我们的工作负载进行优化
- 序列化效率低下：在请求/响应处理过程中，Jackson 占用了大量 CPU
- 阻塞 I/O 操作：特别是在调用外部服务时
- 内存压力：创建过多对象导致 GC 频繁暂停



## 查询优化为响应式

将普通查询优化为响应式


## 数据库连接池优化

HikariCP 的默认设置造成了连接争用。经过大量测试，我得出了这样的配置：


```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 30
      minimum-idle: 10
      idle-timeout: 30000
      connection-timeout: 2000
      max-lifetime: 1800000

```

关键的一点是，连接数并不总是越多越好；我们在 30 个连接数上找到了最佳点，这样既能减少竞争，又不会使数据库不堪重负。


## 缓存

将频繁查询的变化频率低易缓存的接口进行多级缓存(本地+redis)


## 序列化优化

剖析结果显示，15% 的 CPU 时间用于 Jackson 序列化。我改用了更高效的配置：


```java
@Configuration
public class JacksonConfig {
    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        
        // Use afterburner module for faster serialization
        mapper.registerModule(new AfterburnerModule());
        
        // Only include non-null values
        mapper.setSerializationInclusion(Include.NON_NULL);
        
        // Disable features we don't need
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        mapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
        
        return mapper;
    }
}

```


对于性能更高的接口，使用`Protocol Buffers`进行替代


## 线程池和连接调整

如果使用了`WebFlux`可以优化`Netty`线程池配置

```yaml
spring:
  reactor:
    netty:
      worker:
        count: 16  # Number of worker threads (2x CPU cores)
      connection:
        provider:
          pool:
            max-connections: 10000
            acquire-timeout: 5000

```


tomcat连接池调整


```yaml
server:
  tomcat:
    threads:
      max: 200
      min-spare: 20
    max-connections: 8192
    accept-count: 100
    connection-timeout: 2000

```

这些设置使我们能够以较少的资源处理更多的并发连接。

## 总结

- 监控就是一切：如果没有正确的剖析，我就会优化错误的东西。

- 反应式并不总是更好：我们在 Spring MVC 上保留了一些端点，使用混合方法，这样做更有意义。

- 数据库通常是瓶颈：缓存和查询优化为我们带来了一些最大的成功。

- 配置很重要：我们的许多改进都来自于对默认配置的简单调整。

- 不要过早扩展：我们首先优化了应用程序，然后进行了横向扩展，从而节省了大量基础设施成本。

- 使用真实场景进行测试：我们最初使用合成测试进行的基准测试与生产模式不匹配，导致了错误的优化。

- 平衡复杂性和可维护性：一些潜在的优化方案被否决，因为它们会使代码库变得过于复杂，难以维护。
