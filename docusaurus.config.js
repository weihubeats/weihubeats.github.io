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

function getCategoryMeta(dirPath, defaultName) {
  const categoryPath = path.join(dirPath, '_category_.json');
  let position = 999;
  let label = defaultName;

  if (fs.existsSync(categoryPath)) {
    try {
      const content = fs.readFileSync(categoryPath, 'utf8');
      const json = JSON.parse(content);
      if (json.position !== undefined) position = json.position;
      // 🚀 如果配置了 label，就用配置的别名覆盖默认文件名！
      if (json.label !== undefined) label = json.label;
    } catch (e) {
      console.warn(`无法解析 JSON: ${categoryPath}`);
    }
  }
  return { position, label };
}


function getDynamicNavItems() {
  const docsDir = path.resolve(process.cwd(), 'docs');
  if (!fs.existsSync(docsDir)) return [];

  /** @type {any[]} */
  const navItems = [];
  const ignoreFolders = ['images', 'img', 'assets', '.DS_Store'];

  // 1. 获取并处理一级目录
  const topFolders = fs.readdirSync(docsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && !ignoreFolders.includes(dirent.name))
    .map(dirent => {
      // 提前解析元数据
      const meta = getCategoryMeta(path.join(docsDir, dirent.name), dirent.name);
      return { folderName: dirent.name, label: meta.label, position: meta.position };
    })
    .sort((a, b) => {
      if (a.position !== b.position) return a.position - b.position;
      return a.folderName.localeCompare(b.folderName);
    });

  topFolders.forEach(topFolder => {
    // folderName 是真实的物理文件夹名（比如 "Spring-Boot"）
    const topFolderName = topFolder.folderName;
    // label 是网页上显示的漂亮名字（比如 "Spring Boot 专区"）
    const topDisplayLabel = topFolder.label;

    const subDirPath = path.join(docsDir, topFolderName);

    // 2. 获取并处理二级目录
    const subFolders = fs.readdirSync(subDirPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory() && !ignoreFolders.includes(dirent.name))
      .map(dirent => {
        const meta = getCategoryMeta(path.join(subDirPath, dirent.name), dirent.name);
        return { folderName: dirent.name, label: meta.label, position: meta.position };
      })
      .sort((a, b) => {
        if (a.position !== b.position) return a.position - b.position;
        return a.folderName.localeCompare(b.folderName);
      });

    if (subFolders.length > 0) {
      navItems.push({
        label: topDisplayLabel, // 🌟 这里使用漂亮的别名
        type: 'dropdown',
        position: 'left',
        items: subFolders.map(sub => ({
          label: sub.label,     // 🌟 下拉菜单也使用别名
          type: 'docSidebar',
          // ⚠️ ID 必须雷打不动地使用真实物理文件夹名，确保底层路由不断！
          sidebarId: `${topFolderName}_${sub.folderName}`,
        })),
      });
    } else {
      navItems.push({
        label: topDisplayLabel, // 🌟 使用别名
        type: 'docSidebar',
        sidebarId: `${topFolderName}Sidebar`, // ⚠️ 使用真实物理文件夹名
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
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: {
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
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
      href: 'https://cdn.jsdelivr.net/npm/katex@0.13.24/dist/katex.min.css',
      type: 'text/css',
      integrity:
        'sha384-odtC+0UGzzFL/6PNoE8rX/SPcQDXBJ+uRepguP4QkPCm2LBxH3FA3y+fKSiJ+AmM',
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
      announcementBar: {
        id: 'announcementBar-2', // Increment on change
        content: `⭐️ If you like, give it a star on <a target="_blank" rel="noopener noreferrer" href="https://github.com/weihubeats">GitHub</a> and follow me. This web site is updating!! </a>`,
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
          { to: '/blog', label: '博客', position: 'left' },
          {
            href: 'https://github.com/weihubeats/weihubeats.github.io',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Tutorial',
                to: '/docs/intro',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Stack Overflow',
                href: 'https://stackoverflow.com/questions/tagged/docusaurus',
              },
              {
                label: 'Discord',
                href: 'https://discordapp.com/invite/docusaurus',
              },
              {
                label: 'X',
                href: 'https://x.com/docusaurus',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/weihubeats',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
