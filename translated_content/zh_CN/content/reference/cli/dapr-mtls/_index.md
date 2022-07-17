---
type: docs
title: "mtls CLI 命令参考"
linkTitle: "mtls"
description: "有关 mtls CLI 命令的详细信息"
---

### 说明

检查是否启用了 mTLS

### 支持的平台

- [Kubernetes]({{< ref kubernetes >}})

### 用法

```bash
dapr mtls [flags]
dapr mtls [command]
```

### 参数

| Name                 | 环境变量 | 默认值     | 说明                           |
| -------------------- | ---- | ------- | ---------------------------- |
| `--help`, `-h`       |      |         | 显示此帮助消息                      |
| `--kubernetes`, `-k` |      | `false` | 检查是否在 Kubernetes 集群中启用了 mTLS |

### 可用命令

```txt
expiry              Checks the expiry of the root Certificate Authority (CA) certificate
export              Export the root Certificate Authority (CA), issuer cert and issuer key to local files
renew-certificate   Rotates the existing root Certificate Authority (CA), issuer cert and issuer key
```

### 命令参考

您可以通过以下链接了解有关每个 子命令的详细信息。

- [`dapr mtls expiry`]({{< ref dapr-mtls-expiry.md >}})
- [`dapr mtls export`]({{< ref dapr-mtls-export.md >}})
- [`dapr mtls renew-certificate`]({{< ref dapr-mtls-renew-certificate.md >}})

### 示例

```bash
# Check if mTLS is enabled on the Kubernetes cluster
dapr mtls -k
```

### Warning messages
This command can issue warning messages.

#### Root certificate renewal warning
If the mtls root certificate deployed to the Kubernetes cluster expires in under 30 days the following warning message is displayed:

```
Dapr root certificate of your Kubernetes cluster expires in <n> days. Expiry date: <date:time> UTC. 
Please see docs.dapr.io for certificate renewal instructions to avoid service interruptions.
```