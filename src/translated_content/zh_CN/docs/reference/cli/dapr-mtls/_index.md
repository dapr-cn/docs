---
type: docs
title: "mtls CLI 命令参考"
linkTitle: "mtls"
description: "关于 mtls CLI 命令的详细信息"
---

### 描述

检查 mTLS 是否已启用。

### 支持的平台

支持的平台包括 Kubernetes。

### 用法

```bash
dapr mtls [flags]
dapr mtls [command]
```

### 标志

| 名称                | 环境变量             | 默认值  | 描述                                              |
| ------------------- | -------------------- | ------- | ------------------------------------------------- |
| `--help`, `-h`      |                      |         | 显示帮助信息                                      |
| `--kubernetes`, `-k`|                      | `false` | 检查 Kubernetes 集群是否启用了 mTLS               |

### 可用命令

```txt
expiry              检查根证书颁发机构 (CA) 证书的到期时间
export              将根证书颁发机构 (CA)、颁发者证书和颁发者密钥导出到本地文件
renew-certificate   更新现有的根证书颁发机构 (CA)、颁发者证书和颁发者密钥
```

### 命令参考

查看以下链接以获取每个子命令的详细信息。

- [`dapr mtls expiry`]({{< ref dapr-mtls-expiry.md >}})
- [`dapr mtls export`]({{< ref dapr-mtls-export.md >}})
- [`dapr mtls renew-certificate`]({{< ref dapr-mtls-renew-certificate.md >}})

### 示例

```bash
# 检查 Kubernetes 集群上是否启用了 mTLS
dapr mtls -k
```

### 警告信息
此命令可能会发出警告信息。

#### 根证书更新警告
如果部署到 Kubernetes 集群的 mTLS 根证书将在 30 天内到期，将显示以下警告信息：

```
您的 Kubernetes 集群的 Dapr 根证书将在 <n> 天后到期。到期日期：<date:time> UTC。
请参阅 docs.dapr.io 以获取证书更新说明，以避免服务中断。
