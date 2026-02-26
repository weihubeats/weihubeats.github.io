import React from 'react';
import Layout from '@theme/Layout';
import styles from './projects.module.css';

const projectList = [
    {
        name: 'event-bus-rocketmq-all',
        desc: '基于 RocketMQ 的高性能事件总线最佳实践与落地脚手架。',
        url: 'https://github.com/weihubeats/event-bus-rocketmq-all',
        tags: ['Java', 'RocketMQ', 'EventBus'],
        avatar: 'https://github.com/weihubeats.png?size=200',
    },
    {
        name: 'spring-boot-nebula',
        desc: 'spring boot common 让在spring boot上开发更简单，开箱即用的web组件、分布式锁组件等各种常用组件',
        url: 'https://github.com/weihubeats/spring-boot-nebula',
        tags: ['Java', 'Spring Boot', 'jar'],
        avatar: 'https://github.com/weihubeats.png?size=200',
    },
    {
        name: 'fluxcache',
        desc: '基于 Spring Boot 的多级缓存框架',
        url: 'https://github.com/weihubeats/fluxcache',
        tags: ['Java', 'Spring Boot', 'cache', 'redis'],
        avatar: 'https://github.com/weihubeats.png?size=200',
    },
    {
        name: 'Asuna',
        desc: '觉得比较有意思或者有用的开源项目整理',
        url: 'https://github.com/weihubeats/Asuna',
        tags: ['GO', 'DOC'],
        avatar: 'https://github.com/weihubeats.png?size=200',
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
        avatar: 'https://github.com/weihubeats.png?size=200',
    },

    {
        name: 'ignite',
        desc: '一款基于 Arthas 的 IDEA 插件。支持右键直接运行任意 Java 方法/Spring Bean',
        url: 'https://github.com/weihubeats/ignite',
        tags: ['Java', 'idea', 'DeBug'],
        avatar: 'https://github.com/weihubeats.png?size=200',
    }
];

export default function Projects() {
    return (
        <Layout title="我的开源项目" description="WeiHubeats 的开源项目展示">
            <main className="container margin-vert--lg">
                <div className="text--center margin-bottom--xl">
                    <h1>我的开源项目</h1>
                    <p>Talk is cheap. Show me the code.</p>
                </div>

                <div className="row">
                    {projectList.map((project, idx) => (
                        <div key={idx} className="col col--4 margin-bottom--lg">
                            <div className="card shadow--md" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

                                {/* 4. 修改卡片头部结构 */}
                                <div className="card__header">
                                    {/* 使用 flex 布局容器 */}
                                    <div className={styles.cardHeaderFlex}>
                                        {/* 渲染头像图片，应用样式类 */}
                                        <img
                                            src={project.avatar}
                                            alt={project.name}
                                            className={styles.projectAvatar}
                                        />
                                        {/* 渲染标题 */}
                                        <h3 className={styles.cardTitle}>{project.name}</h3>
                                    </div>
                                </div>

                                <div className="card__body">
                                    <p>{project.desc}</p>
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
                                        // 给按钮加个图标试试
                                        className="button button--primary button--block"
                                    >
                                        GitHub Star ⭐️
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