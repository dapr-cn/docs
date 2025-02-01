---
type: docs
title: "stop CLI 命令参考"
linkTitle: "stop"
description: "关于 stop CLI 命令的详细信息"
---

### 描述

停止 Dapr 实例及其相关应用程序。

### 适用平台

- [自托管]({{< ref self-hosted >}})

### 用法

```bash
dapr stop [flags]
```

### 标志

| 名称                 | 环境变量             | 默认值 | 描述                                |
| -------------------- | -------------------- | ------- | ----------------------------------- |
| `--app-id`, `-a`     | `APP_ID`             |         | 要停止的应用程序 ID                 |
| `--help`, `-h`       |                      |         | 显示帮助信息                        |
| `--run-file`, `-f`   |                      |         | 使用多应用运行模板文件来同时停止多个应用程序。目前处于[alpha]({{< ref "support-preview-features.md" >}})阶段，仅在 Linux/MacOS 上可用 |

### 示例

```bash
# 停止 Dapr 应用程序
dapr stop --app-id <ID>
