## 背景

在慢`SQL`平台看到的`SQL`只能看到具体的慢SQL语句，无法定位到具体的代码和请求


## SQL染色

通过`Mybatis`插件实现SQL改写，改写新增如下

主要是一条SQL新增注释

比如原始SQL为

```sql
select * from t_order
```


改写后的SQL为

```sql
select * from t_order/* [SQLMarking] statementId: com.xiaozou.dao.OrdertDao.getOrders, traceId: 59f48d4d-5346-4ffe-9837-693a090090fc */
```

## 代码实现

