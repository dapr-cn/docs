---
type: docs
title: "在 .NET Dapr 可插拔组件中使用多个服务"
linkTitle: "多个服务"
weight: 1000
description: 如何从 .NET 可插拔组件中暴露多个服务
no_list: true
is_preview: true
---

一个可插拔组件可以托管多种类型的组件。您可能会这样做：
- 以减少集群中运行的sidecar数量
- 以便将可能共享库和实现的相关组件进行分组，例如：
   - 一个既作为通用状态存储又作为
   - 允许更具体操作的输出绑定。

每个Unix域套接字可以管理对每种类型的一个组件的调用。要托管多个相同类型的组件，您可以将这些类型分布在多个套接字上。SDK将每个套接字绑定到一个“服务”，每个服务由一个或多个组件类型组成。

## 注册多个服务

每次调用`RegisterService()`都会将一个套接字绑定到一组注册的组件，其中每种类型的组件每个服务可以注册一个。

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

配置Dapr以使用托管组件与任何单个组件相同 - 组件YAML引用关联的套接字。

```yaml
#
# 此组件使用与套接字 `state-store-a` 关联的状态存储
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
# 此组件使用与套接字 `state-store-b` 关联的状态存储
#
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: state-store-b
spec:
  type: state.service-b
  version: v1
  metadata: []
