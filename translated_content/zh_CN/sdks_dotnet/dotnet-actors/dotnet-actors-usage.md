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
    }
}
```

在使用该模式时，要注意避免创建许多实现 `IDisposable` 的 **transient** 服务的实例。 由于与一个 actor 相关联的作用域可以被认为是长期有效的，所以有可能在内存中积累许多服务。 更多信息请参见 [依赖注入指南](https://docs.microsoft.com/en-us/dotnet/core/extensions/dependency-injection-guidelines) 。

### IDisposable 和 actors

Actors可以实现 `IDisposable` 或 `IAsyncDisposable` 。 建议您依靠依赖注入进行资源管理，而不是在应用代码中实现处置功能。 在真正有必要的罕见情况下，提供处置支持。

### 日志

在 actor 类的内部，你可以通过基类 `Actor` 上的一个属性来访问 `ILogger` 的实例。 该实例连接到 ASP.NET Core 日志系统，应该用于 actor 内部的所有日志记录。 在 [此处](https://docs.microsoft.com/en-us/dotnet/core/extensions/logging?tabs=command-line) 阅读更多有关日志的信息。 您可以配置各种不同的日志格式和输出接收器。

您应该使用 *结构化日志* 与 *命名的占位符* 类似于下面的示例：

```csharp
public Task<MyData> GetDataAsync()
{
    this.Logger.LogInformation("Getting state at {CurrentTime}", DateTime.UtcNow);
    return this.StateManager.GetStateAsync<MyData>("my_data");
}
```

日志记录时，避免使用格式字符串： `$"Getting state at {DateTime.UtcNow}`

日志记录应该使用 [命名的占位符语法](https://docs.microsoft.com/en-us/dotnet/core/extensions/logging?tabs=command-line#log-message-template), 这种语法更加性能，能够更好地与日志系统集成。

### 使用显式的actor类型名称

默认情况下，客户端所看到的actor的 *type* 来自 actor 实现类的名称。 默认名称将是类名 (不含命名空间)。

如果需要，你可以通过向actor实现类附加一个 `ActorAttribute` 特性来指定一个显式的类型名称。

```csharp
[Actor(TypeName = "MyCustomActorTypeName")]
internal class MyActor : Actor, IMyActor
{
    // ...
}
}
```

在上面的示例中，名称将是 `MyCustomActorTypename`。

无需更改以运行时注册 actor类型的代码，只需通过属性提供值。

## 在服务器上托管 Actors

### 注册 Actors

Actor 注册是 `Startup.cs` 中 `ConfigureServices` 的一部分。 `ConfigureServices`方法是用依赖注入注册服务的位置，注册 actor 类型集是 actor 服务注册的一部分。

在 `ConfigureServices` 中，您可以：

- 注册 actor 运行时(`UseActors`)
- 注册 actor 类型(`options.Actors.RegisterActor<>`)
- 配置 actor 运行时设置 `options`
- 注册额外的服务类型以便将依赖注入到 Actors中(`services`)

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

Actor 运行时使用 [System.Text.Json](https://docs.microsoft.com/en-us/dotnet/standard/serialization/system-text-json-overview) 将数据序列化到状态存储，并处理来自弱类型客户端的请求。

默认情况下，actor运行时使用基于 [JsonSerializerDefaults.Web](https://docs.microsoft.com/en-us/dotnet/api/system.text.json.jsonserializerdefaults?view=net-5.0) 的设置。

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

### Actors 和 路由

ASP.NET Core 托管支持对 actors 使用[终结点路由](https://docs.microsoft.com/en-us/aspnet/core/fundamenta ls/routing) 系统。 .NET SDK 不提供支持托管 Actors 的早期 ASP.NET Core版本的遗留路由系统。

由于 actors 使用终结点路由，Actors HTTP处理程序是中间件管道的一部分。 下面是一个 `Configure` 方法与 actors一起设置中间件管道的最小示例。

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
         
```

`UseRouting` 和 `UseEndpoints` 调用是配置路由所必需的。 在终结点中间件中添加 `MapActorsHandlers` 就是将 actors 配置为管道的一部分。

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
         
```