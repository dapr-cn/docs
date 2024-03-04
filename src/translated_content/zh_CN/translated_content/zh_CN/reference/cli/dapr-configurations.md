---
type: docs
title: "configurations CLI 命令参考"
linkTitle: "configurations"
description: "有关 configurations CLI 命令的详细信息"
---

### 说明

List all Dapr configurations.

### Supported platforms

- [Kubernetes]({{< ref kubernetes >}})

### Usage

```bash
dapr configurations [flags]
```

### Flags


| 名称                       | 环境变量 | 默认值     | 说明                                            |
| ------------------------ | ---- | ------- | --------------------------------------------- |
| `--kubernetes`, `-k`     |      | `false` | 列出 Kubernetes 集群中的所有 Dapr 配置（必需）。             |
| `--all-namespaces`, `-A` |      | `true`  | 如果为 true，则列出所有命名空间中的所有 Dapr 配置（可选）            |
| `--namespace`            |      |         | 列出指定命名空间中的 Dapr 配置。                           |
| `--name`, `-n`           |      |         | 打印指定的 Dapr 配置。 （可选）                           |
| `--output`, `-o`         |      | `list`  | Output format (options: json or yaml or list) |
| `--help`, `-h`           |      |         | 显示此帮助消息                                       |

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
### 警告信息
此命令可以发出警告消息。

#### 根证书续订警告
如果部署到 Kubernetes 集群的 mtls 根证书在 30 天内过期，则会显示以下警告消息：

```
Dapr root certificate of your Kubernetes cluster expires in <n> days. Expiry date: <date:time> UTC. 
Please see docs.dapr.io for certificate renewal instructions to avoid service interruptions.
```