---
type: docs
title: "实现一个Go状态存储组件"
linkTitle: "State Store"
weight: 1000
description: 如何使用 Dapr 可插拔组件 Go SDK 创建状态存储
no_list: true
is_preview: true
---

创建一个状态存储组件只需要几个基本步骤。

## 导入状态存储包

创建文件`components/statestore.go`并添加与状态存储相关的`import`语句。

```go
package components

import (
    "context"
    "github.com/dapr/components-contrib/state"
)
```

## 实现`Store`接口

创建一个实现`Store`接口的类型。

```go
type MyStateStore struct {
}

func (store *MyStateStore) Init(metadata state.Metadata) error {
    // Called to initialize the component with its configured metadata...
}

func (store *MyStateStore) GetComponentMetadata() map[string]string {
    // Not used with pluggable components...
    return map[string]string{}
}

func (store *MyStateStore) Features() []state.Feature {
    // Return a list of features supported by the state store...
}

func (store *MyStateStore) Delete(ctx context.Context, req *state.DeleteRequest) error {
    // Delete the requested key from the state store...
}

func (store *MyStateStore) Get(ctx context.Context, req *state.GetRequest) (*state.GetResponse, error) {
    // Get the requested key value from the state store, else return an empty response...
}

func (store *MyStateStore) Set(ctx context.Context, req *state.SetRequest) error {
    // Set the requested key to the specified value in the state store...
}

func (store *MyStateStore) BulkGet(ctx context.Context, req []state.GetRequest) (bool, []state.BulkGetResponse, error) {
    // Get the requested key values from the state store...
}

func (store *MyStateStore) BulkDelete(ctx context.Context, req []state.DeleteRequest) error {
    // Delete the requested keys from the state store...
}

func (store *MyStateStore) BulkSet(ctx context.Context, req []state.SetRequest) error {
    // Set the requested keys to their specified values in the state store...
}
```

## 注册状态存储组件

在主应用程序文件中（例如，`main.go`），使用状态存储注册应用程序服务。

```go
package main

import (
    "example/components"
    dapr "github.com/dapr-sandbox/components-go-sdk"
    "github.com/dapr-sandbox/components-go-sdk/state/v1"
)

func main() {
    dapr.Register("<socket name>", dapr.WithStateStore(func() state.Store {
        return &components.MyStateStoreComponent{}
    }))

    dapr.MustRun()
}
```

## 批量状态存储

虽然需要状态存储来支持 [批量操作]({{< ref "state-management-overview.md#bulk-read-operations" >}})，它们的实现按顺序委托给各个操作方法。

## 事务性状态存储

打算支持事务的状态存储应该实现可选的`TransactionalStore`接口。 它的`Multi()`方法接收一个请求，其中包含要在事务中执行的一系列`delete`和/或`set`操作。 状态存储应该遍历序列并应用每个操作。

```go
func (store *MyStateStoreComponent) Multi(ctx context.Context, request *state.TransactionalStateRequest) error {
    // Start transaction...

    for _, operation := range request.Operations {
        switch operation.Operation {
        case state.Delete:
            deleteRequest := operation.Request.(state.DeleteRequest)
            // Process delete request...
        case state.Upsert:
            setRequest := operation.Request.(state.SetRequest)
            // Process set request...
        }
    }

    // End (or rollback) transaction...

    return nil
}
```

## 可查询的状态存储

打算支持查询的状态存储应该实现可选的`Querier`接口。 它的`Query()`方法会传递有关查询的详细信息，例如过滤器、结果限制、分页和结果的排序顺序。 状态存储使用这些详细信息来生成一组值，作为其响应的一部分返回。

```go
func (store *MyStateStoreComponent) Query(ctx context.Context, req *state.QueryRequest) (*state.QueryResponse, error) {
    // Generate and return results...
}
```

## ETag 和其他语义错误处理

Dapr 运行时对某些状态存储操作的特定错误条件有额外处理。 状态存储可以通过从其操作逻辑中返回特定错误来指示这些条件：

| 错误                                      | 适用操作                               | 说明                |
| --------------------------------------- | ---------------------------------- | ----------------- |
| `NewETagError(state.ETagInvalid, ...)`  | Delete, Set, Bulk Delete, Bulk Set | 当 ETag 无效时        |
| `NewETagError(state.ETagMismatch, ...)` | Delete, Set, Bulk Delete, Bulk Set | 当 ETag 与预期值不匹配时   |
| `NewBulkDeleteRowMismatchError(...)`    | Bulk Delete                        | 当受影响的行数与预期的行数不匹配时 |

## 下一步
- [Dapr 可插拔组件 Go SDK 的高级技巧]({{< ref go-advanced >}})
- 详细了解如何实现：
  - [绑定]({{< ref go-bindings >}})
  - [Pub/sub]({{< ref go-pub-sub >}})
