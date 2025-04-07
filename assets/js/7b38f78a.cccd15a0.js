"use strict";(self.webpackChunkweihubeats_website=self.webpackChunkweihubeats_website||[]).push([[7229],{8453:(e,n,t)=>{t.d(n,{R:()=>c,x:()=>l});var s=t(6540);const r={},o=s.createContext(r);function c(e){const n=s.useContext(o);return s.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function l(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:c(e.components),s.createElement(o.Provider,{value:n},e.children)}},9469:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>a,contentTitle:()=>l,default:()=>h,frontMatter:()=>c,metadata:()=>s,toc:()=>i});const s=JSON.parse('{"id":"MQ/RocketMQ/\u8fd0\u7ef4/\u5b8c\u5168\u5220\u9664\u4e00\u4e2aslave\u8282\u70b9","title":"\u5b8c\u5168\u5220\u9664\u4e00\u4e2aslave\u8282\u70b9","description":"1. \u4e0b\u7ebf\u4ece\u8282\u70b9","source":"@site/docs/MQ/RocketMQ/\u8fd0\u7ef4/\u5b8c\u5168\u5220\u9664\u4e00\u4e2aslave\u8282\u70b9.md","sourceDirName":"MQ/RocketMQ/\u8fd0\u7ef4","slug":"/MQ/RocketMQ/\u8fd0\u7ef4/\u5b8c\u5168\u5220\u9664\u4e00\u4e2aslave\u8282\u70b9","permalink":"/docs/MQ/RocketMQ/\u8fd0\u7ef4/\u5b8c\u5168\u5220\u9664\u4e00\u4e2aslave\u8282\u70b9","draft":false,"unlisted":false,"editUrl":"https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/docs/MQ/RocketMQ/\u8fd0\u7ef4/\u5b8c\u5168\u5220\u9664\u4e00\u4e2aslave\u8282\u70b9.md","tags":[],"version":"current","frontMatter":{},"sidebar":"RocketMQ","previous":{"title":"RocketMQ\u4f7f\u7528\u5230\u7684\u7aef\u53e3","permalink":"/docs/MQ/RocketMQ/\u8fd0\u7ef4/RocketMQ\u4f7f\u7528\u5230\u7684\u7aef\u53e3"},"next":{"title":"\u6269\u5bb9","permalink":"/docs/MQ/RocketMQ/\u8fd0\u7ef4/\u6269\u5bb9"}}');var r=t(4848),o=t(8453);const c={},l=void 0,a={},i=[];function d(e){const n={code:"code",li:"li",ol:"ol",p:"p",pre:"pre",...(0,o.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)(n.ol,{children:["\n",(0,r.jsx)(n.li,{children:"\u4e0b\u7ebf\u4ece\u8282\u70b9"}),"\n"]}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-shell",children:"jps java\n\nkill -pid\n"})}),"\n",(0,r.jsxs)(n.ol,{start:"2",children:["\n",(0,r.jsx)(n.li,{children:"\u5220\u9664\u76f8\u5173\u7684\u5143\u6570\u636e"}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"\u9700\u8981\u5220\u9664\u7684\u5143\u6570\u636e"}),"\n",(0,r.jsxs)(n.ol,{children:["\n",(0,r.jsx)(n.li,{children:"\u6d88\u606f\u5b58\u50a8\u76f8\u5173\u6570\u636e"}),"\n"]}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-shell",children:"/data/rmqstore\n"})}),"\n",(0,r.jsxs)(n.ol,{start:"3",children:["\n",(0,r.jsx)(n.li,{children:"\u5220\u9664\u4e3b\u5907\u7684\u7248\u672c\u9636\u6bb5\u3001\u7eaa\u5143\u7b49\u6587\u4ef6"}),"\n"]}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-shell",children:"rm - \uff5e/store/epochFileCheckpoint\nrm - \uff5e/store/epochFileCheckpoint.bak\n"})}),"\n",(0,r.jsxs)(n.ol,{start:"4",children:["\n",(0,r.jsxs)(n.li,{children:["\u4ece",(0,r.jsx)(n.code,{children:"controller"}),"\u5220\u9664\u5143\u6570\u636e\u4fe1\u606f"]}),"\n"]}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-shell",children:"# \u8fdb\u5165\u5012\u811a\u672c\u76ee\u5f55\ncd /root/rocketmq/distribution/target/rocketmq-5.1.0/rocketmq-5.1.0\n# \u67e5\u770b\u540c\u6b65\u4fe1\u606f -a controller\u5730\u5740 -b broker\u540d\u79f0\nsh bin/mqadmin getSyncStateSet -a 127.0.0.1:9878 -b broker-a\n\n# \u5220\u9664\u8282\u70b9\u5143\u6570\u636e -a controller\u5730\u5740 -b broker\u540d\u79f0 -n \u8282\u70b9\u540d\u79f0 -c \u96c6\u7fa4\u540d\u79f0\nsh bin/mqadmin cleanBrokerData -a 127.0.0.1:9878 -b 127.0.0.3:30911 -n broker-a -c xiaozou\n"})})]})}function h(e={}){const{wrapper:n}={...(0,o.R)(),...e.components};return n?(0,r.jsx)(n,{...e,children:(0,r.jsx)(d,{...e})}):d(e)}}}]);