---
type: docs
title: "操作方法：使用 gRPC 调用服务"
linkTitle: "操作方法：使用 gRPC 调用"
description: "入门指南指导如何使用 Dapr 服务在分布式应用程序中调用其它服务"
weight: 3000
---

{{% alert title="Preview feature" color="warning" %}}
gRPC 代理目前处于[预览]({{< ref preview-features.md >}})。
{{% /alert %}}

本文介绍如何使用 Dapr 通过 gRPC 连接服务。 通过使用 Dapr 的 gRPC 代理功能，您可以使用现有的基于原型的 gRPC 服务，并让流量通过 Dapr sidecar。 这样做可以为开发人员带来以下 [Dapr 服务调用]({{< ref service-invocation-overview.md >}}) 好处：

1. 双向认证
2. 追踪
3. 度量
4. 访问列表
5. 网络层弹性
6. 基于 API 令牌的身份验证

## 步骤 1：运行 gRPC 服务器

以下示例摘自 [hello world grpc-go 示例](https://github.com/grpc/grpc-go/tree/master/examples/helloworld)。

请注意，此示例在 Go 中，但适用于 gRPC 支持的所有编程语言。

```go
package main

import (
    "context"
    "log"
    "net"

    "google.golang.org/grpc"
    pb "google.golang.org/grpc/examples/helloworld/helloworld"
)

const (
    port = ":50051"
)

// server is used to implement helloworld.GreeterServer.
type server struct {
    pb.UnimplementedGreeterServer
}

// SayHello implements helloworld.GreeterServer
func (s *server) SayHello(ctx context.Context, in *pb.HelloRequest) (*pb.HelloReply, error) {
    log.Printf("Received: %v", in.GetName())
    return &pb.HelloReply{Message: "Hello " + in.GetName()}, nil
}

func main() {
    lis, err := net.Listen("tcp", port)
    if err != nil {
        log.Fatalf("failed to listen: %v", err)
    }
    s := grpc.NewServer()
    pb.RegisterGreeterServer(s, &server{})
    log.Printf("server listening at %v", lis.Addr())
    if err := s.Serve(lis); err != nil {
        log.Fatalf("failed to serve: %v", err)
    }
}
```

此Go应用程序实现了Greeter proto 服务，并暴露了 `sayHello` 方法 。

### 使用 Dapr CLI 运行 gRPC 服务器

由于 gRPC 代理目前是一项预览功能，因此您需要使用配置文件选择加入。 有关详细信息，请参阅 https://docs.dapr.io/operations/configuration/preview-features/。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: serverconfig
spec:
  tracing:
    samplingRate: "1"
    zipkin:
      endpointAddress: http://localhost:9411/api/v2/spans
  features:
    - name: proxy.grpc
      enabled: true
```

运行 sidecar 和 Go 服务器：

```bash
dapr run --app-id server --app-port 50051 --config config.yaml -- go run main.go
```

使用Dapr CLI，我们使用--app-id标志，为应用程序、`server` 分配一个唯一的id。

## 步骤 2: 调用服务

以下示例演示如何从 gRPC 客户端使用 Dapr 发现 Greeter 服务。 请注意，客户端不是直接在端口 `50051`调用目标服务，而是通过端口 `50007` 调用其本地 Dapr sidecar，然后提供服务调用的所有功能，包括服务发现、跟踪、mTLS 和重试。

```go
package main

import (
    "context"
    "log"
    "time"

    "google.golang.org/grpc"
    pb "google.golang.org/grpc/examples/helloworld/helloworld"
    "google.golang.org/grpc/metadata"
)

const (
    address = "localhost:50007"
)

func main() {
    // Set up a connection to the server.
    conn, err := grpc.Dial(address, grpc.WithInsecure(), grpc.WithBlock())
    if err != nil {
        log.Fatalf("did not connect: %v", err)
    }
    defer conn.Close()
    c := pb.NewGreeterClient(conn)

    ctx, cancel := context.WithTimeout(context.Background(), time.Second*2)
    defer cancel()

    ctx = metadata.AppendToOutgoingContext(ctx, "dapr-app-id", "server")
    r, err := c.SayHello(ctx, &pb.HelloRequest{Name: "Darth Tyrannus"})
    if err != nil {
        log.Fatalf("could not greet: %v", err)
    }

    log.Printf("Greeting: %s", r.GetMessage())
}
```

下面这行告诉 Dapr 发现并调用名为 `server` 的应用：

```go
ctx = metadata.AppendToOutgoingContext(ctx, "dapr-app-id", "server")
```

gRPC 支持的所有语言都允许添加元数据。 以下是几个例子：

{{< tabs Java Dotnet Python JavaScript Ruby "C++">}}

{{% codetab %}}
```java
Metadata headers = new Metadata();
Metadata.Key<String> jwtKey = Metadata.Key.of("dapr-app-id", "server");

GreeterService.ServiceBlockingStub stub = GreeterService.newBlockingStub(channel);
stub = MetadataUtils.attachHeaders(stub, header);
stub.SayHello(new HelloRequest() { Name = "Darth Malak" });
```
{{% /codetab %}}

{{% codetab %}}
```csharp
var metadata = new Metadata
{
    { "dapr-app-id", "server" }
};

var call = client.SayHello(new HelloRequest { Name = "Darth Nihilus" }, metadata);
```
{{% /codetab %}}

{{% codetab %}}
```python
metadata = (('dapr-app-id', 'server'),)
response = stub.SayHello(request={ name: 'Darth Revan' }, metadata=metadata)
```
{{% /codetab %}}

{{% codetab %}}
```javascript
const metadata = new grpc.Metadata();
metadata.add('dapr-app-id', 'server');

client.sayHello({ name: "Darth Malgus" }, metadata)
```
{{% /codetab %}}

{{% codetab %}}
```ruby
metadata = { 'dapr-app-id' : 'server' }
response = service.sayHello({ 'name': 'Darth Bane' }, metadata)
```
{{% /codetab %}}

{{% codetab %}}
```c++
grpc::ClientContext context;
context.AddMetadata("dapr-app-id", "Darth Sidious");
```
{{% /codetab %}}

{{< /tabs >}}

### 使用 Dapr CLI 运行客户端

由于 gRPC 代理目前是一项预览功能，因此您需要使用配置文件选择加入。 有关详细信息，请参阅 https://docs.dapr.io/operations/configuration/preview-features/。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: serverconfig
spec:
  tracing:
    samplingRate: "1"
    zipkin:
      endpointAddress: http://localhost:9411/api/v2/spans
  features:
    - name: proxy.grpc
      enabled: true
```

```bash
dapr run --app-id client --dapr-grpc-port 50007 --config config.yaml -- go run main.go
```

### 查看遥测

如果您在本地运行 Dapr 并安装了 Zipkin，请在 `http://localhost:9411` 打开浏览器并查看客户端和服务器之间的跟踪。

## 部署到 Kubernetes

### 步骤 1：使用 `kubectl` 应用以下 YAML 配置

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: serverconfig
spec:
  tracing:
    samplingRate: "1"
    zipkin:
      endpointAddress: http://localhost:9411/api/v2/spans
  features:
    - name: proxy.grpc
      enabled: true
```

```bash
kubectl apply -f config.yaml
```

### 步骤 2：在容器上设置以下 Dapr annotations

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: grpc-app
  namespace: default
  labels:
    app: grpc-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: grpc-app
  template:
    metadata:
      labels:
        app: grpc-app
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "server"
        dapr.io/app-protocol: "grpc"
        dapr.io/app-port: "50051"
        dapr.io/config: "serverconfig"
...
```
*如果应用程序使用 SSL 连接，那么可以使用 `app-ssl: "true"` 注解 (完整列表 [此处]({{< ref arguments-annotations-overview.md >}})) 告知 Dapr 在不安全的 SSL 连接上调用应用程序。*

`dapr.io/app-protocol："grpc"` annotation 告诉 Dapr 使用 gRPC 调用应用。 `dapr.io/config："serverconfig"` annotation 告诉 Dapr 使用上面应用的启用 gRPC 代理的配置。

### 命名空间

当运行于[支持命名空间]({{< ref "service_invocation_api.md#namespace-supported-platforms" >}})的平台时，在您的 app ID 中包含命名空间：`myApp.production`

例如，在不同的命名空间上调用 gRPC 服务器：

```go
ctx = metadata.AppendToOutgoingContext(ctx, "dapr-app-id", "server.production")
```

有关名称空间的更多信息，请参阅 [跨命名空间 API]({{< ref "service_invocation_api.md#cross-namespace-invocation" >}}) 。

## 步骤 3：跟踪和日志

上面的示例显示了如何直接调用本地或 Kubernetes 中运行的其他服务。 Dapr 输出指标、跟踪和日志记录信息，允许您可视化服务之间的调用图、日志错误和可选地记录有效负载正文。

有关跟踪和日志的更多信息，请参阅 [可观察性]({{< ref observability-concept.md >}}) 篇文章。

 ## 相关链接

* [服务调用概述]({{< ref service-invocation-overview.md >}})
* [服务调用 API 规范]({{< ref service_invocation_api.md >}})
* [gRPC 代理社区会议视频](https://youtu.be/B_vkXqptpXY?t=70)

## 社区示例
观看此 [视频](https://youtu.be/B_vkXqptpXY?t=69) ，了解如何使用 Dapr 的 gRPC 代理功能：

<div class="embed-responsive embed-responsive-16by9">
<iframe width="560" height="315" src="https://www.youtube.com/embed/B_vkXqptpXY?start=69" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>