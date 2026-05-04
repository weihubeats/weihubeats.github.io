## 为什么需要虚拟环境

1. 依赖隔离
不同项目可能依赖同一个库的不同版本。例如，项目 A 需要 Django 2.2，而项目 B 需要 Django 4.2。在全局 Python 环境中，这两个版本无法共存。


1. 为项目创建虚拟环境

2. 避免版本冲突
包之间的依赖关系复杂，全局安装可能导致依赖冲突。虚拟环境确保每个项目的依赖独立管理。

3. 系统 Python 保护
许多操作系统依赖系统 Python 及其包。修改全局 Python 环境可能导致系统功能损坏。

进入项目，运行

```shell
# .venv 是虚拟环境的文件夹名，可以自定义
python3 -m venv .venv
```

2. 激活虚拟环境

```shell
source .venv/bin/activate
```


之后可以在虚拟环境中安装自己想要安装的库
```shell
# 这时就不需要用 pip3 了，直接用 pip
pip install pandas
```