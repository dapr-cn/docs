---
type: docs
title: "mtls export CLI 命令参考"
linkTitle: "mtls export"
description: "有关 mtls export CLI 命令的详细信息"
weight: 1000
---

### 说明

将根证书颁发机构 （CA）、颁发者证书和颁发者密钥导出到本地文件

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
# 导出 Kubernetes 证书
dapr mtls export -o ./certs
```

### 警告信息
此命令可以发出警告消息。

#### 根证书续订警告
如果部署到 Kubernetes 集群的 mtls 根证书在 30 天内过期，则会显示以下警告消息：

```
Dapr root certificate of your Kubernetes cluster expires in <n> days. Expiry date: <date:time> UTC. 
Please see docs.dapr.io for certificate renewal instructions to avoid service interruptions.
```