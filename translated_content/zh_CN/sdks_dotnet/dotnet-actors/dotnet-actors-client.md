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

> 💡 对于一个非依赖注入的应用程序，你可以使用 `ActorProxy` 上静态方法。 当你需要配置自定义设置时，这些方法容易出错，应尽量避免。

本文档中的指导将集中在 `IActorProxyFactory` 上。 `ActorProxy` 的静态方法功能是相同的，除了集中管理配置的能力。

## Identifying an actor

In order to communicate with an actor, you will need to know its type and id, and for a strongly-typed client one of its interfaces. All of the APIs on `IActorProxyFactory` will require an actor type and actor id.

- The actor type uniquely identifies the actor implementation across the whole application.
- The actor id uniquely identifies an instance of that type.

If you do not have an actor id and want to communicate with a new instance, you can use `ActorId.CreateRandom()` to create a randomized id. Since the random id is a cryptographically strong identifier, the runtime will create a new actor instance when you interact with it.

You can use the type `ActorReference` to exchange an actor type and actor id with other actors as part of messages.

## Two styles of actor client

The actor client supports two different styles of invocation: *strongly-typed* clients that use .NET interfaces and *weakly-typed* clients that use the `ActorProxy` class.

Since *strongly-typed* clients are based on .NET interfaces provide the typical benefits of strong-typing, however they do not work with non-.NET actors. You should use the *weakly-typed* client only when required for interop or other advanced reasons.

### Using a strongly-typed client

Use the `CreateActorProxy<>` method to create a strongly-typed client like the following example. `CreateActorProxy<>` requires an actor interface type, and will return an instance of that interface.

```csharp
// Create a proxy for IOtherActor to type OtherActor with a random id
var proxy = this.ProxyFactory.CreateActorProxy<IOtherActor>(ActorId.CreateRandom(), "OtherActor");

// Invoke a method defined by the interface to invoke the actor
//
// proxy is an implementation of IOtherActor so we can invoke its methods directly
await proxy.DoSomethingGreat();
```

### Using a weakly-typed client

Use the `Create` method to create a weakly-typed client like the following example. `Create` returns an instance of `ActorProxy`.

```csharp
// Create a proxy for type OtherActor with a random id
var proxy = this.ProxyFactory.Create(ActorId.CreateRandom(), "OtherActor");

// Invoke a method by name to invoke the actor
//
// proxy is an instance of ActorProxy.
await proxy.InvokeMethodAsync("DoSomethingGreat");
```

Since `ActorProxy` is a weakly-typed proxy you need to pass in the actor method name as a string.

You can also use `ActorProxy` to invoke methods with a request message and response message. Request and response messages will be serialized using the `System.Text.Json` serializer.

```csharp
// Create a proxy for type OtherActor with a random id
var proxy = this.ProxyFactory.Create(ActorId.CreateRandom(), "OtherActor");

// Invoke a method on the proxy to invoke the actor
//
// proxy is an instance of ActorProxy.
var request = new MyRequest() { Message = "Hi, it's me.", };
var response = await proxy.InvokeMethodAsync<MyRequest, MyResponse>("DoSomethingGreat", request);
```

When using a weakly-typed proxy, it is your responsbility to define the correct actor method names and message types. This is done for you when using a strongly-typed proxy since the names and types are part of the interface definition.
