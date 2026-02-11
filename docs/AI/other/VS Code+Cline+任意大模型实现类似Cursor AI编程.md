>大家好，这里是**小奏**,觉得文章不错可以关注公众号**小奏技术**

## 背景

大家都知道`Cursor`在写前端代码的时候写的真是又快又好。

效率嘎嘎翻倍



但是有个问题的就是价格还是比较高的，一个月20美刀还是算比较贵的。


那么有没有能实现自动写码，但是价格比较低或者免费的替代方案呢？


答案也是有的

那就是 `VS Code` + `Cline` + 任意大模型

## 使用

### VS Code 安装Cline

安装很简单。直接扩展里面搜`安装cline`


![alt text](images/vs-code-cline-plugin.png)

然后点击安装

安装完成后我们打开`Cline`

mac按下`command` +`shift` + `P`

输入`Cline`


![alt text](images/vs-code-cline-open.png)

选择`Open In New Tab`


### 配置Cline


![alt text](images/hi-cline.png)

然后选择使用自己的`API Key`进行配置


这里有很多很多知名大模型可以选择，然后填入key就行了。

我这里为了白嫖，选择aliyun免费的模型(送了几百万token)



![alt text](images/vs-code-cline-settings.png)


这里注意`API Provider`选择`OpenAI Compatible`

- Base URL: https://dashscope.aliyuncs.com/compatible-mode/v1
- API Key: 自己去`阿里云百炼`控制台创建

> https://bailian.console.aliyun.com/?tab=home#/home

- Model ID: `deepseek-v3`

> 模型这里我选用的是deepseek-v3。想使用其他模型也可以自己去`阿里云百炼`找到相关的模型id进行替换





然后最好给`Cline`所有的操作权限


## 效果

比如我们让他帮我们自动写一个负载均衡算法

![alt text](images/vs-code-clien-gif.gif)


注意我们在使用的时候最好把相关的文件读写权限都给`Cline`

![alt text](images/vs-code-cline-approve.png)

不然每一步都会进行询问，比如要打开文件，你要手动同意


## 总结

总的来说效果还行吧。

不过没有进行很复杂的实际需求编写，具体和`Cursor`相比差多少就不知道了。

其次如果模型使用`claude`相关应该会比一般模型更好