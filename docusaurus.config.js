// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from 'prism-react-renderer';

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

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: {
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
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
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
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Tutorial',
          },
          {
            label: 'MQ',
            type: 'dropdown',
            position: 'left',
            items: [
              {
                type: 'docSidebar',
                sidebarId: 'RocketMQ',
                to: '/docs/MQ/RocketMQ',
                label: 'RocketMQ',
              },
              {
                type: 'docSidebar',
                sidebarId: 'Kafka',
                to: '/docs/MQ/Kafka',
                label: 'Kafka',
              },

            ]

          },
          {
            label: 'Java',
            type: 'dropdown',
            position: 'left',
            items: [
              {
                type: 'docSidebar',
                sidebarId: 'springboot',
                to: '/docs/java/spring-boot',
                label: 'Spring Boot',
              },
              {
                type: 'docSidebar',
                sidebarId: 'springcloud',
                to: '/docs/java/spring-cloud',
                label: 'Spring Cloud',
              },
              {
                type: 'docSidebar',
                sidebarId: 'netty',
                to: '/docs/java/netty',
                label: 'Netty',
              },
              {
                type: 'docSidebar',
                sidebarId: 'RPC',
                to: '/docs/java/RPC',
                label: 'RPC',
              },
              {
                type: 'docSidebar',
                sidebarId: 'ORM',
                to: '/docs/java/ORM',
                label: 'ORM',
              },
              {
                type: 'docSidebar',
                sidebarId: 'idea',
                to: '/docs/java/idea',
                label: 'idea',
              },
              {
                type: 'docSidebar',
                sidebarId: 'maven',
                to: '/docs/java/maven',
                label: 'maven',
              },
              {
                type: 'docSidebar',
                sidebarId: '性能优化',
                to: '/docs/java/性能优化',
                label: '性能优化',
              },
              {
                type: 'docSidebar',
                sidebarId: '系统重构',
                to: '/docs/java/系统重构',
                label: '系统重构',
              },

            ]

          },
          {
            label: 'GO',
            type: 'dropdown',
            position: 'left',
            items: [
              {
                type: 'docSidebar',
                sidebarId: 'GO基础',
                to: '/docs/GO/GO基础',
                label: 'GO基础',
              },

            ]

          },
          {
            type: 'docSidebar',
            sidebarId: 'python',
            position: 'left',
            label: 'python',
          },
          {
            label: 'APM',
            type: 'dropdown',
            position: 'left',
            items: [
              {
                type: 'docSidebar',
                sidebarId: 'skywalking',
                to: '/docs/apm/skywalking',
                label: 'skywalking',
              },
              {
                type: 'docSidebar',
                sidebarId: 'OpenTelemetry',
                to: '/docs/apm/OpenTelemetry',
                label: 'OpenTelemetry',
              },
              {
                type: 'docSidebar',
                sidebarId: 'Prometheus',
                to: '/docs/apm/Prometheus',
                label: 'Prometheus',
              },
              
            ]

          },
          {
            label: '云原生',
            type: 'dropdown',
            position: 'left',
            items: [
              {
                type: 'docSidebar',
                sidebarId: 'Kubernetes',
                to: '/docs/云原生/Kubernetes',
                label: 'Kubernetes',
              },
              {
                type: 'docSidebar',
                sidebarId: 'APISIX',
                to: '/docs/云原生/APISIX',
                label: 'APISIX',
              },
              {
                type: 'docSidebar',
                sidebarId: 'ServiceMesh',
                to: 'docs/云原生/Service-Mesh',
                label: 'Service Mesh',
              },

            ]

          },
          {
            label: 'DevOps',
            type: 'dropdown',
            position: 'left',
            items: [
              {
                type: 'docSidebar',
                sidebarId: 'CICD',
                to: '/docs/devops/cicd',
                label: 'CI/CD',
              }

            ]

          },
          {
            type: 'docSidebar',
            sidebarId: 'AI',
            position: 'left',
            label: 'AI',
          },
          {
            type: 'docSidebar',
            sidebarId: '数据结构与算法',
            position: 'left',
            label: '数据结构与算法',
          },
          {
            type: 'docSidebar',
            sidebarId: '分布式系统',
            position: 'left',
            label: '分布式系统',
          },
          {
            label: '数据库',
            type: 'dropdown',
            position: 'left',
            items: [
              {
                type: 'docSidebar',
                sidebarId: 'MySQL',
                to: '/数据库/MySQL',
                label: 'MySQL',
              },
              {
                type: 'docSidebar',
                sidebarId: 'PostgreSQL',
                to: '/数据库/PostgreSQL',
                label: 'PostgreSQL',
              },
              {
                type: 'docSidebar',
                sidebarId: 'ClickHouse',
                to: '/数据库/ClickHouse',
                label: 'ClickHouse',
              },
              {
                type: 'docSidebar',
                sidebarId: 'Redis',
                to: '/数据库/Redis',
                label: 'Redis',
              },

            ]

          },
                    {
            label: '安全',
            type: 'dropdown',
            position: 'left',
            items: [
              {
                type: 'docSidebar',
                sidebarId: '用户权限',
                to: '/安全/用户权限',
                label: '用户权限',
              },
            ]

          },
          {
            label: '我的开源项目',
            type: 'dropdown',
            position: 'left',
            items: [
              {
                href: 'https://github.com/weihubeats/event-bus-rocketmq-all',
                label: 'event-bus-rocketmq-all',
                target: '_blank',
                rel: null,
              },
              {
                href: 'https://github.com/weihubeats/spring-boot-nebula',
                label: 'spring-boot-nebula',
                target: '_blank',
                rel: null,
              },
              {
                href: 'https://github.com/weihubeats/fluxcache',
                label: 'fluxcache',
                target: '_blank',
                rel: null,
              },
              {
                href: 'https://github.com/weihubeats/ddd-example',
                label: 'ddd-example',
                target: '_blank',
                rel: null,
              },
              {
                href: 'https://github.com/weihubeats/Asuna',
                label: 'Asuna',
                target: '_blank',
                rel: null,
              },
              {
                href: 'https://github.com/weihubeats/mq-idempotent',
                label: 'mq-idempotent',
                target: '_blank',
                rel: null,
              },
              {
                href: 'https://github.com/weihubeats/mybatis-plus-generator',
                label: 'mybatis-plus-generator',
                target: '_blank',
                rel: null,
              },

            ]

          },

          { to: '/blog', label: 'Blog', position: 'left' },
          {
            href: 'https://github.com/weihubeats',
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
