---
type: docs
title: "操作方法：将 Dapr 配置为使用 gRPC"
linkTitle: "使用 gRPC 接口"
weight: 5000
description: "如何配置 Dapr 以使用gRPC实现低延迟、高性能的场景"
---

Dapr 为本地调用实现 HTTP 和 gRPC API 。 gRPC 适用于低延迟、高性能的场景，并且使用原生客户端进行语言集成。

您可以在[这里]({{< ref sdks >}})找到自动生成的客户端列表。

Dapr 运行时实现 [proto 服务](https://github.com/dapr/dapr/blob/master/dapr/proto/runtime/v1/dapr.proto) ，应用程序可以通过 gRPC 进行通信。

除了通过 gRPC 调用 Dapr ， Dapr 也可以通过 gRPC 与应用程序通信。 要做到这一点，应用程序需要托管 gRPC 服务器，并实现 [Dapr appcallback 服务](https://github.com/dapr/dapr/blob/master/dapr/proto/runtime/v1/appcallback.proto)。

## 配置 Dapr 以通过 gRPC 与应用通信

### 自托管

在自托管模式下运行时，使用 `--app-protocol` 标志来配置 Dapr 使用 gRPC 与应用程序通信：

```bash
dapr run --app-protocol grpc --app-port 5005 node app.js
```
这告诉 Dapr 在端口`5005`上通过 gRPC 与应用进行通信。


### Kubernetes

在 Kubernetes 上，在 deployment YAML 中设置以下注解：

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