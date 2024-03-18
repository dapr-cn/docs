---
type: docs
title: Dapr 客户端 .NET SDK入门
linkTitle: Client
weight: 20000
description: 如何使用 Dapr .NET SDK 启动和运行
no_list: true
---

Dapr 客户端包允许您从 .NET 应用程序中与其他 Dapr 应用程序进行交互。

{{% alert title="注意" color="primary" %}}
如果你还没有，请[尝试使用一个快速入门]({{< ref quickstarts >}})快速了解如何使用 Dapr .NET SDK 与一个 API 构建块。

{{% /alert %}}

## 构建块

.NET SDK 允许您与所有的[Dapr构建块]({{< ref building-blocks >}}}进行接口交互。

### 调用服务

您可以使用 `DaprClient` 或 `System.Net.Http.HttpClient` 来调用您的服务。

{{< tabs SDK HTTP>}}

{{% codetab %}}

```csharp
using var client = new DaprClientBuilder().Build();

// Invokes a POST method named "deposit" that takes input of type "Transaction"
var data = new { id = "17", amount = 99m };
var account = await client.InvokeMethodAsync<object, Account>("routing", "deposit", data, cancellationToken);
Console.WriteLine("Returned: id:{0} | Balance:{1}", account.Id, account.Balance);
```

{{% /codetab %}}

{{% codetab %}}

```csharp
var client = DaprClient.CreateInvokeHttpClient(appId: "routing");

var deposit = new Transaction  { Id = "17", Amount = 99m };
var response = await client.PostAsJsonAsync("/deposit", deposit, cancellationToken);
var account = await response.Content.ReadFromJsonAsync<Account>(cancellationToken: cancellationToken);
Console.WriteLine("Returned: id:{0} | Balance:{1}", account.Id, account.Balance);
```

{{% /codetab %}}

{{< /tabs >}}

- 有关服务调用的完整指南，请访问[操作方法: 调用服务]({{< ref howto-invoke-discover-services.md >}})。

### 保存和获取应用程序状态

```csharp
var client = new DaprClientBuilder().Build();

var state = new Widget() { Size = "small", Color = "yellow", };
await client.SaveStateAsync(storeName, stateKeyName, state, cancellationToken: cancellationToken);
Console.WriteLine("Saved State!");

state = await client.GetStateAsync<Widget>(storeName, stateKeyName, cancellationToken: cancellationToken);
Console.WriteLine($"Got State: {state.Size} {state.Color}");

await client.DeleteStateAsync(storeName, stateKeyName, cancellationToken: cancellationToken);
Console.WriteLine("Deleted State!");
```

### 查询状态（Alpha）

```csharp
var query = "{" +
                "\"filter\": {" +
                    "\"EQ\": { \"value.Id\": \"1\" }" +
                "}," +
                "\"sort\": [" +
                    "{" +
                        "\"key\": \"value.Balance\"," +
                        "\"order\": \"DESC\"" +
                    "}" +
                "]" +
            "}";

var client = new DaprClientBuilder().Build();
var queryResponse = await client.QueryStateAsync<Account>("querystore", query, cancellationToken: cancellationToken);

Console.WriteLine($"Got {queryResponse.Results.Count}");
foreach (var account in queryResponse.Results)
{
    Console.WriteLine($"Account: {account.Data.Id} has {account.Data.Balance}");
}
```

- 有关状态操作的完整列表，请访问 [操作方法：获取和保存状态]({{< ref howto-get-save-state.md >}}).

### 发布消息

```csharp
var client = new DaprClientBuilder().Build();

var eventData = new { Id = "17", Amount = 10m, };
await client.PublishEventAsync(pubsubName, "deposit", eventData, cancellationToken);
Console.WriteLine("Published deposit event!");
```

- 有关状态操作的完整列表，请访问[操作方法: 发布 & 订阅]({{< ref howto-publish-subscribe.md >}})。
- 访问 [.NET SDK 示例](https://github.com/dapr/dotnet-sdk/tree/master/examples/Client/PublishSubscribe) 获取代码示例和使用说明，尝试使用发布/订阅功能

### 与输出绑定交互

```csharp
using var client = new DaprClientBuilder().Build();

// Example payload for the Twilio SendGrid binding
var email = new 
{
    metadata = new 
    {
        emailTo = "customer@example.com",
        subject = "An email from Dapr SendGrid binding",    
    }, 
    data =  "<h1>Testing Dapr Bindings</h1>This is a test.<br>Bye!",
};
await client.InvokeBindingAsync("send-email", "create", email);
```

- 有关输出绑定的完整指南，请访问[操作方法：使用绑定]({{< ref howto-bindings.md >}})。

### 检索密钥

{{< tabs Multi-value-secret Single-value-secret >}}

{{% codetab %}}

```csharp
var client = new DaprClientBuilder().Build();

// Retrieve a key-value-pair-based secret - returns a Dictionary<string, string>
var secrets = await client.GetSecretAsync("mysecretstore", "key-value-pair-secret");
Console.WriteLine($"Got secret keys: {string.Join(", ", secrets.Keys)}");
```

{{% / codetab %}}

{{% codetab %}}

```csharp
var client = new DaprClientBuilder().Build();

// Retrieve a key-value-pair-based secret - returns a Dictionary<string, string>
var secrets = await client.GetSecretAsync("mysecretstore", "key-value-pair-secret");
Console.WriteLine($"Got secret keys: {string.Join(", ", secrets.Keys)}");

// Retrieve a single-valued secret - returns a Dictionary<string, string>
// containing a single value with the secret name as the key
var data = await client.GetSecretAsync("mysecretstore", "single-value-secret");
var value = data["single-value-secret"]
Console.WriteLine("Got a secret value, I'm not going to be print it, it's a secret!");
```

{{% /codetab %}}

{{< /tabs >}}

- 有关秘密的完整指南，请访问[操作方法: 检索秘密]({{< ref howto-secrets.md >}})。

### 获取配置键

```csharp
var client = new DaprClientBuilder().Build();

// Retrieve a specific set of keys.
var specificItems = await client.GetConfiguration("configstore", new List<string>() { "key1", "key2" });
Console.WriteLine($"Here are my values:\n{specificItems[0].Key} -> {specificItems[0].Value}\n{specificItems[1].Key} -> {specificItems[1].Value}");

// Retrieve all configuration items by providing an empty list.
var specificItems = await client.GetConfiguration("configstore", new List<string>());
Console.WriteLine($"I got {configItems.Count} entires!");
foreach (var item in configItems)
{
    Console.WriteLine($"{item.Key} -> {item.Value}")
}
```

### 订阅配置键

```csharp
var client = new DaprClientBuilder().Build();

// The Subscribe Configuration API returns a wrapper around an IAsyncEnumerable<IEnumerable<ConfigurationItem>>.
// Iterate through it by accessing its Source in a foreach loop. The loop will end when the stream is severed
// or if the cancellation token is cancelled.
var subscribeConfigurationResponse = await daprClient.SubscribeConfiguration(store, keys, metadata, cts.Token);
await foreach (var items in subscribeConfigurationResponse.Source.WithCancellation(cts.Token))
{
    foreach (var item in items)
    {
        Console.WriteLine($"{item.Key} -> {item.Value}")
    }
}
```

### 分布式锁（Alpha）

#### 获取锁

```csharp
using System;
using Dapr.Client;

namespace LockService
{
    class Program
    {
        [Obsolete("Distributed Lock API is in Alpha, this can be removed once it is stable.")]
        static async Task Main(string[] args)
        {
            var daprLockName = "lockstore";
            var fileName = "my_file_name";
            var client = new DaprClientBuilder().Build();
     
            // Locking with this approach will also unlock it automatically, as this is a disposable object
            await using (var fileLock = await client.Lock(DAPR_LOCK_NAME, fileName, "random_id_abc123", 60))
            {
                if (fileLock.Success)
                {
                    Console.WriteLine("Success");
                }
                else
                {
                    Console.WriteLine($"Failed to lock {fileName}.");
                }
            }
        }
    }
}
```

#### 释放现有锁

```csharp
using System;
using Dapr.Client;

namespace LockService
{
    class Program
    {
        static async Task Main(string[] args)
        {
            var daprLockName = "lockstore";
            var client = new DaprClientBuilder().Build();

            var response = await client.Unlock(DAPR_LOCK_NAME, "my_file_name", "random_id_abc123"));
            Console.WriteLine(response.status);
        }
    }
}
```

### 管理工作流实例（Alpha）

```csharp
var daprClient = new DaprClientBuilder().Build();

string instanceId = "MyWorkflowInstance1";
string workflowComponentName = "dapr"; // alternatively, this could be the name of a workflow component defined in yaml
string workflowName = "MyWorkflowDefinition";
var input = new { name = "Billy", age = 30 }; // Any JSON-serializable value is OK

// Start workflow
var startResponse = await daprClient.StartWorkflowAsync(instanceId, workflowComponentName, workflowName, input);

// Terminate workflow
await daprClient.TerminateWorkflowAsync(instanceId, workflowComponentName);

// Get workflow metadata
var getResponse = await daprClient.GetWorkflowAsync(instanceId, workflowComponentName, workflowName);
```

## Sidecar APIs

### Sidecar 健康

.NET SDK 提供了一种方式来轮询 sidecar 的健康状态，以及一个方便的方法来等待 sidecar 就绪。

#### 健康轮询

当旁车和您的应用程序都处于运行状态（完全初始化）时，此健康端点返回true。

```csharp
var client = new DaprClientBuilder().Build();

var isDaprReady = await client.CheckHealthAsync();

if (isDaprReady) 
{
    // Execute Dapr dependent code.
}
```

#### 健康轮询 (出站)

当 Dapr 初始化所有组件时，此健康端点返回 true，但可能尚未完成与您的应用程序建立通信渠道的设置。

当您希望在启动路径中利用Dapr组件时，这是最佳选择，例如从secretstore加载密钥。

```csharp
var client = new DaprClientBuilder().Build();

var isDaprComponentsReady = await client.CheckOutboundHealthAsync();

if (isDaprComponentsReady) 
{
    // Execute Dapr component dependent code.
}
```

#### 等待 sidecar

`DaprClient`还提供了一个辅助方法，用于等待sidecar变为健康状态（仅适用于组件）。 在使用该方法时，建议包括一个`CancellationToken`以便请求超时。 下面是一个示例，展示了如何在`DaprSecretStoreConfigurationProvider`中使用它。

```csharp
// Wait for the Dapr sidecar to report healthy before attempting use Dapr components.
using (var tokenSource = new CancellationTokenSource(sidecarWaitTimeout))
{
    await client.WaitForSidecarAsync(tokenSource.Token);
}

// Perform Dapr component operations here i.e. fetching secrets.
```

### 关闭 sidecar

```csharp
var client = new DaprClientBuilder().Build();
await client.ShutdownSidecarAsync();
```

## 相关链接

- [.SDK示例](https://github.com/dapr/dotnet-sdk/tree/master/examples)
