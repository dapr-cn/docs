---
type: docs
title: "How-To: Invoke services using gRPC"
linkTitle: "How-To: Invoke with gRPC"
description: "入门指南指导如何使用 Dapr 服务在分布式应用程序中调用其它服务"
weight: 3000
---

This article describe how to use Dapr to connect services using gRPC. By using Dapr's gRPC proxying capability, you can use your existing proto based gRPC services and have the traffic go through the Dapr sidecar. Doing so yields the following [Dapr service invocation]({{< ref service-invocation-overview.md >}}) benefits to developers:

1. Mutual authentication
2. 追踪
3. 度量
4. Access lists
5. Network level resiliency
6. API token based authentication

## Step 1: Run a gRPC server

The following example is taken from the [hello world grpc-go example](https://github.com/grpc/grpc-go/tree/master/examples/helloworld).

Note this example is in Go, but applies to all programming languages supported by gRPC.

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

This Go app implements the Greeter proto service and exposes a `SayHello` method.

### Run the gRPC server using the Dapr CLI

```bash
dapr run --app-id server --app-port 50051 -- go run main.go
```

Using the Dapr CLI, we're assigning a unique id to the app, `server`, using the `--app-id` flag.

## Step 2: Invoke the service

The following example shows you how to discover the Greeter service using Dapr from a gRPC client. Notice that instead of invoking the target service directly at port `50051`, the client is invoking its local Dapr sidecar over port `50007` which then provides all the capabilities of service invocation including service discovery, tracing, mTLS and retries.

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

The following line tells Dapr to discover and invoke an app named `server`:

```go
ctx = metadata.AppendToOutgoingContext(ctx, "dapr-app-id", "server")
```

All languages supported by gRPC allow for adding metadata. Here are a few examples:

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

### Run the client using the Dapr CLI

```bash
dapr run --app-id client --dapr-grpc-port 50007 -- go run main.go
```

### View telemetry

If you're running Dapr locally with Zipkin installed, open the browser at `http://localhost:9411` and view the traces between the client and server.

## Deploying to Kubernetes

Set the following Dapr annotations on your deployment:

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
*如果应用程序使用 SSL 连接，那么可以使用 `app-ssl: "true"` 注解 (完整列表 [此处]({{< ref arguments-annotations-overview.md >}})) 告知 Dapr 在不安全的 SSL 连接上调用应用程序。*

The `dapr.io/app-protocol: "grpc"` annotation tells Dapr to invoke the app using gRPC.

### 命名空间

当运行于[支持命名空间]({{< ref "service_invocation_api.md#namespace-supported-platforms" >}})的平台时，在您的 app ID 中包含命名空间：`myApp.production`

For example, invoking the gRPC server on a different namespace:

```go
ctx = metadata.AppendToOutgoingContext(ctx, "dapr-app-id", "server.production")
```

有关名称空间的更多信息，请参阅 [跨命名空间 API]({{< ref "service_invocation_api.md#cross-namespace-invocation" >}}) 。

## Step 3: View traces and logs

上面的示例显示了如何直接调用本地或 Kubernetes 中运行的其他服务。 Dapr 输出指标、跟踪和日志记录信息，允许您可视化服务之间的调用图、日志错误和可选地记录有效负载正文。

有关跟踪和日志的更多信息，请参阅 [可观察性]({{< ref observability-concept.md >}}) 篇文章。

 ## Related Links

* [服务调用概述]({{< ref service-invocation-overview.md >}})
* [服务调用 API 规范]({{< ref service_invocation_api.md >}})
* [gRPC proxying community call video](https://youtu.be/B_vkXqptpXY?t=70)

## 社区示例
Watch this [video](https://youtu.be/B_vkXqptpXY?t=69) on how to use Dapr's gRPC proxying capability:

<div class="embed-responsive embed-responsive-16by9">
<iframe width="560" height="315" src="https://www.youtube.com/embed/B_vkXqptpXY?start=69" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>