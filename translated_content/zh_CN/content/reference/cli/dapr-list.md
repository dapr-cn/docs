---
type: docs
title: "list CLI 命令参考"
linkTitle: "list"
description: "有关 list CLI 命令的详细信息"
---

### 说明

列出所有 Dapr 实例。

### 支持的平台

- [自托管]({{< ref self-hosted >}})
- [Kubernetes]({{< ref kubernetes >}})

### 用法

```bash
dapr list [flags]
```

### 参数

| Name                 | 环境变量 | 默认值     | 说明                                                                          |
| -------------------- | ---- | ------- | --------------------------------------------------------------------------- |
| `--help`, `-h`       |      |         | 显示此帮助消息                                                                     |
| `--kubernetes`, `-k` |      | `false` | 列出 Kubernetes 集群中的所有 Dapr pods                                              |
| `--output`, `-o`     |      | `table` | The output format of the list. Valid values are: `json`, `yaml`, or `table` |

### 示例

```bash
# List Dapr instances in self-hosted mode
dapr list

# List Dapr instances in Kubernetes mode
dapr list -k

# List Dapr instances in JSON format
dapr list -o json
```
