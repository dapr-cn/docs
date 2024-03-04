---
type: docs
title: "一个 .NET Dapr 可插拔组件的应用环境"
linkTitle: "应用程序环境"
weight: 1000
description: 如何配置 .NET 可插拔组件的环境
no_list: true
is_preview: true
---

一个.NET Dapr可插拔组件应用可以像ASP.NET应用程序一样配置依赖注入、日志记录和配置值。  `DaprPluggableComponentsApplication` 暴露了与 `WebApplicationBuilder`相似的配置属性集。

## 使用依赖输入

使用服务注册的组件可以参与依赖注入。 在组件的构造函数中，参数将在创建过程中进行注入，假设这些类型已经在应用程序中注册。 您可以通过 `DaprPluggableComponentsApplication`提供的 `IServiceCollection` 进行注册。

```csharp
var app = DaprPluggableComponentsApplication.Create();

// Register MyService as the singleton implementation of IService.
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
    // Inject IService on creation of the state store.
    public MyStateStore(IService service)
    {
        // ...
    }

    // ...
}
```

{{% alert title="Warning" color="warning" %}}
不推荐使用 `IServiceCollection.AddScoped()` 。 这些实例的生命周期与单个 gRPC 方法调用绑定，这与单个组件实例的生命周期不匹配。
{{% /alert %}}

## 日志

.NET Dapr可插拔组件可以使用 [标准的.NET日志机制](https://learn.microsoft.com/en-us/dotnet/core/extensions/logging)。 DaprPluggableComponentsApplication `通过` 暴露了一个 `ILoggingBuilder`，通过它可以进行配置。

{{% alert title="Note" color="primary" %}}
与ASP.NET一样，日志记录器服务（例如， `ILogger<T>`）已预先注册。
{{% /alert %}}

```csharp
var app = DaprPluggableComponentsApplication.Create();

// Reset the default loggers and setup new ones.
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
    // Inject a logger on creation of the state store.
    public MyStateStore(ILogger<MyStateStore> logger)
    {
        // ...
    }

    // ...
}
```

## 配置值

由于.NET可插拔组件是构建在ASP.NET上的，它们可以使用其[标准配置机制](https://learn.microsoft.com/en-us/dotnet/core/extensions/configuration)，并默认使用相同的[预注册提供程序](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/configuration/?view=aspnetcore-6.0#default-application-configuration-sources)。 `DaprPluggableComponentsApplication` 通过一个 `IConfigurationManager` 暴露出来，通过它可以进行配置。

```csharp
var app = DaprPluggableComponentsApplication.Create();

// Reset the default configuration providers and add new ones.
((IConfigurationBuilder)app.Configuration).Sources.Clear();
app.Configuration.AddEnvironmentVariables();

// Get configuration value on startup.
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
    // Inject the configuration on creation of the state store.
    public MyStateStore(IConfiguration configuration)
    {
        // ...
    }

    // ...
}
```
