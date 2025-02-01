---
type: docs
title: "配置 CLI 命令参考"
linkTitle: "配置"
description: "关于配置 CLI 命令的详细信息"
---

### 描述

显示所有的 Dapr 配置项。

### 支持的平台

- [Kubernetes]({{< ref kubernetes >}})

### 用法

```bash
dapr configurations [flags]
```

### 标志

| 名称 | 环境变量 | 默认值 | 描述
| --- | --- | --- | --- |
| `--kubernetes`, `-k` | | `false` | 列出 Kubernetes 集群中的所有 Dapr 配置（必选项）。
| `--all-namespaces`, `-A` | | `true` | 若选择此项，则列出所有命名空间中的所有 Dapr 配置（可选）。
| `--namespace` | | | 列出特定命名空间中的 Dapr 配置。
| `--name`, `-n` | | | 打印特定的 Dapr 配置。（可选）
| `--output`, `-o` | | `list`| 输出格式（选项：json 或 yaml 或 list）
| `--help`, `-h` | | | 打印此帮助信息 |

### 示例

```bash
# 在 Kubernetes 模式下列出所有命名空间中的 Dapr 配置
dapr configurations -k

# 在 Kubernetes 模式下列出特定命名空间中的 Dapr 配置
dapr configurations -k --namespace default

# 在 Kubernetes 模式下打印特定的 Dapr 配置
dapr configurations -k -n appconfig

# 在 Kubernetes 模式下列出所有命名空间中的 Dapr 配置
dapr configurations -k --all-namespaces
```

### 警告信息
此命令可能会显示警告信息。

#### 根证书更新警告
如果部署到 Kubernetes 集群的 mtls 根证书在 30 天内过期，将显示以下警告信息：

```
您的 Kubernetes 集群的 Dapr 根证书将在 <n> 天后过期。到期日期：<date:time> UTC。
请访问 docs.dapr.io 查看证书更新说明，以避免服务中断。
