---
type: docs
title: "IActorProxyFactory 接口"
linkTitle: "Actor 客户端"
weight: 100000
description: 学习如何使用IActorProxyFactory接口创建actor客户端
---

在一个 `Actor` 类或一个 ASP.NET Core 项目中，推荐使用 `IActorProxyFactory` 接口来创建 actor 客户端。

`AddActors(...)` 方法将通过 ASP.NET Core 依赖注入注册 actor 服务。

- **在 actor 实例之外:** `IActorProxyFactory` 实例可以通过依赖注入作为单例服务使用。
- **在一个 actor 实例内：** `IActorProxyFactory` 实例作为一个属性(`this.ProxyFactory`)可用。

下面是在 actor 内部创建代理的例子：

```csharp
public Task<MyData> GetDataAsync()
{
    var proxy = this.ProxyFactory.CreateActorProxy<IOtherActor>(ActorId.CreateRandom(), "OtherActor");
    await proxy.DoSomethingGreat();

    return this.StateManager.GetStateAsync<MyData>("my_data");
}
```

在本指南中，您将学习如何使用`IActorProxyFactory`。

{{% alert title="Tip" color="primary" %}}
对于一个非依赖注入的应用程序，你可以使用 `ActorProxy` 上静态方法。 由于`ActorProxy`方法容易出错，在配置自定义设置时尽量避免使用它们。
{{% /alert %}}

## 识别一个 actor

`IActorProxyFactory` 上的所有API都需要一个_actor类型_和_actor id_来与一个***actor***进行通信。 对于强类型客户端，您还需要其中一个接口。

- **Actor类型**在整个应用程序中唯一标识actor实现。
- **Actor id** 唯一标识该类型的实例。

如果您没有一个 actor `id`并且想要与一个新实例进行通信，请使用`ActorId.CreateRandom()`创建一个随机的id。 由于随机 id 是加密的强标识符，因此当您与运行时交互时，运行时将创建一个新的 actor 实例。

你可以使用 `ActorReference` 类型与其他 actor 交换 actor 类型和 actor id ，作为消息的一部分。

## Actor 客户端的两种风格

Actor客户端支持两种不同的调用方式：

| Actor 客户端样式 | 说明                                                     |
| ----------- | ------------------------------------------------------ |
| 强类型         | 强类型的客户端是基于 .NET 接口的，提供了强类型的典型优点。 他们无法与非.NET actor 互操作。 |
| 弱类型         | 弱类型的客户端使用`ActorProxy`类。 建议仅在需要时，出于互操作或其他高级原因使用这些。      |

### 使用强类型客户端

以下示例使用 `CreateActorProxy<>` 方法创建强类型客户端。 `CreateActorProxy<>` 需要一个 actor 接口类型，并将返回该接口的实例。

```csharp
// Create a proxy for IOtherActor to type OtherActor with a random id
var proxy = this.ProxyFactory.CreateActorProxy<IOtherActor>(ActorId.CreateRandom(), "OtherActor");

// Invoke a method defined by the interface to invoke the actor
//
// proxy is an implementation of IOtherActor so we can invoke its methods directly
await proxy.DoSomethingGreat();
```

### 使用弱类型客户端

以下示例使用 `Create` 方法创建弱类型客户端。 `Create` 返回 `ActorProxy` 的实例。

```csharp
// Create a proxy for type OtherActor with a random id
var proxy = this.ProxyFactory.Create(ActorId.CreateRandom(), "OtherActor");

// Invoke a method by name to invoke the actor
//
// proxy is an instance of ActorProxy.
await proxy.InvokeMethodAsync("DoSomethingGreat");
```

由于 `ActorProxy` 是弱类型的代理，你需要将 actor 方法名作为字符串传入。

您也可以使用`ActorProxy`来调用带有请求消息和响应消息的方法。 请求和响应消息将使用 `System.Text.Json` 序列化器进行序列化。

```csharp
// Create a proxy for type OtherActor with a random id
var proxy = this.ProxyFactory.Create(ActorId.CreateRandom(), "OtherActor");

// Invoke a method on the proxy to invoke the actor
//
// proxy is an instance of ActorProxy.
var request = new MyRequest() { Message = "Hi, it's me.", };
var response = await proxy.InvokeMethodAsync<MyRequest, MyResponse>("DoSomethingGreat", request);
```

使用弱类型代理时，您_必须_主动定义正确的 actor 方法名称和消息类型。 当使用强类型代理时，这些名称和类型将作为接口定义的一部分为您定义。

### Actor方法调用异常详情

演员方法调用异常的详细信息会被显示给调用者和被调用者，提供了一个入口来追踪问题。 异常详细信息包括：
 - 方法名称
 - 行号
 - 异常类型
 - UUID

您可以使用UUID来在调用方和被调用方之间匹配异常。 下面是一个异常详细信息的示例：
```
Dapr.Actors.ActorMethodInvocationException：远程Actor方法异常，详情：异常：NotImplementedException，方法名称：ExceptionExample，行号：14，异常uuid：d291a006-84d5-42c4-b39e-d6300e9ac38b
```

## 下一步

[了解如何使用 `ActorHost`]({{< ref dotnet-actors-usage.md >}}).