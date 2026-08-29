---
title: 如何用 AI 打通飞书文档：lark-cli 实战
description: 让 Cursor / Claude 等 AI 通过 lark-cli 直接读写飞书文档与知识库，实现从本地 Markdown 到线上文档的一键打通。
---

## 为什么需要打通 AI 与飞书文档？

写文档的工作流通常是这样：

- 本地用 Markdown 写，方便、支持 `git` 版本管理
- 但团队协作、评审、分享都在飞书云文档 / Wiki

于是出现了"写一次、两边维护"的痛苦：

```
本地 Markdown 更新了  ->  飞书文档还是旧版本
```

打通之后，AI 会在本地产出 Markdown，然后**自动调用 `lark-cli` 把内容写入飞书**，飞书云文档随时保持和本地一致：

1. AI 在本地写 / 改 Markdown
2. AI 调用 `lark-cli` 创建或更新飞书文档
3. 飞书文档成为线上镜像（在线预览、团队分享、评论），本地保留源稿

## 核心原则与架构设计

```
┌──────────────┐   1. 本地生成 Markdown    ┌──────────────┐
│ Cursor / AI  │ ────────────────────────▶ │   本地 Markdown 源稿    │
└──────┬───────┘                          └──────┬───────┘
       │ 2. 自动调用 lark-cli                    │ 3. 写入飞书
       └────────────────┐                        │
                        ▼                        ▼
              ┌──────────────────────┐  ┌──────────────────────┐
              │   lark-cli (API v2)  │  │ 飞书云文档 / Wiki      │
              │   命令行 / Agent      │─▶│ 线上镜像               │
              └──────────────────────┘  └──────────────────────┘
```

核心思路：**文档源稿留在本地（Markdown），飞书只作为发布/协作的目标地**。AI 的职责是把两者同步起来。

## Lark CLI 环境搭建

### 1. 安装 CLI

```
npx @larksuite/cli@latest install
```

安装完成后会生成 `lark-cli` 命令。若需要给 AI Agent 加载官方 Skills（推荐）：

```
npx skills add larksuite/cli -y -g
```

### 2. 权限与应用配置

1. 访问飞书开放平台（或海外版 Lark Open Platform），创建企业自建应用；
2. 开通权限范围（Scopes）：
   - `docx:document`（云文档创建/编辑）
   - `docs:document:readonly`（云文档只读）
   - `wiki:wiki`（知识库空间与节点操作）
   - `drive:drive`（云空间文件管理）
3. 发布应用版本：权限开通后必须发布一个版本使权限生效

### 3. 初始化凭据（解决 not_configured 错误）

```
# 国内飞书 (feishu.cn)
echo "你的_APP_SECRET" | lark-cli config init --app-id "cli_xxxxxxxxxxxx" --app-secret-stdin --brand feishu
# 海外版 Lark (larksuite.com)
echo "你的_APP_SECRET" | lark-cli config init --app-id "cli_xxxxxxxxxxxx" --app-secret-stdin --brand lark
# 用户登录授权（开通常用权限）
lark-cli auth login --recommend
```

### 4. 验证

```
lark-cli auth status
```

## 常用 CLI 读写指令速查

### 创建文档（新建时）

```
# 创建到个人知识库
lark-cli docs +create \
  --parent-position my_library \
  --doc-format markdown \
  --content @./payment-admin-web-EKS部署SOP.md
# 创建到指定的团队 Wiki 节点下 / 云盘文件夹下
lark-cli docs +create \
  --parent-token "wikcnXXXXXXXXXXXXX" \
  --doc-format markdown \
  --content @./<本地Markdown路径>
```

创建成功返回示例：

```json
{
  "ok": true,
  "data": {
    "doc_id": "doxcnW400yK7JkO9gXhTXXXXXX",
    "doc_url": "https://feishu.cn/docx/doxcnW400yK7JkO9gXhTXXXXXX"
  }
}
```

### 读取文档（AI 理解已有内容）

```
# 读取整篇文档
lark-cli docs +fetch --doc "文档URL或token"

# 输出为 Markdown，方便 AI 继续处理
lark-cli docs +fetch --doc "文档URL或token" --doc-format markdown
```

### 更新 / 维护原生 .md 文件

```
# 覆盖更新云盘中的 .md 文件
lark-cli markdown +overwrite \
  --file-token boxcnXXXX \
  --file ./README.md

# 局部替换（先下载→本地改→再覆盖上传）
lark-cli markdown +patch \
  --file-token boxcnXXXX \
  --pattern "version 1.0" --content "version 2.0"

# 对比本地草稿与云端版本
lark-cli markdown +diff \
  --file-token boxcnXXXX --file ./README.md
```

## 核心原理

`lark-cli` 是飞书官方 CLI，等价于一个**终端 + AI 友好的飞书 API 客户端**：

1. **三层调用**：`+快捷命令`（人机/Agent 友好）→ `API 命令`（与平台端点一一对应）→ `api 通用调用`（覆盖 2500+ 飞书 OpenAPI）
2. **Markdown 原生支持**：`docs +create --doc-format markdown` 直接把 Markdown 转成飞书云文档；`markdown` 系列命令则直接维护 Drive 中的 `.md` 文件
3. **认证即服务**：`config init` 保存应用凭据，`auth login` 走 OAuth 获得用户授权，后续所有命令自动携带身份
4. **AI Agent 原生设计**：26 个官方 Skills（`lark-doc`、`lark-markdown` 等）开箱即用，命令带智能默认值与结构化 JSON 输出，方便 AI 判断成功失败

## 使用示例：让 AI 把本地文档同步到飞书

场景：本地有一份 Markdown 文档，需要同步到团队 Wiki。

**第 1 步**：本地写好 Markdown 源稿

```markdown
# 部署 SOP

## 前置条件
- Python 3.10+
- kubectl 已配置

## 部署步骤
1. 构建镜像
2. 推送镜像
3. 应用 YAML
```

**第 2 步**：让 AI（Cursor / Claude）调用 `lark-cli` 创建飞书文档

```
lark-cli docs +create \
  --parent-token "wikcnXXXXXXXXXXXXX" \
  --doc-format markdown \
  --content @./deploy-sop.md
```

**第 3 步**：AI 把返回的文档 URL 带回给用户，分享到群/评论区

```json
{
  "ok": true,
  "data": {
    "doc_url": "https://feishu.cn/docx/doxcnW400yK7JkO9gXhTXXXXXX"
  }
}
```

**第 4 步**（迭代修改）：本地改动后，AI 用 `+fetch` 校验线上内容，再按需更新

```
lark-cli docs +fetch --doc "https://feishu.cn/docx/doxcnW400yK7JkO9gXhTXXXXXX" --doc-format markdown
```

## 参考文档

- [lark-cli 官方仓库](https://github.com/larksuite/cli)
- [lark-cli 使用文档（README）](https://www.npmjs.com/package/@larksuite/cli)
- [飞书开放平台](https://open.feishu.cn/document/)
- [自研 Agent 接入飞书 CLI](https://open.larkoffice.com/document/mcp_open_tools/feishu-cli/embed-feishu-cli-in-agent)
- [lark-doc / lark-markdown Skills 说明](https://github.com/larksuite/cli/tree/main/skills)