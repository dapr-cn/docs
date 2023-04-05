---
type: docs
title: "logs CLI 命令参考文档"
linkTitle: "logs"
description: "有关 logs CLI 命令的详细信息"
---

### 说明

Get Dapr sidecar logs for an application.

### Supported platforms

- [Kubernetes]({{< ref kubernetes >}})

### Usage

```bash
dapr logs [flags]
```

### Flags

 | 名称                   | 环境变量     | 默认值       | 说明                                           |
 | -------------------- | -------- | --------- | -------------------------------------------- |
 | `--app-id`, `-a`     | `APP_ID` |           | The application id for which logs are needed |
 | `--help`, `-h`       |          |           | 显示此帮助消息                                      |
 | `--kubernetes`, `-k` |          | `true`    | 从 Kubernetes 集群获取日志                          |
 | `--namespace`, `-n`  |          | `default` | 部署应用程序的 Kubernetes 名称空间                      |
 | `--pod-name`, `-p`   |          |           | Kubernetes 中的 pod 的名称，以防您的应用程序具有多个 pod (可选)  |

### Examples

```bash
# 从custom命名空间的sample应用中的名称为target的Pod中拉取日志
dapr logs -k --app-id sample --pod-name target --namespace custom
```

### 警告信息
此命令可以发出警告消息。

#### 根证书续订警告
如果部署到 Kubernetes 集群的 mtls 根证书在 30 天内过期，则会显示以下警告消息：

```
Dapr root certificate of your Kubernetes cluster expires in <n> days. Expiry date: <date:time> UTC. 
Please see docs.dapr.io for certificate renewal instructions to avoid service interruptions.
```