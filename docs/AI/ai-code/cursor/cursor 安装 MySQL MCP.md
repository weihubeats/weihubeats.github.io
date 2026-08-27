## 为什么安装


大部分场景手动去数据库查询可能更方便

但是有一些场景需要使用`MySQL MCP`

比如我们需要分析某个接口的请求处理逻辑

或者遇到了某个接口代码有 bug

直接让 ai 去分析接口没有上下文参数，导致分析的效果很差

需要自己去补全数据

装上`MySQL MCP`，我们只需要将入参告诉 AI

AI 基于入参会自动去`MySQL`查询数据补全上线

然后基于查询出的数据进行代码逻辑分析，找 bug，修复 bug

## MySQL MCP 推荐

目前主流的是`https://github.com/benborla/mcp-server-mysql`


默认是只读权限，如果为了更安全，可以在配置 mcp 的时候账户使用只读账户


## 配置


### 项目级别

这里推荐配置项目级别的,因为不同项目使用的一般是不同的数据库

在项目的`.cursor`目录中的`mcp.json`文件新增`mysql mcp` 配置





```json
    "mysql": {
      "command": "npx",
      "args": [
        "-y",
        "@benborla29/mcp-server-mysql"
      ],
      "env": {
        "MYSQL_HOST": "xiaozou_host",
        "MYSQL_PORT": "3306",
        "MYSQL_USER": "xiaozou",
        "MYSQL_PASS": "xiaozou_pass",
        "MYSQL_DB": "xiaozou_db"
      }
    },
```

> 账户密码数据库改成自己真实的


`mcp`配置修改完后，打开`Curosr` -》`Setting` -> `Tools &MCPS`

看到`Workspace MCP Servers`中就多了`mysql`的 MCP

手动点击开启，开启正常后有一个小绿灯

## 使用

直接在`Cursor`中让帮忙查询数据即可

### 问题排查

有时候我们开发遇到 bug 或者线上遇到 bug

传统方式就是手动查询相关的数据补充到上线文中手动传给 AI

这种效率比较低下，还需要自己熟悉代码，并且逻辑过于复杂，还是不太能补全缺失的数据库信息

查询效率比较低

配置`MySQL MCP` 后AI 自动查询 BUG 处理问题、分析逻辑的效率大大提升

## 总结