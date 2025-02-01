---
type: docs
title: "list CLI 命令参考"
linkTitle: "list"
description: "关于 list CLI 命令的详细信息"
---

### 描述

显示 Dapr 实例列表。

### 支持的平台

- [本地托管]({{< ref self-hosted >}})
- [Kubernetes]({{< ref kubernetes >}})

### 用法

```bash
dapr list [flags]
```

### 标志

| 名称 | 环境变量 | 默认值 | 描述
| --- | --- | --- | --- |
| `--all-namespaces`, `-A` | | `false` | 列出所有命名空间的 Dapr pods（可选） |
| `--help`, `-h` | | | 显示帮助信息 |
| `--kubernetes`, `-k` | | `false` | 列出 Kubernetes 集群中的所有 Dapr pods（可选） |
| `--namespace`, `-n` | | `default` | 列出 Kubernetes 指定命名空间的 Dapr pods。仅与 `-k` 标志一起使用（可选） |
| `--output`, `-o` | | `table` | 列表的输出格式。有效值为：`json`、`yaml` 或 `table`

### 示例

```bash
# 列出本地托管模式下的 Dapr 实例
dapr list

# 列出 Kubernetes 模式下所有命名空间的 Dapr 实例
dapr list -k

# 以 JSON 格式列出 Dapr 实例
dapr list -o json

# 在 Kubernetes 模式下列出特定命名空间的 Dapr 实例
dapr list -k --namespace default

# 在 Kubernetes 模式下列出所有命名空间的 Dapr 实例
dapr list -k --all-namespaces
```

### 警告信息 - Kubernetes 环境
此命令可能会显示警告信息。

#### 根证书更新警告
如果部署到 Kubernetes 集群的 mtls 根证书在 30 天内过期，将显示以下警告信息：

```
Kubernetes 集群的 Dapr 根证书将在 <n> 天内过期。到期日期：<date:time> UTC。
请参阅 docs.dapr.io 以获取证书更新说明，以避免服务中断。
```