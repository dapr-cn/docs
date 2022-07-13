---
type: docs
title: "mtls export CLI 命令参考"
linkTitle: "mtls export"
description: "有关 mtls export CLI 命令的详细信息"
weight: 1000
---

### 说明

Export the root Certificate Authority (CA), issuer cert and issuer key to local files

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

### Warning messages
This command can issue warning messages.

#### Root certificate renewal warning
If the mtls root certificate deployed to the Kubernetes cluster expires in under 30 days the following warning message is displayed:

```
Dapr root certificate of your Kubernetes cluster expires in <n> days. Expiry date: <date:time> UTC. 
Please see docs.dapr.io for certificate renewal instructions to avoid service interruptions.
```