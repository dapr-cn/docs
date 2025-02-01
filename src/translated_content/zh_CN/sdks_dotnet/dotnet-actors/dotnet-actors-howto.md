---
type: docs
title: "如何：在 .NET SDK 中运行和使用虚拟 actor"
linkTitle: "如何：运行和使用虚拟 actor"
weight: 300000
description: 通过此示例尝试 .NET Dapr 虚拟 actor
---

Dapr actor 包使您能够从 .NET 应用程序中与 Dapr 虚拟 actor 交互。在本指南中，您将学习如何：

- 创建一个 actor (`MyActor`)。
- 在客户端应用程序上调用其方法。

```
MyActor --- MyActor.Interfaces
         |
         +- MyActorService
         |
         +- MyActorClient
```

**接口项目 (\MyActor\MyActor.Interfaces)**

此项目包含 actor 的接口定义。actor 接口可以在任何项目中定义，名称不限。接口定义了 actor 实现和调用 actor 的客户端共享的 actor 合约：

- actor 实现
- 调用 actor 的客户端

由于客户端项目可能依赖于它，最好将其定义在与 actor 实现分开的程序集内。

**actor 服务项目 (\MyActor\MyActorService)**

此项目实现了托管 actor 的 ASP.Net Core Web 服务。它包含 actor 的实现，`MyActor.cs`。actor 实现是一个类，它：

- 派生自基础类型 actor
- 实现 `MyActor.Interfaces` 项目中定义的接口。

actor 类还必须实现一个构造函数，该构造函数接受一个 `ActorService` 实例和一个 `ActorId`，并将它们传递给基础 actor 类。

**actor 客户端项目 (\MyActor\MyActorClient)**

此项目包含 actor 客户端的实现，该客户端调用在 actor 接口中定义的 MyActor 的方法。

## 准备工作

- 已安装 [Dapr CLI]({{< ref install-dapr-cli.md >}})。
- 已初始化 [Dapr 环境]({{< ref install-dapr-selfhost.md >}})。
- 已安装 [.NET 6](https://dotnet.microsoft.com/download)、[.NET 8](https://dotnet.microsoft.com/download) 或 [.NET 9](https://dotnet.microsoft.com/download)

{{% alert title="注意" color="primary" %}}

请注意，虽然 .NET 6 通常作为 Dapr .NET SDK 包的最低 .NET 要求得到支持，而 .NET 7 是 Dapr v1.15 中 Dapr.Workflows 的最低支持版本，但只有 .NET 8 和 .NET 9 将继续在 v1.16 及更高版本中得到 Dapr 的支持。

{{% /alert %}}

## 步骤 0：准备

我们将创建 3 个项目，请选择一个空目录开始，并在您选择的终端中打开它。

## 步骤 1：创建 actor 接口

actor 接口定义了 actor 实现和调用 actor 的客户端共享的 actor 合约。

actor 接口定义如下要求：

- actor 接口必须继承 `Dapr.Actors.IActor` 接口
- actor 方法的返回类型必须是 `Task` 或 `Task<object>`
- actor 方法最多可以有一个参数

### 创建接口项目并添加依赖项

```bash
# 创建 actor 接口
dotnet new classlib -o MyActor.Interfaces

cd MyActor.Interfaces

# 添加 Dapr.Actors nuget 包。请使用 nuget.org 上的最新包版本
dotnet add package Dapr.Actors

cd ..
```

### 实现 IMyActor 接口

定义 `IMyActor` 接口和 `MyData` 数据对象。将以下代码粘贴到 `MyActor.Interfaces` 项目的 `MyActor.cs` 中。

```csharp
using Dapr.Actors;
using Dapr.Actors.Runtime;
using System.Threading.Tasks;

namespace MyActor.Interfaces
{
    public interface IMyActor : IActor
    {       
        Task<string> SetDataAsync(MyData data);
        Task<MyData> GetDataAsync();
        Task RegisterReminder();
        Task UnregisterReminder();
        Task<IActorReminder> GetReminder();
        Task RegisterTimer();
        Task UnregisterTimer();
    }

    public class MyData
    {
        public string PropertyA { get; set; }
        public string PropertyB { get; set; }

        public override string ToString()
        {
            var propAValue = this.PropertyA == null ? "null" : this.PropertyA;
            var propBValue = this.PropertyB == null ? "null" : this.PropertyB;
            return $"PropertyA: {propAValue}, PropertyB: {propBValue}";
        }
    }
}
```

## 步骤 2：创建 actor 服务

Dapr 使用 ASP.NET Web 服务来托管 actor 服务。本节将实现 `IMyActor` actor 接口并将 actor 注册到 Dapr 运行时。

### 创建 actor 服务项目并添加依赖项

```bash
# 创建 ASP.Net Web 服务以托管 Dapr actor
dotnet new web -o MyActorService

cd MyActorService

# 添加 Dapr.Actors.AspNetCore nuget 包。请使用 nuget.org 上的最新包版本
dotnet add package Dapr.Actors.AspNetCore

# 添加 actor 接口引用
dotnet add reference ../MyActor.Interfaces/MyActor.Interfaces.csproj

cd ..
```

### 添加 actor 实现

实现 IMyActor 接口并从 `Dapr.Actors.Actor` 类派生。以下示例还展示了如何使用 actor reminder。对于使用 reminder 的 actor，它必须从 IRemindable 派生。如果您不打算使用 reminder 功能，可以跳过实现 IRemindable 和 reminder 特定的方法，这些方法在下面的代码中显示。

将以下代码粘贴到 `MyActorService` 项目的 `MyActor.cs` 中：

```csharp
using Dapr.Actors;
using Dapr.Actors.Runtime;
using MyActor.Interfaces;
using System;
using System.Threading.Tasks;

namespace MyActorService
{
    internal class MyActor : Actor, IMyActor, IRemindable
    {
        // 构造函数必须接受 ActorHost 作为参数，并且还可以接受将从依赖注入容器中检索的其他参数
        //
        /// <summary>
        /// 初始化 MyActor 的新实例
        /// </summary>
        /// <param name="host">将托管此 actor 实例的 Dapr.Actors.Runtime.ActorHost。</param>
        public MyActor(ActorHost host)
            : base(host)
        {
        }

        /// <summary>
        /// 每当 actor 被激活时调用此方法。
        /// actor 在其任何方法首次被调用时被激活。
        /// </summary>
        protected override Task OnActivateAsync()
        {
            // 提供执行一些可选设置的机会。
            Console.WriteLine($"Activating actor id: {this.Id}");
            return Task.CompletedTask;
        }

        /// <summary>
        /// 每当 actor 在一段时间不活动后被停用时调用此方法。
        /// </summary>
        protected override Task OnDeactivateAsync()
        {
            // 提供执行可选清理的机会。
            Console.WriteLine($"Deactivating actor id: {this.Id}");
            return Task.CompletedTask;
        }

        /// <summary>
        /// 将 MyData 设置到 actor 的私有状态存储中
        /// </summary>
        /// <param name="data">用户定义的 MyData，将作为 "my_data" 状态存储到状态存储中</param>
        public async Task<string> SetDataAsync(MyData data)
        {
            // 数据在每次方法执行后由 actor 的运行时隐式保存到配置的状态存储中。
            // 数据也可以通过调用 this.StateManager.SaveStateAsync() 显式保存。
            // 要保存的状态必须是 DataContract 可序列化的。
            await this.StateManager.SetStateAsync<MyData>(
                "my_data",  // 状态名称
                data);      // 为命名状态 "my_data" 保存的数据

            return "Success";
        }

        /// <summary>
        /// 从 actor 的私有状态存储中获取 MyData
        /// </summary>
        /// <return>存储到状态存储中的用户定义的 MyData，作为 "my_data" 状态</return>
        public Task<MyData> GetDataAsync()
        {
            // 从状态存储中获取状态。
            return this.StateManager.GetStateAsync<MyData>("my_data");
        }

        /// <summary>
        /// 向 actor 注册 MyReminder reminder
        /// </summary>
        public async Task RegisterReminder()
        {
            await this.RegisterReminderAsync(
                "MyReminder",              // reminder 的名称
                null,                      // 传递给 IRemindable.ReceiveReminderAsync() 的用户状态
                TimeSpan.FromSeconds(5),   // 在首次调用 reminder 之前的延迟时间
                TimeSpan.FromSeconds(5));  // 在首次调用后 reminder 调用之间的时间间隔
        }

        /// <summary>
        /// 获取 actor 的 MyReminder reminder 详细信息
        /// </summary>
        public async Task<IActorReminder> GetReminder()
        {
            await this.GetReminderAsync("MyReminder");
        }

        /// <summary>
        /// 取消注册 actor 的 MyReminder reminder
        /// </summary>
        public Task UnregisterReminder()
        {
            Console.WriteLine("Unregistering MyReminder...");
            return this.UnregisterReminderAsync("MyReminder");
        }

        // <summary>
        // 实现 IRemindeable.ReceiveReminderAsync()，这是在 actor reminder 触发时调用的回调。
        // </summary>
        public Task ReceiveReminderAsync(string reminderName, byte[] state, TimeSpan dueTime, TimeSpan period)
        {
            Console.WriteLine("ReceiveReminderAsync is called!");
            return Task.CompletedTask;
        }

        /// <summary>
        /// 向 actor 注册 MyTimer timer
        /// </summary>
        public Task RegisterTimer()
        {
            return this.RegisterTimerAsync(
                "MyTimer",                  // timer 的名称
                nameof(this.OnTimerCallBack),       // timer 回调
                null,                       // 传递给 OnTimerCallback() 的用户状态
                TimeSpan.FromSeconds(5),    // 在首次调用异步回调之前的延迟时间
                TimeSpan.FromSeconds(5));   // 异步回调调用之间的时间间隔
        }

        /// <summary>
        /// 取消注册 actor 的 MyTimer timer
        /// </summary>
        public Task UnregisterTimer()
        {
            Console.WriteLine("Unregistering MyTimer...");
            return this.UnregisterTimerAsync("MyTimer");
        }

        /// <summary>
        /// timer 到期后调用的回调
        /// </summary>
        private Task OnTimerCallBack(byte[] data)
        {
            Console.WriteLine("OnTimerCallBack is called!");
            return Task.CompletedTask;
        }
    }
}
```

### 使用 ASP.NET Core 注册 actor 运行时

actor 运行时通过 ASP.NET Core 的 `Startup.cs` 进行配置。

运行时使用 ASP.NET Core 依赖注入系统来注册 actor 类型和必要的服务。此集成通过 `ConfigureServices(...)` 中的 `AddActors(...)` 方法调用提供。使用传递给 `AddActors(...)` 的委托来注册 actor 类型并配置 actor 运行时设置。您可以在 `ConfigureServices(...)` 中注册其他类型以进行依赖注入。这些将可用于注入到您的 actor 类型的构造函数中。

actor 是通过与 Dapr 运行时的 HTTP 调用实现的。此功能是应用程序 HTTP 处理管道的一部分，并在 `Configure(...)` 中的 `UseEndpoints(...)` 内注册。

将以下代码粘贴到 `MyActorService` 项目的 `Startup.cs` 中：

```csharp
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace MyActorService
{
    public class Startup
    {
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddActors(options =>
            {
                // 注册 actor 类型并配置 actor 设置
                options.Actors.RegisterActor<MyActor>();
            });
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseRouting();

            // 注册与 Dapr 运行时接口的 actor 处理程序。
            app.MapActorsHandlers();
        }
    }
}
```

## 步骤 3：添加客户端

创建一个简单的控制台应用程序来调用 actor 服务。Dapr SDK 提供 actor 代理客户端来调用 actor 接口中定义的 actor 方法。

### 创建 actor 客户端项目并添加依赖项

```bash
# 创建 actor 的客户端
dotnet new console -o MyActorClient

cd MyActorClient

# 添加 Dapr.Actors nuget 包。请使用 nuget.org 上的最新包版本
dotnet add package Dapr.Actors

# 添加 actor 接口引用
dotnet add reference ../MyActor.Interfaces/MyActor.Interfaces.csproj

cd ..
```

### 使用强类型客户端调用 actor 方法

您可以使用 `ActorProxy.Create<IMyActor>(..)` 创建一个强类型客户端并调用 actor 的方法。

将以下代码粘贴到 `MyActorClient` 项目的 `Program.cs` 中：

```csharp
using System;
using System.Threading.Tasks;
using Dapr.Actors;
using Dapr.Actors.Client;
using MyActor.Interfaces;

namespace MyActorClient
{
    class Program
    {
        static async Task MainAsync(string[] args)
        {
            Console.WriteLine("Startup up...");

            // 在 actor 服务中注册的 actor 类型
            var actorType = "MyActor";

            // ActorId 唯一标识一个 actor 实例
            // 如果与此 id 匹配的 actor 不存在，将会创建它
            var actorId = new ActorId("1");

            // 使用服务实现的相同接口创建本地代理。
            //
            // 您需要提供类型和 id，以便可以定位 actor。
            var proxy = ActorProxy.Create<IMyActor>(actorId, actorType);

            // 现在您可以使用 actor 接口调用 actor 的方法。
            Console.WriteLine($"Calling SetDataAsync on {actorType}:{actorId}...");
            var response = await proxy.SetDataAsync(new MyData()
            {
                PropertyA = "ValueA",
                PropertyB = "ValueB",
            });
            Console.WriteLine($"Got response: {response}");

            Console.WriteLine($"Calling GetDataAsync on {actorType}:{actorId}...");
            var savedData = await proxy.GetDataAsync();
            Console.WriteLine($"Got response: {savedData}");
        }
    }
}
```

## 运行代码

您创建的项目现在可以测试示例。

1. 运行 MyActorService

    由于 `MyActorService` 托管 actor，因此需要使用 Dapr CLI 运行。

    ```bash
    cd MyActorService
    dapr run --app-id myapp --app-port 5000 --dapr-http-port 3500 -- dotnet run
    ```

    您将在此终端中看到来自 `daprd` 和 `MyActorService` 的命令行输出。您应该看到类似以下内容的内容，这表明应用程序已成功启动。

    ```txt
    ...
    ℹ️  Updating metadata for app command: dotnet run
    ✅  You're up and running! Both Dapr and your app logs will appear here.

    == APP == info: Microsoft.Hosting.Lifetime[0]

    == APP ==       Now listening on: https://localhost:5001

    == APP == info: Microsoft.Hosting.Lifetime[0]

    == APP ==       Now listening on: http://localhost:5000

    == APP == info: Microsoft.Hosting.Lifetime[0]

    == APP ==       Application started. Press Ctrl+C to shut down.

    == APP == info: Microsoft.Hosting.Lifetime[0]

    == APP ==       Hosting environment: Development

    == APP == info: Microsoft.Hosting.Lifetime[0]

    == APP ==       Content root path: /Users/ryan/actortest/MyActorService
    ```

2. 运行 MyActorClient

    `MyActorClient` 作为客户端，可以通过 `dotnet run` 正常运行。

    打开一个新终端并导航到 `MyActorClient` 目录。然后运行项目：

    ```bash
    dotnet run
    ```

    您应该看到类似以下的命令行输出：

    ```txt
    Startup up...
    Calling SetDataAsync on MyActor:1...
    Got response: Success
    Calling GetDataAsync on MyActor:1...
    Got response: PropertyA: ValueA, PropertyB: ValueB
    ```

> 💡 此示例依赖于一些假设。ASP.NET Core Web 项目的默认监听端口是 5000，这被传递给 `dapr run` 作为 `--app-port 5000`。Dapr sidecar 的默认 HTTP 端口是 3500。我们告诉 `MyActorService` 的 sidecar 使用 3500，以便 `MyActorClient` 可以依赖默认值。

现在您已成功创建了一个 actor 服务和客户端。请参阅相关链接部分以了解更多信息。

## 相关链接

- [.NET Dapr Actors 客户端指南]({{< ref dotnet-actors-client.md >}})
- [.NET Dapr Actors 使用指南]({{< ref dotnet-actors-usage.md >}})
