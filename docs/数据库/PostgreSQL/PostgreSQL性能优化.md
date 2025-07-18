## 使用EXPLAIN ANALYZE找出性能瓶颈

```sql
EXPLAIN ANALYZE 你的查询sql

```

注意查询sql过滤掉实际的字段

比如实际的查询是
```sql
        SELECT id,order_id,add_time
        FROM order 

```

那么使用EXPLAIN ANALYZE的语法为

```sql
EXPLAIN ANALYZE
SELECT count(1)
FROM order
```



## 关注指标

比如我们通过`EXPLAIN ANALYZE`得到一份执行计划

```sql

```


### Execution Time (总执行时间)

是什么：整个查询从开始到结束的总耗时。这是最终的成绩单，也是我们优化的首要目标。

关注点：这个数字是不是太大了？我们的优化目标就是让它变小。

### actual time (节点实际时间)

是什么：actual time=0.050..150.321 这样的格式，代表一个操作节点“启动耗时..完成耗时”。

关注点：重点看第二个数字（完成耗时）。哪个节点的完成耗时最长，它就是最大的性能瓶颈。我们的优化应该首先聚焦在最耗时的节点上。


### rows (预估行数) vs. actual rows (实际行数)

是什么：rows=100 是PG优化器预估这个节点会返回100行。rows=50000 (在actual time旁边) 是实际返回了5万行。

关注点：预估和实际的差距是否巨大？ 如果差距达到几倍甚至几十倍（例如，预估1行，实际10万行），说明PG的统计信息陈旧或不准确。这会导致它做出错误的决策，比如选择了一个错误的JOIN方式或扫描方式。

如何修复：对相关的表运行 `ANALYZE <table_name>`; 来更新统计信息，让优化器更“聪明”。

### 扫描方式 (Scan Methods)

#### Seq Scan (顺序扫描)

是什么：从头到尾读取整张表。

关注点：如果这张表很大（几万行以上），看到 Seq Scan 通常就是坏消息。这意味着没有利用到索引。这是最常见的性能杀手。

如何修复：在 WHERE 或 JOIN 条件涉及的列上创建索引 (CREATE INDEX)。

#### Index Scan (索引扫描)

是什么：通过索引快速定位到需要的行，然后可能需要回表（访问主表）获取其他列的数据。

关注点：这通常是好消息，说明索引被用上了。

#### Index Only Scan (纯索引扫描)

是什么：查询所需的所有数据都能在索引中找到，完全无需访问主表。

关注点：这是最好的消息，性能极高。可以通过创建“覆盖索引”（包含所有查询所需列的索引）来实现。

#### Bitmap Heap Scan (位图扫描)

是什么：先用索引找到所有符合条件的行的位置（生成一个位图），然后一次性地从主表里把这些行捞出来。

关注点：这是个好兆头。它对于多条件查询或返回中等数量数据（不是几行，也不是全表）的查询非常高效。


### 连接方式 (Join Methods)

#### Nested Loop (嵌套循环)

是什么：驱动表（外循环）的每一行，都去被驱动表（内循环）里查找匹配项。

关注点：如果内循环是 Index Scan，那么效率极高。但如果内循环是 Seq Scan，就会变成您之前遇到的灾难性性能问题（笛卡尔积）。

#### Hash Join (哈希连接)

是什么：将一个小表在内存里建成一个哈希表，然后扫描大表进行匹配。

关注点：适合没有索引或者需要连接两个大表的场景。注意 Memory Usage，如果内存不足（work_mem配置小），数据会溢出到磁盘，性能会下降。

#### Merge Join (归并连接)

是什么：将两个已排序的输入流像拉拉链一样合并起来。

关注点：在处理超大表且输入已有序时非常高效。


### Rows Removed by Filter (被过滤掉的行)

是什么：表示数据库获取了大量数据后，因为不满足 WHERE 或 JOIN 条件而丢弃了多少行。

关注点：如果这个数字非常大，说明数据库做了很多无用功。通常意味着索引不合适或者查询逻辑有待优化。


## 优化流程

1. 建立基准 (Benchmark)

在做任何修改前，对你的原始SQL执行一次 EXPLAIN ANALYZE，记录下总的 Execution Time。这是你的“优化前”成绩。


2. 定位瓶颈 (Find the Bottleneck)

- 从上到下看查询计划，找到 actual time 最高的那个节点。这就是你最需要解决的问题。

- 从内到外看查询计划，找到第一个出现 Seq Scan 的大表，或者预估行数与实际行数差异巨大的地方。


3. 分析原因并提出假设 (Analyze & Hypothesize)

- 为什么这个节点慢？

    - 是 Seq Scan on a large table? -> 假设：缺少索引。

    - 是 Nested Loop with an inner Seq Scan? -> 假设：内层表的JOIN列缺少索引。

    - 是 rows 预估与实际差异巨大? -> 假设：统计信息过时。

    - 是 Filter 移除了太多行？ -> 假设：索引的选择性不高，或者需要复合索引。


4. 进行优化

根据你的假设，进行最小化、最明确的修改。

```
CREATE INDEX ...

```

```
ANALYZE <table_name>;
```

(高级) 重写部分SQL，比如用 EXISTS 替代 JOIN

5. 重新验证

再次运行 EXPLAIN ANALYZE。

对比结果：

- Execution Time 是否显著减少？如果减少了，恭喜你，优化成功！然后你可以回到第1步，寻找新的（次要的）瓶颈，继续优化。

- 查询计划是否变得更健康了？（例如 Seq Scan 变成了 Index Scan）

- 如果性能没有提升甚至变差了，说明你的假设是错的。撤销修改（比如 DROP INDEX），回到第2步，提出新的假设。