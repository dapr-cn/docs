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


| Name                     | 环境变量 | 默认值       | 说明                                                     |
| ------------------------ | ---- | --------- | ------------------------------------------------------ |
| `--all-namespaces`, `-A` |      | `false`   | 列出所有命名空间中的所有 Dapr Pod（可选）                              |
| `--help`, `-h`           |      |           | 显示此帮助消息                                                |
| `--kubernetes`, `-k`     |      | `false`   | 列出 Kubernetes 集群中的所有 Dapr pod（可选）                      |
| `--namespace`, `-n`      |      | `default` | 列出 在Kubernetes 中定义的命名空间中 Dapr pod。 仅与 `-k` 标志共同起作用（可选） |
| `--output`, `-o`         |      | `table`   | 列表的输出格式。 有效值为： `json`、 `yaml`或 `table`                 |

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

### 警告消息 - Kubernetes 模式
此命令可以发出警告消息。

#### 根证书续订警告
如果部署到 Kubernetes 集群的 mtls 根证书在 30 天内过期，则会显示以下警告消息：

```
Dapr root certificate of your Kubernetes cluster expires in <n> days. Expiry date: <date:time> UTC. 
Please see docs.dapr.io for certificate renewal instructions to avoid service interruptions.
```