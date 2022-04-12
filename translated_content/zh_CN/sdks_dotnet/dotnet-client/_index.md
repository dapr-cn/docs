---
type: docs
title: "Dapr 客户端 .NET SDK入门"
linkTitle: "客户端"
weight: 20000
description: 如何启动和运行Dapr .NET SDK
no_list: true
---

Dapr 客户端包允许您从.NET应用程序中与其他 Dapr 应用程序进行交互。

## 先决条件

- 安装 [Dapr CLI]({{< ref install-dapr-cli.md >}})
- 初始化[Dapr环境]({{< ref install-dapr-selfhost.md >}})
- [.NET Core 3.1 或 .NET 5+](https://dotnet.microsoft.com/download) 已安装

## 构建块

.NET SDK允许您与所有的[Dapr构建块]({{< ref building-blocks >}})接口。

### 调用服务

您可以使用 `DaprClient` 或 `System.Net.Http.HttpClient` 调用您的服务。

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

- 有关服务调用的完整指南，请访问 [如何：调用服务]({{< ref howto-invoke-discover-services.md >}})。

### 保存 & 获取 应用程序状态

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

### Query State (Alpha)

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

- 有关状态操作的完整列表，请访问 [如何：获取 & 保存 状态。]({{< ref howto-get-save-state.md >}})。

### 发布消息

```csharp
var client = new DaprClientBuilder().Build();

var eventData = new { Id = "17", Amount = 10m, };
await client.PublishEventAsync(pubsubName, "deposit", eventData, cancellationToken);
Console.WriteLine("Published deposit event!");
```

- 有关状态操作的完整列表，请访问 [如何: 发布 & 订阅]({{< ref howto-publish-subscribe.md >}})。
- 请访问[.NET SDK示例](https://github.com/dapr/dotnet-sdk/tree/master/examples/client/PublishSubscribe)，获取代码示例和说明，以试用 发布/订阅。

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

- 有关输出绑定的完整指南，请访问 [如何：使用绑定]({{< ref howto-bindings.md >}})。

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

- 有关密钥的完整指南，请访问[如何：检索密钥]({{< ref howto-secrets.md >}})。

### Get Configuration Keys (Alpha)
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

## 相关链接
- [.NET SDK 示例](https://github.com/dapr/dotnet-sdk/tree/master/examples)
