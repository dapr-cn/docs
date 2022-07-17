---
type: docs
title: "components CLI 命令参考"
linkTitle: "组件"
description: "有关 components CLI 命令的详细信息"
---

### 说明

列出所有 Dapr 组件。

### 支持的平台

- [Kubernetes]({{< ref kubernetes >}})

### 用法

```bash
dapr components [flags]
```

### 参数


| Name                     | 环境变量 | 默认值     | 说明                                                          |
| ------------------------ | ---- | ------- | ----------------------------------------------------------- |
| `--kubernetes`, `-k`     |      | `false` | List all Dapr components in a Kubernetes cluster (required) |
| `--all-namespaces`, `-A` |      | `true`  | If true, list all Dapr components in all namespaces         |
| `--help`, `-h`           |      |         | 显示此帮助消息                                                     |
| `--name`, `-n`           |      |         | The components name to be printed (optional)                |
| `--namespace`            |      |         | List all components in the specified namespace              |
| `--output`, `-o`         |      | `list`  | 输出格式（选项：json 或 yaml 或列表）                                    |

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

### Warning messages
This command can issue warning messages.

#### Root certificate renewal warning
If the mtls root certificate deployed to the Kubernetes cluster expires in under 30 days the following warning message is displayed:

```
Dapr root certificate of your Kubernetes cluster expires in <n> days. Expiry date: <date:time> UTC. 
Please see docs.dapr.io for certificate renewal instructions to avoid service interruptions.
```