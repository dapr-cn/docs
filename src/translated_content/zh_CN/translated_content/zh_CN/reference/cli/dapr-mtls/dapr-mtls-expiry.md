---
type: docs
title: "mtls expiry CLI 命令参考"
linkTitle: "mtls expiry"
description: "有关 mtls expiry CLI 命令的详细信息"
weight: 2000
---

### 说明

检查根证书颁发机构 （CA） 证书的过期时间

### Supported platforms

- [Kubernetes]({{< ref kubernetes >}})

### Usage

```bash
dapr mtls expiry [flags]
```

### Flags

| 名称             | 环境变量 | 默认值 | 说明   |
| -------------- | ---- | --- | ---- |
| `--help`, `-h` |      |     | 帮助信息 |

### 示例

```bash
# 检查 Kubernetes 证书的过期时间
dapr mtls expiry
```
