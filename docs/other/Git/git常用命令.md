## Git常用命令


### 查看 Git 提交的用户名和邮箱

```bash

# 查看全局用户名
git config --global user.name

# 查看全局邮箱
git config --global user.email

```


### 查看当前项目的局部配置（优先级更高）

```bas
# 进入项目目录（示例）
cd /your/project/path

# 查看当前项目的用户名
git config user.name

# 查看当前项目的邮箱
git config user.email
```

## 设置 / 修改 Git 用户名和邮箱

### 设置全局配置（推荐，所有项目共用）

```bash
# 设置全局用户名
git config --global user.name "Your Full Name"

# 设置全局邮箱（建议用 GitHub/GitLab 绑定的邮箱）
git config --global user.email "your_email@example.com"
```

- 示例

```bash
git config --global user.name "Zhang San"
git config --global user.email "zhangsan@company.com"
```

### 设置项目局部配置（仅当前项目生效）

如果某个项目需要使用不同的用户名 / 邮箱（比如工作项目用公司邮箱，个人项目用私人邮箱），进入项目目录后执行：


```bash
# 进入项目目录
cd /your/project/path

# 设置当前项目的用户名
git config user.name "Your Project Specific Name"

# 设置当前项目的邮箱
git config user.email "project_specific_email@example.com"
```

### 验证

```bash
# 验证全局配置
git config --global user.name
git config --global user.email

# 验证项目局部配置（进入项目目录）
git config user.name
git config user.email
```

### 重置/删除配置

```
# 删除全局用户名
git config --global --unset user.name

# 删除当前项目的邮箱
git config --unset user.email
```