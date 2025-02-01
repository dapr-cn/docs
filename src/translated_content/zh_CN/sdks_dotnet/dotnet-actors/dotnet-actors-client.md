---
type: docs
title: "IActorProxyFactory 接口"
linkTitle: "actor 客户端"
weight: 100000
description: 了解如何使用 IActorProxyFactory 接口创建 actor 客户端
---

在使用 `actor` 类或 ASP.NET Core 项目时，推荐使用 `IActorProxyFactory` 接口来创建 actor 客户端。

通过 `AddActors(...)` 方法，actor 服务将通过 ASP.NET Core 的依赖注入机制进行注册。

- **在 actor 实例之外：** `IActorProxyFactory` 实例作为单例服务通过依赖注入提供。
- **在 actor 实例内部：** `IActorProxyFactory` 实例作为属性 (`this.ProxyFactory`) 提供。

以下是在 actor 内部创建代理的示例：

```csharp
public Task<MyData> GetDataAsync()
{
    var proxy = this.ProxyFactory.CreateActorProxy<IOtherActor>(ActorId.CreateRandom(), "OtherActor");
    await proxy.DoSomethingGreat();

    return this.StateManager.GetStateAsync<MyData>("my_data");
}
```

在本指南中，您将学习如何使用 `IActorProxyFactory`。

{{% alert title="提示" color="primary" %}}
对于不使用依赖注入的应用程序，您可以使用 `ActorProxy` 的静态方法。由于 `ActorProxy` 方法容易出错，建议在配置自定义设置时尽量避免使用。
{{% /alert %}}

## 确定 actor

`IActorProxyFactory` 的所有 API 都需要提供 actor 的 _类型_ 和 _id_ 以便与其通信。对于强类型客户端，您还需要提供其接口之一。

- **actor 类型** 在整个应用程序中唯一标识 actor 实现。
- **actor id** 唯一标识该类型的一个实例。

如果您没有 actor `id` 并希望与新实例通信，可以使用 `ActorId.CreateRandom()` 创建一个随机 id。随机 id 是一个加密强标识符，运行时将在您与其交互时创建一个新的 actor 实例。

您可以使用 `ActorReference` 类型在消息中传递 actor 类型和 actor id，以便与其他 actor 进行交换。

## 两种风格的 actor 客户端

actor 客户端支持两种不同的调用方式：

| actor 客户端风格 | 描述 |
| ------------------ | ----------- |
| 强类型 | 强类型客户端基于 .NET 接口，提供强类型的优势。它们不适用于非 .NET actor。 |
| 弱类型 | 弱类型客户端使用 `ActorProxy` 类。建议仅在需要互操作或其他高级原因时使用这些。 |

### 使用强类型客户端

以下示例使用 `CreateActorProxy<>` 方法创建强类型客户端。`CreateActorProxy<>` 需要一个 actor 接口类型，并返回该接口的一个实例。

```csharp
// 为 IOtherActor 创建一个代理，将类型设为 OtherActor，使用随机 id
var proxy = this.ProxyFactory.CreateActorProxy<IOtherActor>(ActorId.CreateRandom(), "OtherActor");

// 调用接口定义的方法以调用 actor
//
// proxy 是 IOtherActor 的实现，因此我们可以直接调用其方法
await proxy.DoSomethingGreat();
```

### 使用弱类型客户端

以下示例使用 `Create` 方法创建弱类型客户端。`Create` 返回一个 `ActorProxy` 实例。

```csharp
// 为类型 OtherActor 创建一个代理，使用随机 id
var proxy = this.ProxyFactory.Create(ActorId.CreateRandom(), "OtherActor");

// 通过名称调用方法以调用 actor
//
// proxy 是 ActorProxy 的一个实例。
await proxy.InvokeMethodAsync("DoSomethingGreat");
```

由于 `ActorProxy` 是一个弱类型代理，您需要以字符串形式传递 actor 方法名称。

您还可以使用 `ActorProxy` 调用带有请求和响应消息的方法。请求和响应消息将使用 `System.Text.Json` 序列化器进行序列化。

```csharp
// 为类型 OtherActor 创建一个代理，使用随机 id
var proxy = this.ProxyFactory.Create(ActorId.CreateRandom(), "OtherActor");

// 在代理上调用方法以调用 actor
//
// proxy 是 ActorProxy 的一个实例。
var request = new MyRequest() { Message = "Hi, it's me.", };
var response = await proxy.InvokeMethodAsync<MyRequest, MyResponse>("DoSomethingGreat", request);
```

使用弱类型代理时，您 _必须_ 主动定义正确的 actor 方法名称和消息类型。使用强类型代理时，这些名称和类型作为接口定义的一部分为您定义。

### actor 方法调用异常详细信息

actor 方法调用异常的详细信息会显示给调用者和被调用者，提供一个追踪问题的入口点。异常详细信息包括：
 - 方法名称
 - 行号
 - 异常类型
 - UUID
 
您可以使用 UUID 匹配调用者和被调用者一侧的异常。以下是异常详细信息的示例：
```
Dapr.Actors.ActorMethodInvocationException: 远程 actor 方法异常，详细信息：异常：NotImplementedException，方法名称：ExceptionExample，行号：14，异常 uuid：d291a006-84d5-42c4-b39e-d6300e9ac38b
```

## 下一步

[了解如何使用 `ActorHost` 编写和运行 actor]({{< ref dotnet-actors-usage.md >}})。