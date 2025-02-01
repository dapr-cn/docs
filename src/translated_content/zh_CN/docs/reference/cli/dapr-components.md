---
type: docs
title: "components CLI 命令指南"
linkTitle: "components"
description: "components CLI 命令的详细说明"
---

### 描述

列出所有 Dapr 组件。

### 支持的平台

- [Kubernetes]({{< ref kubernetes >}})

### 用法

```bash
dapr components [flags]
```

### 标志

| 名称 | 环境变量 | 默认值 | 描述
| --- | --- | --- | --- |
| `--kubernetes`, `-k` | | `false` | 在 Kubernetes 集群中列出所有 Dapr 组件（此模式下必需） |
| `--all-namespaces`, `-A` | | `true` | 若为 true，列出所有命名空间的 Dapr 组件 |
| `--help`, `-h` | | | 显示帮助信息 |
| `--name`, `-n` | |  | 指定要显示的组件名称（可选） |
| `--namespace` | | | 列出指定命名空间中的所有组件 |
| `--output`, `-o` | | `list` | 输出格式（选项：json、yaml 或 list） |

### 示例

```bash
# 列出 Kubernetes 模式下所有命名空间的 Dapr 组件
dapr components -k

# 列出 Kubernetes 模式下特定命名空间的 Dapr 组件
dapr components -k --namespace default

# 显示 Kubernetes 模式下特定的 Dapr 组件
dapr components -k -n mycomponent

# 列出 Kubernetes 模式下所有命名空间的 Dapr 组件
dapr components -k --all-namespaces
```

### 警告信息
此命令可能会显示警告信息。

#### 根证书更新警告
如果部署到 Kubernetes 集群的 mtls 根证书在 30 天内过期，将显示以下警告信息：

```
您的 Kubernetes 集群的 Dapr 根证书将在 <n> 天后过期。到期日期：<date:time> UTC。
请参阅 docs.dapr.io 获取证书更新说明，以避免服务中断。
```