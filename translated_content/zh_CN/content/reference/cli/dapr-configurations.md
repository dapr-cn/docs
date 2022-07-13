---
type: docs
title: "configurations CLI 命令参考"
linkTitle: "configurations"
description: "有关 configurations CLI 命令的详细信息"
---

### 说明

列出所有 Dapr 配置。

### 支持的平台

- [Kubernetes]({{< ref kubernetes >}})

### 用法

```bash
dapr configurations [flags]
```

### 参数


| Name                     | 环境变量 | 默认值     | 说明                                                                 |
| ------------------------ | ---- | ------- | ------------------------------------------------------------------ |
| `--kubernetes`, `-k`     |      | `false` | List all Dapr configurations in Kubernetes cluster (required).     |
| `--all-namespaces`, `-A` |      | `true`  | If true, list all Dapr configurations in all namespaces (optional) |
| `--namespace`            |      |         | List Dapr configurations in specific namespace.                    |
| `--name`, `-n`           |      |         | Print specific Dapr configuration. (optional)                      |
| `--output`, `-o`         |      | `list`  | 输出格式（选项：json 或 yaml 或列表）                                           |
| `--help`, `-h`           |      |         | 显示此帮助消息                                                            |

### 示例

```bash
# List Dapr configurations in all namespaces in Kubernetes mode
dapr configurations -k

# List Dapr configurations in specific namespace in Kubernetes mode
dapr configurations -k --namespace default

# Print specific Dapr configuration in Kubernetes mode
dapr configurations -k -n appconfig

# List Dapr configurations in all namespaces in Kubernetes mode
dapr configurations -k --all-namespaces
```
### Warning messages
This command can issue warning messages.

#### Root certificate renewal warning
If the mtls root certificate deployed to the Kubernetes cluster expires in under 30 days the following warning message is displayed:

```
Dapr root certificate of your Kubernetes cluster expires in <n> days. Expiry date: <date:time> UTC. 
Please see docs.dapr.io for certificate renewal instructions to avoid service interruptions.
```