"use strict";(self.webpackChunkweihubeats_website=self.webpackChunkweihubeats_website||[]).push([[7143],{5639:(e,c,n)=>{n.r(c),n.d(c,{assets:()=>t,contentTitle:()=>r,default:()=>p,frontMatter:()=>s,metadata:()=>d,toc:()=>l});const d=JSON.parse('{"id":"MQ/RocketMQ/\u6700\u4f73\u5b9e\u8df5/RocketMQ\u521b\u5efaTopic\u3001GID\u521b\u5efa\u89c4\u8303","title":"RocketMQ\u521b\u5efaTopic\u3001GID\u521b\u5efa\u89c4\u8303","description":"\u8fd9\u91cc\u662fweihubeats,\u89c9\u5f97\u6587\u7ae0\u4e0d\u9519\u53ef\u4ee5\u5173\u6ce8\u516c\u4f17\u53f7\u5c0f\u594f\u6280\u672f","source":"@site/docs/MQ/RocketMQ/\u6700\u4f73\u5b9e\u8df5/RocketMQ\u521b\u5efaTopic\u3001GID\u521b\u5efa\u89c4\u8303.md","sourceDirName":"MQ/RocketMQ/\u6700\u4f73\u5b9e\u8df5","slug":"/MQ/RocketMQ/\u6700\u4f73\u5b9e\u8df5/RocketMQ\u521b\u5efaTopic\u3001GID\u521b\u5efa\u89c4\u8303","permalink":"/docs/MQ/RocketMQ/\u6700\u4f73\u5b9e\u8df5/RocketMQ\u521b\u5efaTopic\u3001GID\u521b\u5efa\u89c4\u8303","draft":false,"unlisted":false,"editUrl":"https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/docs/MQ/RocketMQ/\u6700\u4f73\u5b9e\u8df5/RocketMQ\u521b\u5efaTopic\u3001GID\u521b\u5efa\u89c4\u8303.md","tags":[],"version":"current","frontMatter":{},"sidebar":"RocketMQ","next":{"title":"RocketMQ5.x\u5fc3\u8df3\u673a\u5236\u4f18\u5316","permalink":"/docs/MQ/RocketMQ/\u6e90\u7801\u5206\u6790/RocketMQ5.x\u5fc3\u8df3\u673a\u5236\u4f18\u5316"}}');var i=n(4848),o=n(8453);const s={},r=void 0,t={},l=[{value:"\u80cc\u666f",id:"\u80cc\u666f",level:2},{value:"Topic\u89c4\u8303",id:"topic\u89c4\u8303",level:2},{value:"\u6d88\u8d39\u8005(gid)\u89c4\u8303",id:"\u6d88\u8d39\u8005gid\u89c4\u8303",level:2},{value:"\u6536\u76ca",id:"\u6536\u76ca",level:2}];function h(e){const c={blockquote:"blockquote",code:"code",h2:"h2",p:"p",strong:"strong",...(0,o.R)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsxs)(c.blockquote,{children:["\n",(0,i.jsxs)(c.p,{children:["\u8fd9\u91cc\u662f",(0,i.jsx)(c.strong,{children:"weihubeats"}),",\u89c9\u5f97\u6587\u7ae0\u4e0d\u9519\u53ef\u4ee5\u5173\u6ce8\u516c\u4f17\u53f7",(0,i.jsx)(c.strong,{children:"\u5c0f\u594f\u6280\u672f"})]}),"\n"]}),"\n",(0,i.jsx)(c.h2,{id:"\u80cc\u666f",children:"\u80cc\u666f"}),"\n",(0,i.jsxs)(c.p,{children:["\u65e9\u671f\u5728\u4f7f\u7528",(0,i.jsx)(c.code,{children:"RocketMQ"}),"\u7684\u65f6\u5019\uff0c\u7cfb\u7edf\u548c\u5f00\u53d1\u4eba\u5458\u4e0d\u7b97\u591a\u3002\u6240\u4ee5topic\u7684\u521b\u5efa\u4f1a\u975e\u5e38\u968f\u610f\uff0c\u5404\u79cd\u5343\u5947\u767e\u602a\u7684",(0,i.jsx)(c.code,{children:"topic"})]}),"\n",(0,i.jsxs)(c.p,{children:["\u6bd4\u5982: ",(0,i.jsx)(c.code,{children:"order_topic"}),"\u3001",(0,i.jsx)(c.code,{children:"ORDER_TOPIC"}),"\u3001",(0,i.jsx)(c.code,{children:"order-topic"})]}),"\n",(0,i.jsx)(c.p,{children:"\u5404\u79cd\u5947\u5947\u602a\u602a\u7684\u98ce\u683c\uff0c\u7528_\u7684\uff0c\u7528\u9a7c\u5cf0\u7684\uff0c\u7eaf\u5927\u5199\u52a0\u4e0b\u5212\u7ebf\u7684\u3002\u5404\u79cd\u98ce\u683c"}),"\n",(0,i.jsxs)(c.p,{children:["\u5176\u5b9e\u8fd9\u4e2a\u8fd8\u4e0d\u662f\u4e3b\u8981\u7684\uff0c\u6bd4\u5982\u4e0a\u9762\u7684",(0,i.jsx)(c.code,{children:"order_topic"}),",\u4f60\u5927\u81f4\u77e5\u9053\u8fd9\u4e2a",(0,i.jsx)(c.code,{children:"topic"}),"\u662f\u5c5e\u4e8e\u8ba2\u5355\u7ec4\u7684\uff0c\u6bd4\u5982\u5982\u679c\u6211\u4eec\u51fa\u73b0\u4e86\u4e00\u4e2a",(0,i.jsx)(c.code,{children:"domain_event"}),"topic\uff0c\u8fd9\u65f6\u5019\u6211\u4eec\u53bb\u770b\u8fd9\u4e2a",(0,i.jsx)(c.code,{children:"topic"}),"\uff0c\u4ed6\u662f\u5c5e\u4e8e\u54ea\u4e2a\u7cfb\u7edf\u7684\u5462\uff1f\u5b9e\u9645\u4f1a\u6bd4\u8f83\u56f0\u60d1"]}),"\n",(0,i.jsxs)(c.p,{children:["\u5305\u62ec\u6bd4\u5982\u8981\u6d88\u8d39\u8fd9\u4e2a",(0,i.jsx)(c.code,{children:"topic"}),"\uff0c\u6211\u4eec\u53ef\u4ee5\u6709\u5982\u4e0bgid\ngid_domian_event"]}),"\n",(0,i.jsxs)(c.p,{children:["\u6211\u770b\u4e86\u8fd9\u4e2agid\u4e5f\u4e0d\u77e5\u9053\u8fd9\u4e2agid\u5c5e\u4e8e\u54ea\u4e2a\u7cfb\u7edf\u7684\uff0c\u662f\u5c5e\u4e8e\u81ea\u5df1\u7cfb\u7edf\u6d88\u8d39\u81ea\u5df1\u7684topic\uff0c\u8fd8\u662f\u5c5e\u4e8e\u5176\u4ed6\u7cfb\u7edf\u6d88\u8d39",(0,i.jsx)(c.code,{children:"domian_event"}),"\u8fd9\u4e2a",(0,i.jsx)(c.code,{children:"topic"})]}),"\n",(0,i.jsxs)(c.p,{children:["\u6240\u4ee5\u53ef\u4ee5\u770b\u5230\u5982\u679c\u6ca1\u6709\u4e00\u4e2a",(0,i.jsx)(c.code,{children:"topic"}),"\u548c",(0,i.jsx)(c.code,{children:"gid"}),"\u521b\u5efa\u89c4\u8303\uff0c\u6709\u65f6\u5019\u8fd9\u4e9b",(0,i.jsx)(c.code,{children:"topic"}),"\u548c",(0,i.jsx)(c.code,{children:"gid"}),"\u4f1a\u975e\u5e38\u6ca1\u6709\u610f\u4e49\uff0c\u5728\u505a",(0,i.jsx)(c.code,{children:"topic"}),"\u6216\u8005",(0,i.jsx)(c.code,{children:"gid"}),"\u7ef4\u62a4\u7684\u65f6\u5019\u770b\u8fd9\u4e9b\u540d\u5b57\u662f\u975e\u5e38\u6ca1\u6709\u610f\u4e49\u7684"]}),"\n",(0,i.jsx)(c.h2,{id:"topic\u89c4\u8303",children:"Topic\u89c4\u8303"}),"\n",(0,i.jsxs)(c.p,{children:["topic\u7684\u521b\u5efa\u89c4\u8303\u6211\u4eec\u63a8\u8350\u662f\n",(0,i.jsx)(c.code,{children:"serviceName"})," + ",(0,i.jsx)(c.code,{children:"topicName"}),"(\u4e1a\u52a1\u540d\u79f0)"]}),"\n",(0,i.jsx)(c.p,{children:"\u4e3e\u4e2a\ud83c\udf30"}),"\n",(0,i.jsx)(c.p,{children:"\u6bd4\u5982\u6211\u4eec\u6709\u8ba2\u5355\u7cfb\u7edf(order)\u8981\u521b\u5efa\u81ea\u5df1\u7684\u9886\u57df\u4e8b\u4ef6topic"}),"\n",(0,i.jsxs)(c.p,{children:["\u5219",(0,i.jsx)(c.code,{children:"topic"}),"\u540d\u79f0\u4e3a:",(0,i.jsx)(c.code,{children:"order-domain-event-topic"})]}),"\n",(0,i.jsx)(c.h2,{id:"\u6d88\u8d39\u8005gid\u89c4\u8303",children:"\u6d88\u8d39\u8005(gid)\u89c4\u8303"}),"\n",(0,i.jsxs)(c.p,{children:["\u89c4\u8303\uff1a",(0,i.jsx)(c.code,{children:"gid"})," + ",(0,i.jsx)(c.code,{children:"\u6d88\u8d39\u7cfb\u7edf"})," + ",(0,i.jsx)(c.code,{children:"consume"})," + ",(0,i.jsx)(c.code,{children:"topic"})]}),"\n",(0,i.jsxs)(c.p,{children:["\u5982\u679c\u662f\u81ea\u5df1\u6d88\u8d39\u81ea\u5df1\u5219\u7701\u7565 ",(0,i.jsx)(c.code,{children:"\u6d88\u8d39\u7cfb\u7edf"})," + ",(0,i.jsx)(c.code,{children:"consume"}),"\u53d8\u6210"]}),"\n",(0,i.jsxs)(c.p,{children:[(0,i.jsx)(c.code,{children:"gid"})," + ",(0,i.jsx)(c.code,{children:"topic"})]}),"\n",(0,i.jsx)(c.p,{children:"\u4e3e\u4e2a\ud83c\udf30"}),"\n",(0,i.jsx)(c.p,{children:"\u6bd4\u5982\u6211\u4eec\u652f\u4ed8\u8981\u6d88\u8d39\u8ba2\u5355\u7684topic\n\u90a3\u4e48\u6211\u4eec\u7684gid\u4e3a"}),"\n",(0,i.jsx)(c.p,{children:(0,i.jsx)(c.code,{children:"gid-pay-consume-order-domain-event-topic"})}),"\n",(0,i.jsxs)(c.p,{children:["\u5982\u679c\u8ba2\u5355\u8981\u6d88\u8d39\u81ea\u5df1\u7684",(0,i.jsx)(c.code,{children:"topic"}),"\u5462\uff1f"]}),"\n",(0,i.jsx)(c.p,{children:"\u90a3\u6211\u4eec\u5c31\u53ef\u4ee5\u7701\u7565 \u6d88\u8d39\u7cfb\u7edf + consume\uff0c\u76f4\u63a5\u662fgid+topic"}),"\n",(0,i.jsxs)(c.p,{children:["\u6bd4\u5982 ",(0,i.jsx)(c.code,{children:"gid-order-domain-event-topic"})]}),"\n",(0,i.jsx)(c.p,{children:"\u4e00\u4e9b\u9519\u8bef\u7684gid\u547d\u540d\u4f8b\u5b50"}),"\n",(0,i.jsx)(c.h2,{id:"\u6536\u76ca",children:"\u6536\u76ca"}),"\n",(0,i.jsxs)(c.p,{children:["\u8fd9\u6837\u6211\u4eec\u770b\u5230\u6bcf\u4e2a",(0,i.jsx)(c.code,{children:"topic"}),"\u548c",(0,i.jsx)(c.code,{children:"gid"}),"\u5c31\u77e5\u9053\u662f\u5e72\u561b\u7684\u4e86"]}),"\n",(0,i.jsxs)(c.p,{children:["\u6bd4\u5982\u7ed9\u4f60\u4e00\u4e2a",(0,i.jsx)(c.code,{children:"order-domain-event-topic"})]}),"\n",(0,i.jsxs)(c.p,{children:["\u4f60\u5c31\u77e5\u9053\u662f\u8ba2\u5355\u7ec4\u7684\u9886\u57df\u4e8b\u4ef6",(0,i.jsx)(c.code,{children:"topic"})]}),"\n",(0,i.jsxs)(c.p,{children:["\u770b\u5230",(0,i.jsx)(c.code,{children:"gid-order-domain-event-topic"})," \u5c31\u662f\u8ba2\u5355\u7ec4\u81ea\u5df1\u6d88\u8d39\u81ea\u5df1\u7684",(0,i.jsx)(c.code,{children:"order-domain-event-topic"})]}),"\n",(0,i.jsxs)(c.p,{children:["\u770b\u5230",(0,i.jsx)(c.code,{children:"gid-pay-consume-order-domain-event-topic"}),"\u5c31\u77e5\u9053\u662f\u652f\u4ed8\u7528\u6765\u6d88\u8d39\u8ba2\u5355\u7684",(0,i.jsx)(c.code,{children:"order-domain-event-topic"})," topic"]}),"\n",(0,i.jsxs)(c.p,{children:["\u5f53\u7136\u5982\u679c\u516c\u53f8\u6709\u8db3\u591f\u7684\u7814\u53d1\u8d44\u6e90\u8fd8\u662f\u53ef\u4ee5\u81ea\u7814",(0,i.jsx)(c.code,{children:"RocketMQ"})," \u7684dashboard\uff0c\u4ece\u6d41\u7a0b\u4e0a\u53bb\u89c4\u8303",(0,i.jsx)(c.code,{children:"topic"}),"\u7684\u521b\u5efa\uff0c\u6bd4\u5982\u521b\u5efa",(0,i.jsx)(c.code,{children:"topic"}),"\u7684\u65f6\u5019\u9700\u8981\u8bf4\u660e\u5c5e\u4e8e\u54ea\u4e2a\u7cfb\u7edf\uff0c\u7528\u9014\u7b49"]}),"\n",(0,i.jsx)(c.p,{children:"\u4e0d\u77e5\u9053\u5176\u4ed6\u5c0f\u4f19\u4f34\u6709\u6ca1\u6709\u4ec0\u4e48\u66f4\u597d\u7684\u5efa\u8bae\u5462"})]})}function p(e={}){const{wrapper:c}={...(0,o.R)(),...e.components};return c?(0,i.jsx)(c,{...e,children:(0,i.jsx)(h,{...e})}):h(e)}},8453:(e,c,n)=>{n.d(c,{R:()=>s,x:()=>r});var d=n(6540);const i={},o=d.createContext(i);function s(e){const c=d.useContext(o);return d.useMemo((function(){return"function"==typeof e?e(c):{...c,...e}}),[c,e])}function r(e){let c;return c=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:s(e.components),d.createElement(o.Provider,{value:c},e.children)}}}]);