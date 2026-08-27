## 背景

这里整理一份`cursor`常用的`mcp`配置


```json
{
  "mcpServers": {
    "code-review-graph": {
      "command": "/Users/weihubeats/Desktop/sofa/java/venv_crg/bin/code-review-graph",
      "args": [
        "serve"
      ],
      "type": "stdio",
      "env": {
        "PATH": "/Users/weihubeats/.pyenv/shims:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin"
      }
    },
    "mysql": {
      "command": "npx",
      "args": [
        "-y",
        "@benborla29/mcp-server-mysql"
      ],
      "env": {
        "MYSQL_HOST": "xiaozou_host",
        "MYSQL_PORT": "3306",
        "MYSQL_USER": "xiaozou",
        "MYSQL_PASS": "xiaozou_pass",
        "MYSQL_DB": "xiaozou_db"
      }
    },
    "agentmemory": {
      "command": "/opt/homebrew/bin/npx",
      "args": [
        "-y", 
        "@agentmemory/mcp"
      ],
      "env": {
        "AGENTMEMORY_URL": "http://localhost:3111",
        "PATH": "/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin"
      }
    }
  }
}

```