---
type: docs
title: "实现 .NET 状态存储组件"
linkTitle: "状态存储"
weight: 1000
description: 如何使用 Dapr 可插拔组件 .NET SDK 创建状态存储
no_list: true
is_preview: true
---

创建状态存储组件只需几个基本步骤。

## 添加状态存储命名空间

为状态存储相关的命名空间添加 `using` 语句。

```csharp
using Dapr.PluggableComponents.Components;
using Dapr.PluggableComponents.Components.StateStore;
```

## 实现 `IStateStore`

创建一个实现 `IStateStore` 接口的类。

```csharp
internal sealed class MyStateStore : IStateStore
{
    public Task DeleteAsync(StateStoreDeleteRequest request, CancellationToken cancellationToken = default)
    {
        // 从状态存储中删除请求的键...
    }

    public Task<StateStoreGetResponse?> GetAsync(StateStoreGetRequest request, CancellationToken cancellationToken = default)
    {
        // 从状态存储中获取请求的键值，否则返回 null...
    }

    public Task InitAsync(MetadataRequest request, CancellationToken cancellationToken = default)
    {
        // 使用配置的元数据初始化组件...
    }

    public Task SetAsync(StateStoreSetRequest request, CancellationToken cancellationToken = default)
    {
        // 在状态存储中将请求的键设置为指定的值...
    }
}
```

## 注册状态存储组件

在主程序文件中（如 `Program.cs`），通过应用服务注册状态存储。

```csharp
using Dapr.PluggableComponents;

var app = DaprPluggableComponentsApplication.Create();

app.RegisterService(
    "<socket name>",
    serviceBuilder =>
    {
        serviceBuilder.RegisterStateStore<MyStateStore>();
    });

app.Run();
```

## 支持批量操作的状态存储

如果状态存储打算支持批量操作，应实现可选的 `IBulkStateStore` 接口。其方法与基础 `IStateStore` 接口的方法相似，但包含多个请求的值。

{{% alert title="注意" color="primary" %}}
对于未实现 `IBulkStateStore` 的状态存储，Dapr 运行时将通过单独调用其操作来模拟批量状态存储操作。
{{% /alert %}}

```csharp
internal sealed class MyStateStore : IStateStore, IBulkStateStore
{
    // ...

    public Task BulkDeleteAsync(StateStoreDeleteRequest[] requests, CancellationToken cancellationToken = default)
    {
        // 从状态存储中删除所有请求的值...
    }

    public Task<StateStoreBulkStateItem[]> BulkGetAsync(StateStoreGetRequest[] requests, CancellationToken cancellationToken = default)
    {
        // 返回状态存储中所有请求的值...
    }

    public Task BulkSetAsync(StateStoreSetRequest[] requests, CancellationToken cancellationToken = default)
    {
        // 在状态存储中设置所有请求键的值...
    }
}
```

## 事务性状态存储

如果状态存储打算支持事务，应实现可选的 `ITransactionalStateStore` 接口。其 `TransactAsync()` 方法接收一个请求，其中包含要在事务中执行的删除和/或设置操作序列。状态存储应遍历这些操作，并调用每个操作的 `Visit()` 方法，传递相应的回调以处理每种操作类型。

```csharp
internal sealed class MyStateStore : IStateStore, ITransactionalStateStore
{
    // ...

    public async Task TransactAsync(StateStoreTransactRequest request, CancellationToken cancellationToken = default)
    {
        // 开始事务...

        try
        {
            foreach (var operation in request.Operations)
            {
                await operation.Visit(
                    async deleteRequest =>
                    {
                        // 处理删除请求...

                    },
                    async setRequest =>
                    {
                        // 处理设置请求...
                    });
            }
        }
        catch
        {
            // 回滚事务...

            throw;
        }

        // 提交事务...
    }
}
```

## 可查询状态存储

如果状态存储打算支持查询，应实现可选的 `IQueryableStateStore` 接口。其 `QueryAsync()` 方法接收有关查询的详细信息，例如过滤器、结果限制和分页，以及结果的排序顺序。状态存储应使用这些详细信息生成一组值并作为响应的一部分返回。

```csharp
internal sealed class MyStateStore : IStateStore, IQueryableStateStore
{
    // ...

    public Task<StateStoreQueryResponse> QueryAsync(StateStoreQueryRequest request, CancellationToken cancellationToken = default)
    {
        // 生成并返回结果...
    }
}
```

## ETag 和其他语义错误处理

Dapr 运行时对某些状态存储操作导致的特定错误条件有额外的处理。状态存储可以通过从其操作逻辑中抛出特定异常来指示这些条件：

| 异常 | 适用操作 | 描述
|---|---|---|
| `ETagInvalidException` | 删除、设置、批量删除、批量设置 | 当 ETag 无效时 |
| `ETagMismatchException`| 删除、设置、批量删除、批量设置 | 当 ETag 与预期值不匹配时 |
| `BulkDeleteRowMismatchException` | 批量删除 | 当受影响的行数与预期行数不匹配时 |
