
1. 为项目创建虚拟环境

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