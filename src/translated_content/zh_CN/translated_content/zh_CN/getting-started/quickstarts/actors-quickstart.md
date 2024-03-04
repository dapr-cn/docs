---
type: docs
title: "快速入门：Actors"
linkTitle: "Actors"
weight: 75
description: "开始使用 Dapr 的 Actors 构建块"
---

让我们来看一下Dapr的 [Actors构建块]({{< ref actors >}})。 在这个快速入门中，您将运行一个智能设备微服务和一个简单的控制台客户端，以演示 Dapr Actors 中的有状态对象模式。

当前，您可以使用.NET SDK来体验 actor 的快速入门。

{{< tabs ".NET" >}}

 <!-- .NET -->
{{% codetab %}}

作为 .NET actors 快速入门的一个简要概述：

1. 使用一个 `SmartDevice.Service` 微服务，您可以托管：
   - 两个 `SmartDectectorActor` 烟雾报警对象
   - 一个 `ControllerActor` 对象，用于命令和控制智能设备
1. 使用一个 `SmartDevice.Client` 控制台应用程序，客户端应用程序与每个actor或控制器进行交互，以执行聚合操作。
1. 这 `SmartDevice.Interfaces` 包含服务和客户端应用使用的共享接口和数据类型。

<img src="/images/actors-quickstart/actors-quickstart.png" width=800 style="padding-bottom:15px;">

### 前提

对于此示例，您将需要：

- [Dapr CLI和初始化环境](https://docs.dapr.io/getting-started)。
- [.NET SDK 或 .NET 6 SDK 已安装](https://dotnet.microsoft.com/download).
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### 第1步：设置环境

克隆[快速入门存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/actors)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 第2步：运行服务应用

在新的终端窗口中，导航到 `actors/csharp/sdk/service` 目录并恢复依赖项：

```bash
cd actors/csharp/sdk/service
dotnet build
```

运行 `SmartDevice.Service`，它将启动服务本身和 Dapr sidecar：

```bash
dapr run --app-id actorservice --app-port 5001 --dapr-http-port 3500 --resources-path ../../../resources -- dotnet run --urls=http://localhost:5001/
```

预期输出：

```bash
== APP == info: Microsoft.AspNetCore.Hosting.Diagnostics[1]
== APP ==       Request starting HTTP/1.1 GET http://127.0.0.1:5001/healthz - -
== APP == info: Microsoft.AspNetCore.Routing.EndpointMiddleware[0]
== APP ==       Executing endpoint 'Dapr Actors Health Check'
== APP == info: Microsoft.AspNetCore.Routing.EndpointMiddleware[1]
== APP ==       Executed endpoint 'Dapr Actors Health Check'
== APP == info: Microsoft.AspNetCore.Hosting.Diagnostics[2]
== APP ==       Request finished HTTP/1.1 GET http://127.0.0.1:5001/healthz - - - 200 - text/plain 5.2599ms
```

### 步骤 3：运行客户端应用程序

在一个新的终端实例中，导航到 `actors/csharp/sdk/client` 目录并安装依赖项：

```bash
cd ./actors/csharp/sdk/client
dotnet build
```

运行 `SmartDevice.Client` 应用程序：

```bash
dapr run --app-id actorclient -- dotnet run
```

预期输出：

```bash
== APP == Startup up...
== APP == Calling SetDataAsync on SmokeDetectorActor:1...
== APP == Got response: Success
== APP == Calling GetDataAsync on SmokeDetectorActor:1...
== APP == Device 1 state: Location: First Floor, Status: Ready
== APP == Calling SetDataAsync on SmokeDetectorActor:2...
== APP == Got response: Success
== APP == Calling GetDataAsync on SmokeDetectorActor:2...
== APP == Device 2 state: Location: Second Floor, Status: Ready
== APP == Registering the IDs of both Devices...
== APP == Registered devices: 1, 2
== APP == Detecting smoke on Device 1...
== APP == Device 1 state: Location: First Floor, Status: Alarm
== APP == Device 2 state: Location: Second Floor, Status: Alarm
== APP == Sleeping for 16 seconds before checking status again to see reminders fire and clear alarms
== APP == Device 1 state: Location: First Floor, Status: Ready
== APP == Device 2 state: Location: Second Floor, Status: Ready
```

### （可选）第4步：在Zipkin中查看

如果您在计算机上本地为 Dapr 配置了 Zipkin，则可以在 Zipkin Web UI 中查看 actor 与客户端的交互（通常在 `http://localhost:9411/zipkin/`).

<img src="/images/actors-quickstart/actor-client-interaction-zipkin.png" width=800 style="padding-bottom:15px;">


### 发生了什么？

当您运行客户端应用程序时，会发生几件事情：

1. 两个 `SmartDetectorActor` actor [在客户端应用程序中创建](https://github.com/dapr/quickstarts/blob/master/actors/csharp/sdk/client/Program.cs) 并使用对象状态初始化：
   - `ActorProxy.Create<ISmartDevice>(actorId, actorType)`
   - `proxySmartDevice.SetDataAsync(data)`

   这些对象是可重入的并且保存状态，正如 `proxySmartDevice.GetDataAsync()`所示。

   ```csharp
   // Actor Ids and types
   var deviceId1 = "1";
   var deviceId2 = "2";
   var smokeDetectorActorType = "SmokeDetectorActor";
   var controllerActorType = "ControllerActor";

   Console.WriteLine("Startup up...");

   // An ActorId uniquely identifies the first actor instance for the first device
   var deviceActorId1 = new ActorId(deviceId1);

   // Create a new instance of the data class that will be stored in the first actor
   var deviceData1 = new SmartDeviceData(){
       Location = "First Floor",
       Status = "Ready",
   };

   // Create the local proxy by using the same interface that the service implements.
   var proxySmartDevice1 = ActorProxy.Create<ISmartDevice>(deviceActorId1, smokeDetectorActorType);

   // Now you can use the actor interface to call the actor's methods.
   Console.WriteLine($"Calling SetDataAsync on {smokeDetectorActorType}:{deviceActorId1}...");
   var setDataResponse1 = await proxySmartDevice1.SetDataAsync(deviceData1);
   Console.WriteLine($"Got response: {setDataResponse1}");

   Console.WriteLine($"Calling GetDataAsync on {smokeDetectorActorType}:{deviceActorId1}...");
   var storedDeviceData1 = await proxySmartDevice1.GetDataAsync();
   Console.WriteLine($"Device 1 state: {storedDeviceData1}");

   // Create a second actor for second device
   var deviceActorId2 = new ActorId(deviceId2);

   // Create a new instance of the data class that will be stored in the first actor
   var deviceData2 = new SmartDeviceData(){
       Location = "Second Floor",
       Status = "Ready",
   };

   // Create the local proxy by using the same interface that the service implements.
   var proxySmartDevice2 = ActorProxy.Create<ISmartDevice>(deviceActorId2, smokeDetectorActorType);

   // Now you can use the actor interface to call the second actor's methods.
   Console.WriteLine($"Calling SetDataAsync on {smokeDetectorActorType}:{deviceActorId2}...");
   var setDataResponse2 = await proxySmartDevice2.SetDataAsync(deviceData2);
   Console.WriteLine($"Got response: {setDataResponse2}");

   Console.WriteLine($"Calling GetDataAsync on {smokeDetectorActorType}:{deviceActorId2}...");
   var storedDeviceData2 = await proxySmartDevice2.GetDataAsync();
   Console.WriteLine($"Device 2 state: {storedDeviceData2}");
   ```

1. `SmartDetectorActor 1` 的 [`DetectSmokeAsync` 方法如下](https://github.com/dapr/quickstarts/blob/master/actors/csharp/sdk/service/SmokeDetectorActor.cs#L70).

   ```csharp
    public async Task DetectSmokeAsync()
    {
        var controllerActorId = new ActorId("controller");
        var controllerActorType = "ControllerActor";
        var controllerProxy = ProxyFactory.CreateActorProxy<IController>(controllerActorId, controllerActorType);
        await controllerProxy.TriggerAlarmForAllDetectors();
    }
   ```

1. 这是 [`ControllerActor` 的 `TriggerAlarmForAllDetectors` 方法](https://github.com/dapr/quickstarts/blob/master/actors/csharp/sdk/service/ControllerActor.cs#L54). 当检测到烟雾时， `ControllerActor` 会内部触发所有警报

    ```csharp 
    public async Task TriggerAlarmForAllDetectors()
    {
        var deviceIds =  await ListRegisteredDeviceIdsAsync();
        foreach (var deviceId in deviceIds)
        {
            var actorId = new ActorId(deviceId);
            var proxySmartDevice = ProxyFactory.CreateActorProxy<ISmartDevice>(actorId, "SmokeDetectorActor");
            await proxySmartDevice.SoundAlarm();
        }

        // Register a reminder to refresh and clear alarm state every 15 seconds
        await this.RegisterReminderAsync("AlarmRefreshReminder", null, TimeSpan.FromSeconds(15), TimeSpan.FromSeconds(15));
    }
    ```

    控制台 [打印一条消息，指示检测到烟雾](https://github.com/dapr/quickstarts/blob/master/actors/csharp/sdk/client/Program.cs#L65)。

    ```csharp
    // Smoke is detected on device 1 that triggers an alarm on all devices.
    Console.WriteLine($"Detecting smoke on Device 1...");
    proxySmartDevice1 = ActorProxy.Create<ISmartDevice>(deviceActorId1, smokeDetectorActorType);
    await proxySmartDevice1.DetectSmokeAsync();   
    ```

1. 这是 [`SmartDetectorActor 1`和 `2` 的 `SoundAlarm` 方法](https://github.com/dapr/quickstarts/blob/master/actors/csharp/sdk/service/SmokeDetectorActor.cs#L78) 被调用代码。

   ```csharp
   storedDeviceData1 = await proxySmartDevice1.GetDataAsync();
   Console.WriteLine($"Device 1 state: {storedDeviceData1}");
   storedDeviceData2 = await proxySmartDevice2.GetDataAsync();
   Console.WriteLine($"Device 2 state: {storedDeviceData2}");
   ```

1. `ControllerActor` 还会调用 `RegisterReminderAsync` 创建持久的 reminder 来在15 秒后调用 `ClearAlarm`.

   ```csharp
   // Register a reminder to refresh and clear alarm state every 15 seconds
   await this.RegisterReminderAsync("AlarmRefreshReminder", null, TimeSpan.FromSeconds(15), TimeSpan.FromSeconds(15));
   ```

对于示例的完整上下文，请查看以下代码:

- [`SmartDetectorActor.cs`](https://github.com/dapr/quickstarts/blob/master/actors/csharp/sdk/service/SmokeDetectorActor.cs): 实现智能设备 Actors
- [`ControllerActor.cs`](https://github.com/dapr/quickstarts/blob/master/actors/csharp/sdk/service/ControllerActor.cs)：实现了管理所有设备的控制器 actor
- [`ISmartDevice`](https://github.com/dapr/quickstarts/blob/master/actors/csharp/sdk/interfaces/ISmartDevice.cs)：每个 `SmartDetectorActor`的方法定义和共享数据类型。
- [`IController`](https://github.com/dapr/quickstarts/blob/master/actors/csharp/sdk/interfaces/IController.cs)：用于 `ControllerActor`的方法定义和共享数据类型。

{{% /codetab %}}


{{< /tabs >}}

## 告诉我们您的想法

我们一直在努力改进我们的快速入门示例，并重视您的反馈。 您觉得此快速入门有帮助吗？ 您有改进的建议吗？

加入我们的 [discord 频道](https://discord.com/channels/778680217417809931/953427615916638238)中的讨论。

## 下一步

详细了解 [Actor 构建基块]({{< ref actors >}})

{{< button text="探索 Dapr 教程  >>" page="getting-started/tutorials/_index.md" >}}
