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

- [Dapr CLI]({{< ref install-dapr-cli.md >}}) installed
- Initialized [Dapr environment]({{< ref install-dapr-selfhost.md >}})
- [.NET Core 3.1 或 .NET 5+](https://dotnet.microsoft.com/download) 已安装

## 构建块

The .NET SDK allows you to interface with all of the [Dapr building blocks]({{< ref building-blocks >}}).

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

- For a full guide on service invocation visit [How-To: Invoke a service]({{< ref howto-invoke-discover-services.md >}}).

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

- For a full list of state operations visit [How-To: Get & save state]({{< ref howto-get-save-state.md >}}).

### 发布消息

```csharp
var client = new DaprClientBuilder().Build();

var eventData = new { Id = "17", Amount = 10m, };
await client.PublishEventAsync(pubsubName, "deposit", eventData, cancellationToken);
Console.WriteLine("Published deposit event!");
```

- For a full list of state operations visit [How-To: Publish & subscribe]({{< ref howto-publish-subscribe.md >}}).
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

- For a full guide on output bindings visit [How-To: Use bindings]({{< ref howto-bindings.md >}}).

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

- For a full guide on secrets visit [How-To: Retrieve secrets]({{< ref howto-secrets.md >}}).

## 相关链接
- [.NET SDK 示例](https://github.com/dapr/dotnet-sdk/tree/master/examples)
