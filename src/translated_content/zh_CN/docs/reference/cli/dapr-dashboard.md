---
type: docs
title: "dashboard CLI 命令参考"
linkTitle: "dashboard"
description: "关于 dashboard CLI 命令的详细信息"
---

### 描述

启动 [Dapr 仪表板](https://github.com/dapr/dashboard)。

### 支持的平台类型

- [自托管]({{< ref self-hosted >}})
- [Kubernetes]({{< ref kubernetes >}})

### 用法

```bash
dapr dashboard [flags]
```

### 标志

| 名称                 | 环境变量             | 默认值        | 描述                                                                         |
| -------------------- | -------------------- | ------------- | --------------------------------------------------------------------------- |
| `--address`, `-a`    |                      | `localhost`   | 监听的地址。仅接受 IP 地址或 localhost 作为值                                |
| `--help`, `-h`       |                      |               | 显示帮助信息                                                                |
| `--kubernetes`, `-k` |                      | `false`       | 通过本地代理在浏览器中打开 Dapr 仪表板以连接到 Kubernetes 集群              |
| `--namespace`, `-n`  |                      | `dapr-system` | Dapr 仪表板运行所在的命名空间                                               |
| `--port`, `-p`       |                      | `8080`        | 提供 Dapr 仪表板服务的本地端口                                               |
| `--version`, `-v`    |                      | `false`       | 显示 Dapr 仪表板的版本信息                                                  |

### 示例

```bash
# 本地启动仪表板
dapr dashboard

# 在指定端口本地启动仪表板服务
dapr dashboard -p 9999

# 通过端口转发连接到 Kubernetes 中运行的仪表板服务
dapr dashboard -k

# 在所有地址上通过指定端口转发连接到 Kubernetes 中运行的仪表板服务
dapr dashboard -k -p 9999 --address 0.0.0.0

# 通过指定端口转发连接到 Kubernetes 中运行的仪表板服务
dapr dashboard -k -p 9999
```

### 警告信息 - Kubernetes 模式
此命令可能会显示警告信息。

#### 根证书更新警告
如果部署在 Kubernetes 集群中的 mtls 根证书将在 30 天内过期，将显示以下警告信息：

```
您的 Kubernetes 集群的 Dapr 根证书将在 <n> 天后过期。到期日期：<date:time> UTC。
请访问 docs.dapr.io 获取证书更新说明，以避免服务中断。
```