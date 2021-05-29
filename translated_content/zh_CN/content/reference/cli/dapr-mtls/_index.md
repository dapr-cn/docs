---
type: docs
title: "mtls CLI 命令参考"
linkTitle: "mtls"
description: "有关 mtls CLI 命令的详细信息"
---

## 说明

检查是否启用了 mTLS

## 支持的平台

- [Kubernetes]({{< ref kubernetes >}})

## 用法

```bash
dapr mtls [flags]
dapr mtls [command]
```

## 参数

| Name                 | 环境变量 | 默认值     | 说明                           |
| -------------------- | ---- | ------- | ---------------------------- |
| `--help`, `-h`       |      |         | 显示此帮助消息                      |
| `--kubernetes`, `-k` |      | `false` | 检查是否在 Kubernetes 集群中启用了 mTLS |

## 可用命令

```txt
expiry      检查根证书是否过期
export      从 Kubernetes 中导出根证书、签发密钥到本地文件
```

## 命令参考

您可以通过以下链接了解有关每个 子命令的详细信息。

 - [`dapr mtls expiry`]({{< ref dapr-mtls-expiry.md >}})
 - [`dapr mtls export`]({{< ref dapr-mtls-export.md >}})

## 示例

### 检查是否启用了 mTLS
```bash
dapr mtls -k
```