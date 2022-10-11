---
type: docs
title: "指南：配置 Dapr 来使用 gRPC"
linkTitle: "使用 gRPC 接口"
weight: 5000
description: "如何配置 Dapr 以使用 gRPC 实现低延迟、高性能的场景"
---

Dapr 同时实现了 HTTP 和 gRPC 的API 用于本地调用。 gRPC适用于低延迟、高性能的场景，并且支持使用proto客户端进行开发语言的集成。

您可以在 [这里]({{< ref sdks >}})找到自动生成的客户端的列表。

Dapr 运行时实现了 [proto服务](https://github.com/dapr/dapr/blob/master/dapr/proto/runtime/v1/dapr.proto) ，英语应用程序和 gRPC 服务之间的通信。

除了通过 gRPC 调用 Dapr ， Dapr 也可以通过 gRPC 与应用程序进行通信。 要做到这一点，应用程序需要托管一个gRPC服务器，并实现[Dapr appcallback服务](https://github.com/dapr/dapr/blob/master/dapr/proto/runtime/v1/appcallback.proto)。

## Dapr 通过 gRPC 与应用程序进行通信的配置

### 自托管

在自托管模式下运行时，使用 `--app-protocol` 参数来配置Dapr 使用 gRPC 与应用程序通信：

```bash
dapr run --app-protocol grpc --app-port 5005 node app.js
```
这将告诉Dapr通过gRPC与您的应用程序通过`5005`端口进行通信。


### Kubernetes

在Kubernetes中，需要在deployment YAML文件中配置以下注解:

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