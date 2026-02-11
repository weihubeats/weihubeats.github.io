`gh-ost` 的强大之处在于它支持交互式命令（Interactive Commands）。这意味着我们可以在迁移脚本运行的过程中，通过 Socket 实时调整参数、暂停任务或查看状态，而不需要杀掉进程重启。


## 找到Socket文件路径


当 gh-ost 启动后，它会在 /tmp 目录下创建一个监听 Socket 文件。

如何找到

1. 查看启动日志：启动的前几行日志里会写：`Listening on unix socket file: ...`
2. 直接去目录找：通常格式为 `gh-ost.<数据库名>.<表名>.sock`

```bash
ls -l /tmp/gh-ost.*.sock
# 输出示例：
# /tmp/gh-ost.redotdx.payment_order.sock
```

## 常用命令


命令|作用|说明
:--:|:--:|:--:|
`echo status | nc -U /tmp/gh-ost.sock`|查看迁移进度|~
`echo throttle | nc -U /tmp/gh-ost.sock`|暂停|立即停止读写
`echo no-throttle | nc -U /tmp/gh-ost.sock`|恢复|恢复运行
`echo max-load=Threads_running=50 | nc -U ...`|调高负载阈值|允许主库压力更大
`echo max-load=Threads_running=10 | nc -U ...`|调低负载阈值|降低负载
`echo chunk-size=2000 | nc -U ...`|加速|增加每次copy数据条数
`echo nice-ratio=1.0 | nc -U ...`|减速|拷一下，歇一下
`echo panic | nc -U /tmp/gh-ost.sock`|紧急停止|~


## 参考
- https://github.com/github/gh-ost/blob/master/doc/interactive-commands.md