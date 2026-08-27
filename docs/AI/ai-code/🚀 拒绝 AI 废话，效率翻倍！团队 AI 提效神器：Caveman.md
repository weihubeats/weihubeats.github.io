各位小伙伴，在日常开发中使用 AI（Cursor / Claude / Copilot 等）时，你是否有过这样的体验：

•	问一个简单的报错，AI 先跟客套半天：“这是一个非常好的问题！发生这个错误的原因是...”

•	让 AI 看一段代码，输出了三屏文字，其中两屏都是格式化的总结和废话

•	消耗了大量的 Token，不仅生成速度慢，还要从文字海洋里扒拉真正的代码

今天向大家推荐一个轻量级的 AI 提效插件 / 提示词策略 —— Caveman（穴居人模式），帮我们彻底过滤 AI 废话，直奔技术主题

## 💡 什么是 Caveman？


📊 效果对比：普通 AI vs Caveman 模式

#### 提问：`Explain what an API is.`

| 普通 AI 回复 (冗长) | Caveman 模式回复 (极简) |
| --- | --- |
| *“Hello! An API, or Application Programming Interface, is a set of rules and protocols... Think of it like a waiter in a restaurant who takes your order to the kitchen...”* (耗时长，占用 200+ Tokens) | **`API like waiter. You order food, waiter fetch from kitchen, give to you. Pass data between apps. Done.`** (瞬间生成，仅占 20 Tokens) |

---

## 🔥 核心功能一览

### 1. 日常开发问答 (`/caveman`)

无论查报错、问语法还是写函数，AI 都会给出极其干练的输出，拿来即用，绝不拖泥带水。

### 2. 高效代码审查 (`/caveman-review`)

在提交 PR 或进行 Code Review 时，使用 `/caveman-review`，AI 会使用结构化的**风险级别前缀**为你输出干货建议，拒绝“老好人”式的平庸评价：

- 🔴 **bug**：破坏性缺陷 / 导致崩溃的错误（必须修复）
- 🟡 **risk**：潜在隐患 / 逻辑漏洞（建议关注）
- 🔵 **nit**：代码风格 / 命名规则（微调建议）
- ❓ **q**：对代码逻辑或架构意图的提问

> **Review 效果示例**：
> 🔴 **bug**: Line 42 handles `undefined` improperly. Will throw `TypeError`.
> 🟡 **risk**: Missing `await` on `db.commit()` at line 78. Potential race condition.
> 🔵 **nit**: Rename `x` to `userData` for clarity.

---

## 🛠️ 如何在项目中一键开启？（以 Cursor 为例）

为了让全团队无缝使用，最推荐的方式是在项目中增加配置文件：

### 步骤：

在项目的根目录下新建文件 `.cursorrules`（或 `.cursor/rules/caveman.mdc`），粘贴以下配置并保存：

```markdown
---
description: Caveman mode for token saving and fast responses
alwaysApply: true
---
Talk like a caveman. 
Strip all filler, introductions, hedging, and pleasantries. 
Keep code, shell commands, paths, and technical accuracy 100% exact. 
Use short fragments. Maximum token efficiency.
```

*开启新对话后，Cursor 将自动全局应用 Caveman 极简模式！*

---

## 团队已经用了 RTK，为什么还需要 Caveman

不少关注 Token 优化的同学会问：“我们团队已经在用 **RTK (Rust Token Killer)** 压缩命令行输出了，还有必要用 Caveman 吗？”

**答案是：非常必要！两者是“输入 vs 输出”的强强联合，配合使用才能实现收益最大化。**

| 维度  | RTK (Rust Token Killer) | Caveman |
| --- | --- | --- |
| **控制环节** | **管“输入” (Input Context)** | **管“输出” (Output Generation)** |
| **处理对象** | 拦截并压缩 Shell 命令的冗余输出（如 `git status`、`pytest`、`cargo test` 的无用日志） | 约束 AI 的语言和思维方式，彻底剥离生成的客套、总结与废话 |
| **成本/速度** | 减少 AI 接收的内容量，防 Context 撑爆 | 减少 AI 生成的内容（**Output Token 单价通常比 Input 贵 3~5 倍，且直接决定了生成耗时！**） |
| **场景覆盖** | 依赖 Agent 频繁执行终端命令的场景 | 纯对话问答、代码重构、Code Review、架构讨论等全场景 |

> 💡 **一句话总结**：
> 
> - **RTK** 让 AI **“少看废话”**（工具输出降噪）。
> - **Caveman** 让 AI **“少说废话”**（模型回答提纯）。
> - 单用 RTK 无法阻止 AI 给你回一段长篇大论，**“RTK + Caveman” 组合才是真正的 360° 无死角省 Token 方案**。

---
