---
type: docs
title: "stop CLI 命令参考"
linkTitle: "stop"
description: "有关 stop CLI 命令的详细信息"
---

### 说明

停止 dapr 实例及其关联的应用程序。

### 支持的平台

- [自托管]({{< ref self-hosted >}})

### 用法

```bash
dapr stop [flags]
```

### 参数

| Name             | 环境变量     | 默认值 | 说明          |
| ---------------- | -------- | --- | ----------- |
| `--app-id`, `-a` | `APP_ID` |     | 要停止的应用程序 Id |
| `--help`, `-h`   |          |     | 显示此帮助消息     |

### 示例

```bash
# 停止 Dapr 应用
dapr stop --app-id <ID>
```
