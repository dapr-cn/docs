---
type: docs
title: Dapr 客户端 Go SDK 入门
linkTitle: Client
weight: 20000
description: 如何使用 Dapr Go SDK 启动和运行
no_list: true
---

Dapr client允许您的 Go 应用程序与其他 Dapr 应用程序进行交互。

## 前期准备

- 已安装[Dapr CLI]({{< ref install-dapr-cli.md >}})
- 初始化[Dapr环境]({{< ref install-dapr-selfhost.md >}})
- [安装Go](https://golang.org/doc/install)

## 导入客户端包

```go
import "github.com/dapr/go-sdk/client"
```

## 错误处理

Dapr错误基于[gRPC更丰富的错误模型](https://cloud.google.com/apis/design/errors#error_model)。
以下代码显示了一个示例，展示了如何解析和处理错误详情：

```go
if err != nil {
    st := status.Convert(err)

    fmt.Printf("Code: %s\n", st.Code().String())
    fmt.Printf("Message: %s\n", st.Message())

    for _, detail := range st.Details() {
        switch t := detail.(type) {
        case *errdetails.ErrorInfo:
            // Handle ErrorInfo details
            fmt.Printf("ErrorInfo:\n- Domain: %s\n- Reason: %s\n- Metadata: %v\n", t.GetDomain(), t.GetReason(), t.GetMetadata())
        case *errdetails.BadRequest:
            // Handle BadRequest details
            fmt.Println("BadRequest:")
            for _, violation := range t.GetFieldViolations() {
                fmt.Printf("- Key: %s\n", violation.GetField())
                fmt.Printf("- The %q field was wrong: %s\n", violation.GetField(), violation.GetDescription())
            }
        case *errdetails.ResourceInfo:
            // Handle ResourceInfo details
            fmt.Printf("ResourceInfo:\n- Resource type: %s\n- Resource name: %s\n- Owner: %s\n- Description: %s\n",
                t.GetResourceType(), t.GetResourceName(), t.GetOwner(), t.GetDescription())
        case *errdetails.Help:
            // Handle ResourceInfo details
            fmt.Println("HelpInfo:")
            for _, link := range t.GetLinks() {
                fmt.Printf("- Url: %s\n", link.Url)
                fmt.Printf("- Description: %s\n", link.Description)
            }
        
        default:
            // Add cases for other types of details you expect
            fmt.Printf("Unhandled error detail type: %v\n", t)
        }
    }
}
```

## 构建块

Go SDK 允许您与所有的[Dapr构建块]({{< ref building-blocks >}})}进行接口交互。

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

有关服务调用的完整指南，请访问[操作方法: 调用服务]({{< ref howto-invoke-discover-services.md >}})。

### 状态管理

对于简单的用例，Dapr客户端提供了易于使用的`Save`，`Get`，`Delete`方法：

```go
ctx := context.Background()
data := []byte("hello")
store := "my-store" // defined in the component YAML 

// save state with the key key1, default options: strong, last-write
if err := client.SaveState(ctx, store, "key1", data, nil); err != nil {
    panic(err)
}

// get state for key key1
item, err := client.GetState(ctx, store, "key1", nil)
if err != nil {
    panic(err)
}
fmt.Printf("data [key:%s etag:%s]: %s", item.Key, item.Etag, string(item.Value))

// delete state for key key1
if err := client.DeleteState(ctx, store, "key1", nil); err != nil {
    panic(err)
}
```

为了获得更精细的控制，Dapr Go客户端公开了`SetStateItem`类型，可以用于对状态操作进行更多控制，并允许一次保存多个项目：

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

同样，`GetBulkState`方法提供了一种在单个操作中检索多个状态项的方式：

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

使用`QueryState`从您的状态存储中检索、过滤和排序键/值数据。

```go
// Define the query string
query := `{
	"filter": {
		"EQ": { "value.Id": "1" }
	},
	"sort": [
		{
			"key": "value.Balance",
			"order": "DESC"
		}
	]
}`

// Use the client to query the state
queryResponse, err := c.QueryState(ctx, "querystore", query)
if err != nil {
	log.Fatal(err)
}

fmt.Printf("Got %d\n", len(queryResponse))

for _, account := range queryResponse {
	var data Account
	err := account.Unmarshal(&data)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Printf("Account: %s has %f\n", data.ID, data.Balance)
}
```

> \*\*注意：查询状态 API 目前处于 alpha 阶段

有关状态管理的完整指南，请访问[操作方法：保存和获取状态]({{< ref howto-get-save-state.md >}})。

### 发布消息

要将数据发布到主题上，Dapr Go 客户端提供了一个简单的方法：

```go
data := []byte(`{ "id": "a123", "value": "abcdefg", "valid": true }`)
if err := client.PublishEvent(ctx, "component-name", "topic-name", data); err != nil {
    panic(err)
}
```

要一次发布多条消息，`PublishEvents` 可以使用的方法：

```go
events := []string{"event1", "event2", "event3"}
res := client.PublishEvents(ctx, "component-name", "topic-name", events)
if res.Error != nil {
    panic(res.Error)
}
```

有关pub/sub的完整指南，请访问[操作方法: 发布 & 订阅]({{< ref howto-publish-subscribe.md >}})。

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

有关输出绑定的完整指南，请访问[操作方法：使用绑定]({{< ref howto-bindings.md >}})。

### Actors

使用Dapr Go客户端SDK编写actor。

```go
// MyActor represents an example actor type.
type MyActor struct {
	actors.Actor
}

// MyActorMethod is a method that can be invoked on MyActor.
func (a *MyActor) MyActorMethod(ctx context.Context, req *actors.Message) (string, error) {
	log.Printf("Received message: %s", req.Data)
	return "Hello from MyActor!", nil
}

func main() {
	// Create a Dapr client
	daprClient, err := client.NewClient()
	if err != nil {
		log.Fatal("Error creating Dapr client: ", err)
	}

	// Register the actor type with Dapr
	actors.RegisterActor(&MyActor{})

	// Create an actor client
	actorClient := actors.NewClient(daprClient)

	// Create an actor ID
	actorID := actors.NewActorID("myactor")

	// Get or create the actor
	err = actorClient.SaveActorState(context.Background(), "myactorstore", actorID, map[string]interface{}{"data": "initial state"})
	if err != nil {
		log.Fatal("Error saving actor state: ", err)
	}

	// Invoke a method on the actor
	resp, err := actorClient.InvokeActorMethod(context.Background(), "myactorstore", actorID, "MyActorMethod", &actors.Message{Data: []byte("Hello from client!")})
	if err != nil {
		log.Fatal("Error invoking actor method: ", err)
	}

	log.Printf("Response from actor: %s", resp.Data)

	// Wait for a few seconds before terminating
	time.Sleep(5 * time.Second)

	// Delete the actor
	err = actorClient.DeleteActor(context.Background(), "myactorstore", actorID)
	if err != nil {
		log.Fatal("Error deleting actor: ", err)
	}

	// Close the Dapr client
	daprClient.Close()
}
```

有关 Actors 的完整指南，请访问[Actors 构建块文档]({{< ref actors >}})。

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

有关秘密的完整指南，请访问[操作方法: 检索秘密]({{< ref howto-secrets.md >}})。

### 分布式锁

Dapr 客户端使用锁提供对资源的互斥访问。 使用锁，您可以：

- 提供对数据库行、表或整个数据库的访问权限
- 锁定从队列中按顺序读取信息

```go
package main

import (
    "fmt"

    dapr "github.com/dapr/go-sdk/client"
)

func main() {
    client, err := dapr.NewClient()
    if err != nil {
        panic(err)
    }
    defer client.Close()
    
    resp, err := client.TryLockAlpha1(ctx, "lockstore", &dapr.LockRequest{
			LockOwner:         "random_id_abc123",
			ResourceID:      "my_file_name",
			ExpiryInSeconds: 60,
		})

    fmt.Println(resp.Success)
}
```

有关分布式锁的完整指南，请访问[操作方法：使用锁]({{< ref howto-use-distributed-lock.md >}})。

### Configuration

使用 Dapr 客户端 Go SDK，您可以使用以只读键/值对形式返回的配置项目，并订阅配置项目的更改。

#### 获取配置

```go
	items, err := client.GetConfigurationItem(ctx, "example-config", "mykey")
	if err != nil {
		panic(err)
	}
	fmt.Printf("get config = %s\n", (*items).Value)
```

#### 配置订阅

```go
go func() {
	if err := client.SubscribeConfigurationItems(ctx, "example-config", []string{"mySubscribeKey1", "mySubscribeKey2", "mySubscribeKey3"}, func(id string, items map[string]*dapr.ConfigurationItem) {
		for k, v := range items {
			fmt.Printf("get updated config key = %s, value = %s \n", k, v.Value)
		}
		subscribeID = id
	}); err != nil {
		panic(err)
	}
}()
```

有关配置的完整指南，请访问[操作方法：从商店管理配置]({{< ref howto-manage-configuration.md >}})。

### Cryptography

使用 Dapr 客户端 Go SDK，您可以使用高级的 `Encrypt` 和 `Decrypt` 密码学 API 在处理数据流时进行文件的加密和解密。

加密

```go
// Encrypt the data using Dapr
out, err := client.Encrypt(context.Background(), rf, dapr.EncryptOptions{
	// These are the 3 required parameters
	ComponentName: "mycryptocomponent",
	KeyName:        "mykey",
	Algorithm:     "RSA",
})
if err != nil {
	panic(err)
}
```

加密

```go
// Decrypt the data using Dapr
out, err := client.Decrypt(context.Background(), rf, dapr.EncryptOptions{
	// Only required option is the component name
	ComponentName: "mycryptocomponent",
})
```

有关密码学的完整指南，请访问[操作方法：使用密码学API]({{< ref howto-cryptography.md >}})。

## 相关链接

[Go SDK示例](https://github.com/dapr/go-sdk/tree/main/examples)
