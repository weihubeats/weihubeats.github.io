
## 简介

[Code Review Graph](https://github.com/tirth8205/code-review-graph) 是一个专为 AI 编码助手（如 Cursor、Claude Code 等）设计的本地知识图谱工具。它通过构建代码的结构化地图，让 AI 只读取真正需要的相关文件，从而大幅减少 Token 消耗并提升代码审查的精确度


## 安装

`Code Review Graph`对 Python 版本有严格要求（>= 3.10）。为了避免污染系统环境或产生依赖冲突，建议使用虚拟环境


### Python 高版本虚拟环境安装

`python`多版本管理推荐使用`pyenv`

```
 pyenv install 3.11.0
```

激活虚拟环境,并安装核心包

```
# 创建一个名为 venv_crg 的 Python 虚拟环境
python -m venv venv_crg

source venv_crg/bin/activate

pip install code-review-graph
```

## 在项目中初始化

在项目根目录运行以下命令：

```bash
code-review-graph install --platform cursor
```

它的作用是：

自动在项目中生成 .cursorrules 文件。这相当于给 AI 下达了强制指令：“审查本项目的代码时，必须优先查询本地图谱，不许瞎猜”。

自动在 .cursor/mcp.json 中写入与后台服务连接的配置项。


构建知识图谱数据库

```bash
code-review-graph build
```

它的作用是：

扫描当前目录下的代码，执行语法解析，并在本地生成 SQLite 数据库（真正的“外挂大脑”）。

(注：当项目发生大规模代码重构或拉取了大量新分支代码后，建议重新执行此命令以更新图谱。)


## 使用


在`curosr`中直接可以直接这么使用

`@review-changes  基于 master和当前分支对比，请找出核心架构层面的变更，并帮我输出一份标准 Markdown 格式的 Review 文档`

上线前都可以执行输出一份 ai code review 代码

如果公司基建比较强 可以考虑加到 ci 中自动审查


## 地址

- https://github.com/tirth8205/code-review-graph