---
type: docs
title: "在.NET SDK中运行和使用 virtual actors 的例子。"
linkTitle: "示例"
weight: 300000
description: 试用 .NET Dapr virtual actors
---

通过Dapr actor 程序包，您可以与.NET应用程序中的Dapr虚拟actor进行交互。

## 前期准备

- 安装 [Dapr CLI]({{< ref install-dapr-cli.md >}})
- 初始化的 [Dapr 环境]({{< ref install-dapr-selfhost.md >}})
- [.NET Core 3.1 或 .NET 5+](https://dotnet.microsoft.com/download) 已安装

## 概述

本文档描述了如何创建一个Actor(`MyActor`) 并从客户端程序调用其方法。

```
MyActor --- MyActor.Interfaces
         |
         +- MyActorService
         |
         +- MyActorClient
```

* **接口项目(\MyActor\MyActor.Interfaces).** 该项目包含了actor的接口定义。 Actor接口可以在任何项目中以任意的名称定义。 它定义了actor的实现和调用actor的客户端之间的约定。 由于客户端项目可能会依赖它，所以在一个和actor实现分隔开的程序集中定义通常是有意义的。

* **Actor服务项目 (\MyActor\MyActorService)。** 该项目实现了Asp.Net Core web service，用于托管actor。 它包含了actor的实现，MyActor.cs。 Actor的实现是一个继承了基类Actor并且实现了Myactor.Interfaces项目中定义的接口的类。 Actor还必须提供接受一个ActorService实例和ActorId的构造函数，并将他们传递给基类。

* [Actor(TypeName = "MyCustomActorTypeName")] internal class MyActor : Actor, IMyActor
    { // ... }

## 第 0 步：准备

由于我们将创建3个项目，所以选择一个空的目录开始，在你选择的终端中打开它。

## 第 1 步：创建 actor 接口

Actor接口定义了actor的实现和调用actor的客户端之间的约定。

Actor接口的定义需要满足以下要求：

* Actor接口必须继承 `Dapr.Actors.IActor` 接口
* Actor方法的返回值必须是`Task` 或者 `Task<object>`类型
* Actor方法最多只能有一个参数

### 创建接口项目并添加依赖

```bash
# 创建 Actor 接口
dotnet new classlib -o MyActor.Interfaces

cd MyActor.Interfaces

# 添加 Dapr.Actors nuget 包。 请使用来自 nuget.org 的最新软件包版本
dotnet add package Dapr.Actors -v 1.0.0

cd ..
```

### 定义IMyActor接口

定义 `IMyActor` 接口和 `MyData` 数据对象。 在 `Myactor.Interface` 项目中，将以下代码粘贴到 `Myactor.cs` 中。

```csharp
using Dapr.Actors;
using System.Threading.Tasks;

namespace MyActor.Interfaces
{
    public interface IMyActor : IActor
    {       
        Task<string> SetDataAsync(MyData data);
        Task<MyData> GetDataAsync();
        Task RegisterReminder();
        Task UnregisterReminder();
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

Dapr 使用 ASP.NET web 服务来托管 Actor 服务。 本节将会实现 `IMyActor` 接口并将 Actor 注册到 Dapr Runtime。

### 创建 actor 服务项目并添加依赖

```bash
# 创建 ASP.Net Web 服务来托管 Dapr actor
dotnet new web -o MyActorService

cd MyActorService

# 添加 Dapr.Actors.AspNetCore nuget 包. 请从nuget.org添加最新的包版本
dotnet add package Dapr.Actors.AspNetCore -v 1.0.0

# 添加 Actor 接口引用
dotnet add reference ../MyActor.Interfaces/MyActor.Interfaces.csproj

cd ..
```

### 添加 actor 实现

实现IMyActor接口并继承自 `Dapr.Actors.Actor` 。 下面的例子同样展示了如何使用Actor Reminders。 Actor如果要使用Reminders，则必须实现IRemindable接口 如果你不打算使用Reminder功能，你可以跳过下面代码中实现IRemindable接口和Reminder特定方法的操作。

在 `MyActorService` 项目中，将以下代码粘贴到 `MyActor.cs` 中。

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
        /// 
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
        /// 
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

Actor runtime 使用 ASP.NET Core `Startup.cs` 来配置。

运行时使用ASP.NET Core依赖注入系统来注册actor类型和基本服务。 通过在 `ConfigureServices(...)` 中调用 `AddActors(...)` 方法来提供这种集成。 使用传递到 `AddActors(...)` 方法的委托来注册actor类型并配置actor运行时设置。 你可以在`ConfigureServices(...)`中为依赖注入注册额外的类型。 它们都可以被注入到你的Actor类型的构造器。

Actors通过Dapr runtime使用HTTP调用来实现。 此功能是应用程序的 HTTP 处理管道的一部分，在 `Configure(...)` 方法中的`UseEndpoint(...)` 注册。

在 `MyActorService` 项目中，将以下代码粘贴到 `Startup.cs` 中。

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

            app.UseHttpsRedirection();

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
# 创建 Actor 客户端
dotnet new console -o MyActorClient

cd MyActorClient

# 添加 Dapr.Actors nuget 包。 Please use the latest package version from nuget.org
请从nuget.org添加最新的包版本
dotnet add package Dapr.Actors -v 1.0.0

# 添加 Actor 接口引用
dotnet add reference ../MyActor.Interfaces/MyActor.Interfaces.csproj

cd ..
```

### 使用强类型客户端调用 actor 方法

You can use `ActorProxy.Create<IMyActor>(..)` to create a strongly-typed client and invoke methods on the actor.

Paste the following code into `Program.cs` in the `MyActorClient` project:

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
            Console.WriteLine($"Got response: {response}");
        }
    }
}
```

## Running the code

The projects that you've created can now to test the sample.

1. Run MyActorService

    Since `MyActorService` is hosting actors, it needs to be run with the Dapr CLI.

    ```bash
    cd MyActorService
    dapr run --app-id myapp --app-port 5000 --dapr-http-port 3500 -- dotnet run
    ```

    You will see commandline output from both `daprd` and `MyActorService` in this terminal. You should see something like the following, which indicates that the application started successfully.

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

    `MyActorClient` is acting as the client, and it can be run normally with `dotnet run`.

    Open a new terminal an navigate to the `MyActorClient` directory. Then run the project with:

    ```bash
    dotnet run
    ```

    You should see commandline output like:

    ```txt
    Startup up...
    Calling SetDataAsync on MyActor:1...
    Got response: Success
    Calling GetDataAsync on MyActor:1...
    Got response: Success
    ```

> 💡 This sample relies on a few assumptions. The default listening port for an ASP.NET Core web project is 5000, which is being passed to `dapr run` as `--app-port 5000`. The default HTTP port for the Dapr sidecar is 3500. We're telling the sidecar for `MyActorService` to use 3500 so that `MyActorClient` can rely on the default value.

Now you have successfully created an actor service and client. See the related links section to learn more.

## 相关链接

- [.NET Dapr Actors client guide]({{< ref dotnet-actors-client.md >}})
- [.NET Dapr Actors usage guide]({{< ref dotnet-actors-usage.md >}})
