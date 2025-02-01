---
type: docs
title: ".NET Dapr 可插拔组件的生命周期"
linkTitle: "组件生命周期"
weight: 1000
description: 如何控制 .NET 可插拔组件的生命周期
no_list: true
is_preview: true
---

在 .NET Dapr 中，注册组件有两种方式：

 - 组件作为单例运行，其生命周期由 SDK 管理
 - 组件的生命周期由可插拔组件决定，可以是多实例或单例，视需要而定

## 单例组件

按类型注册的组件将作为单例运行：一个实例将为与该 socket 关联的所有配置组件提供服务。当仅存在一个该类型的组件并在 Dapr 应用程序之间共享时，这种方法是最佳选择。

```csharp
var app = DaprPluggableComponentsApplication.Create();

app.RegisterService(
    "service-a",
    serviceBuilder =>
    {
        serviceBuilder.RegisterStateStore<SingletonStateStore>();
    });

app.Run();

class SingletonStateStore : IStateStore
{
    // ...
}
```

## 多实例组件

可以通过传递“工厂方法”来注册组件。对于与该 socket 关联的每个配置组件，该方法将被调用。该方法返回要与该组件关联的实例（无论是否共享）。当多个相同类型的组件可能配置有不同的元数据集时，或者当组件操作需要彼此隔离时，这种方法是最佳选择。

工厂方法会接收上下文信息，例如配置的 Dapr 组件的 ID，这些信息可用于区分不同的组件实例。

```csharp
var app = DaprPluggableComponentsApplication.Create();

app.RegisterService(
    "service-a",
    serviceBuilder =>
    {
        serviceBuilder.RegisterStateStore(
            context =>
            {
                return new MultiStateStore(context.InstanceId);
            });
    });

app.Run();

class MultiStateStore : IStateStore
{
    private readonly string instanceId;

    public MultiStateStore(string instanceId)
    {
        this.instanceId = instanceId;
    }

    // ...
}
