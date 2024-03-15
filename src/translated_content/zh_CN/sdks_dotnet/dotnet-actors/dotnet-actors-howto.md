---
type: docs
title: 如何在.NET SDK中运行和使用 virtual actors
linkTitle: 如何：运行和使用 virtual actors
weight: 300000
description: 使用此示例试用 .NET Daprvirtual actor
---

通过Dapr actor 程序包，您可以与.NET应用程序中的Dapr virtual actors进行交互。 在本指南中，您将学习如何：

- 创建一个 Actor (`MyActor`)。
- 在客户端应用程序上调用其方法。

```
MyActor --- MyActor.Interfaces
         |
         +- MyActorService
         |
         +- MyActorClient
```

**接口项目（\MyActor\MyActor.Interfaces）**

这个项目包含了 actor 的接口定义。 Actor 接口可以在任何项目中以任意的名称定义。 该接口定义了由以下 actor 共享的 actor 合约：

- Actor实现
- 调用actor的客户端

因为客户端项目可能依赖于它，最好将其定义在与actor实现分开的程序集中。

**Actor 服务项目 (\MyActor\MyActorService)**

该项目实现了托管 actor 的ASP.Net Core Web服务。 它包含了actor的实现，`MyActor.cs`。 一个 actor 实现是一个类，它：

- 派生自基础类型Actor
- 实现了`MyActor.Interfaces`项目中定义的接口。

一个 actor 类还必须实现一个构造函数，该构造函数接受一个 `ActorService` 实例和一个 `ActorId`，并将它们传递给基础 Actor 类。

**Actor 客户端项目 (\MyActor\MyActorClient)**

这个项目包含actor客户端的实现，它调用Actor接口中定义的MyActor的方法。

## 前期准备

- [安装 Dapr CLI]({{< ref install-dapr-cli.md >}}) 已安装。
- 已初始化[Dapr环境]({{< ref install-dapr-selfhost.md >}})。
- 已安装 [.NET Core 3.1 或 .NET 6+](https://dotnet.microsoft.com/download)。 Dapr .NET SDK 使用[ASP.NET Core](https://docs.microsoft.com/aspnet/core/introduction-to-aspnet-core?view=aspnetcore-6.0)。

## 第 0 步：准备

由于我们将创建3个项目，所以选择一个空的目录开始，在你选择的终端中打开它。

## 第 1 步：创建 actor 接口

Actor接口定义了actor的实现和调用actor的客户端之间的约定。

Actor接口的定义需要满足以下要求：

- Actor接口必须继承`Dapr.Actors.IActor`接口
- Actor方法的返回类型必须是`Task`或者`Task<object>`
- Actor 方法最多只能有一个参数

### 创建接口项目并添加依赖

```bash
# Create Actor Interfaces
dotnet new classlib -o MyActor.Interfaces

cd MyActor.Interfaces

# Add Dapr.Actors nuget package. Please use the latest package version from nuget.org
dotnet add package Dapr.Actors

cd ..
```

### 定义 IMyActor 接口

定义`IMyActor`接口和`MyData`数据对象。 将以下代码粘贴到 `MyActor.Interfaces` 项目中的 `MyActor.cs` 文件中。

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

## 第 2 步：创建 actor 服务

Dapr 使用 ASP.NET web service来托管Actor服务。 本节将会实现`IMyActor` actor接口并将Actor注册到Dapr Runtime。

### 创建 actor 服务项目并添加依赖

```bash
# Create ASP.Net Web service to host Dapr actor
dotnet new web -o MyActorService

cd MyActorService

# Add Dapr.Actors.AspNetCore nuget package. Please use the latest package version from nuget.org
dotnet add package Dapr.Actors.AspNetCore

# Add Actor Interface reference
dotnet add reference ../MyActor.Interfaces/MyActor.Interfaces.csproj

cd ..
```

### 添加 actor 实现

实现IMyActor接口并继承自`Dapr.Actors.Actor`类。 下面的例子同样展示了如何使用Actor Reminders。 Actor如果要使用Reminders，则必须实现IRemindable接口 如果你不打算使用Reminder功能，你可以跳过下面代码中实现IRemindable接口和Reminder特定方法的操作。

将以下代码粘贴到 `MyActorService` 项目中的 `MyActor.cs` 文件中：

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
        // The constructor must accept ActorHost as a parameter, and can also accept additional
        // parameters that will be retrieved from the dependency injection container
        //
        /// <summary>
        /// Initializes a new instance of MyActor
        /// </summary>
        /// <param name="host">The Dapr.Actors.Runtime.ActorHost that will host this actor instance.</param>
        public MyActor(ActorHost host)
            : base(host)
        {
        }

        /// <summary>
        /// This method is called whenever an actor is activated.
        /// An actor is activated the first time any of its methods are invoked.
        /// </summary>
        protected override Task OnActivateAsync()
        {
            // Provides opportunity to perform some optional setup.
            Console.WriteLine($"Activating actor id: {this.Id}");
            return Task.CompletedTask;
        }

        /// <summary>
        /// This method is called whenever an actor is deactivated after a period of inactivity.
        /// </summary>
        protected override Task OnDeactivateAsync()
        {
            // Provides Opporunity to perform optional cleanup.
            Console.WriteLine($"Deactivating actor id: {this.Id}");
            return Task.CompletedTask;
        }

        /// <summary>
        /// Set MyData into actor's private state store
        /// </summary>
        /// <param name="data">the user-defined MyData which will be stored into state store as "my_data" state</param>
        public async Task<string> SetDataAsync(MyData data)
        {
            // Data is saved to configured state store implicitly after each method execution by Actor's runtime.
            // Data can also be saved explicitly by calling this.StateManager.SaveStateAsync();
            // State to be saved must be DataContract serializable.
            await this.StateManager.SetStateAsync<MyData>(
                "my_data",  // state name
                data);      // data saved for the named state "my_data"

            return "Success";
        }

        /// <summary>
        /// Get MyData from actor's private state store
        /// </summary>
        /// <return>the user-defined MyData which is stored into state store as "my_data" state</return>
        public Task<MyData> GetDataAsync()
        {
            // Gets state from the state store.
            return this.StateManager.GetStateAsync<MyData>("my_data");
        }

        /// <summary>
        /// Register MyReminder reminder with the actor
        /// </summary>
        public async Task RegisterReminder()
        {
            await this.RegisterReminderAsync(
                "MyReminder",              // The name of the reminder
                null,                      // User state passed to IRemindable.ReceiveReminderAsync()
                TimeSpan.FromSeconds(5),   // Time to delay before invoking the reminder for the first time
                TimeSpan.FromSeconds(5));  // Time interval between reminder invocations after the first invocation
        }

        /// <summary>
        /// Get MyReminder reminder details with the actor
        /// </summary>
        public async Task<IActorReminder> GetReminder()
        {
            await this.GetReminderAsync("MyReminder");
        }

        /// <summary>
        /// Unregister MyReminder reminder with the actor
        /// </summary>
        public Task UnregisterReminder()
        {
            Console.WriteLine("Unregistering MyReminder...");
            return this.UnregisterReminderAsync("MyReminder");
        }

        // <summary>
        // Implement IRemindeable.ReceiveReminderAsync() which is call back invoked when an actor reminder is triggered.
        // </summary>
        public Task ReceiveReminderAsync(string reminderName, byte[] state, TimeSpan dueTime, TimeSpan period)
        {
            Console.WriteLine("ReceiveReminderAsync is called!");
            return Task.CompletedTask;
        }

        /// <summary>
        /// Register MyTimer timer with the actor
        /// </summary>
        public Task RegisterTimer()
        {
            return this.RegisterTimerAsync(
                "MyTimer",                  // The name of the timer
                nameof(this.OnTimerCallBack),       // Timer callback
                null,                       // User state passed to OnTimerCallback()
                TimeSpan.FromSeconds(5),    // Time to delay before the async callback is first invoked
                TimeSpan.FromSeconds(5));   // Time interval between invocations of the async callback
        }

        /// <summary>
        /// Unregister MyTimer timer with the actor
        /// </summary>
        public Task UnregisterTimer()
        {
            Console.WriteLine("Unregistering MyTimer...");
            return this.UnregisterTimerAsync("MyTimer");
        }

        /// <summary>
        /// Timer callback once timer is expired
        /// </summary>
        private Task OnTimerCallBack(byte[] data)
        {
            Console.WriteLine("OnTimerCallBack is called!");
            return Task.CompletedTask;
        }
    }
}
```

### 使用 ASP.NET Core Startup 来注册 actor runtime

Actor runtime使用ASP.NET Core `Startup.cs`来配置。

运行时使用ASP.NET Core依赖注入系统来注册actor类型和基本服务。 这个集成是通过在 `ConfigureServices(...)` 中调用 `AddActors(...)` 方法来提供的。 使用传递到 `AddActors(...)` 方法的委托来注册actor类型并配置actor运行时设置。 您可以在`ConfigureServices(...)`内注册额外的类型以进行依赖注入。 它们都可以被注入到你的Actor类型的构造器。

Actors通过Dapr runtime使用HTTP调用来实现。 此功能是应用程序的HTTP处理管道的一部分，在`Configure(...)`方法中的`UseEndpoints(...)`内注册。

将以下代码粘贴到 `MyActorService` 项目中的 `Startup.cs` 文件中：

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
                // Register actor types and configure actor settings
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

            app.UseEndpoints(endpoints =>
            {
                // Register actors handlers that interface with the Dapr runtime.
                endpoints.MapActorsHandlers();
            });
        }
    }
}
```

## 第 3 步：添加客户端

创建一个简单的控制台应用来调用actor服务。 Dapr SDK 提供 Actor 代理客户端来调用Actor接口中定义的actor方法。

### 创建 actor 客户端项目并添加依赖

```bash
# Create Actor's Client
dotnet new console -o MyActorClient

cd MyActorClient

# Add Dapr.Actors nuget package. Please use the latest package version from nuget.org
dotnet add package Dapr.Actors

# Add Actor Interface reference
dotnet add reference ../MyActor.Interfaces/MyActor.Interfaces.csproj

cd ..
```

### 使用强类型客户端调用 actor 方法

您可以使用 `ActorProxy.Create<IMyActor>(..)` 来创建一个强类型客户端，并调用 actor 上的方法。

将以下代码粘贴到 `MyActorClient` 项目中的 `Program.cs` 文件中：

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

            // Registered Actor Type in Actor Service
            var actorType = "MyActor";

            // An ActorId uniquely identifies an actor instance
            // If the actor matching this id does not exist, it will be created
            var actorId = new ActorId("1");

            // Create the local proxy by using the same interface that the service implements.
            //
            // You need to provide the type and id so the actor can be located. 
            var proxy = ActorProxy.Create<IMyActor>(actorId, actorType);

            // Now you can use the actor interface to call the actor's methods.
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

   由于 `MyActorService` 正在托管 Actors，因此需要使用 Dapr CLI 来运行。

   ```bash
   cd MyActorService
   dapr run --app-id myapp --app-port 5000 --dapr-http-port 3500 -- dotnet run
   ```

   您将在这个终端中看到 `daprd` 和 `MyActorService` 的命令行输出。 您应该看到以下情况，这表明应用程序已成功启动。

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

   `MyActorClient`作为客户端，它可以用`dotnet run`正常运行。

   打开一个新的终端窗口，并导航到 `MyActorClient` 目录。 然后运行此项目：

   ```bash
   dotnet run
   ```

   您应该看到命令行输出，如：

   ```txt
   Startup up...
   Calling SetDataAsync on MyActor:1...
   Got response: Success
   Calling GetDataAsync on MyActor:1...
   Got response: PropertyA: ValueA, PropertyB: ValueB
   ```

> 💡 这个示例依赖于几个假设。 ASP.NET Core Web 项目的默认监听端口是 5000，它被作为 `dapr run` 的 `--app-port 5000` 参数传递。 Dapr sidecar 的默认 HTTP 端口是 3500。 我们告诉`MyActorService`的sidecar使用3500，以便`MyActorClient`可以依赖默认值。

现在您已经成功创建了 actor 服务和客户端。 查看相关链接部分了解更多信息。

## 相关链接

- [.NET Dapr Actors 客户端指南]({{< ref dotnet-actors-client.md >}})
- [.NET Dapr Actors使用指南]({{< ref dotnet-actors-usage.md >}})
