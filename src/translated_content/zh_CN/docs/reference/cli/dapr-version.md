---
type: docs
title: "version CLI 命令参考"
linkTitle: "version"
description: "显示 Dapr 运行时和 CLI 的版本信息。"
---

### 描述

显示 `dapr` CLI 和 `daprd` 可执行文件的版本信息，可以选择普通格式或 JSON 格式。

### 支持的平台

- [自托管平台]({{< ref self-hosted >}})

### 用法

```bash
dapr version [flags]
```

### 标志

| 名称 | 环境变量 | 默认值 | 描述
| --- | --- | --- | --- |
| `--help`, `-h` | | | 显示此帮助信息 |
| `--output`, `-o` | | | 输出格式（选项：json） |

### 示例

```bash
# 获取 Dapr CLI 和运行时的版本信息
dapr version --output json
```

### 相关信息

您可以通过运行 `daprd --version` 命令直接查看 `daprd` 的版本。

您也可以通过运行 `dapr --version` 命令获取普通格式的版本信息。
