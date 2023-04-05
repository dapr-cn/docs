---
type: docs
title: "stop CLI 命令参考文档"
linkTitle: "stop"
description: "有关 stop CLI 命令的详细信息"
---

### 说明

停止 dapr 实例及其关联的应用程序。

### Supported platforms

- [自托管]({{< ref self-hosted >}})

### Usage

```bash
dapr stop [flags]
```

### Flags

| 名称                 | 环境变量     | 默认值 | 说明                                                                                                                                                                               |
| ------------------ | -------- | --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--app-id`, `-a`   | `APP_ID` |     | The application id to be stopped                                                                                                                                                 |
| `--help`, `-h`     |          |     | 显示此帮助消息                                                                                                                                                                          |
| `--run-file`, `-f` |          |     | Stop running multiple applications at once using a Multi-App Run template file. Currently in [alpha]({{< ref "support-preview-features.md" >}}) and only availale in Linux/MacOS |

### Examples

```bash
# 停止 Dapr 应用
dapr stop --app-id <ID>
```
