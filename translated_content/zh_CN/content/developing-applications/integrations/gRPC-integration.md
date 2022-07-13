---
type: docs
title: "Dapr的gRPC接口"
linkTitle: "gRPC接口"
weight: 6000
description: "在应用程序中使用 Dapr gRPC API"
---

# Dapr 和 gRPC

Dapr 为本地调用实现 HTTP 和 gRPC API 。 gRPC适用于低延迟、高性能的场景，并且使用原生客户端进行语言集成。

您可以在 [这里](https://github.com/dapr/docs#sdks)找到自动生成的客户端 的列表。

Dapr 运行时实现 [proto服务](https://github.com/dapr/dapr/blob/master/dapr/proto/runtime/v1/dapr.proto) ，应用程序可以通过 gRPC 进行通信。

除了通过 gRPC 调用 Dapr 之外，Dapr 还通过充当代理来支持使用 gRPC 的服务到服务调用。 在这里查看更多信息 []({{< ref howto-invoke-services-grpc.md >}})。

## Dapr 通过 gRPC 与应用程序通信的配置

### 自托管

在自托管模式下运行时，使用 `--app-protocol` 标志来配置Dapr 使用 gRPC 与应用程序通信：

```bash
dapr run --app-protocol grpc --app-port 5005 node app.js
```
这将告诉Dapr通过gRPC与您的应用程序通过`5005`端口进行通信。


### Kubernetes

在Kubernetes中，需要在deployment YAML文件中设置以下注解:

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

## 使用 gRPC 调用 Dapr - Go语言示例

下面的步骤显示了如何创建 Dapr 客户端并调用 `SaveStateData` 操作：

1. 导入包

```go
package main

import (
    "context"
    "log"
    "os"

    dapr "github.com/dapr/go-sdk/client"
)
```

2. 创建客户端

```go
//仅为本示例
ctx := context.Background()
data := []byte("ping")

// 创建客户端
client, err := dapr.NewClient()
if err != nil {
  log.Panic(err)
}
defer client.Close()
```

3. 调用 " SaveState " 方法

```go
// 保存key1的状态
err = client.SaveState(ctx, "statestore", "key1", data)
if err != nil {
  log.Panic(err)
}
log.Println("data saved")
```

好耶!

现在你可以在Dapr客户端上探索各种各样的方法了。

## 使用 Dapr 创建 gRPC 应用程序

以下步骤将向您显示如何创建一个让Dapr服务器与之通信的应用程序。

1. 导入包

```go
package main

import (
    "context"
    "fmt"
    "log"
    "net"

    "github.com/golang/protobuf/ptypes/any"
    "github.com/golang/protobuf/ptypes/empty"

    commonv1pb "github.com/dapr/go-sdk/dapr/proto/common/v1"
    pb "github.com/dapr/go-sdk/dapr/proto/runtime/v1"
    "google.golang.org/grpc"
)
```

2. 实现接口

```go
// server is our user app
type server struct {
     pb.UnimplementedAppCallbackServer
}

// EchoMethod is a simple demo method to invoke
func (s *server) EchoMethod() string {
    return "pong"
}

// This method gets invoked when a remote service has called the app through Dapr
// The payload carries a Method to identify the method, a set of metadata properties and an optional payload
func (s *server) OnInvoke(ctx context.Context, in *commonv1pb.InvokeRequest) (*commonv1pb.InvokeResponse, error) {
    var response string

    switch in.Method {
    case "EchoMethod":
        response = s.EchoMethod()
    }

    return &commonv1pb.InvokeResponse{
        ContentType: "text/plain; charset=UTF-8",
        Data:        &any.Any{Value: []byte(response)},
    }, nil
}

// Dapr will call this method to get the list of topics the app wants to subscribe to. In this example, we are telling Dapr
// To subscribe to a topic named TopicA
func (s *server) ListTopicSubscriptions(ctx context.Context, in *empty.Empty) (*pb.ListTopicSubscriptionsResponse, error) {
    return &pb.ListTopicSubscriptionsResponse{
        Subscriptions: []*pb.TopicSubscription{
            {Topic: "TopicA"},
        },
    }, nil
}

// Dapr will call this method to get the list of bindings the app will get invoked by. In this example, we are telling Dapr
// To invoke our app with a binding named storage
func (s *server) ListInputBindings(ctx context.Context, in *empty.Empty) (*pb.ListInputBindingsResponse, error) {
    return &pb.ListInputBindingsResponse{
        Bindings: []string{"storage"},
    }, nil
}

// This method gets invoked every time a new event is fired from a registered binding. The message carries the binding name, a payload and optional metadata
func (s *server) OnBindingEvent(ctx context.Context, in *pb.BindingEventRequest) (*pb.BindingEventResponse, error) {
    fmt.Println("Invoked from binding")
    return &pb.BindingEventResponse{}, nil
}

// This method is fired whenever a message has been published to a topic that has been subscribed. Dapr sends published messages in a CloudEvents 0.3 envelope.
func (s *server) OnTopicEvent(ctx context.Context, in *pb.TopicEventRequest) (*pb.TopicEventResponse, error) {
    fmt.Println("Topic message arrived")
        return &pb.TopicEventResponse{}, nil
}

```

3. 创建服务器

```go
func main() {
    // create listener
    lis, err := net.Listen("tcp", ":50001")
    if err != nil {
        log.Fatalf("failed to listen: %v", err)
    }

    // create grpc server
    s := grpc.NewServer()
    pb.RegisterAppCallbackServer(s, &server{})

    fmt.Println("Client starting...")

    // 启动......
    if err := s.Serve(lis); err != nil {
        log.Fatalf("failed to serve: %v", err)
    }
}
```

这将在4000 端口上为应用程序创建一个 gRPC 服务器。

4. 运行你的应用

使用 Dapr CLI在本地运行：

```
dapr run --app-id goapp --app-port 4000 --app-protocol grpc go run main.go
```

Kubernetes 中，必须在您的Pod规范文档中进行如下设置： `dapr.io/app-protocol: "grpc"` 和 `dapr.io/app-port: " 4000` 。

## 其他语言

您可以将 Dapr 与支持Protobuf 的任意语言一起使用，而不仅仅是当前已经生成可用的SDKs。 使用 [protoc](https://developers.google.com/protocol-buffers/docs/downloads) 工具，您可以为 Ruby， C++， Rust 等其他语言生成 Dapr 客户端。

 ## 相关主题
- [服务调用构建块]({{< ref service-invocation >}})
- [服务调用 API 规范]({{< ref service_invocation_api.md >}})
