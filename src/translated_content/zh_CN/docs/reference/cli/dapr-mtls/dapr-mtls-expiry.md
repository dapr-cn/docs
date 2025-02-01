---
type: docs
title: "mtls expiry CLI 命令指南"
linkTitle: "mtls expiry"
description: "mtls expiry CLI 命令的详细说明"
weight: 2000
---

### 描述

用于检查根证书颁发机构 (CA) 证书的有效期

### 支持的平台

- [Kubernetes]({{< ref kubernetes >}})

### 用法

```bash
dapr mtls expiry [flags]
```

### 标志

| 名称           | 环境变量             | 默认值 | 描述                     |
| -------------- | -------------------- | ------- | ----------------------- |
| `--help`, `-h` |                      |         | 显示 expiry 的帮助信息 |

### 示例

```bash
# 查看 Kubernetes 证书的有效期
dapr mtls expiry
