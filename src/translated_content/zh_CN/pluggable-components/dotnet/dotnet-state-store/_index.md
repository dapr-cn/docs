---
type: docs
title: "实现一个.NET状态存储组件"
linkTitle: "State Store"
weight: 1000
description: 如何使用 Dapr 可插拔组件 .NET SDK 创建状态存储
no_list: true
is_preview: true
---

创建一个状态存储组件只需要几个基本步骤。

## 添加状态存储命名空间

添加 `using` 语句来引用与状态存储相关的命名空间。

```csharp
using Dapr.PluggableComponents.Components;
using Dapr.PluggableComponents.Components.StateStore;
```

## 实现 `IStateStore`

创建一个实现`IStateStore`接口的类。

```csharp
internal sealed class MyStateStore : IStateStore
{
    public Task DeleteAsync(StateStoreDeleteRequest request, CancellationToken cancellationToken = default)
    {
        // Delete the requested key from the state store...
    }

    public Task<StateStoreGetResponse?> GetAsync(StateStoreGetRequest request, CancellationToken cancellationToken = default)
    {
        // Get the requested key value from from the state store, else return null...
    }

    public Task InitAsync(MetadataRequest request, CancellationToken cancellationToken = default)
    {
        // Called to initialize the component with its configured metadata...
    }

    public Task SetAsync(StateStoreSetRequest request, CancellationToken cancellationToken = default)
    {
        // Set the requested key to the specified value in the state store...
    }
}
```

## 注册状态存储组件

在主程序文件中（例如，`Program.cs`），将状态存储注册到应用程序服务中。

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

## 批量状态存储

打算支持批量操作的状态存储应该实现可选的`IBulkStateStore`接口。 它的方法与基础`IStateStore`接口的方法相同，但包括多个请求的值。

{{% alert title="Note" color="primary" %}}
Dapr 运行时将通过调用其各个操作来模拟对不实现 IBulkStateStore 的状态存储进行批量操作。
{{% /alert %}}

```csharp
internal sealed class MyStateStore : IStateStore, IBulkStateStore
{
    // ...

    public Task BulkDeleteAsync(StateStoreDeleteRequest[] requests, CancellationToken cancellationToken = default)
    {
        // Delete all of the requested values from the state store...
    }

    public Task<StateStoreBulkStateItem[]> BulkGetAsync(StateStoreGetRequest[] requests, CancellationToken cancellationToken = default)
    {
        // Return the values of all of the requested values from the state store...
    }

    public Task BulkSetAsync(StateStoreSetRequest[] requests, CancellationToken cancellationToken = default)
    {
        // Set all of the values of the requested keys in the state store...
    }
}
```

## 事务性状态存储

打算支持事务的状态存储应该实现可选的`ITransactionalStateStore`接口。 它的`TransactAsync()`方法接收一个请求，其中包含要在事务中执行的一系列删除和/或设置操作。 状态存储应该遍历序列并调用每个操作的`Visit()`方法，传递表示每种操作类型所采取的动作的回调函数。

```csharp
internal sealed class MyStateStore : IStateStore, ITransactionalStateStore
{
    // ...

    public async Task TransactAsync(StateStoreTransactRequest request, CancellationToken cancellationToken = default)
    {
        // Start transaction...

        try
        {
            foreach (var operation in request.Operations)
            {
                await operation.Visit(
                    async deleteRequest =>
                    {
                        // Process delete request...

                    },
                    async setRequest =>
                    {
                        // Process set request...
                    });
            }
        }
        catch
        {
            // Rollback transaction...

            throw;
        }

        // Commit transaction...
    }
}
```

## 可查询的状态存储

打算支持查询的状态存储应该实现可选的`IQueryableStateStore`接口。 它的`QueryAsync()`方法会传递有关查询的详细信息，例如过滤器、结果限制和分页，以及结果的排序顺序。 状态存储应该使用这些详细信息来生成一组值，作为其响应的一部分返回。

```csharp
internal sealed class MyStateStore : IStateStore, IQueryableStateStore
{
    // ...

    public Task<StateStoreQueryResponse> QueryAsync(StateStoreQueryRequest request, CancellationToken cancellationToken = default)
    {
        // Generate and return results...
    }
}
```

## ETag 和其他语义错误处理

Dapr 运行时对某些状态存储操作的特定错误条件有额外处理。 状态存储可以通过从其操作逻辑中抛出特定的异常来指示这些条件：

| 异常                               | 适用操作                               | 说明                |
| -------------------------------- | ---------------------------------- | ----------------- |
| `ETagInvalidException`           | Delete, Set, Bulk Delete, Bulk Set | 当 ETag 无效时        |
| `ETagMismatchException`          | Delete, Set, Bulk Delete, Bulk Set | 当 ETag 与预期值不匹配时   |
| `BulkDeleteRowMismatchException` | Bulk Delete                        | 当受影响的行数与预期的行数不匹配时 |
