"use strict";(self.webpackChunkweihubeats_website=self.webpackChunkweihubeats_website||[]).push([[4616],{8453:(e,n,t)=>{t.d(n,{R:()=>l,x:()=>a});var r=t(6540);const c={},o=r.createContext(c);function l(e){const n=r.useContext(o);return r.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function a(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(c):e.components||c:l(e.components),r.createElement(o.Provider,{value:n},e.children)}},9706:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>s,contentTitle:()=>a,default:()=>h,frontMatter:()=>l,metadata:()=>r,toc:()=>i});const r=JSON.parse('{"id":"MQ/RocketMQ/\u6e90\u7801\u5206\u6790/RocketMQ5.x\u5fc3\u8df3\u673a\u5236\u4f18\u5316","title":"RocketMQ5.x\u5fc3\u8df3\u673a\u5236\u4f18\u5316","description":"\u80cc\u666f","source":"@site/docs/MQ/RocketMQ/\u6e90\u7801\u5206\u6790/RocketMQ5.x\u5fc3\u8df3\u673a\u5236\u4f18\u5316.md","sourceDirName":"MQ/RocketMQ/\u6e90\u7801\u5206\u6790","slug":"/MQ/RocketMQ/\u6e90\u7801\u5206\u6790/RocketMQ5.x\u5fc3\u8df3\u673a\u5236\u4f18\u5316","permalink":"/docs/MQ/RocketMQ/\u6e90\u7801\u5206\u6790/RocketMQ5.x\u5fc3\u8df3\u673a\u5236\u4f18\u5316","draft":false,"unlisted":false,"editUrl":"https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/docs/MQ/RocketMQ/\u6e90\u7801\u5206\u6790/RocketMQ5.x\u5fc3\u8df3\u673a\u5236\u4f18\u5316.md","tags":[],"version":"current","frontMatter":{},"sidebar":"RocketMQ","previous":{"title":"RocketMQ\u521b\u5efaTopic\u3001GID\u521b\u5efa\u89c4\u8303","permalink":"/docs/MQ/RocketMQ/\u6700\u4f73\u5b9e\u8df5/RocketMQ\u521b\u5efaTopic\u3001GID\u521b\u5efa\u89c4\u8303"},"next":{"title":"RocketMQ\u78c1\u76d8\u6ee1\u4e86\u5f88\u614c\u4e0d\u77e5\u600e\u4e48\u529e\uff1f\u542c\u6211\u7ed9\u4f60\u6e90\u7801\u5206\u6790\u8fc7\u671f\u6587\u4ef6\u5982\u4f55\u5220\u9664","permalink":"/docs/MQ/RocketMQ/\u6e90\u7801\u5206\u6790/RocketMQ\u78c1\u76d8\u6ee1\u4e86\u5f88\u614c\u4e0d\u77e5\u600e\u4e48\u529e\uff1f\u542c\u6211\u7ed9\u4f60\u6e90\u7801\u5206\u6790\u8fc7\u671f\u6587\u4ef6\u5982\u4f55\u5220\u9664"}}');var c=t(4848),o=t(8453);const l={},a=void 0,s={},i=[{value:"\u80cc\u666f",id:"\u80cc\u666f",level:2},{value:"\u4f18\u5316\u5fc3\u8df3 [RIP-64] Heartbeat Optimization",id:"\u4f18\u5316\u5fc3\u8df3-rip-64-heartbeat-optimization",level:2},{value:"\u4f18\u5316\u65b9\u5411",id:"\u4f18\u5316\u65b9\u5411",level:3},{value:"\u6e90\u7801\u5206\u6790",id:"\u6e90\u7801\u5206\u6790",level:3},{value:"sendHeartbeatToAllBrokerV2",id:"sendheartbeattoallbrokerv2",level:4},{value:"\u53c2\u8003",id:"\u53c2\u8003",level:2}];function d(e){const n={a:"a",code:"code",h2:"h2",h3:"h3",h4:"h4",li:"li",ol:"ol",p:"p",pre:"pre",ul:"ul",...(0,o.R)(),...e.components};return(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)(n.h2,{id:"\u80cc\u666f",children:"\u80cc\u666f"}),"\n",(0,c.jsxs)(n.p,{children:["\u76ee\u524d",(0,c.jsx)(n.code,{children:"client"}),"\u5728\u542f\u52a8\u540e\u4f1a\u5b9a\u65f6\u5411\u6240\u6709",(0,c.jsx)(n.code,{children:"broker"}),"\u53d1\u9001\u5fc3\u8df3,\u901a\u8fc7\u5fc3\u8df3\u6570\u636e\u4ee5\u544a\u77e5",(0,c.jsx)(n.code,{children:"broker"}),"\u8be5\u5ba2\u6237\u7aef\u53ef\u6b63\u5e38\u5de5\u4f5c\u3002\u540c\u65f6\u4fdd\u8bc1channel\u7684\u4e0d\u4f1a\u56e0\u4e3a\u5fc3\u8df3\u5f02\u5e38\u800c\u88ab\u5173\u95ed"]}),"\n",(0,c.jsx)(n.pre,{children:(0,c.jsx)(n.code,{className:"language-java",children:'        this.scheduledExecutorService.scheduleAtFixedRate(() -> {\n            try {\n                MQClientInstance.this.cleanOfflineBroker();\n                MQClientInstance.this.sendHeartbeatToAllBrokerWithLock();\n            } catch (Exception e) {\n                log.error("ScheduledTask sendHeartbeatToAllBroker exception", e);\n            }\n        }, 1000, this.clientConfig.getHeartbeatBrokerInterval(), TimeUnit.MILLISECONDS);\n'})}),"\n",(0,c.jsx)(n.p,{children:"\u5fc3\u8df3\u95f4\u9694\u9ed8\u8ba430s\u4e00\u6b21"}),"\n",(0,c.jsx)(n.pre,{children:(0,c.jsx)(n.code,{className:"language-java",children:"private int heartbeatBrokerInterval = 1000 * 30;\n\n"})}),"\n",(0,c.jsxs)(n.p,{children:["\u4f46\u662f\u76ee\u524d",(0,c.jsx)(n.code,{children:"client"}),"\u6bcf\u6b21\u53d1\u9001\u7684\u5fc3\u8df3\u6570\u636e\u90fd\u5305\u542b\u62ec\u8be5\u5ba2\u6237\u7aef\u4e0b\u7684\u6240\u6709\u6d88\u8d39\u8005\u7684\u8ba2\u9605\u6570\u636e\uff0c\u8fd9\u5728\u6bcf\u4e2a",(0,c.jsx)(n.code,{children:"consumerGroup"}),"\u90fd\u5177\u6709\u76f8\u540c\u7684\u8ba2\u9605\u60c5\u51b5\u4e0b\uff0c\u6570\u636e\u548c\u8ba1\u7b97\u5177\u6709\u4e00\u5b9a\u7684\u5197\u4f59\u6027"]}),"\n",(0,c.jsx)(n.h2,{id:"\u4f18\u5316\u5fc3\u8df3-rip-64-heartbeat-optimization",children:"\u4f18\u5316\u5fc3\u8df3 [RIP-64] Heartbeat Optimization"}),"\n",(0,c.jsxs)(n.p,{children:["\u6240\u4ee5\u5728",(0,c.jsx)(n.code,{children:"RocketMQ"})," [RIP-64]\u63d0\u51fa\u4e86\u5bf9\u5fc3\u8df3\u673a\u5236\u8fdb\u884c\u4f18\u5316\uff0c\u63a8\u51fa\u4e86",(0,c.jsx)(n.code,{children:"useHeartbeatV2"})]}),"\n",(0,c.jsx)(n.h3,{id:"\u4f18\u5316\u65b9\u5411",children:"\u4f18\u5316\u65b9\u5411"}),"\n",(0,c.jsxs)(n.p,{children:["\u65e2\u7136\u662f\u8ba2\u9605\u6570\u636e\u4e0d\u53d8\u7684",(0,c.jsx)(n.code,{children:"consumerGroup"}),"\u53d1\u9001\u5ba2\u6237\u7aef\u6240\u6709\u7684\u6d88\u8d39\u4e2d\u7684\u8ba2\u9605\u6570\u636e\u592a\u5197\u4f59\uff0c\u90a3\u4e48\u6211\u4eec\u5c31\u53ef\u4ee5\u8fdb\u884c\u5982\u4e0b\u4f18\u5316:"]}),"\n",(0,c.jsx)(n.p,{children:"\u5728\u5e73\u65f6\u7684\u5fc3\u8df3\u53d1\u9001\u8fc7\u7a0b\u4e2d\u4e0d\u7528\u53d1\u9001\u5168\u91cf\u5b8c\u6574\u7684\u5fc3\u8df3\u6570\u636e\uff0c\u53ea\u9700\u8981\u7b80\u5355\u53d1\u9001\u8ba2\u9605\u6570\u636e\u7684\u6307\u7eb9\uff0c\u4ece\u800c\u51cf\u5c11\u5ba2\u6237\u7aef\u5411broker\u4f20\u8f93\u7684\u5fc3\u8df3\u6570\u636e\u4ee5\u53cabroker\u5bf9\u4e8e\u5fc3\u8df3\u7684\u91cd\u590d\u8ba1\u7b97"}),"\n",(0,c.jsx)(n.h3,{id:"\u6e90\u7801\u5206\u6790",children:"\u6e90\u7801\u5206\u6790"}),"\n",(0,c.jsxs)(n.ol,{children:["\n",(0,c.jsxs)(n.li,{children:["\u9996\u5148\u5728",(0,c.jsx)(n.code,{children:"ClientConfig"}),"\u4e2d\u65b0\u589e\u914d\u7f6e",(0,c.jsx)(n.code,{children:"useHeartbeatV2"}),"\uff0c\u8868\u793a\u662f\u5426\u5f00\u542fv2\u7248\u672c\u7684\u5fc3\u8df3\uff0c\u9ed8\u8ba4",(0,c.jsx)(n.code,{children:"false"})]}),"\n"]}),"\n",(0,c.jsx)(n.pre,{children:(0,c.jsx)(n.code,{className:"language-java",children:'public static final String HEART_BEAT_V2 = "com.rocketmq.heartbeat.v2";\n\nprivate boolean useHeartbeatV2 = Boolean.parseBoolean(System.getProperty(HEART_BEAT_V2, "false"));\n'})}),"\n",(0,c.jsx)(n.p,{children:"\u53ef\u4ee5\u901a\u8fc7\u7cfb\u7edf\u53c2\u6570\u8fdb\u884c\u8bbe\u7f6e\u5f00\u542f"}),"\n",(0,c.jsx)(n.pre,{children:(0,c.jsx)(n.code,{className:"language-java",children:'System.setProperty(ClientConfig.HEART_BEAT_V2, "true");\n'})}),"\n",(0,c.jsxs)(n.p,{children:["\u5728\u539f\u5148\u7684",(0,c.jsx)(n.code,{children:"sendHeartbeatToAllBrokerWithLock"}),"\u65b9\u6cd5\u4e2d\u4f1a\u8fdb\u884c\u5224\u65ad\u662f\u5426\u5f00\u542fV2\u7248\u672c\u7684\u5fc3\u8df3\u673a\u5236"]}),"\n",(0,c.jsx)(n.pre,{children:(0,c.jsx)(n.code,{className:"language-java",children:'    public boolean sendHeartbeatToAllBrokerWithLock() {\n        if (this.lockHeartbeat.tryLock()) {\n            try {\n                if (clientConfig.isUseHeartbeatV2()) {\n                    return this.sendHeartbeatToAllBrokerV2(false);\n                } else {\n                    return this.sendHeartbeatToAllBroker();\n                }\n            } catch (final Exception e) {\n                log.error("sendHeartbeatToAllBroker exception", e);\n            } finally {\n                this.lockHeartbeat.unlock();\n            }\n        } else {\n            log.warn("lock heartBeat, but failed. [{}]", this.clientId);\n        }\n        return false;\n    }\n'})}),"\n",(0,c.jsx)(n.h4,{id:"sendheartbeattoallbrokerv2",children:"sendHeartbeatToAllBrokerV2"}),"\n",(0,c.jsx)(n.p,{children:"\u6211\u4eec\u6765\u770b\u770bv2\u7248\u672c\u7684\u5fc3\u8df3\u673a\u5236\u4e3b\u8981\u505a\u4ec0\u4e48\uff0c\u548cV1\u6709\u4ec0\u4e48\u533a\u522b"}),"\n",(0,c.jsx)(n.pre,{children:(0,c.jsx)(n.code,{className:"language-java",children:"sendHeartbeatToAllBrokerWithLockV2\n"})}),"\n",(0,c.jsx)(n.h2,{id:"\u53c2\u8003",children:"\u53c2\u8003"}),"\n",(0,c.jsxs)(n.ul,{children:["\n",(0,c.jsx)(n.li,{children:(0,c.jsx)(n.a,{href:"https://docs.google.com/document/d/174p0N7yDX0p_jvaujwHGFsZ410FKbq3vqGT1RUUyV1c/edit?tab=t.0",children:"RIP-64-doc"})}),"\n",(0,c.jsx)(n.li,{children:(0,c.jsx)(n.a,{href:"https://github.com/apache/rocketmq/pull/6724",children:"RIP-64-pr"})}),"\n"]})]})}function h(e={}){const{wrapper:n}={...(0,o.R)(),...e.components};return n?(0,c.jsx)(n,{...e,children:(0,c.jsx)(d,{...e})}):d(e)}}}]);