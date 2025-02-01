---
type: docs
title: "如何：实现可插拔组件"
linkTitle: "实现可插拔组件"
weight: 1100
description: "学习如何编写和实现可插拔组件"
---

在本指南中，您将学习实现可插拔组件的原因和方法。要了解如何配置和注册可插拔组件，请参阅[如何：注册可插拔组件]({{< ref pluggable-components-registration.md >}})。

## 实现可插拔组件

要实现可插拔组件，需在组件中实现 gRPC 服务。实现 gRPC 服务需要三个步骤：

### 找到 proto 定义文件

每个支持的服务接口（如状态存储、发布订阅、绑定、密钥存储）都提供了 proto 定义。

目前支持以下组件 API：

- 状态存储
- 发布订阅
- 绑定
- 密钥存储

| 组件 | 类型 | gRPC 定义 | 内置参考实现 | 文档 |
| :---------: | :--------: | :--------------: | :----------------------------------------------------------------------------: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 状态存储 | `state` | [state.proto](https://github.com/dapr/dapr/blob/master/dapr/proto/components/v1/state.proto) | [Redis](https://github.com/dapr/components-contrib/tree/master/state/redis) | [概念]({{< ref "state-management-overview" >}}), [如何]({{< ref "howto-get-save-state" >}}), [API 规范]({{< ref "state_api" >}}) |
| 发布订阅 | `pubsub` | [pubsub.proto](https://github.com/dapr/dapr/blob/master/dapr/proto/components/v1/pubsub.proto) | [Redis](https://github.com/dapr/components-contrib/tree/master/pubsub/redis) | [概念]({{< ref "pubsub-overview" >}}), [如何]({{< ref "howto-publish-subscribe" >}}), [API 规范]({{< ref "pubsub_api" >}}) |
| 绑定 | `bindings` | [bindings.proto](https://github.com/dapr/dapr/blob/master/dapr/proto/components/v1/bindings.proto) | [Kafka](https://github.com/dapr/components-contrib/tree/master/bindings/kafka) | [概念]({{< ref "bindings-overview" >}}), [输入如何]({{< ref "howto-triggers" >}}), [输出如何]({{< ref "howto-bindings" >}}), [API 规范]({{< ref "bindings_api" >}}) |
| 密钥存储 | `secretstores` | [secretstore.proto](https://github.com/dapr/dapr/blob/master/dapr/proto/components/v1/secretstore.proto) | [Hashicorp/Vault](https://github.com/dapr/components-contrib/blob/master/secretstores/hashicorp/vault/vault.go) | [概念]({{< ref "secrets-overview" >}}), [如何-secrets]({{< ref "howto-secrets" >}}), [API 规范]({{< ref "secrets_api" >}}) |

以下是可插拔组件状态存储的 gRPC 服务定义片段（[state.proto]）：

```protobuf
// StateStore 服务为状态存储组件提供 gRPC 接口。
service StateStore {
  // 使用给定的元数据初始化状态存储组件。
  rpc Init(InitRequest) returns (InitResponse) {}
  // 返回已实现的状态存储功能列表。
  rpc Features(FeaturesRequest) returns (FeaturesResponse) {}
  // Ping 状态存储。用于活跃性目的。
  rpc Ping(PingRequest) returns (PingResponse) {}
  
  // 从状态存储中删除指定的键。
  rpc Delete(DeleteRequest) returns (DeleteResponse) {}
  // 从给定的键获取数据。
  rpc Get(GetRequest) returns (GetResponse) {}
  // 设置指定键的值。
  rpc Set(SetRequest) returns (SetResponse) {}

  // 一次删除多个键。
  rpc BulkDelete(BulkDeleteRequest) returns (BulkDeleteResponse) {}
  // 一次检索多个键。
  rpc BulkGet(BulkGetRequest) returns (BulkGetResponse) {}
  // 一次设置多个键的值。
  rpc BulkSet(BulkSetRequest) returns (BulkSetResponse) {}
}
```

`StateStore` 服务接口总共公开了 9 个方法：

- 2 个用于初始化和组件能力广告的方法（Init 和 Features）
- 1 个用于健康或活跃性检查的方法（Ping）
- 3 个用于 CRUD 的方法（Get、Set、Delete）
- 3 个用于批量 CRUD 操作的方法（BulkGet、BulkSet、BulkDelete）

### 创建服务脚手架

使用 [protocol buffers 和 gRPC 工具](https://grpc.io)生成服务的脚手架。通过 [gRPC 概念文档](https://grpc.io/docs/what-is-grpc/core-concepts/)了解更多关于这些工具的信息。

这些工具生成针对[任何 gRPC 支持的语言](https://grpc.io/docs/what-is-grpc/introduction/#protocol-buffer-versions)的代码。此代码作为您的服务器的基础，并提供：
- 处理客户端调用的功能
- 基础设施以：
  - 解码传入请求
  - 执行服务方法
  - 编码服务响应

生成的代码是不完整的。它缺少：

- 您的目标服务定义的方法的具体实现（您可插拔组件的核心）。
- 关于如何处理 Unix Socket Domain 集成的代码，这是 Dapr 特有的。
- 处理与下游服务集成的代码。

在下一步中了解更多关于填补这些空白的信息。

### 定义服务

提供所需服务的具体实现。每个组件都有一个 gRPC 服务定义，用于其核心功能，与核心组件接口相同。例如：

- **状态存储**

   可插拔状态存储**必须**提供 `StateStore` 服务接口的实现。
   
   除了这个核心功能外，一些组件可能还会在其他**可选**服务下公开功能。例如，您可以通过定义 `QueriableStateStore` 服务和 `TransactionalStateStore` 服务的实现来添加额外功能。
   
- **发布订阅**

   可插拔发布订阅组件只有一个核心服务接口定义 [pubsub.proto](https://github.com/dapr/dapr/blob/master/dapr/proto/components/v1/pubsub.proto)。它们没有可选的服务接口。
 
- **绑定**

   可插拔输入和输出绑定在 [bindings.proto](https://github.com/dapr/dapr/blob/master/dapr/proto/components/v1/bindings.proto) 上有一个核心服务定义。它们没有可选的服务接口。

- **密钥存储**

   可插拔密钥存储在 [secretstore.proto](https://github.com/dapr/dapr/blob/master/dapr/proto/components/v1/secretstore.proto) 上有一个核心服务定义。它们没有可选的服务接口。

在使用 gRPC 和 protocol buffers 工具生成上述状态存储示例的服务脚手架代码后，您可以为 `service StateStore` 下定义的 9 个方法定义具体实现，以及初始化和与依赖项通信的代码。

这个具体实现和辅助代码是您可插拔组件的**核心**。它们定义了您的组件在处理来自 Dapr 的 gRPC 请求时的行为。

## 返回语义错误

返回语义错误也是可插拔组件协议的一部分。组件必须返回对用户应用程序具有语义意义的特定 gRPC 代码，这些错误用于从并发要求到仅信息的各种情况。

| 错误 | gRPC 错误代码 | 源组件 | 描述 |
| ------------------------ | ------------------------------- | ---------------- | ----------- |
| ETag 不匹配 | `codes.FailedPrecondition` | 状态存储 | 错误映射以满足并发要求 |
| ETag 无效 | `codes.InvalidArgument` | 状态存储 |  |
| 批量删除行不匹配 | `codes.Internal` | 状态存储 |  |

在 [状态管理概述]({{< ref "state-management-overview.md#concurrency" >}})中了解更多关于并发要求的信息。

以下示例演示了如何在您自己的可插拔组件中返回错误，并根据需要更改消息。

{{< tabs ".NET" "Java" "Go" >}}
 <!-- .NET -->
{{% codetab %}}

> **重要提示：** 为了使用 .NET 进行错误映射，首先安装 [`Google.Api.CommonProtos` NuGet 包](https://www.nuget.org/packages/Google.Api.CommonProtos/)。

**ETag 不匹配**

```csharp
var badRequest = new BadRequest();
var des = "提供的 ETag 字段与存储中的不匹配";
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

**ETag 无效**

```csharp
var badRequest = new BadRequest();
var des = "ETag 字段只能包含字母数字字符";
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

{{% /codetab %}}

 <!-- Java -->
{{% codetab %}}

就像 [Dapr Java SDK](https://github.com/tmacam/dapr-java-sdk/) 一样，Java 可插拔组件 SDK 使用 [Project Reactor](https://projectreactor.io/)，它为 Java 提供了异步 API。

错误可以通过以下方式直接返回：
1. 在您的方法返回的 `Mono` 或 `Flux` 中调用 `.error()` 方法
1. 提供适当的异常作为参数。

您也可以引发异常，只要它被捕获并反馈到您结果的 `Mono` 或 `Flux` 中。

**ETag 不匹配**

```java
final Status status = Status.newBuilder()
    .setCode(io.grpc.Status.Code.FAILED_PRECONDITION.value())
    .setMessage("fake-err-msg-for-etag-mismatch")
    .addDetails(Any.pack(BadRequest.FieldViolation.newBuilder()
        .setField("etag")
        .setDescription("提供的 ETag 字段与存储中的不匹配")
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
        .setDescription("ETag 字段只能包含字母数字字符")
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

{{% /codetab %}}

 <!-- Go -->
{{% codetab %}}

**ETag 不匹配**

```go
st := status.New(codes.FailedPrecondition, "fake-err-msg")
desc := "提供的 ETag 字段与存储中的不匹配"
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
desc := "ETag 字段只能包含字母数字字符"
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

{{% /codetab %}}

{{< /tabs >}}

## 下一步

- 使用此[示例代码](https://github.com/dapr/samples/tree/master/pluggable-components-dotnet-template)开始开发 .NET 可插拔组件
- [查看可插拔组件概述]({{< ref pluggable-components-overview.md >}})
- [了解如何注册您的可插拔组件]({{< ref pluggable-components-registration >}})