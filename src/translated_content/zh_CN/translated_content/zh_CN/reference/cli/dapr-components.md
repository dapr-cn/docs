---
type: docs
title: "components CLI 命令参考文档"
linkTitle: "components"
description: "有关 components CLI 命令的详细信息"
---

### 说明

List all Dapr components.

### Supported platforms

- [Kubernetes]({{< ref kubernetes >}})

### Usage

```bash
dapr components [flags]
```

### Flags


| 名称                       | 环境变量 | 默认值     | 说明                                            |
| ------------------------ | ---- | ------- | --------------------------------------------- |
| `--kubernetes`, `-k`     |      | `false` | 列出 Kubernetes 集群中的所有 Dapr 组件（必需）              |
| `--all-namespaces`, `-A` |      | `true`  | 如果为 true，则列出所有命名空间中的所有 Dapr 组件                |
| `--help`, `-h`           |      |         | 显示此帮助消息                                       |
| `--name`, `-n`           |      |         | 要打印的组件名称（可选）                                  |
| `--namespace`            |      |         | 列出指定命名空间中的所有组件                                |
| `--output`, `-o`         |      | `list`  | Output format (options: json or yaml or list) |

### 示例

```bash
# List Dapr components in all namespaces in Kubernetes mode
dapr components -k

# List Dapr components in specific namespace in Kubernetes mode
dapr components -k --namespace default

# Print specific Dapr component in Kubernetes mode
dapr components -k -n mycomponent

# List Dapr components in all namespaces in Kubernetes mode
dapr components -k --all-namespaces
```

### 警告信息
此命令可以发出警告消息。

#### 根证书续订警告
如果部署到 Kubernetes 集群的 mtls 根证书在 30 天内过期，则会显示以下警告消息：

```
Dapr root certificate of your Kubernetes cluster expires in <n> days. Expiry date: <date:time> UTC. 
Please see docs.dapr.io for certificate renewal instructions to avoid service interruptions.
```