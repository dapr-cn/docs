---
type: docs
title: "Dapr actor .NET 使用指南"
linkTitle: "编写 Actors"
weight: 200000
description: 了解有关使用 .NET SDK 编写和运行 Actors
---

## 编写 Actors

### ActorHost

`ActorHost` 是所有Actors的必备构造参数，必须传递给基类构造函数。

```csharp
internal class MyActor : Actor, IMyActor, IRemindable
{
    public MyActor(ActorHost host) // Accept ActorHost in the constructor
        : base(host) // Pass ActorHost to the base class constructor
    {
    }
}
```

`ActorHost` 由运行时提供，包含了允许该 actor 实例与运行时通信的所有状态。 因为 `ActorHost` 包含了actor 独有的状态，所以你不应该将实例传递到代码的其他部分。 除了在测试中，您不应该创建自己的 `ActorHost` 实例。

### 使用依赖输入

Actors支持[依赖性注入](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/dependency-injection)到构造函数中的附加参数。 您定义的任何其他参数都将从依赖注入容器中得到它们的值。

```csharp
internal class MyActor : Actor, IMyActor, IRemindable
{
    public MyActor(ActorHost host, BankService bank) // Accept BankService in the constructor
        : base(host)
    {
        ...
    }
}
     
```

一个 actor 类型应该有一个单一的`public`构造函数。 Actor 基础设施使用 [ActivatorUtilities](https://docs.microsoft.com/en-us/dotnet/core/extensions/dependency-injection#constructor-injection-behavior) 模式来构建 actor 实例。

你可以在 `Startup.cs` 中用依赖注入注册类型来使它们可用。 你可以阅读更多关于注册类型的不同方法 [这里](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/dependency-injection?#service-registration-methods) 。

```csharp
// In Startup.cs
public void ConfigureServices(IServiceCollection services)
{
    ...

    // Register additional types with dependency injection.
    services.AddSingleton<BankService>();
}

     
     
```

每个actor实例都有自己的依赖注入范围。 每个 actor 在执行完一个操作后，都会在内存中保留一段时间，在这段时间内，与 actor 相关的依赖注入作用域也被认为是活的。 当演员被停用时，该范围将被释放。

如果一个actor在构造函数中注入一个 `IServiceProvider` ，该actor将收到一个与它的作用域相关联的 `IServiceProvider` 的引用。 `IServiceProvider` 可以用来在将来动态地解析服务。

```csharp
internal class MyActor : Actor, IMyActor, IRemindable
{
    public MyActor(ActorHost host, IServiceProvider services) // Accept IServiceProvider in the constructor
        : base(host)
    {
        ...
    }
}
     
```

When using this pattern, take care to avoid creating many instances of **transient** services which implement `IDisposable`. Since the scope associated with an actor could be considered valid for a long time, it is possible to accumulate many services in memory. See the [dependency injection guidelines](https://docs.microsoft.com/en-us/dotnet/core/extensions/dependency-injection-guidelines) for more information.

### IDisposable and actors

Actors can implement `IDisposable` or `IAsyncDisposable`. It is recommended that you rely on dependency injection for resource management rather than implementing dispose functionality in application code. Dispose support is provided for the rare case where it is truly necessary.

### 日志

Inside of an actor class you have access to an instance of `ILogger` through a property on the base `Actor` class. This instance is connected to the ASP.NET Core logging system, and should be used for all logging inside an actor. Read more about logging [here](https://docs.microsoft.com/en-us/dotnet/core/extensions/logging?tabs=command-line). You can configure a variety of different logging formats and output sinks.

You should use *structured logging* with *named placeholders* like the example below:

```csharp
public Task<MyData> GetDataAsync()
{
    this.Logger.LogInformation("Getting state at {CurrentTime}", DateTime.UtcNow);
    return this.StateManager.GetStateAsync<MyData>("my_data");
}
```

When logging, avoid using format strings like: `$"Getting state at {DateTime.UtcNow}"`

Logging should use the [named placeholder syntax](https://docs.microsoft.com/en-us/dotnet/core/extensions/logging?tabs=command-line#log-message-template) which is more performant and offers better integration with logging systems.

### Using an explicit actor type name

By default, the *type* of the actor as seen by clients is derived from the name of the actor implementation class. The default name will be the class name name (without namespace).

If desired, you can specify an explicit type name by attaching an `ActorAttribute` attribute to the actor implementation class.

```csharp
[Actor(TypeName = "MyCustomActorTypeName")]
internal class MyActor : Actor, IMyActor
{
    // ...
}
```

In the example above the name will be `MyCustomActorTypeName`.

No change is needed to the code that registers the actor type with the runtime, providing the value via the attribute is all that is required.

## Hosting actors on the server

### Registering actors

Actor registration is part `ConfigureServices` in `Startup.cs`. The `ConfigureServices` method is where services are registered with dependency injection, and registering the set of actor types is part of the registration of actor services.

Inside `ConfigureServices` you can:

- Register the actor runtime (`UseActors`)
- Register actor types (`options.Actors.RegisterActor<>`)
- Configure actor runtime settings `options`
- Register additional service types for dependency injection into actors (`services`)

```csharp
// In Startup.cs
public void ConfigureServices(IServiceCollection services)
{
    // Register actor runtime with DI
    services.AddActors(options =>
    {
        // Register actor types and configure actor settings
        options.Actors.RegisterActor<MyActor>();

        // Configure default settings
        options.ActorIdleTimeout = TimeSpan.FromMinutes(10);
        options.ActorScanInterval = TimeSpan.FromSeconds(35);
        options.DrainOngoingCallTimeout = TimeSpan.FromSeconds(35);
        options.DrainRebalancedActors = true;
    });

    // Register additional services for use with actors
    services.AddSingleton<BankService>();
}
```

### Configuring JSON options

The actor runtime uses [System.Text.Json](https://docs.microsoft.com/en-us/dotnet/standard/serialization/system-text-json-overview) for serializing data to the state store, and for handling requests from the weakly-typed client.

By default the actor runtime uses settings based on [JsonSerializerDefaults.Web](https://docs.microsoft.com/en-us/dotnet/api/system.text.json.jsonserializerdefaults?view=net-5.0)

You can configure the `JsonSerializerOptions` as part of `ConfigureServices`:

```csharp
// In Startup.cs
public void ConfigureServices(IServiceCollection services)
{
    services.AddActors(options =>
    {
        ...

        // Customize JSON options
        options.JsonSerializerOptions = ...
    });
}
```

### Actors and routing

The ASP.NET Core hosting support for actors uses the [endpoint routing](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/routing) system. The .NET SDK provides no support hosting actors with the legacy routing system from early ASP.NET Core releases.

Since actors uses endpoint routing, the actors HTTP handler is part of the middleware pipeline. The following is a minimal example of a `Configure` method setting up the middleware pipeline with actors.

```csharp
// in Startup.cs
public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
{
    if (env.IsDevelopment())
    {
        app.UseDeveloperExceptionPage();
    }

    app.UseRouting();

    app.UseEndpoints(endpoints =>
    {
        // Register actors handlers that interface with the Dapr runtime.
        endpoints.MapActorsHandlers();
    });
}
```

The `UseRouting` and `UseEndpoints` calls are necessary to configure routing. Adding `MapActorsHandlers` inside the endpoint middleware is what configures actors as part of the pipline.

这只是一个最小的例子，它对 Actor 功能并存是有效的：

- Controllers
- Razor Pages
- Blazor
- gRPC 服务
- Dapr 发布/订阅 处理
- 其他终结点，如健康检查

### 问题中间件

某些中间件可能会干扰 Dapr 请求到 actors 处理程序的路由。 特别是 `UseHttpsRedirection` 对于Dapr的默认配置是有问题的。 Dapr默认会通过未加密的HTTP发送请求，然后会被 `UseHttpsRedirection` 中间件阻止。 这个中间件目前不能与 Dapr 一起使用。

```csharp
// in Startup.cs
public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
{
    if (env.IsDevelopment())
    {
        app.UseDeveloperExceptionPage();
    }

    // INVALID - this will block non-HTTPS requests
    app.UseHttpsRedirection();
    // INVALID - this will block non-HTTPS requests

    app.UseRouting();

    app.UseEndpoints(endpoints =>
    {
        // Register actors handlers that interface with the Dapr runtime.
        endpoints.MapActorsHandlers();
    });
}
        endpoints.MapActorsHandlers();
    });
}
```