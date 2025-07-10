## 查看spring boot bean信息

```shell
sc -d org.springframework.context.ApplicationContext


vmtool --action getInstances -c 60e949e1 --className org.springframework.context.ApplicationContext --express 'instances[0].getBean("influhubConfig")' -x 3
```