---
type: docs
title: "使用 Dapr 客户端 Go SDK 入门"
linkTitle: "客户端"
weight: 20000
description: 如何使用 Dapr Go SDK 快速上手
no_list: true
---

Dapr 客户端包使您能够从 Go 应用程序与其他 Dapr 应用程序进行交互。

## 前提条件

在开始之前，您需要确保以下条件已满足：

- 已安装 [Dapr CLI]({{< ref install-dapr-cli.md >}})
- 已初始化 [Dapr 环境]({{< ref install-dapr-selfhost.md >}})
- [已安装 Go](https://golang.org/doc/install)

## 导入客户端包
```go
import "github.com/dapr/go-sdk/client"
```

## 错误处理
Dapr 的错误处理基于 [gRPC 的丰富错误模型](https://cloud.google.com/apis/design/errors#error_model)。以下代码示例展示了如何解析和处理错误详情：

```go
if err != nil {
    st := status.Convert(err)

    fmt.Printf("Code: %s\n", st.Code().String())
    fmt.Printf("Message: %s\n", st.Message())

    for _, detail := range st.Details() {
        switch t := detail.(type) {
        case *errdetails.ErrorInfo:
            // 处理 ErrorInfo 详情
            fmt.Printf("ErrorInfo:\n- Domain: %s\n- Reason: %s\n- Metadata: %v\n", t.GetDomain(), t.GetReason(), t.GetMetadata())
        case *errdetails.BadRequest:
            // 处理 BadRequest 详情
            fmt.Println("BadRequest:")
            for _, violation := range t.GetFieldViolations() {
                fmt.Printf("- Key: %s\n", violation.GetField())
                fmt.Printf("- The %q field was wrong: %s\n", violation.GetField(), violation.GetDescription())
            }
        case *errdetails.ResourceInfo:
            // 处理 ResourceInfo 详情
            fmt.Printf("ResourceInfo:\n- Resource type: %s\n- Resource name: %s\n- Owner: %s\n- Description: %s\n",
                t.GetResourceType(), t.GetResourceName(), t.GetOwner(), t.GetDescription())
        case *errdetails.Help:
            // 处理 Help 详情
            fmt.Println("HelpInfo:")
            for _, link := range t.GetLinks() {
                fmt.Printf("- Url: %s\n", link.Url)
                fmt.Printf("- Description: %s\n", link.Description)
            }
        
        default:
            // 添加其他类型详情的处理
            fmt.Printf("Unhandled error detail type: %v\n", t)
        }
    }
}
```

## 构建块

Go SDK 允许您与所有 [Dapr 构建块]({{< ref building-blocks >}})进行交互。

### 服务调用

要调用运行在 Dapr sidecar 中的另一个服务上的特定方法，Dapr 客户端 Go SDK 提供了两种选项：

调用不带数据的服务：
```go
resp, err := client.InvokeMethod(ctx, "app-id", "method-name", "post")
```

调用带数据的服务：
```go
content := &dapr.DataContent{
    ContentType: "application/json",
    Data:        []byte(`{ "id": "a123", "value": "demo", "valid": true }`),
}

resp, err = client.InvokeMethodWithContent(ctx, "app-id", "method-name", "post", content)
```

有关服务调用的完整指南，请访问 [如何调用服务]({{< ref howto-invoke-discover-services.md >}})。

### 状态管理

对于简单的用例，Dapr 客户端提供了易于使用的 `Save`、`Get`、`Delete` 方法：

```go
ctx := context.Background()
data := []byte("hello")
store := "my-store" // 在组件 YAML 中定义

// 使用键 key1 保存状态，默认选项：强一致性，最后写入
if err := client.SaveState(ctx, store, "key1", data, nil); err != nil {
    panic(err)
}

// 获取键 key1 的状态
item, err := client.GetState(ctx, store, "key1", nil)
if err != nil {
    panic(err)
}
fmt.Printf("data [key:%s etag:%s]: %s", item.Key, item.Etag, string(item.Value))

// 删除键 key1 的状态
if err := client.DeleteState(ctx, store, "key1", nil); err != nil {
    panic(err)
}
```

为了更细粒度的控制，Dapr Go 客户端公开了 `SetStateItem` 类型，可以用于更好地控制状态操作，并允许一次保存多个项目：

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

同样，`GetBulkState` 方法提供了一种在单个操作中检索多个状态项的方法：

```go
keys := []string{"key1", "key2", "key3"}
items, err := client.GetBulkState(ctx, store, keys, nil,100)
```

以及 `ExecuteStateTransaction` 方法，用于以事务方式执行多个插入或删除操作。

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

使用 `QueryState` 检索、过滤和排序存储在状态存储中的键/值数据。

```go
// 定义查询字符串
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

// 使用客户端查询状态
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

> **注意：** 查询状态 API 目前处于 alpha 阶段

有关状态管理的完整指南，请访问 [如何保存和获取状态]({{< ref howto-get-save-state.md >}})。

### 发布消息
要将数据发布到主题上，Dapr Go 客户端提供了一个简单的方法：

```go
data := []byte(`{ "id": "a123", "value": "abcdefg", "valid": true }`)
if err := client.PublishEvent(ctx, "component-name", "topic-name", data); err != nil {
    panic(err)
}
```

要一次发布多个消息，可以使用 `PublishEvents` 方法：

```go
events := []string{"event1", "event2", "event3"}
res := client.PublishEvents(ctx, "component-name", "topic-name", events)
if res.Error != nil {
    panic(res.Error)
}
```

有关发布/订阅的完整指南，请访问 [如何发布和订阅]({{< ref howto-publish-subscribe.md >}})。

### 工作流

您可以使用 Go SDK 创建 [工作流]({{< ref workflow-overview.md >}})。例如，从一个简单的工作流活动开始：

```go
func TestActivity(ctx workflow.ActivityContext) (any, error) {
	var input int
	if err := ctx.GetInput(&input); err != nil {
		return "", err
	}
	
	// 在这里做一些事情
	return "result", nil
}
```

编写一个简单的工作流函数：

```go
func TestWorkflow(ctx *workflow.WorkflowContext) (any, error) {
	var input int
	if err := ctx.GetInput(&input); err != nil {
		return nil, err
	}
	var output string
	if err := ctx.CallActivity(TestActivity, workflow.ActivityInput(input)).Await(&output); err != nil {
		return nil, err
	}
	if err := ctx.WaitForExternalEvent("testEvent", time.Second*60).Await(&output); err != nil {
		return nil, err
	}
	
	if err := ctx.CreateTimer(time.Second).Await(nil); err != nil {
		return nil, nil
	}
	return output, nil
}
```

然后编写将使用您创建的工作流的应用程序。有关完整的演练，请参阅 [如何编写工作流指南]({{< ref howto-author-workflow.md >}})。

尝试 [Go SDK 工作流示例](https://github.com/dapr/go-sdk/blob/main/examples/workflow)。

### 输出绑定

Dapr Go 客户端 SDK 提供了两种方法来调用 Dapr 定义的绑定上的操作。Dapr 支持输入、输出和双向绑定。

对于简单的输出绑定：

```go
in := &dapr.InvokeBindingRequest{ Name: "binding-name", Operation: "operation-name" }
err = client.InvokeOutputBinding(ctx, in)
```

调用带内容和元数据的方法：

```go
in := &dapr.InvokeBindingRequest{
    Name:      "binding-name",
    Operation: "operation-name",
    Data: []byte("hello"),
    Metadata: map[string]string{"k1": "v1", "k2": "v2"},
}

out, err := client.InvokeBinding(ctx, in)
```

有关输出绑定的完整指南，请访问 [如何使用绑定]({{< ref howto-bindings.md >}})。

### Actor

使用 Dapr Go 客户端 SDK 编写 actor。

```go
// MyActor 表示一个示例 actor 类型。
type MyActor struct {
	actors.Actor
}

// MyActorMethod 是可以在 MyActor 上调用的方法。
func (a *MyActor) MyActorMethod(ctx context.Context, req *actors.Message) (string, error) {
	log.Printf("Received message: %s", req.Data)
	return "Hello from MyActor!", nil
}

func main() {
	// 创建一个 Dapr 客户端
	daprClient, err := client.NewClient()
	if err != nil {
		log.Fatal("Error creating Dapr client: ", err)
	}

	// 向 Dapr 注册 actor 类型
	actors.RegisterActor(&MyActor{})

	// 创建一个 actor 客户端
	actorClient := actors.NewClient(daprClient)

	// 创建一个 actor ID
	actorID := actors.NewActorID("myactor")

	// 获取或创建 actor
	err = actorClient.SaveActorState(context.Background(), "myactorstore", actorID, map[string]interface{}{"data": "initial state"})
	if err != nil {
		log.Fatal("Error saving actor state: ", err)
	}

	// 调用 actor 上的方法
	resp, err := actorClient.InvokeActorMethod(context.Background(), "myactorstore", actorID, "MyActorMethod", &actors.Message{Data: []byte("Hello from client!")})
	if err != nil {
		log.Fatal("Error invoking actor method: ", err)
	}

	log.Printf("Response from actor: %s", resp.Data)

	// 在终止前等待几秒钟
	time.Sleep(5 * time.Second)

	// 删除 actor
	err = actorClient.DeleteActor(context.Background(), "myactorstore", actorID)
	if err != nil {
		log.Fatal("Error deleting actor: ", err)
	}

	// 关闭 Dapr 客户端
	daprClient.Close()
}
```

有关 actor 的完整指南，请访问 [actor 构建块文档]({{< ref actors >}})。

### Secret 管理

Dapr 客户端还提供对运行时 secret 的访问，这些 secret 可以由任意数量的 secret 存储（例如 Kubernetes Secrets、HashiCorp Vault 或 Azure KeyVault）支持：

```go
opt := map[string]string{
    "version": "2",
}

secret, err := client.GetSecret(ctx, "store-name", "secret-name", opt)
```

### 认证

默认情况下，Dapr 依赖于网络边界来限制对其 API 的访问。然而，如果目标 Dapr API 配置了基于令牌的认证，用户可以通过两种方式配置 Go Dapr 客户端以使用该令牌：

**环境变量**

如果定义了 DAPR_API_TOKEN 环境变量，Dapr 将自动使用它来增强其 Dapr API 调用以确保认证。

**显式方法**

此外，用户还可以在任何 Dapr 客户端实例上显式设置 API 令牌。这种方法在用户代码需要为不同的 Dapr API 端点创建多个客户端时非常有用。

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

有关 secret 的完整指南，请访问 [如何检索 secret]({{< ref howto-secrets.md >}})。

### 分布式锁

Dapr 客户端提供了使用锁对资源的互斥访问。通过锁，您可以：

- 提供对数据库行、表或整个数据库的访问
- 以顺序方式锁定从队列中读取消息

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

有关分布式锁的完整指南，请访问 [如何使用锁]({{< ref howto-use-distributed-lock.md >}})。

### 配置

使用 Dapr 客户端 Go SDK，您可以消费作为只读键/值对返回的配置项，并订阅配置项的更改。

#### 配置获取

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

有关配置的完整指南，请访问 [如何从存储管理配置]({{< ref howto-manage-configuration.md >}})。

### 加密

使用 Dapr 客户端 Go SDK，您可以使用高级 `Encrypt` 和 `Decrypt` 加密 API 在处理数据流时加密和解密文件。

加密：

```go
// 使用 Dapr 加密数据
out, err := client.Encrypt(context.Background(), rf, dapr.EncryptOptions{
	// 这是 3 个必需的参数
	ComponentName: "mycryptocomponent",
	KeyName:        "mykey",
	Algorithm:     "RSA",
})
if err != nil {
	panic(err)
}
```

解密：

```go
// 使用 Dapr 解密数据
out, err := client.Decrypt(context.Background(), rf, dapr.EncryptOptions{
	// 唯一必需的选项是组件名称
	ComponentName: "mycryptocomponent",
})
```

有关加密的完整指南，请访问 [如何使用加密 API]({{< ref howto-cryptography.md >}})。

## 相关链接
[Go SDK 示例](https://github.com/dapr/go-sdk/tree/main/examples)
