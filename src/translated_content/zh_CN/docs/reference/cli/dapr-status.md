---
type: docs
title: "status CLI 命令参考"
linkTitle: "status"
description: "关于 status CLI 命令的详细信息"
---

### 描述

显示 Dapr 服务的运行状态。

### 支持的平台类型

- [Kubernetes]({{< ref kubernetes >}})

### 用法

```bash
dapr status -k
```

### 标志

| 名称                 | 环境变量             | 默认值  | 描述                                                         |
| -------------------- | -------------------- | ------- | ------------------------------------------------------------ |
| `--help`, `-h`       |                      |         | 打印此帮助信息                                               |
| `--kubernetes`, `-k` |                      | `false` | 显示 Kubernetes 集群中 Dapr 服务的状态                       |

### 示例

```bash
# 从 Kubernetes 获取 Dapr 服务的状态
dapr status -k
```

### 警告信息
此命令可能会发出警告信息。

#### 根证书更新警告
如果部署到 Kubernetes 集群的 mtls 根证书在 30 天内过期，将显示以下警告信息：

```
Kubernetes 集群中的 Dapr 根证书将在 <n> 天后过期，具体到期日期为：<date:time> UTC。
请参阅 docs.dapr.io 以获取证书更新说明，以避免服务中断。
