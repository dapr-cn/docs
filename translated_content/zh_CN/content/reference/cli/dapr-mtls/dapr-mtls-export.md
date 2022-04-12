---
type: docs
title: "mtls export CLI 命令参考"
linkTitle: "mtls export"
description: "有关 mtls export CLI 命令的详细信息"
weight: 1000
---

### 说明

将根 CA，颁发者证书和密钥从 Kubernetes 导出到本地文件

### 支持的平台

- [Kubernetes]({{< ref kubernetes >}})

### 用法

```bash
dapr mtls export [flags]
```

### 参数

| Name           | 环境变量 | 默认值  | 说明            |
| -------------- | ---- | ---- | ------------- |
| `--help`, `-h` |      |      | 帮助信息          |
| `--out`, `-o`  |      | 当前目录 | 用于保存证书的输出目录路径 |

### 示例

```bash
# Check expiry of Kubernetes certs
dapr mtls export -o ./certs
```
