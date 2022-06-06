---
type: docs
title: "dashboard CLI 命令参考"
linkTitle: "dashboard"
description: "有关 dashboard CLI 命令的详细信息"
---

### 说明

启动 [Dapr 仪表板](https://github.com/dapr/dashboard)。

### 支持的平台

- [自托管]({{< ref self-hosted >}})
- [Kubernetes]({{< ref kubernetes >}})

### 用法

```bash
dapr dashboard [flags]
```

### 参数

| Name                 | 环境变量 | 默认值           | 说明                                                                    |
| -------------------- | ---- | ------------- | --------------------------------------------------------------------- |
| `--address`, `-a`    |      | `localhost`   | Address to listen on. Only accepts IP address or localhost as a value |
| `--help`, `-h`       |      |               | 显示此帮助消息                                                               |
| `--kubernetes`, `-k` |      | `false`       | 通过本地代理连接 Kubernetes 集群，在本地浏览器打开Dapr 控制面板                              |
| `--namespace`, `-n`  |      | `dapr-system` | Dapr 仪表板正在运行的名称空间                                                     |
| `--port`, `-p`       |      | `8080`        | 用于 Dapr 仪表板的本地端口                                                      |
| `--version`, `-v`    |      | `false`       | 打印 Dapr 仪表板的版本                                                        |

### 示例

```bash
# 启动本地仪表盘
dapr dashboard

# 启动本地仪表盘并指定监听端口
dapr dashboard -p 9999

# 端口转发到在Kubernetes集群中运行的仪表盘服务
dapr dashboard -k

# 端口转发到在Kubernetes集群中运行的仪表盘服务，并且监听指定端口，不限定IP地址
dapr dashboard -k -p 9999 --address 0.0.0.0

# 端口转发到在Kubernetes集群中运行的仪表盘服务，并且监听指定端口
dapr dashboard -k -p 9999
```
