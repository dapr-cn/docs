---
type: docs
title: "Dapr actor .NET SDK入门"
linkTitle: "Example"
weight: 100000
description: Try out .NET virtual actors with this example
---

## 前期准备

- [Dapr CLI]({{< ref install-dapr-cli.md >}}) installed
- Initialized [Dapr environment]({{< ref install-dapr-selfhost.md >}})
- [.NET Core 3.1 or .NET 5+](https://dotnet.microsoft.com/download) installed

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

* **演员客户端项目 (\MyActor\MyActorClient)。** 该项目包含了actor客户端的实现，并在其中调用了在Actor接口中定义的方法。


## STEP1 - 创建Actor接口

Actor接口定义了actor的实现和调用actor的客户端之间的约定。

Actor接口的定义需要满足以下要求：

* Actor接口必须继承 `Dapr.Actors.IActor` 接口
* Actor方法的返回值必须是`Task` 或者 `Task<object>`类型
* Actor方法最多只能有一个参数

### 创建项目并添加依赖

```bash
# Create Actor Interfaces
dotnet new classlib -o MyActor.Interfaces

cd MyActor.Interfaces

# Add Dapr.Actors nuget package. Please use the latest package version from nuget.org
dotnet add package Dapr.Actors -v 1.0.0-rc02
```


### 定义IMyActor接口

定义IMyActor接口和MyData数据对象.

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

## STEP2 - 创建Actor服务

Dapr 使用 ASP.NET web service来托管Actor服务。 本节将会实现`IMyActor`接口并将Actor注册到Dapr Runtime。

### 创建项目并添加依赖

```bash
# Create ASP.Net Web service to host Dapr actor
dotnet new webapi -o MyActorService

cd MyActorService

# Add Dapr.Actors nuget package. Please use the latest package version from nuget.org
dotnet add package Dapr.Actors -v 1.0.0-rc02

# Add Dapr.Actors.AspNetCore nuget package. Please use the latest package version from nuget.org
dotnet add package Dapr.Actors.AspNetCore -v 1.0.0-rc02

# Add Actor Interface reference
dotnet add reference ../MyActor.Interfaces/MyActor.Interfaces.csproj
```

### 添加Actor实现

实现IMyActor接口并继承自 `Dapr.Actors.Actor` 。 下面的例子同样展示了如何使用Actor Reminders。 Actor如果要使用Reminders，则必须实现IRemindable接口 如果你不打算使用Reminder功能，你可以跳过下面代码中实现IRemindable接口和Reminder特定方法的操作。

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

#### 使用显式的actor类型名称

默认情况下，客户端所看到的actor的“类型”来自actor实现类的名称。 如果需要，你可以通过向actor实现类附加一个 `ActorAttribute` 特性来指定一个显式的类型名称。

```csharp
    [Actor(TypeName = "MyCustomActorTypeName")]
    internal class MyActor : Actor, IMyActor
    {
        // ...
    }
```

### 使用ASP.NET Core Startup来注册Actor runtime

Actor runtime使用ASP.NET Core `Startup.cs`来配置。

运行时使用ASP.NET Core依赖注入系统来注册actor类型和基本服务。 通过在 `ConfigureServices(...)` 中调用 `AddActors(...)` 方法来提供这种集成。 使用传递到 `AddActors(...)` 方法的委托来注册actor类型并配置actor运行时设置。 你可以在`ConfigureServices(...)`中为依赖注入注册额外的类型。 它们都可以被注入到你的Actor类型的构造器。

Actors通过Dapr runtime使用HTTP调用来实现。 此功能是应用程序的 HTTP 处理管道的一部分，在 `Configure(...)` 方法中的`UseEndpoint(...)` 注册。


```csharp
        // In Startup.cs
        public void ConfigureServices(IServiceCollection services)
        {
            // Register actor runtime with DI
            services.AddActors(options =>
            {
                // Register actor types and configure actor settings
                options.Actors.RegisterActor<MyActor>();
            });

            // Register additional services for use with actors
            services.AddSingleton<BankService>();
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseHsts();
            }

            app.UseRouting();

            app.UseEndpoints(endpoints =>
            {
                // Register actors handlers that interface with the Dapr runtime.
                endpoints.MapActorsHandlers();
            });
        }
```

### **可选** - 覆盖默认的Actor设置

Actor的设置针对每个应用程序。  在[此处](https://docs.dapr.io/reference/api/actors_api/) 描述的设置在options中可用的并可以通过如下方式来修改。

下面的代码扩展了上一节来做这件事。  请注意下面的值仅用于 **示例**。

```csharp

        // In Startup.cs
        public void ConfigureServices(IServiceCollection services)
        {
            // Register actor runtime with DI
            services.AddActors(options =>
            {
                // Register actor types and configure actor settings
                options.Actors.RegisterActor<MyActor>();

                options.ActorIdleTimeout = TimeSpan.FromMinutes(10);
                options.ActorScanInterval = TimeSpan.FromSeconds(35);
                options.DrainOngoingCallTimeout = TimeSpan.FromSeconds(35);
                options.DrainRebalancedActors = true;
            });

            // Register additional services for use with actors
            services.AddSingleton<BankService>();
        }
```

## STEP 3 - 添加客户端

创建一个简单的控制台应用来调用actor服务。 Dapr SDK 提供 Actor 代理客户端来调用Actor接口中定义的actor方法。

### 创建项目并添加依赖

```bash
# Create Actor's Client
dotnet new console -o MyActorClient

cd MyActorClient

# Add Dapr.Actors nuget package. Please use the latest package version from nuget.org
dotnet add package Dapr.Actors -v 1.0.0-rc02

# Add Actor Interface reference
dotnet add reference ../MyActor.Interfaces/MyActor.Interfaces.csproj
```

### Invoke Actor method with Actor Service Remoting

We recommend to use the local proxy to actor instance because `ActorProxy.Create<IMyActor>(actorID, actorType)` returns strongly-typed actor instance to set up the remote procedure call.

```csharp
namespace MyActorClient
{
    using Dapr.Actors;
    using Dapr.Actors.Client;
    using MyActor.Interfaces;
    using System;
    using System.Threading.Tasks;

    ...
        static async Task InvokeActorMethodWithRemotingAsync()
        {
            var actorType = "MyActor";      // Registered Actor Type in Actor Service
            var actorID = new ActorId("1");

            // Create the local proxy by using the same interface that the service implements
            // By using this proxy, you can call strongly typed methods on the interface using Remoting.
            var proxy = ActorProxy.Create<IMyActor>(actorID, actorType);
            var response = await proxy.SetDataAsync(new MyData()
            {
                PropertyA = "ValueA",
                PropertyB = "ValueB",
            });
            Console.WriteLine(response);

            var savedData = await proxy.GetDataAsync();
            Console.WriteLine(savedData);
        }
    ...
}
```

### Invoke Actor method without Actor Service Remoting
You can invoke Actor methods without remoting (directly over http or using helper methods provided in ActorProxy), if Actor method accepts at-most one argument. Actor runtime will deserialize the incoming request body from client and use it as method argument to invoke the actor method. When making non-remoting calls Actor method arguments and return types are serialized, deserialized as JSON.

`ActorProxy.Create(actorID, actorType)` returns ActorProxy instance and allow to use the raw http client to invoke the method defined in `IMyActor`.

```csharp
namespace MyActorClient
{
    using Dapr.Actors;
    using Dapr.Actors.Client;
    using MyActor.Interfaces;
    using System;
    using System.Threading.Tasks;

    ...
        static async Task InvokeActorMethodWithoutRemotingAsync()
        {
            var actorType = "MyActor";
            var actorID = new ActorId("1");

            // Create Actor Proxy instance to invoke the methods defined in the interface
            var proxy = ActorProxy.Create(actorID, actorType);
            // Need to specify the method name and response type explicitly
            var response = await proxy.InvokeMethodAsync<MyData, string>("SetDataAsync", new MyData()
            {
                PropertyA = "ValueA",
                PropertyB = "ValueB",
            });
            Console.WriteLine(response);

            var savedData = await proxy.InvokeMethodAsync<MyData>("GetDataAsync");
            Console.WriteLine(savedData);
        }
    ...
}
```

## Run Actor

In order to validate and debug actor service and client, we need to run actor services via Dapr CLI first.

1. Run Dapr Runtime via Dapr cli

   ```bash
   $ dapr run --app-id myapp --app-port 5000 --dapr-http-port 3500 dotnet run
   ```

   After executing MyActorService via Dapr runtime, make sure that application is discovered on port 5000 and actor connection is established successfully.

   ```bash
    INFO[0000] starting Dapr Runtime -- version  -- commit
    INFO[0000] log level set to: info
    INFO[0000] standalone mode configured
    INFO[0000] dapr id: myapp
    INFO[0000] loaded component statestore (state.redis)
    INFO[0000] application protocol: http. waiting on port 5000
    INFO[0000] application discovered on port 5000
    INFO[0000] application configuration loaded
    2019/08/27 14:42:06 redis: connecting to localhost:6379
    2019/08/27 14:42:06 redis: connected to localhost:6379 (localAddr: [::1]:53155, remAddr: [::1]:6379)
    INFO[0000] actor runtime started. actor idle timeout: 1h0m0s. actor scan interval: 30s
    INFO[0000] actors: starting connection attempt to placement service at localhost:50005
    INFO[0000] http server is running on port 3500
    INFO[0000] gRPC server is running on port 50001
    INFO[0000] dapr initialized. Status: Running. Init Elapsed 19.699438ms
    INFO[0000] actors: established connection to placement service at localhost:50005
    INFO[0000] actors: placement order received: lock
    INFO[0000] actors: placement order received: update
    INFO[0000] actors: placement tables updated
    INFO[0000] actors: placement order received: unlock
    ...
   ```

2. Run MyActorClient

   MyActorClient will console out if it calls actor hosted in MyActorService successfully.

   > If you specify the different Dapr runtime http port (default port: 3500), you need to set DAPR_HTTP_PORT environment variable before running the client. 
   > 
   > ```bash
   >    Success
   >    PropertyA: ValueA, PropertyB: ValueB
   > ```
