---
type: docs
title: "Dapr 客户端 Go SDK 入门"
linkTitle: "客户端"
weight: 20000
description: 如何使用 Dapr Go SDK 启动和运行
no_list: true
---

Dapr client允许您的 Go 应用程序与其他 Dapr 应用程序进行交互。

## 先决条件

- 安装 [Dapr CLI]({{< ref install-dapr-cli.md >}})
- 初始化[Dapr环境]({{< ref install-dapr-selfhost.md >}})
- [Go已安装](https://golang.org/doc/install)


## 导入包
```go
import "github.com/dapr/go-sdk/client"
```

## 构建块

Go SDK 允许您与所有 [Dapr 构建块]({{< ref building-blocks >}}) 进行交互。

### 服务调用

要在 Dapr sidecar 运行的服务上调用特定方法，Dapr 客户端 Go SDK 提供了两个选项：

调用没有数据的服务：
```go
resp, err := client.InvokeMethod(ctx, "app-id", "method-name", "post")
```

调用有数据的服务：
```go
content := &dapr.DataContent{
    ContentType: "application/json",
    Data:        []byte(`{ "id": "a123", "value": "demo", "valid": true }`),
}

resp, err = client.InvokeMethodWithContent(ctx, "app-id", "method-name", "post", content)
```

- 有关服务调用的完整指南，请访问 [如何：调用服务]({{< ref howto-invoke-discover-services.md >}})。

### 状态管理

对于简单的用例，Dapr client 提供了易于使用的 `Save`, `Get`, `Delete` 方法：

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

为了获得更精细的控制，Dapr Go client 公开了 `SetStateItem` 类型 ，`SetStateItem`可用于更好地控制状态操作，并允许一次保存多个项目：

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

同样， `GetBulkState` 提供了检索多个状态项的方法：

```go
keys := []string{"key1", "key2", "key3"}
items, err := client.GetBulkState(ctx, store, keys, nil,100)
```

还有 `ExecuteStateTransaction` 可以事务性地执行多个upsert或delete操作。

```go
ops := make([]*dapr.StateOperation, 0)

op1 := &dapr.StateOperation{
    Type: dapr.StateOperationTypeUpsert,
    Item: &dapr.SetStateItem{
        Key:   "key1",
        Value: []byte(data),
    },
}
op2 := &dapr.StateOperation{
    Type: dapr.StateOperationTypeDelete,
    Item: &dapr.SetStateItem{
        Key:   "key2",
    },
}
ops = append(ops, op1, op2)
meta := map[string]string{}
err := testClient.ExecuteStateTransaction(ctx, store, meta, ops)
```

### 发布消息
要将数据发布到主题上，Dapr Go 客户端提供了一个简单的方法：

```go
data := []byte(`{ "id": "a123", "value": "abcdefg", "valid": true }`)
if err := client.PublishEvent(ctx, "component-name", "topic-name", data); err != nil {
    panic(err)
}
```

- 有关状态操作的完整列表，请访问 [如何: 发布 & 订阅]({{< ref howto-publish-subscribe.md >}})。

### 输出绑定
Dapr Go Client SDK 提供了两种方法来调用 Dapr 定义好的绑定操作方法。 Dapr 支持输入、输出和双向绑定。

比如，输出绑定：
```go
in := &dapr.InvokeBindingRequest{ Name: "binding-name", Operation: "operation-name" }
err = client.InvokeOutputBinding(ctx, in)
```
调用带有内容和元数据的方法。
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

Dapr client 还提供访问运行时的密钥，并可以由任何的密钥存储服务支持(例如： Kubernetes Secrets, HashiCorp Vault, or Azure KeyVault):

```go
opt := map[string]string{
    "version": "2",
}

secret, err := client.GetSecret(ctx, "store-name", "secret-name", opt)
```

### 鉴权

默认情况下，Dapr依靠网络边界限制对其API的访问。 然而，如果Dapr API 使用了基于令牌的身份验证配置，用户可以通过以下两种方式配置Go Dapr客户端鉴权：

**环境变量**

如果定义了 DAPR_API_TOKEN 环境变量，Dapr 将自动使用它来做 Dapr API 调用时的鉴权。

**显式方法**

此外，用户还可以在任何 Dapr client 实例上设置显式鉴权令牌。 该方法对多个 Dapr API 端点创建多个 client 的时候十分有用。

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
