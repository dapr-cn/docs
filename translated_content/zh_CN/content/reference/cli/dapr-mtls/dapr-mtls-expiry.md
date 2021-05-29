---
type: docs
title: "mtls expiry CLI 命令参考"
linkTitle: "mtls expiry"
description: "有关 mtls expiry CLI 命令的详细信息"
weight: 2000
---

## 说明

检查根证书的到期时间

## 支持的平台

- [Kubernetes]({{< ref kubernetes >}})

## 用法
```bash
dapr mtls expiry [flags]
```

## 参数

| Name           | 环境变量 | 默认值 | 说明   |
| -------------- | ---- | --- | ---- |
| `--help`, `-h` |      |     | 帮助信息 |

## 示例

### 检查 Kubernetes 证书的过期时间
```bash
dapr mtls expiry
```
