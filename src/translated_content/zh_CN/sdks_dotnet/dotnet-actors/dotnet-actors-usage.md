---
type: docs
title: "编写并运行 Actors"
linkTitle: "Authoring actors"
weight: 200000
description: 了解有关使用 .NET SDK 编写和运行 Actors
---

## 编写 Actors

### ActorHost

`ActorHost`：

- 是所有 Actors 的必需构造函数参数
- 由运行时提供
- 必须传递给基类的构造函数
- 包含了允许该 actor 实例与运行时通信的所有状态

```csharp
internal class MyActor : Actor, IMyActor, IRemindable
{
    public MyActor(ActorHost host) // Accept ActorHost in the constructor
        : base(host) // Pass ActorHost to the base class constructor
    {
    }
}
```

因为 `ActorHost` 包含了actor独有的状态，所以你不需要将实例传递到代码的其他部分。 建议只在测试中创建自己的`ActorHost`实例。

### 使用依赖输入

Actors支持[依赖性注入](https://docs.microsoft.com/aspnet/core/fundamentals/dependency-injection)到构造函数中的附加参数。 您定义的任何其他参数都将从依赖注入容器中得到它们的值。

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

Actor 类型应该有单个的 `public` 构造函数。 Actor 基础设施使用 [`ActivatorUtilities`](https://docs.microsoft.com/en-us/dotnet/core/extensions/dependency-injection#constructor-injection-behavior) 模式来构建 actor 实例。

你可以在 `Startup.cs` 中用依赖注入注册类型来使它们可用。 阅读更多关于[注册类型的不同方法](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/dependency-injection?#service-registration-methods)。

```csharp
// In Startup.cs
public void ConfigureServices(IServiceCollection services)
{
    ...

    // Register additional types with dependency injection.
    services.AddSingleton<BankService>();
}
```

每个 actor 实例都有自己的依赖注入范围，并在执行操作后在内存中保留一段时间。 在此期间，也会考虑与 actor 相关联的依赖注入范围是活动的。 当 actor 被停用时，将释放该作用域。

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

在使用这种模式时，要避免创建许多实现 **transient** 的服务，这些服务实现了 `IDisposable` 接口。 由于与一个 actor 相关联的作用域可以被认为是长期有效的，所以你可以在内存中积累许多服务。 更多信息请参见 [依赖注入指南](https://docs.microsoft.com/en-us/dotnet/core/extensions/dependency-injection-guidelines) 。

### IDisposable 和 actors

Actor 可以实现 `IDisposable` 或 `IAsyncDisposable` 。 建议您依靠依赖关系注入进行资源管理，而不是在应用程序代码中实现释放功能。 在极少数情况下，在确实有必要的情况下提供处置支持。

### 日志

在一个 actor 类中，你可以通过基类 `Actor` 上的属性来访问一个 `ILogger` 实例。 该实例连接到 ASP.NET Core 日志系统，应该用于 actor 内部的所有日志记录。 [了解更多关于日志记录](https://docs.microsoft.com/en-us/dotnet/core/extensions/logging?tabs=command-line)。 您可以配置各种不同的日志格式和输出接收器。

使用 _结构化日志_ 与 _命名的占位符_ 类似于下面的示例：

```csharp
public Task<MyData> GetDataAsync()
{
    this.Logger.LogInformation("Getting state at {CurrentTime}", DateTime.UtcNow);
    return this.StateManager.GetStateAsync<MyData>("my_data");
}
```

日志记录时，避免使用格式字符串： `$"Getting state at {DateTime.UtcNow}`

日志记录应该使用 [命名的占位符语法](https://docs.microsoft.com/dotnet/core/extensions/logging?tabs=command-line#log-message-template), 这种语法更加性能，能够更好地与日志系统集成。

### 使用显式的 actor 类型名称

默认情况下，_actor_的_类型_，如同客户端所见，是从_actor_实现类的_名称_派生而来。 默认名称将是类名 (不含命名空间)。

如果需要，可以通过将 `ActorAttribute` 属性附加到 actor 实现类来指定显式类型名称。

```csharp
[Actor(TypeName = "MyCustomActorTypeName")]
internal class MyActor : Actor, IMyActor
{
    // ...
}
```

在上面的示例中，名称将是 `MyCustomActorTypename`。

无需更改以运行时注册 actor类型的代码，只需通过属性提供值。

## 在服务器上托管 Actors

### 注册 Actor

Actor 注册是 `Startup.cs` 中 `ConfigureServices` 的一部分。 您可以通过`ConfigureServices`方法使用依赖注入注册服务。 注册一组 actor 类型是 actor 服务的注册的一部分。

在 `ConfigureServices` 中，您可以：

- 注册 actor 运行时(`AddActors`)
- 注册 actor 类型(`options.Actors.RegisterActor<>`)
- 配置 actor 运行时设置 `options`
- 注册额外的服务类型以便将依赖注入到 Actors 中(`services`)

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

Actor 运行时使用 [System.Text.Json](https://docs.microsoft.com/dotnet/standard/serialization/system-text-json-overview) 为：

- 将数据序列化到状态存储
- 处理来自弱类型客户端的请求

默认情况下，actor 运行时使用基于 [JsonSerializerDefaults.Web](https://docs.microsoft.com/dotnet/api/system.text.json.jsonserializerdefaults?view=net-5.0) 的设置。

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

`UseRouting` 和 `UseEndpoints` 的调用对于配置路由是必要的。 通过在中间件内部添加`MapActorsHandlers`，将 Actors 配置为管道的一部分。

这是一个最小的示例，它对 Actor 功能与以下功能一起存在是有效的：

- Controllers
- Razor Pages
- Blazor
- gRPC 服务
- Dapr 发布/订阅 处理
- 其他端点，如健康检查

### 有问题的中间件

某些中间件可能会干扰 Dapr 请求到 actor 处理程序的路由。 特别是，`UseHttpsRedirection` 对于Dapr的默认配置是有问题的。 Dapr 默认会通过未加密的 HTTP 发送请求，然后会被 `UseHttpsRedirection` 中间件阻止。 这个中间件目前不能与 Dapr 一起使用。

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

试试 [运行和使用 virtual actors 示例]({{< ref dotnet-actors-howto.md >}}). 