## 引言：从 DELETE FROM 的恐惧说起

在日常开发中，数据删除是一个敏感操作。最原始的删除方式是物理删除，即直接从磁盘上抹去数据：

```sql
DELETE FROM user WHERE id = 1;
```

这种方式简单直接，但也伴随着巨大的风险。如果某天开发人员手抖漏掉了 WHERE 条件：

```sql
DELETE FROM user; -- 灾难现场
```

后果不堪设想。为了规避这种风险，同时也为了数据可追溯（数据价值），现代企业级项目通常会采用逻辑删除，并配合安全拦截机制。本文将带你深入 MyBatis-Plus 的这两大安全利器。


## 第一道防线：防全表更新与删除插件

`MyBatis-Plus` 提供了一个强大的插件 `BlockAttackInnerInterceptor`，它的作用就像数据库的“保险丝”。

### 什么是 BlockAttackInnerInterceptor？

`BlockAttackInnerInterceptor` 是 `MyBatis-Plus` 内置的安全插件，专门用于防止恶意的或无意的全表更新（UPDATE）和删除（DELETE）操作。

核心原理： 插件会分析执行的 SQL 语句，如果检测到 `UPDATE` 或 `DELETE` 语句中没有 WHERE 条件，它会直接抛出异常，拦截该操作。


### 使用


1. 注册插件

在 `Spring Boot` 配置类中，将插件添加到拦截器链中：

```java
@Configuration
public class MybatisPlusConfig {

    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        // 添加防全表更新/删除插件
        interceptor.addInnerInterceptor(new BlockAttackInnerInterceptor());
        return interceptor;
    }
}
```

2. 效果

一旦配置生效，当我们试图执行如下代码时：
```java
userMapper.delete(null); // 没有任何条件
```

#### 自定义拦截规则

默认规则是“无 WHERE 即拦截”。但在某些特殊场景下（比如定期清理日志表），我们需要允许全表删除，或者我们需要更严格的规则（比如禁止一切物理删除）。

我们可以通过继承 `BlockAttackInnerInterceptor` 并重写 `processDelete` 或 `processUpdate` 方法来实现。

比如我们全局禁止物理删除

```java
public class StrictDeleteInterceptor extends BlockAttackInnerInterceptor {

    @Override
    protected void processDelete(Delete delete, int index, String sql, Object obj) {
        // 无论有没有 WHERE 条件，直接禁止执行 DELETE 语句
        throw new UnsupportedOperationException("系统已全面禁止物理删除操作，请使用逻辑删除！");
    }
}

```

## 第二道防线：逻辑删除（Logical Delete）

既然我们通过插件限制了高风险的物理删除，甚至禁止了物理删除，那业务中废弃的数据该如何处理？答案是：**逻辑删除**


### 什么是逻辑删除？

逻辑删除本质上是更新操作。并没有真正删除数据，而是通过一个标记字段（如 is_delete）来标识数据状态。

- 物理删除 SQL： `DELETE FROM user WHERE id = 1`

- 逻辑删除 SQL： `UPDATE user SET is_delete = 1 WHERE id = 1`

手动维护这个字段非常繁琐：每次查询都要记得写 `WHERE is_delete = 0`，否则就会查出脏数据。MyBatis-Plus 完美解决了这个痛点，实现了无感知的逻辑删除。

### MyBatis-Plus 的自动化支持


开启逻辑删除后，`MyBatis-Plus` 会自动处理 `SQL`

- 查询（Select）： 自动拼接 `WHERE is_delete = 0`

- 更新（Update）： 自动拼接 `WHERE is_delete = 0`，防止更新已删除数据

- 删除（Delete）： 将 `DELETE` 语句自动转换为 `UPDATE` 语句

### 配置指南

1. 全局配置 (application.yml)

推荐使用全局配置，规范统一

```yaml
mybatis-plus:
  global-config:
    db-config:
      logic-delete-field: deleted # 数据库中逻辑删除字段名
      logic-delete-value: 1       # 标记为“已删除”的值
      logic-not-delete-value: 0   # 标记为“未删除”的值
```



2. 实体类注解 (可选)

如果某个表比较特殊（例如字段名叫 `is_del`，删除值为 -1），可以使用 `@TableLogic` 单独配置：

```java
public class User {
    // 其他字段...

    @TableLogic(value = "0", delval = "-1")
    private Integer deleted;
}
```

- value: 逻辑未删除值

- delval: 逻辑已删除值

### 避坑指南

虽然逻辑删除很方便，但在使用时需注意以下两点：

1. 唯一索引冲突：如果表中某个字段（如 username）有唯一索引，当数据被逻辑删除后，再次插入相同的 `username` 会报主键冲突。

    - 解决方案：将唯一索引修改为 `username + deleted` 的联合索引（前提是删除值不固定，通常推荐删除值使用时间戳等动态值，或者在业务层做校验）

2. 手写 SQL：如果你在 `Mapper.xml` 中手写了 SQL 语句，`MyBatis-Plus` 不会自动追加逻辑删除条件，你需要手动加上 `AND deleted = 0`

## 总结

数据是企业的核心资产。通过组合使用 `MyBatis-Plus` 的 `BlockAttackInnerInterceptor`（防全表攻击） 和 逻辑删除 功能，我们不仅能防止“手抖”导致的删库事故，还能以极低的开发成本实现数据的软删除，极大地提升了系统的安全性和健壮性。

当然如果我们想要更安全的数据保护，可以直接基于`数据库账号权限隔离`

在数据库账号级别禁用 `DELETE` 权限


## 参考

- https://baomidou.com/guides/logic-delete/
- https://baomidou.com/plugins/block-attack/