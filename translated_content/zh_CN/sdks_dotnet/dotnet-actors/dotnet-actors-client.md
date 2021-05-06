---
type: docs
title: "Dapr actor .NET 使用指南"
linkTitle: "Actors 客户端"
weight: 100000
description: 了解有关使用 actor client 与 .NET SDK 的所有信息
---

## 使用 IActorProxyFactory

在一个 `Actor` 类或其他ASP.NET Core项目中，你应该使用 `IActorProxyFactory` 接口来创建 actor 客户端。

`AddActors(...)` 方法将通过 ASP.NET Core 依赖注入注册 actor 服务。

- 在 actor 实例之外，`IActorProxyFactory` 实例可以通过依赖注入作为单例服务使用。
- 在一个 actor 实例中，`IActorProxyFactory` 实例作为一个属性(`this.ProxyFactory`)可用。

下面是一个在 actor 内部创建代理的例子。

```csharp
public Task<MyData> GetDataAsync()
{
    var proxy = this.ProxyFactory.CreateActorProxy<IOtherActor>(ActorId.CreateRandom(), "OtherActor");
    await proxy.DoSomethingGreat();

    return this.StateManager.GetStateAsync<MyData>("my_data");
}
```

> 💡 For a non-dependency-injected application you can use the static methods on `ActorProxy`. 当你需要配置自定义设置时，这些方法容易出错，应尽量避免。

本文档中的指导将集中在 `IActorProxyFactory` 上。 `ActorProxy` 的静态方法功能是相同的，除了集中管理配置的能力。

## 识别 actor

为了与 actor 进行通信，你需要知道它的类型和id，对于强类型的客户端，需要知道它的一个接口。 `IActorProxyFactory` 上的所有API都需要一个 actor 类型和 actor id。

- Actor 类型唯一地识别了 actor 在整个应用中的实现情况。
- Actor id唯一地标识了该类型的一个实例。

如果您没有actor id，并且想要与新的实例进行通信，您可以使用 `ActorId.CreateRandom()` 来创建一个随机的id。 由于随机 id 是一个加密的强标识符，所以当你与它交互时，运行时将创建一个新的 actor 实例。

你可以使用 `ActorReference` 类型与其他actor交换 actor类型和actor id作为消息的一部分。

## Actor 客户端的两种风格

Actor客户端支持两种不同风格的调用。*使用.NET接口的强类型*客户端和使用 `ActorProxy` 类的弱类型</em>客户端。

由于 *强类型* 客户端基于.NET接口提供了强类型的典型优势，但是它们不能与非.NET Actors 一起工作。 您应该只在需要互操作或其他高级原因时才使用 *弱类型* 客户端。

### 使用强类型客户端

使用 `CreateActorProxy<>` 来创建一个强类型的客户端，比如下面的例子。 `CreateActorProxy<>` 需要一个actor接口类型，并将返回该接口的实例。

```csharp
// Create a proxy for IOtherActor to type OtherActor with a random id
var proxy = this.ProxyFactory.CreateActorProxy<IOtherActor>(ActorId.CreateRandom(), "OtherActor");

// Invoke a method defined by the interface to invoke the actor
//
// proxy is an implementation of IOtherActor so we can invoke its methods directly
await proxy.DoSomethingGreat();
```

### 使用弱类型客户端

使用 `Create` 方法来创建一个弱类型客户端，比如下面的例子。 `Create` 返回一个 `ActorProxy` 的实例。

```csharp
// Create a proxy for type OtherActor with a random id
var proxy = this.ProxyFactory.Create(ActorId.CreateRandom(), "OtherActor");

// Invoke a method by name to invoke the actor
//
// proxy is an instance of ActorProxy.
await proxy.InvokeMethodAsync("DoSomethingGreat");
 
```

由于 `ActorProxy` 是一个弱类型的代理，你需要将 actor 方法名作为一个字符串传入。

您也可以使用 `ActorProxy` 来调用带有请求消息和响应消息的方法。 请求和响应消息将使用 `System.Text.Json` 序列化器序列化。

```csharp
// Create a proxy for type OtherActor with a random id
var proxy = this.ProxyFactory.Create(ActorId.CreateRandom(), "OtherActor");

// Invoke a method on the proxy to invoke the actor
//
// proxy is an instance of ActorProxy.
var request = new MyRequest() { Message = "Hi, it's me.", };
var response = await proxy.InvokeMethodAsync<MyRequest, MyResponse>("DoSomethingGreat", request);
var request = new MyRequest() { Message = "Hi, it's me.", };
var response = await proxy.InvokeMethodAsync<MyRequest, MyResponse>("DoSomethingGreat", request);
```

当使用弱类型的代理时，您有责任定义正确的代理方法名称和消息类型。 当使用强类型代理时，这是为你完成的，因为名称和类型是接口定义的一部分。
