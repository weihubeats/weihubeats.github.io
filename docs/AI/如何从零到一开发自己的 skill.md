

## 创建目录结构

在项目根目录（或者全局配置目录下），找到或创建一个符合你 `agents.md` 规范的技能目录，比如 `./.agents/skills/`

```
你的项目/
└── .agents/
    └── skills/
        └── my-first-skill/    # skill name
            └── SKILL.md       # 主文件，必须使用该名字(必须)
            └── scripts/       # 可执行脚本（可选）
            └── references/    # 详细参考文档（可选，按需加载）
            └── resources/     # 模板、清单等资源（可选）
            └── examples/      # 示例（可选）
```

## 编写 SKILL.md（YAML 头部 + 正文）

打开`SKILL.md`，粘贴并修改以下模板：

```
---
name: my-first-skill
description: 当用户要求“检查慢查询”、“优化 SQL”或“排查数据库性能”时触发。这个技能提供了一套严格的数据库与 MyBatis 优化标准。
---

# 数据库与 SQL 优化专家规则

当你被触发执行数据库相关的任务时，必须严格遵守以下步骤和规范：

## 1. 索引审查 (Index Review)
- 在编写任何查询语句之前，必须先要求查看对应表的 DDL 或索引结构。
- 绝不允许写出导致全表扫描（Full Table Scan）的条件，例如前缀模糊匹配 `LIKE '%xxx'`。

## 2. MyBatis 规范
- 严禁使用 `<select id="..." resultType="map">` 这种无类型约束的写法，必须映射到具体的 Entity 或 DTO。
- 所有的批量插入必须使用 `<foreach>` 标签，严禁在 Java 代码的 `for` 循环中单条 `insert`。

## 3. 性能底线
- 所有查询必须带有 `LIMIT`，或者通过 PageHelper 进行了分页限制。
- 严禁在代码里使用 `SELECT *`，只查询业务实际需要的字段。
```

## Skill核心原理

- `name`：技能的唯一标识符，最好用小写字母加中划线（kebab-case）

- `description`: AI（比如 Cursor）在平时聊天时不会把整个 SKILL.md 塞进上下文（为了省 Token），它只会看 description。当你的提问与 description 高度匹配时，它才会把下面的正文加载进来。因此，你的描述必须包含清晰的触发条件（比如：“当进行前端重构时触发”、“当写单元测试时触发”）
- 正文部分：这里就是你给 AI 写的 Prompt。建议像你写 agents.md 那样，用祈使句、列表和明确的红线（“严禁”、“必须”）来约束 AI

## 测试

输入一句命中 description 的话，比如：“帮我检查一下 UserService 里的这段 SQL 性能如何。”

此时，如果你看到回复气泡上方出现了类似 Using rule: my-first-skill，或者 AI 的回答严格遵循了你刚刚写的 MyBatis 规范，就说明你的 Skill 开发成功并且生效了

## 开源发布

1. 在 GitHub 上新建一个公开仓库（例如命名为 my-awesome-sql-skill）。

2. 把包含 SKILL.md 的文件夹 push 到这个仓库的根目录。

3. 执行`npx skills add 你的GitHub用户名/my-awesome-sql-skill` 即可安装


## 如何编写一个企业级 skill

知道了如何写`skill` 和能写一个好的`skill`是两码事

如何写一个好的`skill`呢

要注意下如下事情

