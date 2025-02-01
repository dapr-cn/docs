---
type: docs
title: "开始使用 Dapr 客户端 .NET SDK"
linkTitle: "客户端"
weight: 20000
description: 如何使用 Dapr .NET SDK 快速上手
no_list: true
---

Dapr 客户端包使您能够从 .NET 应用程序与其他 Dapr 应用程序进行交互。

{{% alert title="注意" color="primary" %}}
 如果您还没有这样做，[请尝试其中一个快速入门]({{< ref quickstarts >}})，以快速了解如何使用 Dapr .NET SDK 和 API 构建块。

{{% /alert %}}


## 构建块

.NET SDK 允许您与所有 [Dapr 构建块]({{< ref building-blocks >}})进行接口交互。

### 调用服务

#### HTTP
您可以使用 `DaprClient` 或 `System.Net.Http.HttpClient` 来调用服务。

{{% alert title="注意" color="primary" %}}
 您还可以[使用命名的 `HTTPEndpoint` 或非 Dapr 环境的 FQDN URL 调用非 Dapr 端点]({{< ref "howto-invoke-non-dapr-endpoints.md#using-an-httpendpoint-resource-or-fqdn-url-for-non-dapr-endpoints" >}})。

{{% /alert %}}


{{< tabs SDK HTTP>}}

{{% codetab %}}
```csharp
using var client = new DaprClientBuilder().
                UseTimeout(TimeSpan.FromSeconds(2)). // 可选：设置超时
                Build(); 

// 调用名为 "deposit" 的 POST 方法，输入类型为 "Transaction"
var data = new { id = "17", amount = 99m };
var account = await client.InvokeMethodAsync<object, Account>("routing", "deposit", data, cancellationToken);
Console.WriteLine("返回: id:{0} | 余额:{1}", account.Id, account.Balance);
```
{{% /codetab %}}

{{% codetab %}}
```csharp
var client = DaprClient.CreateInvokeHttpClient(appId: "routing");

// 设置 HTTP 客户端的超时：
client.Timeout = TimeSpan.FromSeconds(2);

var deposit = new Transaction  { Id = "17", Amount = 99m };
var response = await client.PostAsJsonAsync("/deposit", deposit, cancellationToken);
var account = await response.Content.ReadFromJsonAsync<Account>(cancellationToken: cancellationToken);
Console.WriteLine("返回: id:{0} | 余额:{1}", account.Id, account.Balance);
```
{{% /codetab %}}
{{< /tabs >}}

#### gRPC
您可以使用 `DaprClient` 通过 gRPC 调用服务。

```csharp
using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(20));
var invoker = DaprClient.CreateInvocationInvoker(appId: myAppId, daprEndpoint: serviceEndpoint);
var client = new MyService.MyServiceClient(invoker);

var options = new CallOptions(cancellationToken: cts.Token, deadline: DateTime.UtcNow.AddSeconds(1));
await client.MyMethodAsync(new Empty(), options);

Assert.Equal(StatusCode.DeadlineExceeded, ex.StatusCode);
```

- 有关服务调用的完整指南，请访问 [如何：调用服务]({{< ref howto-invoke-discover-services.md >}})。

### 保存和获取应用程序状态

```csharp
var client = new DaprClientBuilder().Build();

var state = new Widget() { Size = "small", Color = "yellow", };
await client.SaveStateAsync(storeName, stateKeyName, state, cancellationToken: cancellationToken);
Console.WriteLine("状态已保存!");

state = await client.GetStateAsync<Widget>(storeName, stateKeyName, cancellationToken: cancellationToken);
Console.WriteLine($"获取状态: {state.Size} {state.Color}");

await client.DeleteStateAsync(storeName, stateKeyName, cancellationToken: cancellationToken);
Console.WriteLine("状态已删除!");
```

### 查询状态 (Alpha)

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

Console.WriteLine($"获取 {queryResponse.Results.Count}");
foreach (var account in queryResponse.Results)
{
    Console.WriteLine($"账户: {account.Data.Id} 余额 {account.Data.Balance}");
}
```

- 有关状态操作的完整列表，请访问 [如何：获取和保存状态]({{< ref howto-get-save-state.md >}})。

### 发布消息

```csharp
var client = new DaprClientBuilder().Build();

var eventData = new { Id = "17", Amount = 10m, };
await client.PublishEventAsync(pubsubName, "deposit", eventData, cancellationToken);
Console.WriteLine("已发布存款事件!");
```

- 有关状态操作的完整列表，请访问 [如何：发布和订阅]({{< ref howto-publish-subscribe.md >}})。
- 访问 [.NET SDK 示例](https://github.com/dapr/dotnet-sdk/tree/master/examples/Client/PublishSubscribe) 获取代码示例和尝试 pub/sub 的说明

### 与输出绑定交互

```csharp
using var client = new DaprClientBuilder().Build();

// Twilio SendGrid 绑定的示例负载
var email = new 
{
    metadata = new 
    {
        emailTo = "customer@example.com",
        subject = "来自 Dapr SendGrid 绑定的邮件",    
    }, 
    data =  "<h1>测试 Dapr 绑定</h1>这是一个测试。<br>再见!",
};
await client.InvokeBindingAsync("send-email", "create", email);
```

- 有关输出绑定的完整指南，请访问 [如何：使用绑定]({{< ref howto-bindings.md >}})。

### 检索秘密

{{< tabs Multi-value-secret Single-value-secret >}}

{{% codetab %}}

```csharp
var client = new DaprClientBuilder().Build();

// 检索基于键值对的秘密 - 返回一个 Dictionary<string, string>
var secrets = await client.GetSecretAsync("mysecretstore", "key-value-pair-secret");
Console.WriteLine($"获取秘密键: {string.Join(", ", secrets.Keys)}");
```

{{% /codetab %}}

{{% codetab %}}

```csharp
var client = new DaprClientBuilder().Build();

// 检索基于键值对的秘密 - 返回一个 Dictionary<string, string>
var secrets = await client.GetSecretAsync("mysecretstore", "key-value-pair-secret");
Console.WriteLine($"获取秘密键: {string.Join(", ", secrets.Keys)}");

// 检索单值秘密 - 返回一个 Dictionary<string, string>
// 包含一个以秘密名称为键的单个值
var data = await client.GetSecretAsync("mysecretstore", "single-value-secret");
var value = data["single-value-secret"]
Console.WriteLine("获取了一个秘密值，我不会打印它，因为它是秘密!");
```

{{% /codetab %}}

{{< /tabs >}}

- 有关秘密的完整指南，请访问 [如何：检索秘密]({{< ref howto-secrets.md >}})。

### 获取配置键
```csharp
var client = new DaprClientBuilder().Build();

// 检索特定的一组键。
var specificItems = await client.GetConfiguration("configstore", new List<string>() { "key1", "key2" });
Console.WriteLine($"这是我的值:\n{specificItems[0].Key} -> {specificItems[0].Value}\n{specificItems[1].Key} -> {specificItems[1].Value}");

// 通过提供一个空列表来检索所有配置项。
var specificItems = await client.GetConfiguration("configstore", new List<string>());
Console.WriteLine($"我得到了 {configItems.Count} 个条目!");
foreach (var item in configItems)
{
    Console.WriteLine($"{item.Key} -> {item.Value}")
}
```

### 订阅配置键
```csharp
var client = new DaprClientBuilder().Build();

// 订阅配置 API 返回一个 IAsyncEnumerable<IEnumerable<ConfigurationItem>> 的包装器。
// 通过在 foreach 循环中访问其 Source 进行迭代。当流被切断或取消令牌被取消时，循环将结束。
var subscribeConfigurationResponse = await daprClient.SubscribeConfiguration(store, keys, metadata, cts.Token);
await foreach (var items in subscribeConfigurationResponse.Source.WithCancellation(cts.Token))
{
    foreach (var item in items)
    {
        Console.WriteLine($"{item.Key} -> {item.Value}")
    }
}
```

### 分布式锁 (Alpha)

#### 获取锁

```csharp
using System;
using Dapr.Client;

namespace LockService
{
    class Program
    {
        [Obsolete("分布式锁 API 处于 Alpha 阶段，一旦稳定可以移除。")]
        static async Task Main(string[] args)
        {
            var daprLockName = "lockstore";
            var fileName = "my_file_name";
            var client = new DaprClientBuilder().Build();
     
            // 使用这种方法锁定也会自动解锁，因为这是一个可释放对象
            await using (var fileLock = await client.Lock(DAPR_LOCK_NAME, fileName, "random_id_abc123", 60))
            {
                if (fileLock.Success)
                {
                    Console.WriteLine("成功");
                }
                else
                {
                    Console.WriteLine($"锁定 {fileName} 失败。");
                }
            }
        }
    }
}
```

#### 解锁现有锁

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

### 管理工作流实例 (Alpha)

```csharp
var daprClient = new DaprClientBuilder().Build();

string instanceId = "MyWorkflowInstance1";
string workflowComponentName = "dapr"; // 或者，这可以是 yaml 中定义的工作流组件的名称
string workflowName = "MyWorkflowDefinition";
var input = new { name = "Billy", age = 30 }; // 任何 JSON 可序列化的值都可以

// 启动工作流
var startResponse = await daprClient.StartWorkflowAsync(instanceId, workflowComponentName, workflowName, input);

// 终止工作流
await daprClient.TerminateWorkflowAsync(instanceId, workflowComponentName);

// 获取工作流元数据
var getResponse = await daprClient.GetWorkflowAsync(instanceId, workflowComponentName, workflowName);
```

## Sidecar APIs
### Sidecar 健康
.NET SDK 提供了一种轮询 sidecar 健康状态的方法，以及一个等待 sidecar 准备就绪的便捷方法。

#### 轮询健康状态
当 sidecar 和您的应用程序都启动（完全初始化）时，此健康端点返回 true。

```csharp
var client = new DaprClientBuilder().Build();

var isDaprReady = await client.CheckHealthAsync();

if (isDaprReady) 
{
    // 执行依赖 Dapr 的代码。
}
```

#### 轮询健康状态（出站）
当 Dapr 初始化了其所有组件时，此健康端点返回 true，但可能尚未完成与您的应用程序的通信通道设置。

当您希望在启动路径中利用 Dapr 组件时，这种方法最好，例如，从 secretstore 加载秘密。

```csharp
var client = new DaprClientBuilder().Build();

var isDaprComponentsReady = await client.CheckOutboundHealthAsync();

if (isDaprComponentsReady) 
{
    // 执行依赖 Dapr 组件的代码。
}
```

#### 等待 sidecar
`DaprClient` 还提供了一个辅助方法来等待 sidecar 变得健康（仅限组件）。使用此方法时，建议包含一个 `CancellationToken` 以允许请求超时。以下是 `DaprSecretStoreConfigurationProvider` 中使用此方法的示例。

```csharp
// 在尝试使用 Dapr 组件之前，等待 Dapr sidecar 报告健康。
using (var tokenSource = new CancellationTokenSource(sidecarWaitTimeout))
{
    await client.WaitForSidecarAsync(tokenSource.Token);
}

// 在此处执行 Dapr 组件操作，例如获取秘密。
```

### 关闭 sidecar
```csharp
var client = new DaprClientBuilder().Build();
await client.ShutdownSidecarAsync();
```

## 相关链接
- [.NET SDK 示例](https://github.com/dapr/dotnet-sdk/tree/master/examples)
