---
type: docs
title: "How-To : 使用 Dapr 的 W3C 跟踪上下文"
linkTitle: "How-To: 使用 W3C 跟踪上下文"
weight: 20000
description: 将 W3C 追踪标准与 Dapr 一起使用
---

# 如何使用追踪上下文
Dapr 使用 W3C 追踪上下文对服务调用和 pub/sub 消息传递进行分布式跟踪。 Dapr 承担生成和传播跟踪上下文信息的所有繁重工作，并且很少需要传播或创建跟踪上下文。 首先阅读 [W3C 分布式跟踪]({{< ref w3c-tracing >}}) 这篇文章中的方案 ，以了解您是否需要传播或创建跟踪上下文。

若要查看跟踪，请阅读 [如何诊断与跟踪]({{< ref tracing-overview.md >}}) 文章。

## 如何从响应中检索跟踪上下文
`注意: 在 Dapr SDK 中没有用于传播和检索跟踪上下文的辅助方法。 您需要使用 http/gRPC 客户端通过 http 标头和 gRPC 元数据传播和检索跟踪标头。`

### 在 Go 中检索跟踪上下文
#### 对于 HTTP 调用
OpenCensus Go SDK 提供 [ochttp](https://pkg.go.dev/go.opencensus.io/plugin/ochttp/propagation/tracecontext?tab=doc) 包，提供从 http 响应中检索跟踪上下文的方法。

若要从 HTTP 响应检索跟踪上下文，可以使用 ：

```go
f := tracecontext.HTTPFormat{}
sc, ok := f.SpanContextFromRequest(req)
```
#### 对于gRPC 调用
在 gRPC 调用返回时检索追踪上下文头部， 您可以将响应头的引用作为gRPC 调用选项传递给响应头，这个选项包含响应头：

```go
var responseHeader metadata.MD

// Call the InvokeService with call option
// grpc.Header(&responseHeader)

client.InvokeService(ctx, &pb.InvokeServiceRequest{
        Id: "client",
        Message: &commonv1pb.InvokeRequest{
            Method:      "MyMethod",
            ContentType: "text/plain; charset=UTF-8",
            Data:        &any.Any{Value: []byte("Hello")},
        },
    },
    grpc.Header(&responseHeader))
```

### 在 C# 中检索跟踪上下文
#### 对于 HTTP 调用
要从 HTTP 响应检索跟踪上下文，可以使用 [.NET API](https://docs.microsoft.com/en-us/dotnet/api/system.net.http.headers.httpresponseheaders?view=netcore-3.1):

```csharp
// client is HttpClient. req is HttpRequestMessage
HttpResponseMessage response = await client.SendAsync(req);
IEnumerable<string> values1, values2;
string traceparentValue = "";
string tracestateValue = "";
if (response.Headers.TryGetValues("traceparent", out values1))
{
    traceparentValue = values1.FirstOrDefault();
}
if (response.Headers.TryGetValues("tracestate", out values2))
{
    tracestateValue = values2.FirstOrDefault();
}
```

#### 对于gRPC 调用
要从 gRPC 响应检索跟踪上下文，可以使用 [Grpc.Net.Client](https://www.nuget.org/packages/Grpc.Net.Client) ResponseHeadersAsync 方法。

```csharp
// client is Dapr proto client
using var call = client.InvokeServiceAsync(req);
var response = await call.ResponseAsync;
var headers = await call.ResponseHeadersAsync();
var tracecontext = headers.First(e => e.Key == "grpc-trace-bin");
```
有关使用 .NET 客户端调用 gRPC 服务的其他细节 [在此处](https://docs.microsoft.com/en-us/aspnet/core/grpc/client?view=aspnetcore-3.1)。

## 如何在请求中传播跟踪上下文
`注意: 在 Dapr SDK 中没有用于传播和检索跟踪上下文的辅助方法。 您需要使用 http/gRPC 客户端通过 http 标头和 gRPC 元数据传播和检索跟踪标头。`

### 在 Go 中传递跟踪上下文
#### 对于 HTTP 调用
OpenCensus Go SDK 提供 [ochttp](https://pkg.go.dev/go.opencensus.io/plugin/ochttp/propagation/tracecontext?tab=doc) 包，提供在 http 请求中附加跟踪上下文的方法。

```go
f := tracecontext.HTTPFormat{}
req, _ := http.NewRequest("GET", "http://localhost:3500/v1.0/invoke/mathService/method/api/v1/add", nil)

traceContext := span.SpanContext()
f.SpanContextToRequest(traceContext, req)
```

#### 对于gRPC 调用

```go
traceContext := span.SpanContext()
traceContextBinary := propagation.Binary(traceContext)
 ```

然后，可以通过 [gRPC 元数据](https://google.golang.org/grpc/metadata) 到 `grpc-trace-bin` 头传递跟踪上下文。

```go
ctx = metadata.AppendToOutgoingContext(ctx, "grpc-trace-bin", string(traceContextBinary))
```

然后，您可以在后续的 Dapr gRPC 调用中继续传递此go上下文 `ctx` 作为第一个参数。 例如， `InvokeService`，上下文在第一个参数中传递。

### 在 C 中传递跟踪上下文
#### 对于 HTTP 调用
要在 HTTP 请求中传递跟踪上下文，可以使用 [.NET API](https://docs.microsoft.com/en-us/dotnet/api/system.net.http.headers.httprequestheaders?view=netcore-3.1):

```csharp
// client is HttpClient. req is HttpRequestMessage
req.Headers.Add("traceparent", traceparentValue);
req.Headers.Add("tracestate", tracestateValue);
HttpResponseMessage response = await client.SendAsync(req);
```

#### 对于gRPC 调用
要在 gRPC 调用元数据中传递跟踪上下文，您可以使用 [Grpc.Net.Client](https://www.nuget.org/packages/Grpc.Net.Client) ResponseHeadersAsync 方法。

```csharp
// client is Dapr.Client.Autogen.Grpc.v1
var headers = new Metadata();
headers.Add("grpc-trace-bin", tracecontext);
using var call = client.InvokeServiceAsync(req, headers);
```
有关使用 .NET 客户端调用 gRPC 服务的其他细节 [在此处](https://docs.microsoft.com/en-us/aspnet/core/grpc/client?view=aspnetcore-3.1)。

## 如何创建跟踪上下文
您可以使用推荐的 OpenCensus SDK 创建跟踪上下文。 OpenCensus 支持多种不同的编程语言。

|   语言    |                                           SDK                                           |
|:-------:|:---------------------------------------------------------------------------------------:|
|   Go    |                [Link](https://pkg.go.dev/go.opencensus.io?tab=overview)                 |
|  Java   |    [Link](https://www.javadoc.io/doc/io.opencensus/opencensus-api/latest/index.html)    |
|   C#    |          [Link](https://github.com/census-instrumentation/opencensus-csharp/)           |
|   C++   |            [Link](https://github.com/census-instrumentation/opencensus-cpp)             |
| Node.js |            [Link](https://github.com/census-instrumentation/opencensus-node)            |
| Python  | [Link](https://census-instrumentation.github.io/opencensus-python/trace/api/index.html) |

### 在 Go 中创建跟踪上下文

#### 1. 获取 OpenCensus Go SDK

先决条件:OpenCensus Go 库需要 Go 1.8 或更高版本。 有关安装的详细信息，请访问 [这里](https://pkg.go.dev/go.opencensus.io?tab=overview)。

#### 2. 导入包 "go.openensuss.io/trace"
`$ go get -u go.opencensus.io`

#### 3. 创建跟踪上下文

```go
ctx, span := trace.StartSpan(ctx, "cache.Get")
defer span.End()

// Do work to get from cache.
```

### 在 Java 中创建跟踪上下文

```java
try (Scope ss = TRACER.spanBuilder("cache.Get").startScopedSpan()) {
}
```

### 在 Python 中创建跟踪上下文

```python
with tracer.span(name="cache.get") as span:
    pass
```

### 在 NodeJS 中创建跟踪上下文

```nodejs
tracer.startRootSpan({name: 'cache.Get'}, rootSpan => {
});
```

### 在 C++ 中创建跟踪上下文

```cplusplus
opencensus::trace::Span span = opencensus::trace::Span::StartSpan(
                                            "cache.Get", nullptr, {&sampler});
```

### 在 C# 中创建跟踪上下文

```csharp
var span = tracer.SpanBuilder("cache.Get").StartScopedSpan();
```

## 把它和一个Go 示例一起放在一起

### 在 Dapr 中配置跟踪
首先需要在 Dapr 中启用跟踪配置。 提到此步骤是为了完整地从启用跟踪到调用具有跟踪上下文的 Dapr。 创建一个部署配置 yaml ，例如 `appconfig.yaml` 具有以下配置。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  tracing:
    samplingRate: "1"
```

在 Kubernetes中，您可以应用以下配置 :

```bash
kubectl apply -f appconfig.yaml
```

然后在部署 YAML 中设置以下跟踪注释。 您可以在示例 [grpc app]({{< ref grpc.md >}}) 部署 yaml 中添加以下注释。

```yaml
dapr.io/config: "appconfig"
```

### 使用跟踪上下文调用 dapr

Dapr 包含生成跟踪上下文，您无需明确创建跟踪上下文。

但是，如果您选择显式传递跟踪上下文，那么 Dapr 将使用被传递的跟踪上下文并在整个 HTTP/GRPC 调用中传播。

使用示例中的 [grpc app]({{< ref grpc.md >}}) 并将这全部放在一起，以下步骤显示如何创建 Dapr 客户端并调用传递跟踪上下文的 InvokeService 方法 :

其他代码片段和详细信息，请参阅 [grpc 应用程序]({{< ref grpc >}})。

### 1. 导入包

```go
package main

import (
    pb "github.com/dapr/go-sdk/dapr"
    "go.opencensus.io/trace"
      "go.opencensus.io/trace/propagation"
      "google.golang.org/grpc"
      "google.golang.org/grpc/metadata"
)
```

### 2. 创建客户端

```go
  // Get the Dapr port and create a connection
  daprPort := os.Getenv("DAPR_GRPC_PORT")
  daprAddress := fmt.Sprintf("localhost:%s", daprPort)
  conn, err := grpc.Dial(daprAddress, grpc.WithInsecure())
  if err != nil {
    fmt.Println(err)
  }
  defer conn.Close()

  // Create the client
  client := pb.NewDaprClient(conn)
```

### 3. 使用跟踪上下文调用 InvokeService 方法

```go
  // Create the Trace Context
  ctx , span := trace.StartSpan(context.Background(), "InvokeService")

  // The returned context can be used to keep propagating the newly created span in the current context.
  // In the same process, context.Context is used to propagate trace context.

  // Across the process, use the propagation format of Trace Context to propagate trace context.
  traceContext := propagation.Binary(span.SpanContext())
  ctx = metadata.NewOutgoingContext(ctx, string(traceContext))

  // Pass the trace context
  resp, err := client.InvokeService(ctx, &pb.InvokeServiceRequest{
        Id: "client",
        Message: &commonv1pb.InvokeRequest{
            Method:      "MyMethod",
            ContentType: "text/plain; charset=UTF-8",
            Data:        &any.Any{Value: []byte("Hello")},
        },
    })
```

现在，您可以使用相同的跟踪上下文将应用中和跨服务的调用与 Dapr 关联。

## 相关链接

- [可观察性概念]({{< ref observability-concept.md >}})
- [用于分布式跟踪的 W3C 跟踪上下文]({{< ref w3c-tracing >}})
- [如何使用 OpenTelemetry 为分布式跟踪设置 Application Insights]({{< ref open-telemetry-collector.md >}})
- [如何设置 Zipkin 以进行分布式跟踪]({{< ref zipkin.md >}})
- [W3C 跟踪上下文规范](https://www.w3.org/TR/trace-context/)
- [可观察性 快速开始](https://github.com/dapr/quickstarts/tree/master/observability)
