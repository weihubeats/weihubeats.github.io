
## 项目地址

- https://github.com/rtk-ai/rtk

## 作用

rtk 在命令输出到达 LLM 上下文之前进行过滤和压缩。单一 Rust 二进制文件，零依赖，&lt;10ms 开销

## Token 节省（30 分钟 Claude Code 会话）

|操作|	频率|	标准|	rtk|	节省|
|:--:|:--:|:--:|:--:|:--:|
ls / tree|	10x|	2,000|	400|	-80%
cat / read|	20x|	40,000|	12,000|	-70%
grep / rg|	8x|	16,000|	3,200|	-80%
git status|	10x|	3,000|	600|	-80%
git diff|	5x|	10,000|	2,500|	-75%
cargo test| / npm test|	5x	25,000|	2,500|	-90%
总计|		|~118,000|	~23,900|	-80%


## 安装

### Homebrew（推荐）

```bash
brew install rtk
```

### 快速安装（Linux/macOS）

```bash
curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh
```

### Cargo

```bash
cargo install --git https://github.com/rtk-ai/rtk
```

### 验证

```bash
rtk --version   # 应显示 "rtk 0.27.x"
rtk gain        # 应显示 token 节省统计
```

## 快速开始

```bash
# 1. 为 Claude Code 安装 hook（推荐）
rtk init --global

# 2. 重启 Claude Code，然后测试
git status  # 自动重写为 rtk git status
```

## 工作原理

```
  没有 rtk：                                      使用 rtk：

  Claude  --git status-->  shell  -->  git         Claude  --git status-->  RTK  -->  git
    ^                                   |            ^                      |          |
    |        ~2,000 tokens（原始）       |            |   ~200 tokens        | 过滤     |
    +-----------------------------------+            +------- （已过滤）-----+----------+
```

四种策略：

1. **智能过滤** - 去除噪音（注释、空白、样板代码）
2. **分组** - 聚合相似项（按目录分文件，按类型分错误）
3. **截断** - 保留相关上下文，删除冗余
4. **去重** - 合并重复日志行并计数

## 命令

### 文件
```bash
rtk ls .                        # 优化的目录树
rtk read file.rs                # 智能文件读取
rtk find "*.rs" .               # 紧凑的查找结果
rtk grep "pattern" .            # 按文件分组的搜索结果
```

### Git
```bash
rtk git status                  # 紧凑状态
rtk git log -n 10               # 单行提交
rtk git diff                    # 精简 diff
rtk git push                    # -> "ok main"
```

### 测试
```bash
rtk jest                        # Jest 紧凑输出
rtk vitest                      # Vitest 紧凑输出
rtk pytest                      # Python 测试（-90%）
rtk go test                     # Go 测试（-90%）
rtk test <cmd>                  # 仅显示失败（-90%）
```

### 构建 & 检查
```bash
rtk lint                        # ESLint 按规则分组
rtk tsc                         # TypeScript 错误分组
rtk cargo build                 # Cargo 构建（-80%）
rtk ruff check                  # Python lint（-80%）
```

### 容器
```bash
rtk docker ps                   # 紧凑容器列表
rtk docker logs <container>     # 去重日志
rtk kubectl pods                # 紧凑 Pod 列表
```

### 分析
```bash
rtk gain                        # 节省统计
rtk gain --graph                # ASCII 图表（30 天）
rtk discover                    # 发现遗漏的节省机会
```

## 文档

- **[TROUBLESHOOTING.md](https://github.com/rtk-ai/rtk/blob/main/docs/TROUBLESHOOTING.md)** - 解决常见问题
- **[INSTALL.md](https://github.com/rtk-ai/rtk/blob/main/INSTALL.md)** - 详细安装指南
- **[ARCHITECTURE.md](https://github.com/rtk-ai/rtk/blob/main/docs/contributing/ARCHITECTURE.md)** - 技术架构