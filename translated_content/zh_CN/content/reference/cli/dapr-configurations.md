---
type: docs
title: "configurations CLI 命令参考"
linkTitle: "configurations"
description: "有关 configurations CLI 命令的详细信息"
---

### 说明

列出所有 Dapr 配置。

### 支持的平台

- [Kubernetes]({{< ref kubernetes >}})

### 用法

```bash
dapr configurations [flags]
```

### 参数

| Name                 | 环境变量 | 默认值     | 说明                           |
| -------------------- | ---- | ------- | ---------------------------- |
| `--kubernetes`, `-k` |      | `false` | 列出 Kubernetes 群集中的所有 Dapr 配置 |
| `--name`, `-n`       |      |         | 要打印的配置名称（可选）                 |
| `--output`, `-o`     |      | `list`  | 输出格式（选项：json 或 yaml 或列表）     |
| `--help`, `-h`       |      |         | 显示此帮助消息                      |

### 示例

```bash
# List Kubernetes Dapr configurations
dapr configurations -k
```
