---
type: docs
title: "dashboard CLI 命令参考"
linkTitle: "dashboard"
description: "有关 dashboard CLI 命令的详细信息"
---

### 说明

Start [Dapr dashboard](https://github.com/dapr/dashboard).

### Supported platforms

- [自托管]({{< ref self-hosted >}})
- [Kubernetes]({{< ref kubernetes >}})

### Usage

```bash
dapr dashboard [flags]
```

### Flags

| 名称                   | 环境变量 | 默认值           | 说明                                                                    |
| -------------------- | ---- | ------------- | --------------------------------------------------------------------- |
| `--address`, `-a`    |      | `localhost`   | Address to listen on. Only accepts IP address or localhost as a value |
| `--help`, `-h`       |      |               | 显示此帮助消息                                                               |
| `--kubernetes`, `-k` |      | `false`       | 通过本地代理连接 Kubernetes 集群，在本地浏览器打开 Dapr 控制面板                             |
| `--namespace`, `-n`  |      | `dapr-system` | The namespace where Dapr dashboard is running                         |
| `--port`, `-p`       |      | `8080`        | The local port on which to serve Dapr dashboard                       |
| `--version`, `-v`    |      | `false`       | Print the version for Dapr dashboard                                  |

### Examples

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
### 警告消息 - Kubernetes 模式
此命令可以发出警告消息。

#### 根证书续订警告
如果部署到 Kubernetes 集群的 mtls 根证书在 30 天内过期，则会显示以下警告消息：

```
Dapr root certificate of your Kubernetes cluster expires in <n> days. Expiry date: <date:time> UTC. 
Please see docs.dapr.io for certificate renewal instructions to avoid service interruptions.
```