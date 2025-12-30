## 背景

现在有两张表

一张用户表

```sql
create table user
(
    id            bigint auto_increment
        primary key,
    uid           bigint                        not null comment '用户uid',
    constraint user_pk
        unique (uid)
);
create index idx_user_uid
    on user (uid);
```

一张用户路由表

```sql

create table user_route
(
    id            bigint auto_increment
        primary key,
    uid           varchar(50)                        not null comment '用户uid',
    constraint user_route_pk
        unique (uid)
);
create index idx_user_route_uid
    on user_route (uid);
```

注意`user`表中的uid为`bigint`

`user_route`表中的`uid`为`varchar(50)`


两张表进行关联查询

```sql
select * from user u left join user_route ur on u.uid = ur.uid
where u.uid = 10002153326;
```


问题 

此时的`uid`索引会失效吗

答案是会

## 为什么会失效？

MySQL 在处理不同数据类型的比较时，会触发隐式类型转换（Implicit Type Conversion）。

MySQL 有一条铁律：当字符串（VARCHAR）和数字（BIGINT/INT）进行比较时，MySQL 会自动把“字符串”转换成“数字”，然后再进行比较。

如果 MySQL 优化器决定先查 `user`（驱动表），拿着 `user` 的 uid（数字）去 `user_route`表（被驱动表）里找匹配的记录。

此时，对于 `user_route`表 来说，查询逻辑等同于：

```sql
SELECT * FROM user_route WHERE uid = 10002153326;
```

为了进行比较，MySQL 必须把 `user_route` 里每一行的 `uid` 字符串都转换成数字。实际上，MySQL 内部执行了类似这样的操作：

```sql
WHERE CAST(ur.uid AS UNSIGNED) = 10002153326
```

因为转换函数（CAST）作用在了**索引字段（ur.uid）**上，破坏了 B+ 树的有序性（B+ 树存的是字符串的字典序，不是数字的大小顺序）。索引一旦参与计算或转换，立刻失效

## 什么情况下索引可能会有效

驱动表 (Driver)|	被驱动表 (Driven)|	比较逻辑|	索引是否失效|	结果
:--:|:--:|:--:|:--:|:--:|
user| 	user_route|	用数字去查字符串|	失效 ❌|	全表扫描 (灾难)
user_route| 	user|	用字符串去查数字|	有效 ✅|	走索引



## 实战验证 (EXPLAIN)

我们使用 EXPLAIN 还原事故现场：

```sql
EXPLAIN SELECT * FROM user u 
LEFT JOIN user_route ur ON u.uid = ur.uid
WHERE u.uid = 10002153326;
```

执行结果分析：

| id | select_type | table | partitions | type | possible_keys               | key     | key_len | ref   | rows  | filtered | Extra       |
|----|:-----------:|:-----:|:----------:|:----:|:---------------------------:|:-------:|:-------:|:-----:|:-----:|:--------:|:-----------:|
| 1  | SIMPLE      | u     |            | const| PRIMARY                     | PRIMARY | 8       | const | 1     | 100      |             |
| 1  | SIMPLE      | ur    |            | ALL  | user_route_pk,idx_user_route_uid |         |         |       | 9296  | 100      | Using where |

type: ALL：赤裸裸的全表扫描。

key: NULL：未命中任何索引。

Extra: Using where：MySQL 不得不在内存中遍历每一行数据进行过滤，如果数据量大，这将导致 CPU 飙升。



## 解决方式

### 方案一：统一字段类型（推荐 ⭐️⭐️⭐️⭐️⭐️）

这是最治本的方法。将两张表的 uid 字段类型保持一致（建议均为 BIGINT 或均为 VARCHAR）

>如果表数据量过大，线上执行`DDL` 锁表可能会长时间影响线上业务正常运行(锁表)


### 方案二：查询时手动转换（救急方案）

```sql
SELECT *
FROM user u
LEFT JOIN user_route ur 
    -- 手动将 u.uid (数字) 转为 字符串，再传给 ur
    ON CAST(u.uid AS CHAR) = ur.uid 
WHERE u.uid = 1000229339;
```

- 验证修复后的执行计划：

| id | select_type | table | partitions | type  | possible_keys               | key                 | key_len | ref   | rows | filtered | Extra |
|----|:-----------:|:-----:|:----------:|:-----:|:---------------------------:|:-------------------:|:-------:|:-----:|:----:|:--------:|:-----:|
| 1  | SIMPLE      | u     |            | const | PRIMARY                     | PRIMARY             | 8       | const | 1    | 100      |       |
| 1  | SIMPLE      | ur    |            | const | user_route_pk,idx_user_route_uid | user_route_pk | 202     | const | 1    | 100      |       |


可以看到 type 变成了 const（或 ref），且准确使用了 user_route_pk 索引。

## PostgreSQL 会有这个问题吗？

PostgreSQL 和 MySQL 在此表现出巨大的设计哲学差异：

MySQL (弱类型倾向)：倾向于“尽力执行”，哪怕性能受损也要自动转换类型尝试匹配。

PostgreSQL (强类型)：非常严谨。

如果你在 PostgreSQL 中尝试将 BIGINT 和 VARCHAR 直接 JOIN，数据库会直接拒绝执行并报错：

> ERROR: operator does not exist: bigint = character varying

你必须显式地进行类型转换（如 ::varchar 或 ::bigint），这种“报错即提醒”的机制反而在开发阶段就规避了隐式转换带来的性能地雷。

## 总结
1. 铁律：联表查询时，JOIN 字段的数据类型及字符集（Charset/Collation）必须保持严格一致
2. 原理：索引字段一旦被“函数化”（包含隐式类型转换），索引即刻失效
3. 警惕：String ↔ Number 是隐式转换的重灾区，Code Review 时需重点关注

