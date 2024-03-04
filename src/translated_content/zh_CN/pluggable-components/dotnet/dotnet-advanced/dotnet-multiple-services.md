---
type: docs
title: ".NET Dapr 可插拔组件中的多个服务"
linkTitle: "Multiple services"
weight: 1000
description: 如何从一个.NET可插拔组件中公开多个服务
no_list: true
is_preview: true
---

一个可插拔的组件可以承载多个不同类型的组件。 你可以这样做：
- 尽量减少集群中运行的 sidecar 数量
- 将可能共享库和实现的相关组件分组，例如：
   - 一个同时作为通用状态存储和数据库暴露的
   - 允许进行更具体操作的输出绑定。

每个 Unix 域套接字都可以管理对每种类型的一个组件的调用。 要承载 _相同_ 类型，您可以将这些类型分布在多个套接字中。 SDK 将每个套接字绑定到一个“服务”，每个服务由一个或多个组件类型组成。

## 注册多个服务

每次调用`RegisterService()`都会将套接字绑定到一组已注册的组件，每个服务可以注册每种类型的组件中的一个。

```csharp
var app = DaprPluggableComponentsApplication.Create();

app.RegisterService(
    "service-a",
    serviceBuilder =>
    {
        serviceBuilder.RegisterStateStore<MyDatabaseStateStore>();
        serviceBuilder.RegisterBinding<MyDatabaseOutputBinding>();
    });

app.RegisterService(
    "service-b",
    serviceBuilder =>
    {
        serviceBuilder.RegisterStateStore<AnotherStateStore>();
    });

app.Run();

class MyDatabaseStateStore : IStateStore
{
    // ...
}

class MyDatabaseOutputBinding : IOutputBinding
{
    // ...
}

class AnotherStateStore : IStateStore
{
    // ...
}
```

## 配置多个组件

配置 Dapr 使用托管组件与任何单个组件的配置方式相同 - 组件的 YAML 引用关联的套接字。

```yaml
#
# This component uses the state store associated with socket `state-store-a`
#
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: state-store-a
spec:
  type: state.service-a
  version: v1
  metadata: []
```

```yaml
#
# This component uses the state store associated with socket `state-store-b`
#
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: state-store-b
spec:
  type: state.service-b
  version: v1
  metadata: []
```
