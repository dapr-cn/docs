---
type: docs
title: "list CLI 命令参考"
linkTitle: "list"
description: "有关 list CLI 命令的详细信息"
---

## 描述

列出所有 Dapr 实例。

## 支持的平台

- [自托管]({{< ref self-hosted >}})
- [Kubernetes]({{< ref kubernetes >}})

## 用法
```bash
dapr list [flags]
```

## Flags

| Name                 | Environment Variable | Default | Description                                |
| -------------------- | -------------------- | ------- | ------------------------------------------ |
| `--help`, `-h`       |                      |         | Print this help message                    |
| `--kubernetes`, `-k` |                      | `false` | List all Dapr pods in a Kubernetes cluster |

## Examples

### List Dapr instances in self-hosted mode
```bash
dapr list
```

### List Dapr instances in Kubernetes mode
```bash
dapr list -k
```
