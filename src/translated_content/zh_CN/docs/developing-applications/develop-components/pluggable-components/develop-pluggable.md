---
type: docs
title: 如何实现可插拔组件
linkTitle: 实现可插拔组件
weight: 1100
description: 学习如何编写和实现可插拔组件
---

在本指南中，您将了解为什么以及如何实现 [可插拔组件]({{< ref pluggable-components-overview >}})。 要了解如何配置和注册可插拔组件，请参阅[如何：注册可插入组件]({{< ref pluggable-components-registration.md >}})

## 实现一个可插拔组件

为了实现可插拔组件，您需要在组件中实现一个 gRPC 服务。 实现 gRPC 服务需要三个步骤：

### 查找 proto 定义文件

为每个支持的服务接口（状态存储、发布/订阅、绑定、密钥存储）提供了Proto定义。

目前支持以下组件API：

- State stores
- Pub/sub
- 绑定
- Secret stores

| Component |      Type      |                                                  gRPC 定义                                                 |                                                      内置参考实现                                                     | 文档                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| :-------: | :------------: | :------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|    状态存储   |     `state`    |       [state.proto](https://github.com/dapr/dapr/blob/master/dapr/proto/components/v1/state.proto)       |                   [Redis](https://github.com/dapr/components-contrib/tree/master/state/redis)                   | [概念]({{< ref "state-management-overview" >}})，[如何操作]({{< ref "howto-get-save-state" >}})，[API规范]({{< ref "state_api" >}})                                                                                                  |
|  Pub/sub  |    `pubsub`    |      [pubsub.proto](https://github.com/dapr/dapr/blob/master/dapr/proto/components/v1/pubsub.proto)      |                   [Redis](https://github.com/dapr/components-contrib/tree/master/pubsub/redis)                  | [概念]({{< ref "pubsub-overview" >}})，[如何操作]({{< ref "howto-publish-subscribe" >}})，[API规范]({{< ref "pubsub_api" >}})                                                                                                        |
|     绑定    |   `bindings`   |    [bindings.proto](https://github.com/dapr/dapr/blob/master/dapr/proto/components/v1/bindings.proto)    |                  [Kafka](https://github.com/dapr/components-contrib/tree/master/bindings/kafka)                 | [概念]({{< ref "bindings-overview" >}})，[输入如何]({{< ref "howto-triggers" >}})，[输出如何]({{< ref "howto-bindings" >}})，[API规范]({{< ref "bindings_api" >}}) |
|    密钥存储   | `secretstores` | [secretstore.proto](https://github.com/dapr/dapr/blob/master/dapr/proto/components/v1/secretstore.proto) | [Hashicorp/Vault](https://github.com/dapr/components-contrib/blob/master/secretstores/hashicorp/vault/vault.go) | [概念]({{< ref "secrets-overview" >}})，[如何操作-机密]({{< ref "howto-secrets" >}})，[API规范]({{< ref "secrets_api" >}})                                                                                                             |

以下是可插拔组件状态存储的 gRPC 服务定义片段（[state.proto]）:

```protobuf
// StateStore service provides a gRPC interface for state store components.
service StateStore {
  // Initializes the state store component with the given metadata.
  rpc Init(InitRequest) returns (InitResponse) {}
  // Returns a list of implemented state store features.
  rpc Features(FeaturesRequest) returns (FeaturesResponse) {}
  // Ping the state store. Used for liveness purposes.
  rpc Ping(PingRequest) returns (PingResponse) {}
  
  // Deletes the specified key from the state store.
  rpc Delete(DeleteRequest) returns (DeleteResponse) {}
  // Get data from the given key.
  rpc Get(GetRequest) returns (GetResponse) {}
  // Sets the value of the specified key.
  rpc Set(SetRequest) returns (SetResponse) {}


  // Deletes many keys at once.
  rpc BulkDelete(BulkDeleteRequest) returns (BulkDeleteResponse) {}
  // Retrieves many keys at once.
  rpc BulkGet(BulkGetRequest) returns (BulkGetResponse) {}
  // Set the value of many keys at once.
  rpc BulkSet(BulkSetRequest) returns (BulkSetResponse) {}
}
```

`StateStore` 服务的接口公开了总共 9 个方法：

- 2 种初始化方法和组件功能通告（Init 和 Features）
- 1种用于健康性或活动性检查的方法 (Ping)
- CRUD 的 3 种方法（获取、设置、删除）
- 批量 CRUD 操作的 3 种方法（BulkGet、BulkSet、BulkDelete）

### 创建服务脚手架

使用[协议缓冲区和gRPC工具](https://grpc.io)为服务创建必要的基架。 通过[gRPC 概念文档](https://grpc.io/docs/what-is-grpc/core-concepts/)了解更多关于这些工具的信息。

这些工具生成针对[任何支持gRPC的语言编写](https://grpc.io/docs/what-is-grpc/introduction/#protocol-buffer-versions)的代码。 此代码作为您的服务器的基础，并提供：

- 处理客户端调用的功能
- 基础设施包括：
  - 解码传入请求
  - 执行服务方法
  - 编码服务响应

生成的代码不完整。 它缺少：

- 您的目标服务定义的方法的具体实现（可插拔组件的核心）。
- 有关如何处理 Unix 套接字域集成的代码，这是特定于 Dapr 的。
- 处理与您的下游服务集成的代码。

在下一步中详细了解如何填补这些空白。

### 定义服务

提供所需服务的具体实现。 每个组件都有一个 gRPC 服务定义，用于其核心功能，与核心组件接口相同。 For example:

- **状态存储**

  可插拔的状态存储**必须**提供StateStore服务接口的实现。

  除了这个核心功能之外，一些组件还可能在其他**可选**服务下公开功能。 例如，您可以通过定义 `QueriableStateStore` 服务和 `TransactionalStateStore` 服务的实现来添加额外功能。

- **发布/订阅**

  可插拔的发布/订阅组件只定义了一个单一的核心服务接口 [pubsub.proto](https://github.com/dapr/dapr/blob/master/dapr/proto/components/v1/pubsub.proto)。 它们没有可选的服务接口。

- **绑定**

  可插拔的输入和输出绑定在 [bindings.proto](https://github.com/dapr/dapr/blob/master/dapr/proto/components/v1/bindings.proto) 上只有一个单一的核心服务定义。 它们没有可选的服务接口。

- **密钥存储**

  可插拔的密钥存储在 [secretstore.proto](https://github.com/dapr/dapr/blob/master/dapr/proto/components/v1/secretstore.proto) 上只有一个单一的核心服务定义。 它们没有可选的服务接口。

在使用 gRPC 和协议缓冲区工具生成上述状态存储示例的服务脚手架代码后，您可以为`service StateStore`下定义的 9 个方法定义具体实现，以及用于初始化和与您的依赖项通信的代码。

这个具体的实现和辅助代码是您可插拔组件的**核心**。 它们定义了组件在处理来自 Dapr 的 gRPC 请求时的行为方式。

## 返回语义错误

返回语义错误也是可插拔组件协议的一部分。 组件必须返回具有语义意义的特定 gRPC 代码，这些错误用于从并发要求到仅供信息使用的各种情况。

| 错误       | gRPC错误代码                   | 源组件         | 说明            |
| -------- | -------------------------- | ----------- | ------------- |
| Etag不匹配  | `codes.FailedPrecondition` | State store | 映射错误，无法满足并发需求 |
| ETag 无效  | `codes.InvalidArgument`    | State store |               |
| 批量删除行不匹配 | `codes.Internal`           | State store |               |

在[状态管理概述]({{< ref "state-management-overview\.md#concurrency" >}})中了解更多关于并发要求的信息。

以下示例演示如何在您自己的可插拔组件中返回错误，更改消息以满足您的需求。



 <!-- .NET -->

{{% codetab %}}

> **重要:** 为了使用.NET进行错误映射，请首先安装[`Google.Api.CommonProtos` NuGet包](https://www.nuget.org/packages/Google.Api.CommonProtos/)。

**Etag不匹配**

```csharp
var badRequest = new BadRequest();
var des = "The ETag field provided does not match the one in the store";
badRequest.FieldViolations.Add(    
   new Google.Rpc.BadRequest.Types.FieldViolation
       {        
         Field = "etag",
         Description = des
       });

var baseStatusCode = Grpc.Core.StatusCode.FailedPrecondition;
var status = new Google.Rpc.Status{    
   Code = (int)baseStatusCode
};

status.Details.Add(Google.Protobuf.WellKnownTypes.Any.Pack(badRequest));

var metadata = new Metadata();
metadata.Add("grpc-status-details-bin", status.ToByteArray());
throw new RpcException(new Grpc.Core.Status(baseStatusCode, "fake-err-msg"), metadata);
```

**Etag 无效**

```csharp
var badRequest = new BadRequest();
var des = "The ETag field must only contain alphanumeric characters";
badRequest.FieldViolations.Add(
   new Google.Rpc.BadRequest.Types.FieldViolation
   {
      Field = "etag",
      Description = des
   });

var baseStatusCode = Grpc.Core.StatusCode.InvalidArgument;
var status = new Google.Rpc.Status
{
   Code = (int)baseStatusCode
};

status.Details.Add(Google.Protobuf.WellKnownTypes.Any.Pack(badRequest));

var metadata = new Metadata();
metadata.Add("grpc-status-details-bin", status.ToByteArray());
throw new RpcException(new Grpc.Core.Status(baseStatusCode, "fake-err-msg"), metadata);
```

**批量删除行不匹配**

```csharp
var errorInfo = new Google.Rpc.ErrorInfo();

errorInfo.Metadata.Add("expected", "100");
errorInfo.Metadata.Add("affected", "99");

var baseStatusCode = Grpc.Core.StatusCode.Internal;
var status = new Google.Rpc.Status{
    Code = (int)baseStatusCode
};

status.Details.Add(Google.Protobuf.WellKnownTypes.Any.Pack(errorInfo));

var metadata = new Metadata();
metadata.Add("grpc-status-details-bin", status.ToByteArray());
throw new RpcException(new Grpc.Core.Status(baseStatusCode, "fake-err-msg"), metadata);
```



 <!-- Java -->

{{% codetab %}}

就像[Dapr Java SDK](https://github.com/tmacam/dapr-java-sdk/)一样，Java Pluggable Components SDK使用[Project Reactor](https://projectreactor.io/)，为Java提供了异步API。

错误可以直接返回:

1. 在您的方法返回的`Mono`或`Flux`中调用`.error()`方法
2. 提供适当的异常作为参数。

只要它被捕获并反馈到您的结果`Mono`或`Flux`中，您也可以引发异常。

**Etag不匹配**

```java
final Status status = Status.newBuilder()
    .setCode(io.grpc.Status.Code.FAILED_PRECONDITION.value())
    .setMessage("fake-err-msg-for-etag-mismatch")
    .addDetails(Any.pack(BadRequest.FieldViolation.newBuilder()
        .setField("etag")
        .setDescription("The ETag field provided does not match the one in the store")
        .build()))
    .build();
return Mono.error(StatusProto.toStatusException(status));
```

**ETag 无效**

```java
final Status status = Status.newBuilder()
    .setCode(io.grpc.Status.Code.INVALID_ARGUMENT.value())
    .setMessage("fake-err-msg-for-invalid-etag")
    .addDetails(Any.pack(BadRequest.FieldViolation.newBuilder()
        .setField("etag")
        .setDescription("The ETag field must only contain alphanumeric characters")
        .build()))
    .build();
return Mono.error(StatusProto.toStatusException(status));
```

**批量删除行不匹配**

```java
final Status status = Status.newBuilder()
    .setCode(io.grpc.Status.Code.INTERNAL.value())
    .setMessage("fake-err-msg-for-bulk-delete-row-mismatch")
    .addDetails(Any.pack(ErrorInfo.newBuilder()
        .putAllMetadata(Map.ofEntries(
            Map.entry("affected", "99"),
            Map.entry("expected", "100")
        ))
        .build()))
    .build();
return Mono.error(StatusProto.toStatusException(status));
```



 <!-- Go -->

{{% codetab %}}

**Etag不匹配**

```go
st := status.New(codes.FailedPrecondition, "fake-err-msg")
desc := "The ETag field provided does not match the one in the store"
v := &errdetails.BadRequest_FieldViolation{
	Field:       etagField,
	Description: desc,
}
br := &errdetails.BadRequest{}
br.FieldViolations = append(br.FieldViolations, v)
st, err := st.WithDetails(br)
```

**ETag 无效**

```go
st := status.New(codes.InvalidArgument, "fake-err-msg")
desc := "The ETag field must only contain alphanumeric characters"
v := &errdetails.BadRequest_FieldViolation{
	Field:       etagField,
	Description: desc,
}
br := &errdetails.BadRequest{}
br.FieldViolations = append(br.FieldViolations, v)
st, err := st.WithDetails(br)
```

**批量删除行不匹配**

```go
st := status.New(codes.Internal, "fake-err-msg")
br := &errdetails.ErrorInfo{}
br.Metadata = map[string]string{
	affected: "99",
	expected: "100",
}
st, err := st.WithDetails(br)
```



{{< /tabs >}}

## 下一步

- Get started with developing .NET pluggable component using this [sample code](https://github.com/dapr/samples/tree/master/pluggable-components-dotnet-template)
- [查看可插拔组件概述]({{< ref pluggable-components-overview\.md >}})
- [了解如何注册您的可插拔组件]({{< ref pluggable-components-registration >}})
