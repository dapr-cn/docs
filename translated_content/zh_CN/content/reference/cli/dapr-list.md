---
type: docs
title: "list CLI 命令参考"
linkTitle: "list"
description: "有关 list CLI 命令的详细信息"
---

### 说明

列出所有 Dapr 实例。

### 支持的平台

- [自托管]({{< ref self-hosted >}})
- [Kubernetes]({{< ref kubernetes >}})

### 用法

```bash
dapr list [flags]
```

### 参数


| Name                     | 环境变量 | 默认值       | 说明                                                                                        |
| ------------------------ | ---- | --------- | ----------------------------------------------------------------------------------------- |
| `--all-namespaces`, `-A` |      | `false`   | List all Dapr pods in all namespaces (optional)                                           |
| `--help`, `-h`           |      |           | 显示此帮助消息                                                                                   |
| `--kubernetes`, `-k`     |      | `false`   | List all Dapr pods in a Kubernetes cluster (optional)                                     |
| `--namespace`, `-n`      |      | `default` | List the Dapr pods in the defined namespace in Kubernetes. Only with `-k` flag (optional) |
| `--output`, `-o`         |      | `table`   | The output format of the list. Valid values are: `json`, `yaml`, or `table`               |

### 示例

```bash
# List Dapr instances in self-hosted mode
dapr list

# List Dapr instances in all namespaces in Kubernetes mode
dapr list -k

# List Dapr instances in JSON format
dapr list -o json

# List Dapr instances in a specific namespace in Kubernetes mode
dapr list -k --namespace default

# List Dapr instances in all namespaces in  Kubernetes mode
dapr list -k --all-namespaces
```

### Warning messages - Kubernetes Mode
This command can issue warning messages.

#### Root certificate renewal warning
If the mtls root certificate deployed to the Kubernetes cluster expires in under 30 days the following warning message is displayed:

```
Dapr root certificate of your Kubernetes cluster expires in <n> days. Expiry date: <date:time> UTC. 
Please see docs.dapr.io for certificate renewal instructions to avoid service interruptions.
```