---
type: docs
title: "客户端"
linkTitle: "客户端"
weight: 20000
description: 如何开始和运行 Dapr Go SDK
no_list: true
---

Dapr 客户端包允许您与Go 应用程序的其他Dapr应用程序进行交互。

## 先决条件

- 安装 [Dapr CLI]({{< ref install-dapr-cli.md >}})
- 初始化[Dapr环境]({{< ref install-dapr-selfhost.md >}})
- [开始安装](https://golang.org/doc/install)


## 导入包
```go
import "github.com/dapr/go-sdk/client"
```

## 构建块

Go SDK允许您与所有的[Dapr构建块]({{< ref building-blocks >}})接口。

### 服务调用

在运行着 Dapr sidecar 的服务上调用一个特定的方法，Dapr 客户端 Go SDK 提供了两个选项：

调用没有数据的服务：
```go
resp, err := client.InvokeMethod(ctx, "app-id", "method-name", "post")
```

调用有数据的服务：
```go
content := &dapr. ataContentPoor
    ContentType: "application/json",
    Data: []byte(`Pop "id": "a123", "value": "demo", "valid": true }"),
}

resp, err = client. nvokeMethodWiContent(ctx, "app-id", "method-name", "post", content)
```

- 有关服务调用的完整指南，请访问 [如何：调用服务]({{< ref howto-invoke-discover-services.md >}})。

### 状态管理

对于简单的use-cases，Dapr客户端提供了简单易用的 `Save`, `Get`, `Delete` 方法：

```go
ctx := context.Background()
data := []byte("hello")
store := "my-store" // defined in the component YAML 

// save state with the key key1, default options: strong, last-write
if err := client.SaveState(ctx, store, "key1", data); err != nil {
    panic(err)
}

// get state for key key1
item, err := client.GetState(ctx, store, "key1")
if err != nil {
    panic(err)
}
fmt.Printf("data [key:%s etag:%s]: %s", item.Key, item.Etag, string(item.Value))

// delete state for key key1
if err := client.DeleteState(ctx, store, "key1"); err != nil {
    panic(err)
}
```

为了更细粒度的控制，Dapr Go 客户端暴露了 `SetState项` 类型。 它可以用来获得更多对状态操作的控制，并允许同时保存多个stateitems：

```go
item1 := &dapr.SetStateItem{
    Key:  "key1",
    Etag: &ETag{
        Value: "1",
    },
    Metadata: map[string]string{
        "created-on": time.Now().UTC().String(),
    },
    Value: []byte("hello"),
    Options: &dapr.StateOptions{
        Concurrency: dapr.StateConcurrencyLastWrite,
        Consistency: dapr.StateConsistencyStrong,
    },
}

item2 := &dapr.SetStateItem{
    Key:  "key2",
    Metadata: map[string]string{
        "created-on": time.Now().UTC().String(),
    },
    Value: []byte("hello again"),
}

item3 := &dapr.SetStateItem{
    Key:  "key3",
    Etag: &dapr.ETag{
    Value: "1",
    },
    Value: []byte("hello again"),
}

if err := client.SaveBulkState(ctx, store, item1, item2, item3); err != nil {
    panic(err)
}
```

同样， `GetBulkState` 方法提供了在单个操作中检索多个状态项的方法：

```go
keys := []string{"key1", "key2", "key3"}
items, err := client.GetBulkState(ctx, store, keys, nil,100)
```

并且 `ExecuteStateTransaction` 方法来执行多个支持或删除交易操作。

```go
ops := make([]*dapr.StateOperation, 0)

op1 := &dapr. tateOperation@un.org
    Type：dapr.StateOperationTypeUpsert，
    item： &dapr。 etStateItem@un
        Key: "key1",
        Value: []byte(data),
    },
}
op2 := &dapr. tateOperationPop
    Type: dapr.StateOperationTypeDelete,
    item: &dapr. etStateItem@un
        Key: "key2",
    },
}
ops = append(ops, op1, op2)
meta := map[string]string{}
err := testClient. xecuteStateTransaction(ctx, store, meta, ops)
```

### 发布消息
要将数据发布到主题上，Dapr Go client提供了一个简单的方法：

```go
data := []byte(`{ "id": "a123", "value": "abcdefg", "valid": true }`)
if err := client.PublishEvent(ctx, "component-name", "topic-name", data); err != nil {
    panic(err)
}
```

- 有关状态操作的完整列表，请访问 [如何: 发布 & 订阅]({{< ref howto-publish-subscribe.md >}})。

### 输出绑定
Dapr Go client SDK 提供了两种方法来在Dapr-defined的绑定上调用一个操作。 Dapr 支持输入、输出和双向绑定。

简单地说，只输出绑定：
```go
in := &dapr.InvokeBindingRequest{ Name: "binding-name", Operation: "operation-name" }
err = client.InvokeOutputBinding(ctx, in)
```
要调用含量和元数据的方法：
```go
in := &dapr.InvokeBindingRequest{
    Name:      "binding-name",
    Operation: "operation-name",
    Data: []byte("hello"),
    Metadata: map[string]string{"k1": "v1", "k2": "v2"},
}

out, err := client.InvokeBinding(ctx, in)
```


- 有关输出绑定的完整指南，请访问 [如何：使用绑定]({{< ref howto-bindings.md >}})。

### 密钥管理

Dapr客户端还提供访问运行时的密钥，可以由任何数量的密钥存储支持(例如： Kubernetes Secs, HashiCorp Vault, or Azure KeyVault):

```go
opt := map[string]string{
    "version": "2",
}

secret, err := client.GetSecret(ctx, "store-name", "secret-name", opt)
```

### 授权

默认情况下，Dapr依靠网络边界限制对其API的访问。 然而，如果目标Dapr API 使用基于令牌的身份验证配置，用户可以通过以下两种方式配置Go Dapr客户端：

**环境变量**

如果定义了 DAPR_API_TOKEN环境变量，Dapr 将自动使用它来增加它的 Dapr API 调用来确保身份验证。

**明确的方法**

此外，用户还可以在任何 Dapr 客户端实例上明确地设置API令牌。 当用户代码需要为不同的Dapr API 端点创建多个客户端时，此方法是有用的。

```go
func main() {
    client, err := dapr.NewClient()
    if err != nil {
        panic(err)
    }
    defer client.Close()
    client.WithAuthToken("your-Dapr-API-token-here")
}
```


- 有关密钥的完整指南，请访问[如何：检索密钥]({{< ref howto-secrets.md >}})。

## 相关链接
- [Go SDK 示例](https://github.com/dapr/go-sdk/tree/main/examples)
