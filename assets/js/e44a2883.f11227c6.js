"use strict";(self.webpackChunkweihubeats_website=self.webpackChunkweihubeats_website||[]).push([[4736],{4306:(e,n,t)=>{t.d(n,{A:()=>s});const s=t.p+"assets/images/localeDropdown-f0d995e751e7656a1b0dbbc1134e49c2.png"},6379:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>l,contentTitle:()=>i,default:()=>u,frontMatter:()=>o,metadata:()=>s,toc:()=>c});const s=JSON.parse('{"id":"tutorial-extras/translate-your-site","title":"Translate your site","description":"Let\'s translate docs/intro.md to French.","source":"@site/docs/tutorial-extras/translate-your-site.md","sourceDirName":"tutorial-extras","slug":"/tutorial-extras/translate-your-site","permalink":"/docs/tutorial-extras/translate-your-site","draft":false,"unlisted":false,"editUrl":"https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/docs/tutorial-extras/translate-your-site.md","tags":[],"version":"current","sidebarPosition":2,"frontMatter":{"sidebar_position":2},"sidebar":"tutorialSidebar","previous":{"title":"Manage Docs Versions","permalink":"/docs/tutorial-extras/manage-docs-versions"},"next":{"title":"Apache Kafka 4.0\u65b0\u7279\u6027","permalink":"/docs/MQ/Kafka/Apache Kafka 4.0\u65b0\u7279\u6027"}}');var a=t(4848),r=t(8453);const o={sidebar_position:2},i="Translate your site",l={},c=[{value:"Configure i18n",id:"configure-i18n",level:2},{value:"Translate a doc",id:"translate-a-doc",level:2},{value:"Start your localized site",id:"start-your-localized-site",level:2},{value:"Add a Locale Dropdown",id:"add-a-locale-dropdown",level:2},{value:"Build your localized site",id:"build-your-localized-site",level:2}];function d(e){const n={a:"a",admonition:"admonition",code:"code",h1:"h1",h2:"h2",header:"header",img:"img",p:"p",pre:"pre",...(0,r.R)(),...e.components};return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(n.header,{children:(0,a.jsx)(n.h1,{id:"translate-your-site",children:"Translate your site"})}),"\n",(0,a.jsxs)(n.p,{children:["Let's translate ",(0,a.jsx)(n.code,{children:"docs/intro.md"})," to French."]}),"\n",(0,a.jsx)(n.h2,{id:"configure-i18n",children:"Configure i18n"}),"\n",(0,a.jsxs)(n.p,{children:["Modify ",(0,a.jsx)(n.code,{children:"docusaurus.config.js"})," to add support for the ",(0,a.jsx)(n.code,{children:"fr"})," locale:"]}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-js",metastring:'title="docusaurus.config.js"',children:"export default {\n  i18n: {\n    defaultLocale: 'en',\n    locales: ['en', 'fr'],\n  },\n};\n"})}),"\n",(0,a.jsx)(n.h2,{id:"translate-a-doc",children:"Translate a doc"}),"\n",(0,a.jsxs)(n.p,{children:["Copy the ",(0,a.jsx)(n.code,{children:"docs/intro.md"})," file to the ",(0,a.jsx)(n.code,{children:"i18n/fr"})," folder:"]}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-bash",children:"mkdir -p i18n/fr/docusaurus-plugin-content-docs/current/\n\ncp docs/intro.md i18n/fr/docusaurus-plugin-content-docs/current/intro.md\n"})}),"\n",(0,a.jsxs)(n.p,{children:["Translate ",(0,a.jsx)(n.code,{children:"i18n/fr/docusaurus-plugin-content-docs/current/intro.md"})," in French."]}),"\n",(0,a.jsx)(n.h2,{id:"start-your-localized-site",children:"Start your localized site"}),"\n",(0,a.jsx)(n.p,{children:"Start your site on the French locale:"}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-bash",children:"npm run start -- --locale fr\n"})}),"\n",(0,a.jsxs)(n.p,{children:["Your localized site is accessible at ",(0,a.jsx)(n.a,{href:"http://localhost:3000/fr/",children:"http://localhost:3000/fr/"})," and the ",(0,a.jsx)(n.code,{children:"Getting Started"})," page is translated."]}),"\n",(0,a.jsx)(n.admonition,{type:"caution",children:(0,a.jsx)(n.p,{children:"In development, you can only use one locale at a time."})}),"\n",(0,a.jsx)(n.h2,{id:"add-a-locale-dropdown",children:"Add a Locale Dropdown"}),"\n",(0,a.jsx)(n.p,{children:"To navigate seamlessly across languages, add a locale dropdown."}),"\n",(0,a.jsxs)(n.p,{children:["Modify the ",(0,a.jsx)(n.code,{children:"docusaurus.config.js"})," file:"]}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-js",metastring:'title="docusaurus.config.js"',children:"export default {\n  themeConfig: {\n    navbar: {\n      items: [\n        // highlight-start\n        {\n          type: 'localeDropdown',\n        },\n        // highlight-end\n      ],\n    },\n  },\n};\n"})}),"\n",(0,a.jsx)(n.p,{children:"The locale dropdown now appears in your navbar:"}),"\n",(0,a.jsx)(n.p,{children:(0,a.jsx)(n.img,{alt:"Locale Dropdown",src:t(4306).A+"",width:"370",height:"302"})}),"\n",(0,a.jsx)(n.h2,{id:"build-your-localized-site",children:"Build your localized site"}),"\n",(0,a.jsx)(n.p,{children:"Build your site for a specific locale:"}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-bash",children:"npm run build -- --locale fr\n"})}),"\n",(0,a.jsx)(n.p,{children:"Or build your site to include all the locales at once:"}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-bash",children:"npm run build\n"})})]})}function u(e={}){const{wrapper:n}={...(0,r.R)(),...e.components};return n?(0,a.jsx)(n,{...e,children:(0,a.jsx)(d,{...e})}):d(e)}},8453:(e,n,t)=>{t.d(n,{R:()=>o,x:()=>i});var s=t(6540);const a={},r=s.createContext(a);function o(e){const n=s.useContext(r);return s.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function i(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(a):e.components||a:o(e.components),s.createElement(r.Provider,{value:n},e.children)}}}]);