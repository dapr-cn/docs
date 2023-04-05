---
type: docs
title: "mtls CLI 命令参考"
linkTitle: "mtls"
description: "有关 mtls CLI 命令的详细信息"
---

### 说明

Check if mTLS is enabled.

### Supported platforms

- [Kubernetes]({{< ref kubernetes >}})

### Usage

```bash
dapr mtls [flags]
dapr mtls [command]
```

### Flags

| 名称                   | 环境变量 | 默认值     | 说明                           |
| -------------------- | ---- | ------- | ---------------------------- |
| `--help`, `-h`       |      |         | 显示此帮助消息                      |
| `--kubernetes`, `-k` |      | `false` | 检查是否在 Kubernetes 集群中启用了 mTLS |

### Available Commands

```txt
expiry 检查根证书颁发机构 （CA） 证书的到期时间
export 导出根证书颁发机构 （CA）、颁发者证书和颁发者密钥到本地文件
renew-certificate 轮换现有的根证书颁发机构 （CA）、颁发者证书和颁发者密钥
```

### Command Reference

您可以通过以下链接了解有关每个 子命令的详细信息。

- [`dapr mtls expiry`]({{< ref dapr-mtls-expiry.md >}})
- [`dapr mtls export`]({{< ref dapr-mtls-export.md >}})
- [`dapr mtls renew-certificate`]({{< ref dapr-mtls-renew-certificate.md >}})

### 示例

```bash
# Check if mTLS is enabled on the Kubernetes cluster
dapr mtls -k
```

### 警告信息
此命令可以发出警告消息。

#### 根证书续订警告
如果部署到 Kubernetes 集群的 mtls 根证书在 30 天内过期，则会显示以下警告消息：

```
Dapr root certificate of your Kubernetes cluster expires in <n> days. Expiry date: <date:time> UTC. 
Please see docs.dapr.io for certificate renewal instructions to avoid service interruptions.
```