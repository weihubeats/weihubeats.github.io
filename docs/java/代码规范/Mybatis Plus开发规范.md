## 开发标准格式

- infra
    - dao
        - mapper
            - OrderMapper.java
        - impl
            - OrderDAOImpl.java
              OrderDAO.java
    - entity
        - OrderDO.java


具体的代码如下：

- OrderDO

```java
@Data
public class OrderDO {

}
```

- OrderMapper

```java
@Mapper
public interface OrderMapper extends BaseMapper<OrderDO> {
}
```

- OrderDAO

```java
public interface OrderDAO extends IService<OrderDO> {
}
```

- OrderDAOImpl

```java
@Repository
@RequiredArgsConstructor
public class OrderDAOImpl extends ServiceImpl<OrderMapper, OrderDO> implements OrderDAO {

    private final InfluhubOrderMapper influhub_orderMapper;
}
```

## 目的

主要是不要将`ServiceImpl`暴露到`Servcie`

这样做的好处是

1. 可以将所有数据库查询操作封装在DAO层
2. 以后需要做数据库相关的改造封装，仅需关注`DAO`层

如果由`Servcie`直接继承`ServiceImpl`，会出现如下问题

1. 大量SQL查询逻辑写在`Service`层，无法复用
2. `Service`层更应关注业务逻辑处理，而不是数据查询条件构建
3. 后续需要对SQL进行拦截改写，`Servcie`直接继承`ServiceImpl`调用`ServiceImpl`无法添加注解进行`AOP`切面拦截，因为`ServiceImpl`的方法在jar中
