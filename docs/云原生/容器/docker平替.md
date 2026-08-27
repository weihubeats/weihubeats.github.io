## docker替换

`Docker Desktop`是付费项目

为了找免费的平替，决定使用`Podman Desktop`


## 下载安装 Podman Desktop

1.	下载 Podman Desktop：

前往 `Podman Desktop` 官网 下载适安装包并进行安装

2. 初始化 Podman 虚拟机（Windows 和 macOS 需要）：

•	打开 Podman Desktop，它会检测到你没有安装 Podman 后端引擎，并提示你安装

•	点击界面上的 "Set up" 或 "Install"，它会自动帮你配置好底层的 Podman 虚拟机（基于 WSL2 或 QEMU）。

也可以通过命令行手动初始化并启动：

```bash
podman machine init
podman machine start
```

## 配置环境变量

```bash
# 将 Podman 路径写入 zsh 配置文件
echo 'export PATH="/opt/podman/bin:$PATH"' >> ~/.zshrc

# 刷新配置使其立刻生效
source ~/.zshrc
```

## 配置别名兼容 docker 命令

Podman 的命令行参数和 Docker 几乎 100% 一致。为了让你原有的脚本或肌肉记忆不需要改变，可以做以下配置：


1. 设置命令别名（Alias）

```bash
# 1. 将别名追加到配置文件末尾
echo "alias docker=podman" >> ~/.zshrc

# 2. 让配置立即生效（无需重启终端）
source ~/.zshrc
```

## 镜像源配置

如果继续使用`docker`拉取镜像，需要配置登入`docker`，不然会被限制拉取不到镜像

1.	打开 Podman Desktop

2.	点击左下角的 Settings (设置) ⚙️ -> 选择 Registries

下面有`Docker Hub` 然后输入账户密码登入即可
