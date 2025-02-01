---
type: docs
title: "状态生存时间 (TTL)"
linkTitle: "状态 TTL"
weight: 500
description: "管理具有 TTL 的状态。"
---

Dapr 允许为每个状态设置生存时间 (TTL)。这意味着应用程序可以为存储的每个状态指定一个生存时间，过期后将无法检索这些状态。

对于[支持的状态存储]({{< ref supported-state-stores >}})，只需在发布消息时设置 `ttlInSeconds` 元数据。其他状态存储将忽略此值。对于某些状态存储，您可以为每个表或容器指定默认的过期时间。

## 原生状态 TTL 支持

当状态存储组件原生支持状态 TTL 时，Dapr 会直接传递 TTL 配置，而不添加额外的逻辑，从而保持行为的一致性。这在组件以不同方式处理过期状态时尤为有用。

如果未指定 TTL，将保留状态存储的默认行为。

## 显式持久化绕过全局定义的 TTL

对于允许为所有数据指定默认 TTL 的状态存储，持久化状态的方式包括：
- 通过 Dapr 组件设置全局 TTL 值，或
- 在 Dapr 之外创建状态存储并设置全局 TTL 值。

如果未指定特定的 TTL，数据将在全局 TTL 时间段后过期，这不是由 Dapr 直接控制的。

此外，所有状态存储还支持显式持久化数据的选项。这意味着您可以忽略默认的数据库策略（可能是在 Dapr 之外或通过 Dapr 组件设置的），以无限期保留特定的数据库记录。您可以通过将 `ttlInSeconds` 设置为 `-1` 来实现，这表示忽略任何设置的 TTL 值。

## 支持的组件

请参阅[状态存储组件指南]({{< ref supported-state-stores >}})中的 TTL 列。

## 示例

您可以在状态存储请求的元数据中设置状态 TTL：

{{< tabs Python ".NET" Go "HTTP API (Bash)" "HTTP API (PowerShell)">}}

{{% codetab %}}

<!--python-->

```python
# 依赖

from dapr.clients import DaprClient

# 代码

DAPR_STORE_NAME = "statestore"

with DaprClient() as client:
        client.save_state(DAPR_STORE_NAME, "order_1", str(orderId), state_metadata={
            'ttlInSeconds': '120'
        }) 

```

要启动 Dapr sidecar 并运行上述示例应用程序，您可以运行类似以下的命令：

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 -- python3 OrderProcessingService.py
```

{{% /codetab %}}

{{% codetab %}}

<!--dotnet-->

```csharp
// 依赖

using Dapr.Client;

// 代码

await client.SaveStateAsync(storeName, stateKeyName, state, metadata: new Dictionary<string, string>() { 
    { 
        "ttlInSeconds", "120" 
    } 
});
```

要启动 Dapr sidecar 并运行上述示例应用程序，您可以运行类似以下的命令：

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 dotnet run
```

{{% /codetab %}}

{{% codetab %}}

<!--go-->

```go
// 依赖

import (
	dapr "github.com/dapr/go-sdk/client"
)

// 代码

md := map[string]string{"ttlInSeconds": "120"}
if err := client.SaveState(ctx, store, "key1", []byte("hello world"), md); err != nil {
   panic(err)
}
```

要启动 Dapr sidecar 并运行上述示例应用程序，您可以运行类似以下的命令：

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 go run .
```

{{% /codetab %}}

{{% codetab %}}

```bash
curl -X POST -H "Content-Type: application/json" -d '[{ "key": "order_1", "value": "250", "metadata": { "ttlInSeconds": "120" } }]' http://localhost:3601/v1.0/state/statestore
```

{{% /codetab %}}

{{% codetab %}}

```powershell
Invoke-RestMethod -Method Post -ContentType 'application/json' -Body '[{"key": "order_1", "value": "250", "metadata": {"ttlInSeconds": "120"}}]' -Uri 'http://localhost:3601/v1.0/state/statestore'
```

{{% /codetab %}}

{{< /tabs >}}

## 相关链接

- 查看[状态 API 参考指南]({{< ref state_api.md >}})。
- 学习[如何使用键值对持久化状态]({{< ref howto-get-save-state.md >}})。
- [状态存储组件]({{< ref supported-state-stores >}})列表。
- 阅读[API 参考]({{< ref state_api.md >}})。