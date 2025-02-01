---
type: docs
title: "如何：在你的 Dapr 应用中使用 gRPC 接口"
linkTitle: "gRPC 接口"
weight: 6000
description: "在你的应用中使用 Dapr gRPC API"
---

Dapr 提供了用于本地调用的 HTTP 和 gRPC API。[gRPC](https://grpc.io/) 适用于低延迟、高性能的场景，并通过 proto 客户端进行语言集成。

[在 Dapr SDK 文档中查找自动生成的客户端列表]({{< ref sdks >}})。

Dapr 运行时提供了一个 [proto 服务](https://github.com/dapr/dapr/blob/master/dapr/proto/runtime/v1/dapr.proto)，应用可以通过 gRPC 与其通信。

除了通过 gRPC 调用 Dapr，Dapr 还支持通过代理方式进行服务到服务的调用。[在 gRPC 服务调用指南中了解更多]({{< ref howto-invoke-services-grpc.md >}})。

本指南演示了如何使用 Go SDK 配置和调用 Dapr 的 gRPC。

## 配置 Dapr 通过 gRPC 与应用通信

{{< tabs "自托管" "Kubernetes">}}
<!--selfhosted-->
{{% codetab %}}

在自托管模式下运行时，使用 `--app-protocol` 标志指定 Dapr 使用 gRPC 与应用通信。

```bash
dapr run --app-protocol grpc --app-port 5005 node app.js
```

这使 Dapr 通过端口 `5005` 使用 gRPC 与应用进行通信。

{{% /codetab %}}

<!--k8s-->
{{% codetab %}}

在 Kubernetes 上，在你的部署 YAML 中设置以下注解：

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

{{% /codetab %}}

{{< /tabs >}}

## 使用 gRPC 调用 Dapr

以下步骤展示了如何创建一个 Dapr 客户端并调用其 `SaveStateData` 操作。

1. 导入包：

    ```go
    package main
    
    import (
    	"context"
    	"log"
    	"os"
    
    	dapr "github.com/dapr/go-sdk/client"
    )
    ```

1. 创建客户端：

    ```go
    // 仅用于此演示
    ctx := context.Background()
    data := []byte("ping")
    
    // 创建客户端
    client, err := dapr.NewClient()
    if err != nil {
      log.Panic(err)
    }
    defer client.Close()
    ```
    
    3. 调用 `SaveState` 方法：
    
    ```go
    // 使用键 key1 保存状态
    err = client.SaveState(ctx, "statestore", "key1", data)
    if err != nil {
      log.Panic(err)
    }
    log.Println("数据已保存")
    ```

现在你可以探索 Dapr 客户端上的所有不同方法。

## 使用 Dapr 创建 gRPC 应用

以下步骤将展示如何创建一个应用，该应用暴露一个服务器，Dapr 可以与之通信。

1. 导入包：

    ```go
    package main
    
    import (
    	"context"
    	"fmt"
    	"log"
    	"net"
    
    	"github.com/golang/protobuf/ptypes/any"
    	"github.com/golang/protobuf/ptypes/empty"
    
    	commonv1pb "github.com/dapr/dapr/pkg/proto/common/v1"
    	pb "github.com/dapr/dapr/pkg/proto/runtime/v1"
    	"google.golang.org/grpc"
    )
    ```

1. 实现接口：

    ```go
    // server 是我们的用户应用
    type server struct {
         pb.UnimplementedAppCallbackServer
    }
    
    // EchoMethod 是一个简单的演示方法
    func (s *server) EchoMethod() string {
    	return "pong"
    }
    
    // 当远程服务通过 Dapr 调用应用时，此方法被调用
    // 负载携带一个方法以识别方法、一组元数据属性和一个可选负载
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
    
    // Dapr 将调用此方法以获取应用想要订阅的主题列表。在此示例中，我们告诉 Dapr
    // 订阅名为 TopicA 的主题
    func (s *server) ListTopicSubscriptions(ctx context.Context, in *empty.Empty) (*pb.ListTopicSubscriptionsResponse, error) {
    	return &pb.ListTopicSubscriptionsResponse{
    		Subscriptions: []*pb.TopicSubscription{
    			{Topic: "TopicA"},
    		},
    	}, nil
    }
    
    // Dapr 将调用此方法以获取应用将被调用的绑定列表。在此示例中，我们告诉 Dapr
    // 使用名为 storage 的绑定调用我们的应用
    func (s *server) ListInputBindings(ctx context.Context, in *empty.Empty) (*pb.ListInputBindingsResponse, error) {
    	return &pb.ListInputBindingsResponse{
    		Bindings: []string{"storage"},
    	}, nil
    }
    
    // 每当从注册的绑定触发新事件时，此方法被调用。消息携带绑定名称、负载和可选元数据
    func (s *server) OnBindingEvent(ctx context.Context, in *pb.BindingEventRequest) (*pb.BindingEventResponse, error) {
    	fmt.Println("从绑定调用")
    	return &pb.BindingEventResponse{}, nil
    }
    
    // 每当消息发布到已订阅的主题时，此方法被触发。Dapr 在 CloudEvents 0.3 信封中发送已发布的消息。
    func (s *server) OnTopicEvent(ctx context.Context, in *pb.TopicEventRequest) (*pb.TopicEventResponse, error) {
    	fmt.Println("主题消息到达")
            return &pb.TopicEventResponse{}, nil
    }
    
    ```

1. 创建服务器：

    ```go
    func main() {
    	// 创建监听器
    	lis, err := net.Listen("tcp", ":50001")
    	if err != nil {
    		log.Fatalf("监听失败: %v", err)
    	}
    
    	// 创建 grpc 服务器
    	s := grpc.NewServer()
    	pb.RegisterAppCallbackServer(s, &server{})
    
    	fmt.Println("客户端启动中...")
    
    	// 并开始...
    	if err := s.Serve(lis); err != nil {
    		log.Fatalf("服务失败: %v", err)
    	}
    }
    ```

   这将在端口 50001 上为你的应用创建一个 gRPC 服务器。

## 运行应用

{{< tabs "自托管" "Kubernetes">}}
<!--selfhosted-->
{{% codetab %}}

要在本地运行，使用 Dapr CLI：

```bash
dapr run --app-id goapp --app-port 50001 --app-protocol grpc go run main.go
```

{{% /codetab %}}

<!--k8s-->
{{% codetab %}}

在 Kubernetes 上，如上所述，在你的 pod 规范模板中设置所需的 `dapr.io/app-protocol: "grpc"` 和 `dapr.io/app-port: "50001` 注解。

{{% /codetab %}}

{{< /tabs >}}
    

## 其他语言

你可以使用任何 Protobuf 支持的语言与 Dapr 一起使用，而不仅限于当前可用的生成 SDK。

使用 [protoc](https://developers.google.com/protocol-buffers/docs/downloads) 工具，你可以为其他语言（如 Ruby、C++、Rust 等）生成 Dapr 客户端。

## 相关主题
- [服务调用构建块]({{< ref service-invocation >}})
- [服务调用 API 规范]({{< ref service_invocation_api.md >}})
