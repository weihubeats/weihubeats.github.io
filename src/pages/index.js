import React, { useState } from 'react';  // 添加useState
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';
import styles from './index.module.css';


// 添加模态框样式（可以放在组件外部）
const modalStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999,
};

const contentStyle = {
  backgroundColor: '#fff',
  padding: '20px',
  borderRadius: '8px',
  textAlign: 'center',
  position: 'relative',
};

const closeStyle = {
  position: 'absolute',
  top: '10px',
  right: '10px',
  cursor: 'pointer',
  fontSize: '24px',
  fontWeight: 'bold',
};

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  const [showModal, setShowModal] = useState(false); // 添加状态管理

  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          {/* 修改原始Link为触发模态的按钮 */}
          <button
            className="button button--secondary button--lg"
            onClick={() => setShowModal(true)}
          >
            公众号:小奏技术 📢
          </button>
        </div>

        {/* 添加二维码模态框 */}
        {showModal && (
          <div style={modalStyle} onClick={() => setShowModal(false)}>
            <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
              <span
                style={closeStyle}
                onClick={() => setShowModal(false)}
                role="button"
                tabIndex={0}
              >
                ×
              </span>
              <h3>微信扫码关注</h3>
              <img
                src="/img/wechat-qrcode.jpg"
                alt="微信公众号二维码"
                style={{
                  width: '580px',
                  height: '280px',
                  margin: '15px 0',
                  border: '1px solid #eee'
                }}
              />
              <p style={{ color: '#666', fontSize: '14px' }}>
                扫码关注获取最新技术资讯
              </p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="技术博客与开发文档">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}