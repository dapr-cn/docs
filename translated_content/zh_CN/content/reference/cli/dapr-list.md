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

| Name                 | 环境变量 | 默认值     | 说明                                     |
| -------------------- | ---- | ------- | -------------------------------------- |
| `--help`, `-h`       |      |         | 显示此帮助消息                                |
| `--kubernetes`, `-k` |      | `false` | 列出 Kubernetes 集群中的所有 Dapr pods         |
| `--output`, `-o`     |      | `table` | 列表的输出格式。 有效值为： `json`、 `yaml`或 `table` |

### 示例

```bash
# 列出自托管模式下的Dapr实例列表
dapr list

# 列出Kubernetes模式下的Dpar实例列表
dapr list -k

# 以JSON格式列出Dapr实例列表
dapr list -o json
```
