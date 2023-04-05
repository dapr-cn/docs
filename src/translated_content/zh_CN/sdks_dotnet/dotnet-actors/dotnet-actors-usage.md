---
type: docs
title: "Author & run actors"
linkTitle: "Authoring actors"
weight: 200000
description: 了解有关使用 .NET SDK 编写和运行 Actors
---

## Author actors

### ActorHost

The `ActorHost`:

- Is a required constructor parameter of all actors
- Is provided by the runtime
- Must be passed to the base class constructor
- Contains all of the state that allows that actor instance to communicate with the runtime

```csharp
internal class MyActor : Actor, IMyActor, IRemindable
{
    public MyActor(ActorHost host) // Accept ActorHost in the constructor
        : base(host) // Pass ActorHost to the base class constructor
    {
    }
}
```

Since the `ActorHost` contains state unique to the actor, you don't need to pass the instance into other parts of your code. It's recommended only create your own instances of `ActorHost` in tests.

### Dependency injection

Actors support [dependency injection](https://docs.microsoft.com/aspnet/core/fundamentals/dependency-injection) of additional parameters into the constructor. Any other parameters you define will have their values satisfied from the dependency injection container.

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

Actor 类型应该有单个的 `public` 构造函数。 The actor infrastructure uses the [`ActivatorUtilities`](https://docs.microsoft.com/en-us/dotnet/core/extensions/dependency-injection#constructor-injection-behavior) pattern for constructing actor instances.

你可以在 `Startup.cs` 中用依赖注入注册类型来使它们可用。 Read more about [the different ways of registering your types](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/dependency-injection?#service-registration-methods).

```csharp
// In Startup.cs
public void ConfigureServices(IServiceCollection services)
{
    ...

    // Register additional types with dependency injection.
    services.AddSingleton<BankService>();
}
```

Each actor instance has its own dependency injection scope and remains in memory for some time after performing an operation. During that time, the dependency injection scope associated with the actor is also considered live. The scope will be released when the actor is deactivated.

如果 actor 在构造函数中注入 `IServiceProvider` ，该 actor 将收到一个与它的作用域相关联的 `IServiceProvider` 的引用。 `IServiceProvider` 可以用来在将来动态地解析服务。

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

When using this pattern, avoid creating many instances of **transient** services which implement `IDisposable`. Since the scope associated with an actor could be considered valid for a long time, you can accumulate many services in memory. 更多信息请参见 [依赖注入指南](https://docs.microsoft.com/en-us/dotnet/core/extensions/dependency-injection-guidelines) 。

### IDisposable 和 actors

Actor 可以实现 `IDisposable` 或 `IAsyncDisposable` 。 It's recommended that you rely on dependency injection for resource management rather than implementing dispose functionality in application code. Dispose support is provided in the rare case where it is truly necessary.

### 日志

Inside an actor class, you have access to an `ILogger` instance through a property on the base `Actor` class. This instance is connected to the ASP.NET Core logging system and should be used for all logging inside an actor. Read more about [logging](https://docs.microsoft.com/en-us/dotnet/core/extensions/logging?tabs=command-line). 您可以配置各种不同的日志格式和输出接收器。

Use _structured logging_ with _named placeholders_ like the example below:

```csharp
public Task<MyData> GetDataAsync()
{
    this.Logger.LogInformation("Getting state at {CurrentTime}", DateTime.UtcNow);
    return this.StateManager.GetStateAsync<MyData>("my_data");
}
```

日志记录时，避免使用格式字符串： `$"Getting state at {DateTime.UtcNow}`

Logging should use the [named placeholder syntax](https://docs.microsoft.com/dotnet/core/extensions/logging?tabs=command-line#log-message-template) which offers better performance and integration with logging systems.

### 使用显式的 actor 类型名称

By default, the _type_ of the actor, as seen by clients, is derived from the _name_ of the actor implementation class. The default name will be the class name (without namespace).

如果需要，可以通过将 `ActorAttribute` 属性附加到 actor 实现类来指定显式类型名称。

```csharp
[Actor(TypeName = "MyCustomActorTypeName")]
internal class MyActor : Actor, IMyActor
{
    // ...
}
```

In the example above, the name will be `MyCustomActorTypeName`.

无需更改以运行时注册 actor类型的代码，只需通过属性提供值。

## Host actors on the server

### 注册 Actor

Actor registration is part of `ConfigureServices` in `Startup.cs`. You can register services with dependency injection via the `ConfigureServices` method. Registering the set of actor types is part of the registration of actor services.

在 `ConfigureServices` 中，您可以：

- Register the actor runtime (`AddActors`)
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

### 配置 JSON 选项

The actor runtime uses [System.Text.Json](https://docs.microsoft.com/dotnet/standard/serialization/system-text-json-overview) for:

- Serializing data to the state store
- Handling requests from the weakly-typed client

By default, the actor runtime uses settings based on [JsonSerializerDefaults.Web](https://docs.microsoft.com/dotnet/api/system.text.json.jsonserializerdefaults?view=net-5.0).

您可以配置 `JsonSerializerOptions` 作为 `ConfigureServices` 的一部分：

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

### Actor 和路由

托管支持 actor 的 ASP.NET Core 使用[端点路由](https://docs.microsoft.com/en-us/aspnet/core/fundamenta ls/routing)系统。 .NET SDK 不提供支持托管 Actors 的早期 ASP.NET Core版本的遗留路由系统。

由于 actors 使用端点路由，因此 actors HTTP 处理程序是中间件管道的一部分。 下面是 `Configure` 方法与 actor 一起设置中间件管道的最小示例。

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

`UseRouting` 和 `UseEndpoints` 的调用对于配置路由是必要的。 Configure actors as part of the pipeline by adding `MapActorsHandlers` inside the endpoint middleware.

这是一个最小的示例，它对 Actor 功能与以下功能一起存在是有效的：

- Controllers
- Razor Pages
- Blazor
- gRPC Services
- Dapr pub/sub handler
- other endpoints such as health checks

### 有问题的中间件

某些中间件可能会干扰 Dapr 请求到 actor 处理程序的路由。 In particular, the `UseHttpsRedirection` is problematic for Dapr's default configuration. Dapr sends requests over unencrypted HTTP by default, which the `UseHttpsRedirection` middleware will block. 这个中间件目前不能与 Dapr 一起使用。

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
```

## 下一步

Try the [Running and using virtual actors example]({{< ref dotnet-actors-howto.md >}}). 