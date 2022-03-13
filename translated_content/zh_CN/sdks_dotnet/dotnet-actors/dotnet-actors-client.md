---
type: docs
title: "Dapr actor .NET 使用指南"
linkTitle: "Actor 客户端"
weight: 100000
description: 了解有关将 actor 客户端与 .NET SDK 配合使用的所有信息
---

## 使用 IActorProxyFactory

在 `Actor` 类或其他 ASP.NET Core 项目中，您应该使用 `IActorProxyFactory` 接口来创建 actor 客户端。

`AddActors(...)` 方法将通过 ASP.NET Core 依赖注入注册 actor 服务。

- 在 actor 实例之外，`IActorProxyFactory` 实例可以通过依赖注入作为单例服务使用。
- 在 actor 实例中，`IActorProxyFactory` 实例作为一个属性(`this.ProxyFactory`)可用。

下面是在 actor 内部创建代理的例子：

```csharp
public Task<MyData> GetDataAsync()
{
    var proxy = this.ProxyFactory.CreateActorProxy<IOtherActor>(ActorId.CreateRandom(), "OtherActor");
    await proxy.DoSomethingGreat();

    return this.StateManager.GetStateAsync<MyData>("my_data");
}
```

> 💡对于一个非依赖注入的应用程序，你可以使用 `ActorProxy` 上静态方法。 当你需要配置自定义设置时，这些方法容易出错，应尽量避免。

本文档中的指导将集中在 `IActorProxyFactory` 上。 `ActorProxy` 的静态方法功能是相同的，除了集中管理配置的能力。

## 识别 actor

为了与 actor 通信，您需要知道其类型和 id，对于强类型客户端，需要知道其接口之一。 `IActorProxyFactory` 上的所有 API 都需要 actor 类型和 actor id。

- Actor 类型在整个应用程序中唯一标识 actor 实现。
- Actor id 唯一标识该类型的实例。

如果您没有actor id，并且想要与新的实例进行通信，您可以使用 `ActorId.CreateRandom()` 来创建一个随机的 id。 由于随机 id 是加密的强标识符，因此当您与运行时交互时，运行时将创建一个新的 actor 实例。

你可以使用 `ActorReference` 类型与其他 actor 交换 actor 类型和 actor id ，作为消息的一部分。

## Actor 客户端的两种风格

Actor 客户端支持两种不同风格的调用：*使用 .NET 接口的强类型*客户端和使用 `ActorProxy` 类的*弱类型*客户端。

由于*强类型的*客户端是基于 .NET 接口的，提供了强类型的典型优点，但是它们不能与非 .NET actor 一起工作。 仅当出于互操作或其他高级原因需要时，才应使用*弱类型*客户端。

### 使用强类型客户端

使用 `CreateActorProxy<>` 来创建强类型客户端，比如下面的例子。 `CreateActorProxy<>` 需要一个 actor 接口类型，并将返回该接口的实例。

```csharp
// Create a proxy for IOtherActor to type OtherActor with a random id
var proxy = this.ProxyFactory.CreateActorProxy<IOtherActor>(ActorId.CreateRandom(), "OtherActor");

// Invoke a method defined by the interface to invoke the actor
//
// proxy is an implementation of IOtherActor so we can invoke its methods directly
await proxy.DoSomethingGreat();
```

### 使用弱类型客户端

使用 `Create` 方法来创建弱类型客户端，比如下面的例子。 `Create` 返回 `ActorProxy` 的实例。

```csharp
// Create a proxy for type OtherActor with a random id
var proxy = this.ProxyFactory.Create(ActorId.CreateRandom(), "OtherActor");

// Invoke a method by name to invoke the actor
//
// proxy is an instance of ActorProxy.
await proxy.InvokeMethodAsync("DoSomethingGreat");
```

由于 `ActorProxy` 是弱类型的代理，你需要将 actor 方法名作为字符串传入。

您也可以使用 `ActorProxy` 来调用带有请求消息和响应消息的方法。 请求和响应消息将使用 `System.Text.Json` 序列化器进行序列化。

```csharp
// Create a proxy for type OtherActor with a random id
var proxy = this.ProxyFactory.Create(ActorId.CreateRandom(), "OtherActor");

// Invoke a method on the proxy to invoke the actor
//
// proxy is an instance of ActorProxy.
var request = new MyRequest() { Message = "Hi, it's me.", };
var response = await proxy.InvokeMethodAsync<MyRequest, MyResponse>("DoSomethingGreat", request);
```

使用弱类型代理时，您有责任定义正确的 actor 方法名称和消息类型。 当使用强类型代理时，这是自动实现的，因为名称和类型是接口定义的一部分。
