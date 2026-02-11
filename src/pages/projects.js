import React from 'react';
import Layout from '@theme/Layout';

// 把你的项目数据集中写在这里
const projectList = [
    {
        name: 'event-bus-rocketmq-all',
        desc: '基于 RocketMQ 的高性能事件总线最佳实践与落地脚手架。',
        url: 'https://github.com/weihubeats/event-bus-rocketmq-all',
        tags: ['Java', 'RocketMQ', 'EventBus'],
    },
    {
        name: 'spring-boot-nebula',
        desc: 'spring boot common 让在spring boot上开发更简单，开箱即用的web组件、分布式锁组件等各种常用组件',
        url: 'https://github.com/weihubeats/spring-boot-nebula',
        tags: ['Java', 'Spring Boot', 'jar'],
    },
    {
        name: 'fluxcache',
        desc: '基于 Spring Boot 的多级缓存框架',
        url: 'https://github.com/weihubeats/fluxcache',
        tags: ['Java', 'Spring Boot', 'cache', 'redis'],
    },
    {
        name: 'Asuna',
        desc: '觉得比较有意思或者有用的开源项目整理',
        url: 'https://github.com/weihubeats/Asuna',
        tags: ['GO', 'DOC'],
    },
    {
        name: 'mybatis-plus-generator',
        desc: 'MyBatis-Plus 代码生成器',
        url: 'https://github.com/weihubeats/mybatis-plus-generator',
        tags: ['Java', 'MyBatis', '代码生成'],
    },
    {
        name: 'mybatis-plus-generator',
        desc: 'MyBatis-Plus 代码生成器',
        url: 'https://github.com/weihubeats/mybatis-plus-generator',
        tags: ['Java', 'MyBatis', '代码生成'],
    },

    {
        name: 'ignite',
        desc: '一款基于 Arthas 的 IDEA 插件。支持右键直接运行任意 Java 方法/Spring Bean',
        url: 'https://github.com/weihubeats/ignite',
        tags: ['Java', 'idea', 'DeBug'],
    }
];

export default function Projects() {
    return (
        <Layout title="我的开源项目" description="WeiHubeats 的开源项目展示">
            <main className="container margin-vert--lg">
                <div className="text--center margin-bottom--xl">
                    <h1>💻 我的开源项目</h1>
                    <p>Talk is cheap. Show me the code.</p>
                </div>

                <div className="row">
                    {projectList.map((project, idx) => (
                        <div key={idx} className="col col--4 margin-bottom--lg">
                            {/* 使用 Docusaurus 内置的卡片 UI */}
                            <div className="card shadow--md" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <div className="card__header">
                                    <h3>{project.name}</h3>
                                </div>
                                <div className="card__body">
                                    <p>{project.desc}</p>
                                    {/* 渲染技术栈标签 */}
                                    <div>
                                        {project.tags.map(tag => (
                                            <span key={tag} className="badge badge--secondary margin-right--sm">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="card__footer" style={{ marginTop: 'auto' }}>
                                    <a
                                        href={project.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="button button--primary button--block"
                                    >
                                        查看 GitHub 源码
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </Layout>
    );
}