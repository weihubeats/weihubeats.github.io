## 背景

线上千万大表需要变更表字段，先本地模拟验证下

## 验证目的

验证数据迁移正确性，以及数据迁移过程是否锁表


## 环境

- 数据库： MySQL8
- 数据量: 50w

## 注意事项

1. 本地验证的MySQL没有验证集群模式
2. 本地验证的MySQL没有验证数据同步，比如DTS等

> 实际线上环境更为复杂，线上如果要使用`gh-ost`需要在线上再次验证

## 验证

### Docker安装MySQL

```bash
# 停止并删除旧容器（如果有）
docker stop mysql-lab && docker rm mysql-lab

# 启动新容器（适配 M1 芯片）
docker run --name mysql-lab \
  -e MYSQL_ROOT_PASSWORD=root \
  -p 3306:3306 \
  -d mysql:8.0 \
  --server-id=100 \
  --log-bin=mysql-bin \
  --binlog-format=ROW \
  --default-authentication-plugin=mysql_native_password
```

安装完成后可以使用`docker`自带工具进行连接数据库，确认数据库安装挣钱

```bash
# 使用 Docker 内置客户端连接
docker exec -it mysql-lab mysql -uroot -proot
```

## 安装gh-ost

1. 安装
```bash
brew install gh-ost
```

2. 验证

```bash
gh-ost --version
```

## 构建测试数据

1. 建表

```sql
CREATE DATABASE IF NOT EXISTS gh_test;
USE gh_test;

-- 原始表结构
CREATE TABLE user_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_no VARCHAR(64) NOT NULL,
    biz_type TINYINT NOT NULL COMMENT '业务类型', -- 这里是我们主要修改的目标
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
```

2. 生成测试数据

```sql
DELIMITER //
CREATE PROCEDURE generate_data()
BEGIN
  DECLARE i INT DEFAULT 0;
  -- 循环插入 500,000 条数据
  WHILE i < 500000 DO
    INSERT INTO user_order (order_no, biz_type) 
    VALUES (UUID(), FLOOR(RAND() * 100)); -- biz_type 随机生成 0-99
    SET i = i + 1;
  END WHILE;
END;
//
DELIMITER ;

-- 执行存储过程（可能需要 30秒 - 1分钟）
CALL generate_data();
```

3. 测试数据验证

```sql
-- 确认输出 500000
SELECT count(*) FROM user_order; 
-- 确认数据在 tinyint 范围内
SELECT min(biz_type), max(biz_type) FROM user_order; 
```

## 执行迁移

1. 创建控制文件

```bash
touch /tmp/ghost.postpone.flag
```

2. 执行gh-ost命令

```bash
gh-ost \
--max-load=Threads_running=25 \
--critical-load=Threads_running=50 \
--chunk-size=1000 \
--max-lag-millis=1500 \
--host=127.0.0.1 \
--port=3306 \
--user="root" \
--password="root" \
--database="gh_test" \
--table="user_order" \
--alter="MODIFY COLUMN biz_type INT NOT NULL DEFAULT 0 COMMENT '业务类型'" \
--allow-on-master \
--concurrent-rowcount \
--cut-over=default \
--exact-rowcount \
--panic-flag-file=/tmp/ghost.panic.flag \
--postpone-cut-over-flag-file=/tmp/ghost.postpone.flag \
--execute
```

终端显示进度
- Copy: 250000/500000 50.0% ...
- 如果想暂停，打开另一个终端：echo throttle | nc -U /tmp/gh-ost.gh_test.user_order.sock
- 最后它会停在：Copy: 500000/500000 100.0% 并且状态显示 Postponing cut-over。

此时，数据已经同步到了影子表（隐形的新表），且正在实时同步增量数据

3. 模拟生产环境的“增量写入” 

```sql
-- 在另一个终端连接 MySQL
INSERT INTO user_order (order_no, biz_type) VALUES ('NEW_DATA_TEST', 120);
```

![alt text](images/user_order_insert.png)

4. 执行切换 (Cut-over)

```bash
# 在另一个终端执行
rm /tmp/ghost.postpone.flag
```

回到运行 `gh-ost` 的终端，发现输出 `Done` 并退出

![alt text](images/gh_ost_done.png)

5. 数据验证

- 字段验证

```sql
DESC user_order;
```

![alt text](images/gh_ost_create_table.png)


- 数据量验证


![alt text](images/gh_ost_count.png)

## 环境清理(可选)

验证完成后如果我们想要清理环境

```bash
docker stop mysql-lab
docker rm mysql-lab
rm /tmp/gh-ost.*.sock
```