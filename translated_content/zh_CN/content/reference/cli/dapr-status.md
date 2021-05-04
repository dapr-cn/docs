---
type: docs
title: "status CLI 命令参考"
linkTitle: "status"
description: "有关 status CLI 命令的详细信息"
---

## 描述

显示 Dapr 服务的健康状况。

## 支持的平台

- [Kubernetes]({{< ref kubernetes >}})

## 用法

```bash
dapr status -k
```

## 参数

| 名称                   | 环境变量 | 默认值     | 描述                             |
| -------------------- | ---- | ------- | ------------------------------ |
| `--help`, `-h`       |      |         | 显示此帮助消息                        |
| `--kubernetes`, `-k` |      | `false` | 显示 Kubernetes 集群上 Dapr 服务的运行状况 |

## 示例

### 获取来自 Kubernetes 的 Dapr 服务的状态
```bash
dapr status -k
```