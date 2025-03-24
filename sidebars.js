// @ts-check

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.

 @type {import('@docusaurus/plugin-content-docs').SidebarsConfig}
 */
const sidebars = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  tutorialSidebar: [{type: 'autogenerated', dirName: '.'}],
  RocketMQ: [{type: 'autogenerated', dirName: 'MQ/RocketMQ'}],
  Kafka: [{type: 'autogenerated', dirName: 'MQ/Kafka'}],
  springboot: [{type: 'autogenerated', dirName: 'java/spring-boot'}],
  springcloud: [{type: 'autogenerated', dirName: 'java/spring-cloud'}],
  idea: [{type: 'autogenerated', dirName: 'java/idea'}],
  maven: [{type: 'autogenerated', dirName: 'java/maven'}],
  skywalking: [{type: 'autogenerated', dirName: 'APM/skywalking'}],
  Kubernetes: [{type: 'autogenerated', dirName: '云原生/Kubernetes'}],


  // But you can create a sidebar manually
  /*
  tutorialSidebar: [
    'intro',
    'hello',
    {
      type: 'category',
      label: 'Tutorial',
      items: ['tutorial-basics/create-a-document'],
    },
  ],
   */
};

export default sidebars;
