## 背景

一般表的id主键我们都是设置为自增序列。

但是如果我们在插入一些数据的时候手动指定id，那么自增序列不会跟随我们手动设置的id增长。

就会出现下次不设置id的时候自增到我们手动指定的id导致主键冲突bug

举个例子

现在数据有
| id | 
| -- | 
| 1  | 
| 2  | 
| 3  | 

现在我们手动插入数据比如
```sql
insert into xiaozou(id) values(4)
```

这时候我们的数据变成
| id| 
| --| 
| 1 | 
| 2 | 
| 3 | 
|4|

实际我们的id自增序列还停留在3。

如果我们插入数据不指定id。自动生成的id就还是4，从而导致主键冲突

## 解决方案

设置自增序列为当前id的最大值+1
```sql
SELECT setval('xiaozou_id_seq', (SELECT MAX(id) FROM xiaozou)+1);
```
> xiaozou_id_seq是序列名，xiaozou是表名

如果不知道序列名可以通过如下方式查询
```sql
SELECT column_name, column_default
FROM information_schema.columns
WHERE table_name = 'xiaozou' AND column_default LIKE 'nextval%';
```
