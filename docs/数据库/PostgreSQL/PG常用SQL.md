## 设置序列起始点

```sql
CREATE TABLE example (
    id SERIAL PRIMARY KEY,
    name TEXT
);

-- 修改序列的起始值
ALTER SEQUENCE example_id_seq RESTART WITH 1000;
```

