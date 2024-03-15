---
type: docs
title: .NET Dapr可插拔组件的生命周期
linkTitle: 组件生命周期
weight: 1000
description: 如何控制 .NET 可插拔组件的生命周期
no_list: true
is_preview: true
---

注册组件有两种方式：

- 该组件作为单例运行，其生命周期由SDK管理
- 组件的生命周期由可插拔组件确定，可以根据需要是多实例或单例

## 单例组件

_按类型_注册的组件是单例：一个实例将为与该套接字关联的该类型的所有已配置组件提供服务。 当只有一个该类型的组件存在并在 Dapr 应用程序之间共享时，这种方法是最佳的。

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

组件可以通过传递一个"工厂方法"来注册。 该方法将会被调用，用于每个与该套接字关联的配置组件类型的实例。 该方法返回与该组件关联的实例（无论是共享的还是非共享的）。 当同一类型的多个组件可能配置有不同的元数据集时，或者需要将组件操作彼此隔离时，此方法最佳。

工厂方法将传递上下文，例如配置的 Dapr 组件的 ID，可用于区分组件实例。

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
```
