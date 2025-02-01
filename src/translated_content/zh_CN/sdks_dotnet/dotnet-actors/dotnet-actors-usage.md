---
type: docs
title: "编写和运行actor"
linkTitle: "编写actor"
weight: 200000
description: 了解如何使用.NET SDK编写和运行actor
---

## 编写actor

### ActorHost

`ActorHost`：

- 是所有actor构造函数所需的参数
- 由运行时提供的
- 必须传递给基类的构造函数
- 包含允许该actor实例与运行时通信的所有状态信息

```csharp
internal class MyActor : Actor, IMyActor, IRemindable
{
    public MyActor(ActorHost host) // 在构造函数中接收ActorHost
        : base(host) // 将ActorHost传递给基类的构造函数
    {
    }
}
```

由于`ActorHost`包含actor特有的状态信息，您不需要将其实例传递给代码的其他部分。建议仅在测试中创建您自己的`ActorHost`实例。

### 依赖注入

actor支持通过[依赖注入](https://docs.microsoft.com/aspnet/core/fundamentals/dependency-injection)将额外的参数传递到构造函数中。您定义的任何其他参数都将从依赖注入容器中获取其值。

```csharp
internal class MyActor : Actor, IMyActor, IRemindable
{
    public MyActor(ActorHost host, BankService bank) // 在构造函数中接收BankService
        : base(host)
    {
        ...
    }
}
```

一个actor类型应该只有一个`public`构造函数。actor系统使用[`ActivatorUtilities`](https://docs.microsoft.com/en-us/dotnet/core/extensions/dependency-injection#constructor-injection-behavior)模式来创建actor实例。

您可以在`Startup.cs`中注册类型以进行依赖注入以使其可用。阅读更多关于[注册类型的不同方法](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/dependency-injection?#service-registration-methods)。

```csharp
// 在Startup.cs中
public void ConfigureServices(IServiceCollection services)
{
    ...

    // 使用依赖注入注册额外的类型。
    services.AddSingleton<BankService>();
}
```

每个actor实例都有其自己的依赖注入范围，并在执行操作后在内存中保留一段时间。在此期间，与actor关联的依赖注入范围也被视为活动状态。该范围将在actor被停用时释放。

如果actor在构造函数中注入`IServiceProvider`，actor将接收到与其范围关联的`IServiceProvider`的引用。`IServiceProvider`可以用于将来动态解析服务。

```csharp
internal class MyActor : Actor, IMyActor, IRemindable
{
    public MyActor(ActorHost host, IServiceProvider services) // 在构造函数中接收IServiceProvider
        : base(host)
    {
        ...
    }
}
```

使用此模式时，避免创建许多实现`IDisposable`的**瞬态**服务。由于与actor关联的范围可能被视为有效时间较长，您可能会在内存中积累许多服务。有关更多信息，请参阅[依赖注入指南](https://docs.microsoft.com/en-us/dotnet/core/extensions/dependency-injection-guidelines)。

### IDisposable和actor

actor可以实现`IDisposable`或`IAsyncDisposable`。建议您依赖依赖注入进行资源管理，而不是在应用程序代码中实现释放功能。仅在确实必要的情况下提供释放支持。

### 日志记录

在actor类内部，您可以通过基类`Actor`上的属性访问`ILogger`实例。此实例连接到ASP.NET Core日志系统，应该用于actor内部的所有日志记录。阅读更多关于[日志记录](https://docs.microsoft.com/en-us/dotnet/core/extensions/logging?tabs=command-line)。您可以配置各种不同的日志格式和输出接收器。

使用_结构化日志记录_和_命名占位符_，如下例所示：

```csharp
public Task<MyData> GetDataAsync()
{
    this.Logger.LogInformation("获取状态时间为 {CurrentTime}", DateTime.UtcNow);
    return this.StateManager.GetStateAsync<MyData>("my_data");
}
```

记录日志时，避免使用格式字符串，如：`$"获取状态时间为 {DateTime.UtcNow}"`

日志记录应使用[命名占位符语法](https://docs.microsoft.com/dotnet/core/extensions/logging?tabs=command-line#log-message-template)，这提供了更好的性能和与日志系统的集成。

### 使用显式actor类型名称

默认情况下，客户端看到的actor的_类型_是从actor实现类的_名称_派生的。默认名称将是类名（不包括命名空间）。

如果需要，您可以通过将`ActorAttribute`属性附加到actor实现类来指定显式类型名称。

```csharp
[Actor(TypeName = "MyCustomActorTypeName")]
internal class MyActor : Actor, IMyActor
{
    // ...
}
```

在上面的例子中，名称将是`MyCustomActorTypeName`。

无需更改注册actor类型与运行时的代码，通过属性提供值是唯一需要的。

## 在服务器上托管actor

### 注册actor

actor注册是`Startup.cs`中`ConfigureServices`的一部分。您可以通过`ConfigureServices`方法使用依赖注入注册服务。注册actor类型集是actor服务注册的一部分。

在`ConfigureServices`中，您可以：

- 注册actor运行时（`AddActors`）
- 注册actor类型（`options.Actors.RegisterActor<>`）
- 配置actor运行时设置`options`
- 注册额外的服务类型以进行actor的依赖注入（`services`）

```csharp
// 在Startup.cs中
public void ConfigureServices(IServiceCollection services)
{
    // 使用DI注册actor运行时
    services.AddActors(options =>
    {
        // 注册actor类型并配置actor设置
        options.Actors.RegisterActor<MyActor>();
        
        // 配置默认设置
        options.ActorIdleTimeout = TimeSpan.FromMinutes(10);
        options.ActorScanInterval = TimeSpan.FromSeconds(35);
        options.DrainOngoingCallTimeout = TimeSpan.FromSeconds(35);
        options.DrainRebalancedActors = true;
    });

    // 注册额外的服务以供actor使用
    services.AddSingleton<BankService>();
}
```

### 配置JSON选项

actor运行时使用[System.Text.Json](https://docs.microsoft.com/dotnet/standard/serialization/system-text-json-overview)进行：

- 将数据序列化到状态存储
- 处理来自弱类型客户端的请求

默认情况下，actor运行时使用基于[JsonSerializerDefaults.Web](https://docs.microsoft.com/dotnet/api/system.text.json.jsonserializerdefaults?view=net-5.0)的设置。

您可以在`ConfigureServices`中配置`JsonSerializerOptions`：

```csharp
// 在Startup.cs中
public void ConfigureServices(IServiceCollection services)
{
    services.AddActors(options =>
    {
        ...
        
        // 自定义JSON选项
        options.JsonSerializerOptions = ...
    });
}
```

### actor和路由

ASP.NET Core对actor的托管支持使用[端点路由](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/routing)系统。.NET SDK不支持使用早期ASP.NET Core版本的传统路由系统托管actor。

由于actor使用端点路由，actor的HTTP处理程序是中间件管道的一部分。以下是设置包含actor的中间件管道的`Configure`方法的最小示例。

```csharp
// 在Startup.cs中
public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
{
    if (env.IsDevelopment())
    {
        app.UseDeveloperExceptionPage();
    }

    app.UseRouting();

    app.UseEndpoints(endpoints =>
    {
        // 注册与Dapr运行时接口的actor处理程序。
        endpoints.MapActorsHandlers();
    });
}
```

`UseRouting`和`UseEndpoints`调用是配置路由所必需的。通过在端点中间件中添加`MapActorsHandlers`将actor配置为管道的一部分。

这是一个最小示例，actor功能可以与以下内容共存：

- 控制器
- Razor页面
- Blazor
- gRPC服务
- Dapr pub/sub处理程序
- 其他端点，如健康检查

### 问题中间件

某些中间件可能会干扰Dapr请求到actor处理程序的路由。特别是，`UseHttpsRedirection`对于Dapr的默认配置是有问题的。Dapr默认通过未加密的HTTP发送请求，这将被`UseHttpsRedirection`中间件阻止。此中间件目前不能与Dapr一起使用。

```csharp
// 在Startup.cs中
public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
{
    if (env.IsDevelopment())
    {
        app.UseDeveloperExceptionPage();
    }

    // 无效 - 这将阻止非HTTPS请求
    app.UseHttpsRedirection();
    // 无效 - 这将阻止非HTTPS请求

    app.UseRouting();

    app.UseEndpoints(endpoints =>
    {
        // 注册与Dapr运行时接口的actor处理程序。
        endpoints.MapActorsHandlers();
    });
}
```

## 下一步

尝试[运行和使用虚拟actor示例]({{< ref dotnet-actors-howto.md >}})。
