---
type: docs
title: "logs CLI 命令参考"
linkTitle: "logs"
description: "关于 logs CLI 命令的详细信息"
---

### 描述

获取应用程序的 Dapr sidecar 的日志。

### 支持的平台环境

- [Kubernetes]({{< ref kubernetes >}})

### 用法

```bash
dapr logs [flags]
```

### 标志

 | 名称                 | 环境变量             | 默认值   | 描述                                                                                      |
 | -------------------- | -------------------- | --------- | ---------------------------------------------------------------------------------------- |
 | `--app-id`, `-a`     | `APP_ID`             |           | 需要获取日志的应用程序 ID                                                                 |
 | `--help`, `-h`       |                      |           | 显示帮助信息                                                                              |
 | `--kubernetes`, `-k` |                      | `true`    | 从 Kubernetes 集群中获取日志                                                              |
 | `--namespace`, `-n`  |                      | `default` | 部署应用程序的 Kubernetes 命名空间                                                        |
 | `--pod-name`, `-p`   |                      |           | Kubernetes 中 pod 的名称，如果应用程序有多个 pod（可选）                                  |

### 示例

```bash
# 从自定义命名空间中的目标 pod 获取示例应用的日志
dapr logs -k --app-id sample --pod-name target --namespace custom
```

### 警告信息
此命令可能会发出警告信息。

#### 根证书更新警告
如果部署在 Kubernetes 集群中的 mTLS 根证书将在 30 天内过期，将显示以下警告信息：

```
您的 Kubernetes 集群的 Dapr 根证书将在 <n> 天后过期。到期日期：<date:time> UTC。
请访问 docs.dapr.io 查看证书更新说明，以避免服务中断。
