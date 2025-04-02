## 背景

早期安装的`Homebrew`不支持m系列的芯片


## 安装

```shell
# 卸载当前可能不完整的 Homebrew 安装
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/uninstall.sh)"

# 安装适用于 Apple Silicon 的 Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

```

安装报错

```shell
安装报错 Error: Your Command Line Tools are too outdated.
Update them from Software Update in System Preferences.

If that doesn't show you any updates, run:
  sudo rm -rf /Library/Developer/CommandLineTools
  sudo xcode-select --install

Alternatively, manually download them from:
  https://developer.apple.com/download/all/.
You should download the Command Line Tools for Xcode 14.2.

```


卸载旧版本的命令行工具，安装新版本的命令行工具

```shell
# 删除旧版命令行工具
sudo rm -rf /Library/Developer/CommandLineTools

# 安装新版命令行工具
sudo xcode-select --install

```

安装完成后重新安装`Homebrew`

```shell
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

安装 Homebrew 后，按照之前的建议配置 PATH 环境变量

```shell
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```