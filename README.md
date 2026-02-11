## weihubeats 博客源码

## 地址

[访问地址](https://weihubeats.github.io)

## 运行

```shell
npm run start

# 不使用默认浏览器打开 解决IPv4 与 IPv6 的冲突
npm run start -- --host 0.0.0.0 --no-open
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

## URL规范

默认情况下，如果你的文件叫 docs/MQ/RocketMQ/01-基础概念.md，生成的 URL 就是 `.../RocketMQ/01-基础概念`。 当别人复制你的文章链接分享到微信或论坛时，链接会被自动转码成这样： `https://yoursite.com/docs/MQ/RocketMQ/01-%E5%9F%BA%E7%A1%80%E6%A6%82%E5%BF%B5`

 这不仅极不美观，而且极易被各类社交平台截断，导致别人点进去直接 404

最佳实践是使用

```
---
title: RocketMQ 的核心概念与架构设计  # 这是网页上显示的漂亮中文标题
slug: /rocketmq/core-concepts      # 🌟 这是在浏览器地址栏显示的永久英文 URL
---

正文从这里开始...
```

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


## 数学公式支持

```
npm install --save remark-math@6 rehype-katex@7
```

修改配置

- docusaurus.config.js

```js
// docusaurus.config.js
import {themes as prismThemes} from 'prism-react-renderer';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default {
  // ... 其他配置
  presets: [
    [
      'classic',
      {
        docs: {
          path: 'docs',
          // 添加这两个插件
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
        },
        blog: {
          // 如果博客也需要支持，同样添加
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      },
    ],
  ],
  
  // 务必添加 KaTeX 的 CSS 样式表，否则公式会没有样式（看起来很乱）
  stylesheets: [
    {
      href: 'https://cdn.jsdelivr.net/npm/katex@0.13.24/dist/katex.min.css',
      type: 'text/css',
      integrity:
        'sha384-odtC+0UGzzFL/6PNoE8rX/SPcQDXBJ+uRepguP4QkPCm2LBxH3FA3y+fKSiJ+AmM',
      crossorigin: 'anonymous',
    },
  ],
};
```


## 图片放大

```
npm install --save docusaurus-plugin-image-zoom
```

配置

- docusaurus.config.js

```js
export default {
  // ... 前面的配置

  // 1. 注册插件
  plugins: [
    'docusaurus-plugin-image-zoom',
  ],

  // 2. 在 themeConfig 中配置具体参数
  themeConfig: {
    // ... 原有的 navbar, footer 等配置

    // 添加 zoom 配置项
    zoom: {
      // 指定哪些图片可以被放大（这里设置为 Markdown 内容里的图片）
      selector: '.markdown :not(em) > img', 
      background: {
        light: 'rgba(255, 255, 255, 0.9)', // 亮色模式下的遮罩背景色
        dark: 'rgba(50, 50, 50, 0.9)'      // 暗色模式下的遮罩背景色
      },
      config: {
        // 你可以在这里添加 medium-zoom 的原生配置，通常留空即可
      }
    },
  },
};
```


## Mermaid支持

```
npm install --save @docusaurus/theme-mermaid
```

修改配置

- docusaurus.config.js

```js
// docusaurus.config.js
export default {
  title: '你的网站标题',
  // ... 其他基础配置

  // 1. 开启 Markdown 中的 Mermaid 支持 (这是 Docusaurus v3 的新写法)
  markdown: {
    mermaid: true,
  },

  // 2. 将 Mermaid 主题添加到 themes 列表中
  themes: [
    '@easyops-cn/docusaurus-search-local', // 这是我们之前配置的搜索插件
    '@docusaurus/theme-mermaid',           // 👈 添加这一行
  ],

  presets: [
    // ...
  ],
};
```

## 展示文章最后更新时间

Docusaurus 底层会自动读取当前文件的 Git 提交历史（Git commit），来计算出这篇文章的最后修改时间和修改人。

第一步：修改配置文件 打开你的 docusaurus.config.js，在你配置 docs 和 blog 的地方，开启这两个选项：showLastUpdateTime 和 showLastUpdateAuthor

```js
export default {
  // ...
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.js',
          // ⬇️ 开启文档的最后更新时间和作者
          showLastUpdateTime: true,
          showLastUpdateAuthor: true,
        },
        blog: {
          // 如果你之前没有禁用 blog，在这里开启
          showLastUpdateTime: true,
          showLastUpdateAuthor: true,
        },
      },
    ],
  ],
};
```

使用`GitHub Actions`自动部署

自动部署网站，默认情况下它只会拉取“最近 1 次”的 Git 记录，这会导致所有文章的更新时间都变成“你刚刚部署的时间”。 解决方法：在你的 GitHub Actions 部署脚本（.github/workflows/deploy.yml）中，找到 actions/checkout，加上 fetch-depth: 0，让它拉取完整的 Git 历史

```yaml
- uses: actions/checkout@v3
  with:
    fetch-depth: 0  # 👈 必须加这个，否则更新时间不准
```

## 首位自定义

```
npm run swizzle @docusaurus/theme-classic DocItem/Content -- --wrap
```

修改生成的 Wrapper 文件 打开刚刚生成的 src/theme/DocItem/Content/index.js（或 .tsx），你可以像写普通的 React 组件一样，在正文的上下添加任何内容！

把它改成类似这样：

```js
import React from 'react';
import Content from '@theme-original/DocItem/Content';

export default function ContentWrapper(props) {
  return (
    <>
      {/* 🌟 这里是你的全局【前缀】 */}
      <div style={{ 
        padding: '12px', 
        backgroundColor: 'var(--ifm-color-primary-lightest)', 
        borderRadius: '8px',
        marginBottom: '20px',
        borderLeft: '4px solid var(--ifm-color-primary)'
      }}>
        👋 <strong>哈喽！我是 WeiHubeats。</strong> 欢迎关注我的公众号/GitHub，获取最新技术干货！
      </div>

      {/* 📄 这里是 Docusaurus 原本的文章正文 */}
      <Content {...props} />

      {/* 🌟 这里是你的全局【后缀】 */}
      <div style={{ 
        marginTop: '40px', 
        paddingTop: '20px', 
        borderTop: '1px solid var(--ifm-toc-border-color)',
        textAlign: 'center',
        color: 'var(--ifm-color-emphasis-700)'
      }}>
        <p>🎉 原创不易，如果这篇文章对你有帮助，欢迎点个赞或分享给朋友！</p>
      </div>
    </>
  );
}
```