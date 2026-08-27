## Open Code Review 是什么？

Open Code Review 是一款 AI 驱动的代码审查 CLI 工具。它的前身是阿里集团内部官方 AI 代码审查助手，过去两年在内部服务了数万开发者，识别了数百万个代码缺陷。经过大规模充分验证后，我们将其孵化为开源项目，对社区开放。只需配置一个模型端点即可使用。

它读取 Git diff，通过具备工具调用能力的 Agent 将变更文件发送至可配置的 LLM，生成具有行级精度的结构化审查意见。Agent 可以读取完整文件内容、搜索代码库、检查其他变更文件以获取上下文，从而进行深度审查——而非仅停留在表面的 diff 反馈。除了 diff 审查，ocr scan 可以审查整个文件，适用于审计不熟悉的代码库或没有有意义 diff 的目录。


## 使用

两种使用方式

1. 自己准备 LLM，也就是 准备大模型的 api key
2. 委托模式: 也就直接使用类似`cursor`这类编程工具，这些工具已内置 LLM 订阅额度


## Cursor使用


### 安装 Open Code Review CLI 工具


```
npm install -g @alibaba-group/open-code-review
```

> 因为使用 Delegate 模式，不需要执行 ocr config provider 配置 LLM


### 在 Cursor 中安装本地插件


1.	先将官方代码库克隆到本地：

```
git clone https://github.com/alibaba/open-code-review.git
```

2. 将插件目录复制到 Cursor 的本地插件目录中

```
mkdir -p ~/.cursor/plugins/local/
cp -r open-code-review/plugins/open-code-review ~/.cursor/plugins/local/
```

3. 重启 Cursor

## 在 Cursor 中使用


```
@Open Code Review review my current changes
```


请使用 ocr 审查我当前的代码改动