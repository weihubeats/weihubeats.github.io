## 背景

`MySQL`一般小表直接执行`DDL`是没什么风险的,比较快

但是如果线上数据超过500W左右，执行`DDL`会有如下风险

1. 服务器负载飙升 (IO & CPU)：建索引需要把整张表的数据读一遍并进行排序。这会消耗大量的磁盘 IO 和 CPU 资源，导致正常的业务 SQL 变慢，甚至超时
2. 主从延迟 (Replication Lag)：MySQL 的主从复制通常是单线程的（或基于表的并发）。如果主库花 10 分钟建好了索引，这个操作同步到从库后，从库也要花 10 分钟重放这个操作，导致从库延迟，读写分离失效
3. 死锁风险 (MDL Lock)：如果在业务高峰期执行，且恰好遇到长事务，可能瞬间堵死数据库连接池

## 大表如何加索引

### 无锁添加索引

1. 找一个业务低峰期比如凌晨
2. 执行无锁添加索引命令

```sql
-- 1. 设置当前会话获取锁的超时时间为 5 秒
SET SESSION lock_wait_timeout = 5;

-- 2. 执行加索引，强制使用不锁表模式
ALTER TABLE user_security 
ADD INDEX idx_update_time_kyc_nation (update_time, kyc_nation), 
ALGORITHM=INPLACE, 
LOCK=NONE;
```

但是无锁模式只有 mysql 5.6+版本才支持 以下版本就直接添加

### 使用第三方工具 gh-ost


- 地址：https://github.com/github/gh-ost

#### 核心原理

1. 创建幽灵表：`gh-ost` 会在数据库里创建一个长得和原表一样的空表，叫 `_user_security_gho`

2. 变更结构：它在这个幽灵表上执行 ALTER TABLE 加索引（因为是空表，瞬间完成）。

3. 全量拷贝：它慢慢地把原表的数据，一批一批地拷贝到幽灵表里

4. 增量同步 (关键)：在拷贝过程中，如果有新用户注册（写入），gh-ost 会通过读取 Binlog，把这些新操作重放到幽灵表里，确保数据一致

5. 原子切换：等到数据追平了，它会利用 MySQL 的机制，瞬间把两张表的名字互换。旧表变成 _user_security_del，新表变成 user_security

#### 使用前置检查（Checklist）
在下载工具之前，必须确认我们的数据库满足以下 3 个条件：

1. Binlog 格式必须是 ROW 模式（硬性要求）： 执行 SQL 检查：

```sql
SHOW VARIABLES LIKE 'binlog_format';
```

- 如果显示 ROW：✅ Pass。

- 如果显示 STATEMENT 或 MIXED：❌ 无法使用 `gh-ost`。

2. 表必须有主键： 如果没有主键，gh-ost 没法切分数据拷贝

3. 外键约束： 如果表里有外键（Foreign Key），gh-ost 默认不支持（比较麻烦）

#### 使用方式

1. 下载

去 GitHub Release 页面下载最新的 Linux 版本

```shell
curl -O https://github.com/github/gh-ost/releases/download/v1.1.7/gh-ost-binary-linux-amd64-20241219160321.tar.gz

```

2. 解压

```shell
tar -zxvf gh-ost-binary-linux-amd64-*.tar.gz
chmod +x gh-ost
```

3. 添加索引

比如我们的数据库信息如下：

- IP: 192.168.1.100

- 用户: admin

- 密码: 123456

- 库名: mydb

- 表名: user_security

我们要加的索引是：
```sql
ADD INDEX idx_update_time (update_time)
```

先运行测试模式 (Dry Run)，看看会不会报错



```shell
./gh-ost \
--user="admin" \
--password="123456" \
--host="192.168.1.100" \
--database="mydb" \
--table="user_security" \
--alter="ADD INDEX idx_update_time (update_time)" \
--chunk-size=1000 \
--max-load=Threads_running=25 \
--critical-load=Threads_running=100 \
--method=gtid \
--panic-flag-file=/tmp/ghost.panic \
--verbose
```

如果不报错，并且最后提示 Dry run complete，说明连接和权限都 OK。

正式执行模式

确认无误后，加上 --execute 参数，真正开始干活。

```shell
./gh-ost \
--user="admin" \
--password="123456" \
--host="192.168.1.100" \
--database="mydb" \
--table="user_security" \
--alter="ADD INDEX idx_update_time (update_time)" \
--chunk-size=2000 \
--max-load=Threads_running=25 \
--critical-load=Threads_running=100 \
--allow-on-master \
--cut-over=default \
--execute \
--verbose
```

参数解释

- `--alter`: 这里只需要写 `ADD INDEX` ... 这一部分，不需要写 `ALTER TABLE user_security`

- `--allow-on-master`: `gh-ost` 默认建议在从库上测试，如果你直接连接主库进行操作，必须加上这个参数，否则它不让你跑

- `--chunk-size=2000`:每次拷贝多少行数据,默认是 1000。如果不赶时间，建议设小点（比如 1000-2000），这样对磁盘 IO 压力更小

- --max-load="Threads_running=25" (核心限流):每秒检查数据库的状态。如果发现当前数据库的 Threads_running（正在运行的线程数）超过 25，gh-ost 会自动暂停拷贝，直到负载降下来

- `--cut-over=default`:决定最后什么时候切换表。default: 当数据同步完成，准备好了就自动切;或者你可以指定一个标志文件，当你手动创建那个文件时它才切（适合极其严谨的发布流程）

- `--panic-flag-file=/tmp/ghost.panic`:如果在执行过程中你发现业务有点不对劲，赶紧在服务器上创建这个文件（touch /tmp/ghost.panic）,gh-ost 发现这个文件存在，会立即终止所有操作并退出，清理现场

#### 注意事项

- 磁盘空间是否足够:因为 gh-ost 会复制出一张新表，所以你的磁盘剩余空间至少要是当前表大小的 1.5 倍以上

- 执行时间: 假设数据有800w，每秒copy行为2000，则需要1个小时左右。建议使用 screen 或 nohup 后台运行，防止你电脑断网导致 SSH 断开，进程被杀
- 主从延迟：虽然 gh-ost 是分批写的，但在最后 Binlog 回放阶段，如果写入量很大，从库可能会有轻微延迟，但比直接 ALTER 好得多

### pt-online-schema-change

pt-online-schema-change (简称 pt-osc) 是数据库圈内大名鼎鼎的 Percona Toolkit 工具包中的核心组件。在 gh-ost 出现之前，它几乎是 MySQL 在线变更表结构的“唯一真神”

#### 核心原理

虽然和`gh-ost`一样都是“不锁表加索引”，但实现方式有本质区别。

- gh-ost (基于 Binlog)： 像个**“间谍”。它悄悄读取数据库的日志（Binlog），把旧表的变化同步到新表。它不入侵**原表，负载非常低。

- pt-osc (基于 触发器 Triggers)： 像个**“监工”**。
    1. 它会在你的原表上创建 3 个触发器（Insert, Update, Delete）。
    2. 每当有业务写入原表，触发器就会强制把这笔数据同时也写一份到新表。
    3. 同时，它后台开启进程把旧数据慢慢搬运过去。



- 优点
    - 老牌稳重：历史悠久，Bug 极少，很多老 DBA 只信它
    - 外键支持：虽然也不完美，但比 gh-ost 对外键的支持要好一些（gh-ost 默认不支持外键表）。

- 缺点
    - 写放大（Write Amplification）：因为用了触发器，业务每写一条数据，数据库就要实际写两次（旧表+新表）。如果你的业务并发写入极高（比如每秒写几千条），pt-osc 可能会导致数据库响应变慢。
    - 死锁风险：触发器是同步操作，更容易引发锁等待

#### 使用

- 安装

```yaml
yum install percona-toolkit
```

- 预检查

```shell
pt-online-schema-change \
--alter "ADD INDEX idx_update_time_kyc_nation (update_time, kyc_nation)" \
--host=127.0.0.1 \
--user=admin \
--password=123456 \
D=mydb,t=user_security \
--charset=utf8mb4 \
--dry-run
```

- 正式执行

```shell
pt-online-schema-change \
--alter "ADD INDEX idx_update_time_kyc_nation (update_time, kyc_nation)" \
--host=127.0.0.1 \
--user=admin \
--password=123456 \
D=mydb,t=user_security \
--charset=utf8mb4 \
--max-load="Threads_running=25" \
--critical-load="Threads_running=100" \
--print \
--execute
```

关键参数详解
- `--alter`:写法和 ALTER TABLE 后面跟的内容一样。不需要写 ALTER TABLE 字样。

- `D=mydb,t=user_security`:指定数据库（D）和表（t）。

- `--max-load & --critical-load`:

    - `max-load`: 如果数据库负载（Threads_running）超过这个值（默认25），工具会暂停拷贝数据，休息一会儿。

    - `critical-load`: 如果负载超过这个值（默认50），工具会直接终止并退出，为了保护数据库不被打挂。

- `--print`:打印出它正在执行的 SQL，方便你看进度