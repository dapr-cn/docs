---
type: docs
title: "components CLI 命令参考"
linkTitle: "components"
description: "有关 components CLI 命令的详细信息"
---

## 说明

列出所有 Dapr 组件。

## 支持的平台

- [Kubernetes]({{< ref kubernetes >}})

## 用法

```bash
dapr components [flags]
```

## 参数

| 名称                   | 环境变量 | 默认值     | 说明                           |
| -------------------- | ---- | ------- | ---------------------------- |
| `--help`, `-h`       |      |         | 显示此帮助消息                      |
| `--kubernetes`, `-k` |      | `false` | 列出 Kubernetes 集群中的所有 Dapr 组件 |

## 示例

### 列出 Kubernetes 组件
```bash
dapr components -k
```
