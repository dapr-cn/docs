---
type: docs
title: "如何：在 .NET SDK 中编写和管理 Dapr 任务"
linkTitle: "如何：编写和管理任务"
weight: 51000
description: 学习如何使用 .NET SDK 编写和管理 Dapr 任务
---

我们来创建一个端点，该端点将在 Dapr 任务触发时被调用，然后在同一个应用中调度该任务。我们将使用[此处提供的简单示例](https://github.com/dapr/dotnet-sdk/tree/master/examples/Jobs)，进行以下演示，并通过它来解释如何使用间隔或 Cron 表达式自行调度一次性或重复性任务。在本指南中，您将：

- 部署一个 .NET Web API 应用程序 ([JobsSample](https://github.com/dapr/dotnet-sdk/tree/master/examples/Jobs/JobsSample))
- 利用 Dapr .NET 任务 SDK 调度任务调用并设置被触发的端点

在 .NET 示例项目中：
- 主要的 [`Program.cs`](https://github.com/dapr/dotnet-sdk/tree/master/examples/Jobs/JobsSample/Program.cs) 文件是整个演示的核心。

## 前提条件
- [Dapr CLI](https://docs.dapr.io/getting-started/install-dapr-cli/)
- [初始化的 Dapr 环境](https://docs.dapr.io/getting-started/install-dapr-selfhost)
- 已安装 [.NET 6](https://dotnet.microsoft.com/download/dotnet/6.0)、[.NET 8](https://dotnet.microsoft.com/download/dotnet/8.0) 或 [.NET 9](https://dotnet.microsoft.com/download/dotnet/9.0)
- 项目中已安装 [Dapr.Jobs](https://www.nuget.org/packages/Dapr.Jobs) NuGet 包

{{% alert title="注意" color="primary" %}}

请注意，虽然 .NET 6 是 Dapr v1.15 中支持的最低版本，但从 v1.16 开始，Dapr 仅支持 .NET 8 和 .NET 9。

{{% /alert %}}

## 设置环境
克隆 [.NET SDK 仓库](https://github.com/dapr/dotnet-sdk)。

```sh
git clone https://github.com/dapr/dotnet-sdk.git
```

从 .NET SDK 根目录，导航到 Dapr 任务示例。

```sh
cd examples/Jobs
```

## 本地运行应用程序

要运行 Dapr 应用程序，您需要启动 .NET 程序和一个 Dapr sidecar。导航到 `JobsSample` 目录。

```sh
cd JobsSample
```

我们将运行一个命令，同时启动 Dapr sidecar 和 .NET 程序。

```sh
dapr run --app-id jobsapp --dapr-grpc-port 4001 --dapr-http-port 3500 -- dotnet run
```

> Dapr 监听 HTTP 请求在 `http://localhost:3500` 和内部任务 gRPC 请求在 `http://localhost:4001`。

## 使用依赖注入注册 Dapr 任务客户端
Dapr 任务 SDK 提供了一个扩展方法来简化 Dapr 任务客户端的注册。在 `Program.cs` 中完成依赖注入注册之前，添加以下行：

```cs
var builder = WebApplication.CreateBuilder(args);

//在这两行之间的任意位置添加
builder.Services.AddDaprJobsClient(); //这样就完成了

var app = builder.Build();
```

> 请注意，在当前的任务 API 实现中，调度任务的应用也将是接收触发通知的应用。换句话说，您不能调度一个触发器在另一个应用中运行。因此，虽然您不需要在应用中显式注册 Dapr 任务客户端来调度触发调用端点，但如果没有同一个应用以某种方式调度任务（无论是通过此 Dapr 任务 .NET SDK 还是对 sidecar 的 HTTP 调用），您的端点将永远不会被调用。

您可能希望为 Dapr 任务客户端提供一些配置选项，这些选项应在每次调用 sidecar 时存在，例如 Dapr API 令牌，或者您希望使用非标准的 HTTP 或 gRPC 端点。这可以通过使用允许配置 `DaprJobsClientBuilder` 实例的注册方法重载来实现：

```cs
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDaprJobsClient((_, daprJobsClientBuilder) =>
{
    daprJobsClientBuilder.UseDaprApiToken("abc123");
    daprJobsClientBuilder.UseHttpEndpoint("http://localhost:8512"); //非标准 sidecar HTTP 端点
});

var app = builder.Build();
```

如果您需要从其他来源检索注入的值，这些来源本身注册为依赖项，您可以使用另一个重载来将 `IServiceProvider` 注入到配置操作方法中。在以下示例中，我们注册了一个虚构的单例，可以从某处检索 secret，并将其传递到 `AddDaprJobClient` 的配置方法中，以便我们可以从其他地方检索我们的 Dapr API 令牌以在此处注册：

```cs
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<SecretRetriever>();
builder.Services.AddDaprJobsClient((serviceProvider, daprJobsClientBuilder) =>
{
    var secretRetriever = serviceProvider.GetRequiredService<SecretRetriever>();
    var daprApiToken = secretRetriever.GetSecret("DaprApiToken").Value;
    daprJobsClientBuilder.UseDaprApiToken(daprApiToken);

    daprJobsClientBuilder.UseHttpEndpoint("http://localhost:8512");
});

var app = builder.Build();
```

## 使用 IConfiguration 配置 Dapr 任务客户端
可以使用注册的 `IConfiguration` 中的值来配置 Dapr 任务客户端，而无需显式指定每个值的重写，如前一节中使用 `DaprJobsClientBuilder` 所示。相反，通过填充通过依赖注入提供的 `IConfiguration`，`AddDaprJobsClient()` 注册将自动使用这些值覆盖其各自的默认值。

首先在您的配置中填充值。这可以通过以下示例中的几种不同方式完成。

### 通过 `ConfigurationBuilder` 配置
应用程序设置可以在不使用配置源的情况下配置，而是通过填充 `ConfigurationBuilder` 实例中的值来实现：

```csharp
var builder = WebApplication.CreateBuilder();

//创建配置
var configuration = new ConfigurationBuilder()
    .AddInMemoryCollection(new Dictionary<string, string> {
            { "DAPR_HTTP_ENDPOINT", "http://localhost:54321" },
            { "DAPR_API_TOKEN", "abc123" }
        })
    .Build();

builder.Configuration.AddConfiguration(configuration);
builder.Services.AddDaprJobsClient(); //这将自动从 IConfiguration 中填充 HTTP 端点和 API 令牌值
```

### 通过环境变量配置
应用程序设置可以从应用程序可用的环境变量中访问。

以下环境变量将用于填充用于注册 Dapr 任务客户端的 HTTP 端点和 API 令牌。

| Key | Value |
| --- | --- |
| DAPR_HTTP_ENDPOINT | http://localhost:54321 |
| DAPR_API_TOKEN | abc123 |

```csharp
var builder = WebApplication.CreateBuilder();

builder.Configuration.AddEnvironmentVariables();
builder.Services.AddDaprJobsClient();
```

Dapr 任务客户端将被配置为使用 HTTP 端点 `http://localhost:54321` 并用 API 令牌头 `abc123` 填充所有出站请求。

### 通过前缀环境变量配置

然而，在共享主机场景中，多个应用程序都在同一台机器上运行而不使用容器或在开发环境中，前缀环境变量并不罕见。以下示例假设 HTTP 端点和 API 令牌都将从前缀为 "myapp_" 的环境变量中提取。在此场景中使用的两个环境变量如下：

| Key | Value |
| --- | --- |
| myapp_DAPR_HTTP_ENDPOINT | http://localhost:54321 |
| myapp_DAPR_API_TOKEN | abc123 |

这些环境变量将在以下示例中加载到注册的配置中，并在没有附加前缀的情况下提供。

```csharp
var builder = WebApplication.CreateBuilder();

builder.Configuration.AddEnvironmentVariables(prefix: "myapp_");
builder.Services.AddDaprJobsClient();
```

Dapr 任务客户端将被配置为使用 HTTP 端点 `http://localhost:54321` 并用 API 令牌头 `abc123` 填充所有出站请求。

## 不依赖于依赖注入使用 Dapr 任务客户端
虽然使用依赖注入简化了 .NET 中复杂类型的使用，并使处理复杂配置变得更容易，但您不需要以这种方式注册 `DaprJobsClient`。相反，您也可以选择从 `DaprJobsClientBuilder` 实例创建它的实例，如下所示：

```cs

public class MySampleClass
{
    public void DoSomething()
    {
        var daprJobsClientBuilder = new DaprJobsClientBuilder();
        var daprJobsClient = daprJobsClientBuilder.Build();

        //使用 `daprJobsClient` 做一些事情
    }
}
```

## 设置一个在任务触发时被调用的端点

如果您熟悉 [ASP.NET Core 中的最小 API](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/overview)，那么设置一个任务端点很简单，因为两者的语法相同。

一旦完成依赖注入注册，按照您在 ASP.NET Core 中使用最小 API 功能处理 HTTP 请求映射的方式配置应用程序。实现为扩展方法，传递它应该响应的任务名称和一个委托。服务可以根据需要注入到委托的参数中，您可以选择传递 `JobDetails` 以获取有关已触发任务的信息（例如，访问其调度设置或负载）。

这里有两个委托可以使用。一个提供 `IServiceProvider` 以防您需要将其他服务注入处理程序：

```cs
//我们从上面的示例中得到了这个
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDaprJobsClient();

var app = builder.Build();

//添加我们的端点注册
app.MapDaprScheduledJob("myJob", (IServiceProvider serviceProvider, string? jobName, JobDetails? jobDetails) => {
    var logger = serviceProvider.GetService<ILogger>();
    logger?.LogInformation("Received trigger invocation for '{jobName}'", "myJob");

    //做一些事情...
});

app.Run();
```

如果不需要，委托的另一个重载不需要 `IServiceProvider`：

```cs
//我们从上面的示例中得到了这个
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDaprJobsClient();

var app = builder.Build();

//添加我们的端点注册
app.MapDaprScheduledJob("myJob", (string? jobName, JobDetails? jobDetails) => {
    //做一些事情...
});

app.Run();
```

## 注册任务

最后，我们必须注册我们想要调度的任务。请注意，从这里开始，所有 SDK 方法都支持取消令牌，并在未设置时使用默认令牌。

有三种不同的方式来设置任务，具体取决于您想要如何配置调度：

### 一次性任务
一次性任务就是这样；它将在某个时间点运行，并且不会重复。这种方法要求您选择一个任务名称并指定一个触发时间。

| 参数名称 | 类型 | 描述 | 必需 |
|---|---|---|---|
| jobName | string | 正在调度的任务的名称。 | 是 |
| scheduledTime | DateTime | 任务应运行的时间点。 | 是 |
| payload | ReadOnlyMemory<byte> | 触发时提供给调用端点的任务数据。 | 否 |
| cancellationToken | CancellationToken | 用于提前取消操作，例如由于操作超时。 | 否 |

可以从 Dapr 任务客户端调度一次性任务，如以下示例所示：

```cs
public class MyOperation(DaprJobsClient daprJobsClient)
{
    public async Task ScheduleOneTimeJobAsync(CancellationToken cancellationToken)
    {
        var today = DateTime.UtcNow;
        var threeDaysFromNow = today.AddDays(3);

        await daprJobsClient.ScheduleOneTimeJobAsync("myJobName", threeDaysFromNow, cancellationToken: cancellationToken);
    }
}
```

### 基于间隔的任务
基于间隔的任务是一个在配置为固定时间量的循环中运行的任务，不像今天在 actor 构建块中工作的[提醒](https://docs.dapr.io/developing-applications/building-blocks/actors/actors-timers-reminders/#actor-reminders)。这些任务也可以通过许多可选参数进行调度：

| 参数名称 | 类型 | 描述 | 必需 |
|---|---|---|---|
| jobName | string | 正在调度的任务的名称。 | 是 |
| interval | TimeSpan | 任务应触发的间隔。 | 是 |
| startingFrom | DateTime | 任务调度应开始的时间点。 | 否 |
| repeats | int | 任务应触发的最大次数。 | 否 |
| ttl | 任务何时过期且不再触发。 | 否 |
| payload | ReadOnlyMemory<byte> | 触发时提供给调用端点的任务数据。 | 否 |
| cancellationToken | CancellationToken | 用于提前取消操作，例如由于操作超时。 | 否 |

可以从 Dapr 任务客户端调度基于间隔的任务，如以下示例所示：

```cs
public class MyOperation(DaprJobsClient daprJobsClient)
{

    public async Task ScheduleIntervalJobAsync(CancellationToken cancellationToken)
    {
        var hourlyInterval = TimeSpan.FromHours(1);

        //每小时触发任务，但最多触发 5 次
        await daprJobsClient.ScheduleIntervalJobAsync("myJobName", hourlyInterval, repeats: 5), cancellationToken: cancellationToken;
    }
}
```

### 基于 Cron 的任务
基于 Cron 的任务是使用 Cron 表达式调度的。这提供了更多基于日历的控制，以便在任务触发时使用日历值在表达式中。与其他选项一样，这些任务也可以通过许多可选参数进行调度：

| 参数名称 | 类型 | 描述 | 必需 |
|---|---|---|---|
| jobName | string | 正在调度的任务的名称。 | 是 |
| cronExpression | string | 指示任务应触发的 systemd 类似 Cron 表达式。 | 是 |
| startingFrom | DateTime | 任务调度应开始的时间点。 | 否 |
| repeats | int | 任务应触发的最大次数。 | 否 |
| ttl | 任务何时过期且不再触发。 | 否 |
| payload | ReadOnlyMemory<byte> | 触发时提供给调用端点的任务数据。 | 否 |
| cancellationToken | CancellationToken | 用于提前取消操作，例如由于操作超时。 | 否 |

可以从 Dapr 任务客户端调度基于 Cron 的任务，如下所示：

```cs
public class MyOperation(DaprJobsClient daprJobsClient)
{
    public async Task ScheduleCronJobAsync(CancellationToken cancellationToken)
    {
        //在每个月的第五天的每隔一小时的顶部
        const string cronSchedule = "0 */2 5 * *";

        //直到下个月才开始
        var now = DateTime.UtcNow;
        var oneMonthFromNow = now.AddMonths(1);
        var firstOfNextMonth = new DateTime(oneMonthFromNow.Year, oneMonthFromNow.Month, 1, 0, 0, 0);

        //每小时触发任务，但最多触发 5 次
        await daprJobsClient.ScheduleCronJobAsync("myJobName", cronSchedule, dueTime: firstOfNextMonth, cancellationToken: cancellationToken);
    }
}
```

## 获取已调度任务的详细信息
如果您知道已调度任务的名称，您可以在不等待其触发的情况下检索其元数据。返回的 `JobDetails` 提供了一些有用的属性，用于从 Dapr 任务 API 消费信息：

- 如果 `Schedule` 属性包含 Cron 表达式，则 `IsCronExpression` 属性将为 true，并且表达式也将在 `CronExpression` 属性中可用。
- 如果 `Schedule` 属性包含持续时间值，则 `IsIntervalExpression` 属性将为 true，并且该值将转换为 `TimeSpan` 值，可从 `Interval` 属性访问。

这可以通过使用以下方法完成：

```cs
public class MyOperation(DaprJobsClient daprJobsClient)
{
    public async Task<JobDetails> GetJobDetailsAsync(string jobName, CancellationToken cancellationToken)
    {
        var jobDetails = await daprJobsClient.GetJobAsync(jobName, canecllationToken);
        return jobDetails;
    }
}
```

## 删除已调度的任务
要删除已调度的任务，您需要知道其名称。从那里开始，只需在 Dapr 任务客户端上调用 `DeleteJobAsync` 方法即可：

```cs
public class MyOperation(DaprJobsClient daprJobsClient)
{
    public async Task DeleteJobAsync(string jobName, CancellationToken cancellationToken)
    {
        await daprJobsClient.DeleteJobAsync(jobName, cancellationToken);
    }
}
