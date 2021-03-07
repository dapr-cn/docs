---
type: docs
title: "How-To: Configure Dapr to use gRPC"
linkTitle: "Use gRPC interface"
weight: 5000
description: "How to configure Dapr to use gRPC for low-latency, high performance scenarios"
---

Dapr 为本地调用实现 HTTP 和 gRPC API 。 gRPC is useful for low-latency, high performance scenarios and has language integration using the proto clients.

You can find a list of auto-generated clients [here]({{< ref sdks >}}).

Dapr 运行时实现 [服务](https://github.com/dapr/dapr/blob/master/dapr/proto/runtime/v1/dapr.proto) ，应用程序可以通过 gRPC 进行通信。

除了通过 gRPC 调用 Dapr ， Dapr 还可以通过 gRPC 与应用程序通信。 To do that, the app needs to host a gRPC server and implements the [Dapr appcallback service](https://github.com/dapr/dapr/blob/master/dapr/proto/runtime/v1/appcallback.proto)

## 配置 dapr 以通过 gRPC 与应用程序通信

### 自托管

当在自己托管模式下运行时，使用 `--app-protocol` 标志告诉Dapr 使用 gRPC 来与应用程序对话：

```bash
dapr run --app-protocol grpc --app-port 5005 node app.js
```
This tells Dapr to communicate with your app via gRPC over port `5005`.


### Kubernetes

On Kubernetes, set the following annotations in your deployment YAML:

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