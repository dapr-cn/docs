---
type: docs
title: "如何使用 gRPC 调用服务"
linkTitle: "使用 gRPC 调用"
description: "通过服务调用在服务之间进行通信"
weight: 30
---

本文介绍如何通过 Dapr 使用 gRPC 进行服务间通信。

通过 Dapr 的 gRPC 代理功能，您可以使用现有的基于 proto 的 gRPC 服务，并让流量通过 Dapr sidecar。这为开发人员带来了以下 [Dapr 服务调用]({{< ref service-invocation-overview.md >}}) 的优势：

1. 双向认证
2. 跟踪
3. 指标
4. 访问控制列表
5. 网络级别的弹性
6. 基于 API 令牌的认证

Dapr 支持代理所有类型的 gRPC 调用，包括一元和[流式调用](#proxying-of-streaming-rpcs)。

## 第一步：运行 gRPC 服务器

以下示例来自 ["hello world" grpc-go 示例](https://github.com/grpc/grpc-go/tree/master/examples/helloworld)。虽然此示例使用 Go 语言，但相同的概念适用于所有支持 gRPC 的编程语言。

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

// server 用于实现 helloworld.GreeterServer。
type server struct {
	pb.UnimplementedGreeterServer
}

// SayHello 实现 helloworld.GreeterServer
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

这个 Go 应用实现了 Greeter proto 服务并提供了一个 `SayHello` 方法。

### 使用 Dapr CLI 运行 gRPC 服务器

```bash
dapr run --app-id server --app-port 50051 -- go run main.go
```

使用 Dapr CLI，我们为应用分配了一个唯一的 ID，`server`，通过 `--app-id` 标志指定。

## 第二步：调用服务

以下示例展示了如何使用 Dapr 从 gRPC 客户端发现 Greeter 服务。
注意，客户端不是直接通过端口 `50051` 调用目标服务，而是通过端口 `50007` 调用其本地 Dapr sidecar，这样就提供了所有的服务调用功能，包括服务发现、跟踪、mTLS 和重试。

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
	// 设置与服务器的连接。
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

以下行告诉 Dapr 发现并调用名为 `server` 的应用：

```go
ctx = metadata.AppendToOutgoingContext(ctx, "dapr-app-id", "server")
```

所有 gRPC 支持的语言都允许添加元数据。以下是一些示例：

{{< tabs Java ".NET" Python JavaScript Ruby "C++">}}

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
context.AddMetadata("dapr-app-id", "server");
```
{{% /codetab %}}

{{< /tabs >}}

### 使用 Dapr CLI 运行客户端

```bash
dapr run --app-id client --dapr-grpc-port 50007 -- go run main.go
```

### 查看遥测

如果您在本地运行 Dapr 并安装了 Zipkin，请在浏览器中打开 `http://localhost:9411` 并查看客户端和服务器之间的跟踪。

### 部署到 Kubernetes

在您的部署上设置以下 Dapr 注解：

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
...
```

`dapr.io/app-protocol: "grpc"` 注解告诉 Dapr 使用 gRPC 调用应用。

如果您的应用使用 TLS 连接，您可以通过 `app-protocol: "grpcs"` 注解告诉 Dapr 通过 TLS 调用您的应用（完整列表[在此]({{< ref arguments-annotations-overview.md >}})）。注意，Dapr 不会验证应用提供的 TLS 证书。

### 命名空间

在[支持命名空间的平台]({{< ref "service_invocation_api.md#namespace-supported-platforms" >}})上运行时，您可以在应用 ID 中包含目标应用的命名空间：`myApp.production`

例如，在不同命名空间中调用 gRPC 服务器：

```go
ctx = metadata.AppendToOutgoingContext(ctx, "dapr-app-id", "server.production")
```

有关命名空间的更多信息，请参阅[跨命名空间 API 规范]({{< ref "service_invocation_api.md#cross-namespace-invocation" >}})。

## 第三步：查看跟踪和日志

上面的示例展示了如何直接调用本地或 Kubernetes 中运行的不同服务。Dapr 输出指标、跟踪和日志信息，允许您可视化服务之间的调用图、记录错误并可选地记录负载体。

有关跟踪和日志的更多信息，请参阅[可观测性]({{< ref observability-concept.md >}})文章。

## 流式 RPC 的代理

使用 Dapr 代理 gRPC 的流式 RPC 调用时，您必须设置一个额外的元数据选项 `dapr-stream`，值为 `true`。

例如：

{{< tabs Go Java ".NET" Python JavaScript Ruby "C++">}}

{{% codetab %}}
```go
ctx = metadata.AppendToOutgoingContext(ctx, "dapr-app-id", "server")
ctx = metadata.AppendToOutgoingContext(ctx, "dapr-stream", "true")
```
{{% /codetab %}}

{{% codetab %}}
```java
Metadata headers = new Metadata();
Metadata.Key<String> jwtKey = Metadata.Key.of("dapr-app-id", "server");
Metadata.Key<String> jwtKey = Metadata.Key.of("dapr-stream", "true");
```
{{% /codetab %}}

{{% codetab %}}
```csharp
var metadata = new Metadata
{
	{ "dapr-app-id", "server" },
	{ "dapr-stream", "true" }
};
```
{{% /codetab %}}

{{% codetab %}}
```python
metadata = (('dapr-app-id', 'server'), ('dapr-stream', 'true'),)
```
{{% /codetab %}}

{{% codetab %}}
```javascript
const metadata = new grpc.Metadata();
metadata.add('dapr-app-id', 'server');
metadata.add('dapr-stream', 'true');
```
{{% /codetab %}}

{{% codetab %}}
```ruby
metadata = { 'dapr-app-id' : 'server' }
metadata = { 'dapr-stream' : 'true' }
```
{{% /codetab %}}

{{% codetab %}}
```c++
grpc::ClientContext context;
context.AddMetadata("dapr-app-id", "server");
context.AddMetadata("dapr-stream", "true");
```
{{% /codetab %}}

{{< /tabs >}}

### 流式 gRPC 和弹性

在代理流式 gRPC 时，由于其长时间存在的特性，[弹性]({{< ref "resiliency-overview.md" >}})策略仅应用于“初始握手”。因此：

- 如果流在初始握手后中断，Dapr 不会自动重新建立。您的应用将被通知流已结束，并需要重新创建它。
- 重试策略仅影响初始连接“握手”。如果您的弹性策略包括重试，Dapr 将检测到建立与目标应用的初始连接失败，并将重试直到成功（或直到策略中定义的重试次数耗尽）。
- 同样，弹性策略中定义的超时仅适用于初始“握手”。连接建立后，超时不再影响流。

## 相关链接

* [服务调用概述]({{< ref service-invocation-overview.md >}})
* [服务调用 API 规范]({{< ref service_invocation_api.md >}})
* [gRPC 代理社区通话视频](https://youtu.be/B_vkXqptpXY?t=70)

## 社区通话演示

观看此[视频](https://youtu.be/B_vkXqptpXY?t=69)了解如何使用 Dapr 的 gRPC 代理功能：

<div class="embed-responsive embed-responsive-16by9">
<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/B_vkXqptpXY?start=69" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/B_vkXqptpXY?start=69" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>
