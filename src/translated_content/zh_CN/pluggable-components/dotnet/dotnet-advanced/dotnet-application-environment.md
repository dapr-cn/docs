---
type: docs
title: ".NET Dapr 插件组件的应用环境配置"
linkTitle: "应用环境配置"
weight: 1000
description: 如何配置 .NET 插件组件的环境
no_list: true
is_preview: true
---

.NET Dapr 插件组件应用可以配置依赖注入、日志记录和配置值，类似于 ASP.NET 应用。`DaprPluggableComponentsApplication` 提供了一组与 `WebApplicationBuilder` 类似的配置属性。

## 依赖注入

注册到服务的组件可以参与依赖注入。组件构造函数中的参数会在创建时被注入，前提是这些类型已在应用中注册。你可以通过 `DaprPluggableComponentsApplication` 提供的 `IServiceCollection` 来注册它们。

```csharp
var app = DaprPluggableComponentsApplication.Create();

// 将 MyService 注册为 IService 的单例实现。
app.Services.AddSingleton<IService, MyService>();

app.RegisterService(
    "<service name>",
    serviceBuilder =>
    {
        serviceBuilder.RegisterStateStore<MyStateStore>();
    });

app.Run();

interface IService
{
    // ...
}

class MyService : IService
{
    // ...
}

class MyStateStore : IStateStore
{
    // 在创建 state 存储时注入 IService。
    public MyStateStore(IService service)
    {
        // ...
    }

    // ...
}
```

{{% alert title="警告" color="warning" %}}
不推荐使用 `IServiceCollection.AddScoped()`。因为此类实例的生命周期仅限于单个 gRPC 方法调用，这与组件实例的生命周期不一致。
{{% /alert %}}

## 日志记录

.NET Dapr 插件组件可以使用[标准 .NET 日志机制](https://learn.microsoft.com/en-us/dotnet/core/extensions/logging)。`DaprPluggableComponentsApplication` 提供了一个 `ILoggingBuilder`，可以通过它进行配置。

{{% alert title="注意" color="primary" %}}
与 ASP.NET 类似，日志服务（例如，`ILogger<T>`）已预先注册。
{{% /alert %}}

```csharp
var app = DaprPluggableComponentsApplication.Create();

// 清除默认日志记录器并添加新的。
app.Logging.ClearProviders();
app.Logging.AddConsole();

app.RegisterService(
    "<service name>",
    serviceBuilder =>
    {
        serviceBuilder.RegisterStateStore<MyStateStore>();
    });

app.Run();

class MyStateStore : IStateStore
{
    // 在创建 state 存储时注入日志记录器。
    public MyStateStore(ILogger<MyStateStore> logger)
    {
        // ...
    }

    // ...
}
```

## 配置值

由于 .NET 插件组件是基于 ASP.NET 构建的，它们可以使用其[标准配置机制](https://learn.microsoft.com/en-us/dotnet/core/extensions/configuration)，并默认使用相同的一组[预注册提供者](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/configuration/?view=aspnetcore-6.0#default-application-configuration-sources)。`DaprPluggableComponentsApplication` 提供了一个 `IConfigurationManager`，可以通过它进行配置。

```csharp
var app = DaprPluggableComponentsApplication.Create();

// 清除默认配置提供者并添加新的。
((IConfigurationBuilder)app.Configuration).Sources.Clear();
app.Configuration.AddEnvironmentVariables();

// 在启动时获取配置值。
const value = app.Configuration["<name>"];

app.RegisterService(
    "<service name>",
    serviceBuilder =>
    {
        serviceBuilder.RegisterStateStore<MyStateStore>();
    });

app.Run();

class MyStateStore : IStateStore
{
    // 在创建 state 存储时注入配置。
    public MyStateStore(IConfiguration configuration)
    {
        // ...
    }

    // ...
}
