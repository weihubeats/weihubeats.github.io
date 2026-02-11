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