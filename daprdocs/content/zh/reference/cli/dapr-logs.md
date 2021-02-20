---
type: docs
title: "logs CLI 命令参考"
linkTitle: "logs"
description: "有关 logs CLI 命令的详细信息"
---

## 说明

获取应用程序的 dapr sidecar 日志。

## Supported platforms

- [Kubernetes]({{< ref kubernetes >}})

## 用法
```bash
dapr logs [flags]
```

## 参数

| Name                 | 环境变量 | 默认值       | 说明                                          |
| -------------------- | ---- | --------- | ------------------------------------------- |
| `--app-id`, `-a`     |      |           | 需要显示日志的应用程序 Id                              |
| `--help`, `-h`       |      |           | 显示此帮助消息                                     |
| `--kubernetes`, `-k` |      | `true`    | 从 Kubernetes 集群获取日志                         |
| `--namespace`, `-n`  |      | `default` | 部署应用程序的 Kubernetes 名称空间                     |
| `--pod-name`, `-p`   |      |           | Kubernetes 中的 pod 的名称，以防您的应用程序具有多个 pod (可选) |


## 示例

### 从定制名称空间中的目标 Pod 获取 应用程序的日志
```bash
dapr logs -k --app-id sample --pod-name target --namespace custom
```
