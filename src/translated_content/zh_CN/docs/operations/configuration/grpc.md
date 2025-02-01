---
type: docs
title: "操作指南：配置 Dapr 使用 gRPC"
linkTitle: "使用 gRPC 接口"
weight: 5000
description: "配置 Dapr 使用 gRPC 以实现低延迟、高性能场景"
---

Dapr 提供了用于本地调用的 HTTP 和 gRPC API。gRPC 适用于低延迟、高性能的场景，并支持通过 proto 客户端进行语言集成。[您可以查看自动生成的客户端（Dapr SDKs）的完整列表]({{< ref sdks >}})。

Dapr 运行时提供了一个 [proto 服务](https://github.com/dapr/dapr/blob/master/dapr/proto/runtime/v1/dapr.proto)，应用程序可以通过 gRPC 与其进行通信。

Dapr 不仅可以通过 gRPC 被调用，还可以通过 gRPC 与应用程序通信。为此，应用程序需要托管一个 gRPC 服务器并实现 [Dapr `appcallback` 服务](https://github.com/dapr/dapr/blob/master/dapr/proto/runtime/v1/appcallback.proto)。

## 配置 Dapr 通过 gRPC 与应用程序通信

{{< tabs "Self-hosted" Kubernetes >}}

 <!-- Self hosted -->
{{% codetab %}}

在自托管模式下运行时，使用 `--app-protocol` 标志告诉 Dapr 使用 gRPC 与应用程序通信：

```bash
dapr run --app-protocol grpc --app-port 5005 node app.js
```
这告诉 Dapr 通过端口 `5005` 使用 gRPC 与您的应用程序通信。

{{% /codetab %}}

 <!-- Kubernetes -->
{{% codetab %}}

在 Kubernetes 上，在您的部署 YAML 中设置以下注释：

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
#...
```

{{% /codetab %}}

{{< /tabs >}}

## 下一步

{{< button text="处理大型 HTTP 头部大小" page="increase-read-buffer-size" >}}
