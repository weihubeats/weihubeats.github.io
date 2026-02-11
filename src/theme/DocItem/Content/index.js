import React from 'react';
import Content from '@theme-original/DocItem/Content';

export default function ContentWrapper(props) {
  return (
    <>
      {/* 🌟 这里是你的全局【前缀】 */}
      <div style={{
        padding: '16px 20px',
        // 使用内置的 surface 颜色，亮色下是极浅灰，暗色下是深灰，完美融合
        backgroundColor: 'var(--ifm-background-surface-color)',
        borderRadius: '8px',
        marginBottom: '28px',
        borderLeft: '4px solid var(--ifm-color-primary)', // 左侧保留一条细细的主题色点缀
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)', // 增加淡淡的立体阴影
        fontSize: '0.95rem',
        color: 'var(--ifm-font-color-base)'
      }}>
        👋 哈喽！我是<strong> 小奏</strong> , 欢迎关注我的公众号【<strong>小奏技术</strong>】
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
        <p>本文为博主原创文章，未经博主允许不得转载</p>
      </div>
    </>
  );
}