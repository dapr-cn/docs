---
type: docs
title: "指南：配置 Dapr 来使用 gRPC"
linkTitle: "Use gRPC interface"
weight: 5000
description: "How to configure Dapr to use gRPC for low-latency, high performance scenarios"
---

Dapr 为本地调用实现 HTTP 和 gRPC API 。 gRPC适用于低延迟、高性能的场景，并且使用原生客户端进行语言集成。

You can find a list of auto-generated clients [here]({{< ref sdks >}}).

Dapr 运行时实现 [服务](https://github.com/dapr/dapr/blob/master/dapr/proto/runtime/v1/dapr.proto) ，应用程序可以通过 gRPC 进行通信。

除了通过 gRPC 调用 Dapr ， Dapr 还可以通过 gRPC 与应用程序通信。 要做到这一点，应用程序需要托管一个gRPC服务器，并实现[Dapr appcallback服务](https://github.com/dapr/dapr/blob/master/dapr/proto/runtime/v1/appcallback.proto)。

## 配置 dapr 以通过 gRPC 与应用程序通信

### 自托管

当在自己托管模式下运行时，使用 `--app-protocol` 标志告诉Dapr 使用 gRPC 来与应用程序对话：

```bash
dapr run --app-protocol grpc --app-port 5005 node app.js
```
这将告诉Dapr通过gRPC与您的应用程序通过`5005`端口进行通信。


### Kubernetes

在Kubernetes上，在你的deployment YAML中设置以下注解:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
  namespace: default
  labels:
    app: myapp
spec:
  replicas: 1
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "myapp"
        dapr.io/app-protocol: "grpc"
        dapr.io/app-port: "5005"
...
```