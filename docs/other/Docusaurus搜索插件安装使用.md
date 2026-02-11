## 官方页面申请

[DocSearch Apply](https://docsearch.algolia.com/apply/)

## 申请完后会得到如下配置信息

```
import docsearch from '@docsearch/js';
import '@docsearch/css';

docsearch({
  container: '#docsearch',
  appId: 'JBXS0SATOD',
  indexName: 'docusaurus-github-page',
  apiKey: 'bfad805f458axsabb49358d2a71033c0',
  askAi: 'YOUR_ALGOLIA_ASSISTANT_ID', // TODO: Replace with your Algolia Assistant ID
});
```

主要是如下三个会用到

- appId

- indexName

- apiKey

## Docusaurus中配置

拿到邮件中的这三个凭证后，打开你的 docusaurus.config.js 文件，找到 themeConfig，将 algolia 对象添加进去：

```js

      algolia: {
        appId: 'JBXS0UZTOD',
        apiKey: 'bfad805f458a9e9bb49358d2a71033c0',
        indexName: 'docusaurus-github-page',
        contextualSearch: true,
      },
```

## 首次爬虫获取