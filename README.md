## weihubeats 博客源码

## 运行

```shell
npm run start
```

> 需要安装node
> 如果是第一次运行，需要`npm install  `

node安装

```shell
# 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 重新加载 shell 配置
source ~/.zshrc  # 如果使用 bash，改为 source ~/.bashrc

# 安装最新 LTS 版本的 Node.js
nvm install --lts
nvm use --lts

# 设置为默认版本
nvm alias default node
```


## 地址

[访问地址](https://weihubeats.github.io)


## 一些注意事项

1. 标题不能带`()`、`%`特殊字符
2. label才是页面显示的标题
3. 内容不允许直接出现`<xx>`相关的内容，必须用代码块包裹
4. 文件目录中如果不存在任何内容，加入页面标签则会报错


## 推送

```shell

git add .
git commit -m 'update'

git push -u origin main
```