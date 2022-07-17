---
type: docs
title: "status CLI 命令参考"
linkTitle: "status"
description: "有关 status CLI 命令的详细信息"
---

### 说明

显示 Dapr 服务的健康状况。

### 支持的平台

- [Kubernetes]({{< ref kubernetes >}})

### 用法

```bash
dapr status -k
```

### 参数

| Name                 | 环境变量 | 默认值     | 说明                             |
| -------------------- | ---- | ------- | ------------------------------ |
| `--help`, `-h`       |      |         | 显示此帮助消息                        |
| `--kubernetes`, `-k` |      | `false` | 显示 Kubernetes 集群上 Dapr 服务的运行状况 |

### 示例

```bash
# Get status of Dapr services from Kubernetes
dapr status -k
```

### Warning messages
This command can issue warning messages.

#### Root certificate renewal warning
If the mtls root certificate deployed to the Kubernetes cluster expires in under 30 days the following warning message is displayed:

```
Dapr root certificate of your Kubernetes cluster expires in <n> days. Expiry date: <date:time> UTC. 
Please see docs.dapr.io for certificate renewal instructions to avoid service interruptions.
```