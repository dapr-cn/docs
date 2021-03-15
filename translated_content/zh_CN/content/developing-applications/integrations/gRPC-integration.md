---
type: docs
title: "Dapr的 gRPC 接口"
linkTitle: "gRPC"
weight: 1000
description: "在应用程序中使用 Dapr gRPC API"
---

# Dapr 和 gRPC

Dapr 为本地调用实现 HTTP 和 gRPC API 。 gRPC适用于低延迟、高性能的场景，并且使用原生客户端进行语言集成。

您可以在这里找到 [](https://github.com/dapr/docs#sdks) 自动生成的客户端 的列表。

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

## 使用 gRPC 调用 dapr - 执行示例

下面的步骤显示了如何创建 Dapr 客户端并调用 `保存状态数据` 操作：

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
// just for this demo
ctx := context.Background()
data := []byte("ping")

// create the client
client, err := dapr.NewClient()
if err != nil {
  logger.Panic(err)
}
defer client.Close()
```

3. 调用 " 保存状态 " 方法

```go
// save state with the key key1
err = client.SaveStateData(ctx, "statestore", "key1", "1", data)
if err != nil {
  logger.Panic(err)
}
logger.Println("data saved")
```

好耶!

现在你可以探索Dapr客户端上的所有不同方法。

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

// This method gets invoked every time a new event is fired from a registerd binding. The message carries the binding name, a payload and optional metadata
func (s *server) OnBindingEvent(ctx context.Context, in *pb.BindingEventRequest) (*pb.BindingEventResponse, error) {
    fmt.Println("Invoked from binding")
    return &pb.BindingEventResponse{}, nil
}

// This method is fired whenever a message has been published to a topic that has been subscribed. Dapr用CloudEvents 0.3规范发送发布的消息。
func (s *server) OnTopicEvent(ctx context.Context, in *pb.TopicEventRequest) (*empty.Empty, error) {
    fmt.Println("Topic message arrived")
    return &empty.Empty{}, nil
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

    // and start...
    if err := s.Serve(lis); err != nil {
        log.Fatalf("failed to serve: %v", err)
    }
}

    // and start...
    if err := s.Serve(lis); err != nil {
        log.Fatalf("failed to serve: %v", err)
    }
}
```

这将在端口 4000 上为应用程序创建一个 gRPC 服务器。

4. 运行你的应用

使用 Dapr CLI在本地运行：

```
dapr run --app-id goapp --app-port 4000 --app-protocol grpc go run main.go
```

在 Kubernetes 上，设置所需的 `dapr.io/app-protocol: "grpc"` 和 `dapr.io/app-port: " 4000` 注释在您的 Pod 规范模板中如上所述。

## Other languages

您可以将 Dapr 与 Protobuf 支持的任何语言一起使用，而不只是使用当前可用的生成 SDK。 使用 [原型](https://developers.google.com/protocol-buffers/docs/downloads) 工具，您可以为 Ruby， C++， Rust 等其他语言生成 Dapr 客户机。

 相关主题
- [Service invocation building block]({{< ref service-invocation >}})
- [服务调用 API 规范]({{< ref service_invocation_api.md >}})
