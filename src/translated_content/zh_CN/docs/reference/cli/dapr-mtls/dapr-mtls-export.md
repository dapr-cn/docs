---
type: docs
title: "mtls export CLI 命令参考"
linkTitle: "mtls export"
description: "关于 mtls export CLI 命令的详细信息"
weight: 1000
---

### 描述

将根证书颁发机构（CA）、颁发者证书和密钥导出到本地文件中

### 适用平台

- [Kubernetes]({{< ref kubernetes >}})

### 用法

```bash
dapr mtls export [flags]
```

### 标志

| 名称           | 环境变量             | 默认值           | 描述                                         |
| -------------- | -------------------- | ----------------- | ------------------------------------------- |
| `--help`, `-h` |                      |                   | 导出命令的帮助信息                          |
| `--out`, `-o`  |                      | 当前目录          | 证书保存的输出目录路径                      |

### 示例

```bash
# 检查 Kubernetes 证书的到期时间
dapr mtls export -o ./certs
```

### 警告信息
此命令可能会发出警告信息。

#### 根证书更新警告
如果部署到 Kubernetes 集群的 mtls 根证书在 30 天内到期，将显示以下警告信息：

```
您的 Kubernetes 集群的 Dapr 根证书将在 <n> 天后到期。到期日期：<date:time> UTC。
请访问 docs.dapr.io 获取证书更新说明，以避免服务中断。
```