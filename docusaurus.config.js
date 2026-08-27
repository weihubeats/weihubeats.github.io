// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from 'prism-react-renderer';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import fs from 'fs';
import path from 'path';

/**
 * 获取分类的元数据（position/label/hideInNav）
 * @param {string} dirPath - 分类目录的路径
 * @param {string} defaultName - 默认的分类名称
 * @returns {{ position: number, label: string, hideInNav: boolean }} 分类元数据
 */
function getCategoryMeta(dirPath, defaultName) {
  const categoryPath = path.join(dirPath, '_category_.json');
  let position = 999;
  let label = defaultName;
  let hideInNav = false; // 👈 默认不隐藏

  if (fs.existsSync(categoryPath)) {
    try {
      const content = fs.readFileSync(categoryPath, 'utf8');
      const json = JSON.parse(content);
      if (json.position !== undefined) position = json.position;
      if (json.label !== undefined) label = json.label;

      // 🚀 核心：读取官方支持的扩展字段 customProps 里的 hideInNav
      if (json.customProps && json.customProps.hideInNav === true) {
        hideInNav = true;
      }
    } catch (e) {
      console.warn(`无法解析 JSON: ${categoryPath}`);
    }
  }
  return { position, label, hideInNav };
}


// 🚀 动态读取目录，生成导航栏配置
function getDynamicNavItems() {
  const docsDir = path.resolve(process.cwd(), 'docs');
  if (!fs.existsSync(docsDir)) return [];

  /** @type {any[]} */
  const navItems = [];
  // 基础的物理黑名单（纯粹不是文章目录的文件夹依然保留在这里）
  const ignoreFolders = ['images', 'img', 'assets', '.DS_Store'];

  /**
   * 判断目录下（含子目录）是否存在任何 md/mdx 文件，空目录不生成导航
   * @param {string} dirPath - 目录路径
   * @returns {boolean}
   */
  function hasContent(dirPath) {
    return fs.readdirSync(dirPath, { withFileTypes: true }).some(dirent => {
      if (dirent.isFile() && /\.(md|mdx)$/.test(dirent.name)) return true;
      if (dirent.isDirectory() && !ignoreFolders.includes(dirent.name)) {
        return hasContent(path.join(dirPath, dirent.name));
      }
      return false;
    });
  }

  // 1. 获取、过滤并排序【一级目录】
  const topFolders = fs.readdirSync(docsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && !ignoreFolders.includes(dirent.name))
    .map(dirent => {
      const meta = getCategoryMeta(path.join(docsDir, dirent.name), dirent.name);
      return { folderName: dirent.name, label: meta.label, position: meta.position, hideInNav: meta.hideInNav };
    })
    // 🌟 新增过滤条件：剔除掉要求隐藏的目录
    .filter(item => !item.hideInNav)
    // 🌟 剔除掉没有任何文章的空目录
    .filter(item => hasContent(path.join(docsDir, item.folderName)))
    .sort((a, b) => {
      if (a.position !== b.position) return a.position - b.position;
      return a.folderName.localeCompare(b.folderName);
    });

  topFolders.forEach(topFolder => {
    const topFolderName = topFolder.folderName;
    const topDisplayLabel = topFolder.label;
    const subDirPath = path.join(docsDir, topFolderName);

    // 2. 获取、过滤并排序【二级目录】
    const subFolders = fs.readdirSync(subDirPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory() && !ignoreFolders.includes(dirent.name))
      .map(dirent => {
        const meta = getCategoryMeta(path.join(subDirPath, dirent.name), dirent.name);
        return { folderName: dirent.name, label: meta.label, position: meta.position, hideInNav: meta.hideInNav };
      })
      // 🌟 二级目录同样支持隐藏配置
      .filter(item => !item.hideInNav)
      .sort((a, b) => {
        if (a.position !== b.position) return a.position - b.position;
        return a.folderName.localeCompare(b.folderName);
      });

    if (subFolders.length > 0) {
      navItems.push({
        label: topDisplayLabel,
        type: 'dropdown',
        position: 'left',
        items: subFolders.map(sub => ({
          label: sub.label,
          type: 'docSidebar',
          sidebarId: `${topFolderName}_${sub.folderName}`,
        })),
      });
    } else {
      navItems.push({
        label: topDisplayLabel,
        type: 'docSidebar',
        sidebarId: `${topFolderName}Sidebar`,
        position: 'left',
      });
    }
  });

  return navItems;
}

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'weihubeats',
  tagline: 'something you keep in mind will blossom someday',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://weihubeats.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',
  trailingSlash: false,

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'weihubeats', // Usually your GitHub org/user name.
  projectName: 'weihubeats.github.io', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
  },

  plugins: [
    'docusaurus-plugin-image-zoom',
  ],
  markdown: {
    mermaid: true,
  },

  themes: [
    '@docusaurus/theme-mermaid',
  ],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          path: 'docs',
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
          sidebarPath: './sidebars.js',
          showLastUpdateTime: true,
          // 请修改为你的仓库地址，用于生成"编辑此页"链接
          editUrl: 'https://github.com/weihubeats/weihubeats.github.io/edit/main/docs/',
        },
        blog: {
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl: 'https://github.com/weihubeats/weihubeats.github.io/edit/main/blog/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
          showLastUpdateTime: true,
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  stylesheets: [
    {
      // 与 rehype-katex@7 依赖的 katex 0.16.x 版本保持一致
      href: 'https://cdn.jsdelivr.net/npm/katex@0.16.47/dist/katex.min.css',
      type: 'text/css',
      integrity:
        'sha384-lxEFIJ6VcuOSmrKr+LPffgAKBF/EGI7d2+nMMUC1U9KI2AznNXYhVtsQvgcBqfwu',
      crossorigin: 'anonymous',
    },
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      algolia: {
        appId: 'JBXS0UZTOD',
        apiKey: 'bfad805f458a9e9bb49358d2a71033c0',
        indexName: 'docusaurus-github-page',
        contextualSearch: true,
      },
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
      // Replace with your project's social card
      docs: {
        sidebar: {
          hideable: true,
          autoCollapseCategories: true,
        },
      },
      tableOfContents: {
        minHeadingLevel: 2,
        maxHeadingLevel: 5,
      },
      navbar: {
        title: '',
        logo: {
          alt: '',
          src: 'img/logo.svg',
        },
        items: [
          ...getDynamicNavItems(),
          { to: '/projects', label: '开源项目', position: 'right' },
          // { to: '/blog', label: '博客', position: 'left' },
          {
            href: 'https://github.com/weihubeats/weihubeats.github.io',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark', // 可选 'light' 或 'dark'，推荐 dark 显得更稳重
        links: [
          {
            title: '本站导航',
            items: [
              // {
              //   label: '我的博客',
              //   to: '/blog',
              // },
              {
                label: '开源项目',
                to: '/projects', // 👈 指向我们之前建的项目页
              },
            ],
          },
          {
            title: '社交与联系',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/weihubeats',
              },
              {
                label: '掘金主页', // 如果有其他平台，可以加在这里
                href: 'https://juejin.cn/user/395479918848487',
              },
            ],
          },
          {
            title: '更多',
            items: [
              {
                // 如果你有建站源码仓库，可以放这里
                label: '本站源码 (GitHub)',
                href: 'https://github.com/weihubeats/weihubeats.github.io',
              },
            ],
          },
        ],
        // 🌟 版权信息
        // 使用 new Date().getFullYear() 自动获取当前年份，永远不用手动改时间！
        copyright: `
        <p style="margin-bottom: 0;">Copyright © ${new Date().getFullYear()} WeiHubeats. Built with Docusaurus.</p>
      `,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: [
          'java',
          'bash',
          'docker',
          'diff',
          'git',
          'ruby',
          'php',
          'csharp',
          'scala',
          'elixir',
          'haskell',
          'lua',
          'r',
          'clojure',
          'markup-templating',
        ],
      },
    }),
};

export default config;
