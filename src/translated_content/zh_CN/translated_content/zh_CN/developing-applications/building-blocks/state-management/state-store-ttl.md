---
type: docs
title: "状态生存时间（TTL）"
linkTitle: "State TTL"
weight: 500
description: "使用 TTL 管理状态。"
---

Dapr 允许对每个状态设置请求的生存时间(TTL)。 这意味着应用程序可以为每个存储的状态设置生存时间，并且在过期后无法检索这些状态。

为 [支持的状态存储]({{< ref supported-state-stores >}})，您只需设置 `ttlInSeconds` 元数据。 其他的状态存储将忽略这个值。 对于一些状态存储，您可以在每个表/容器的基础上指定一个默认的到期时间。

## 原生状态 TTL 支持

当状态 TTL 在状态存储组件中具有本机支持时，Dapr 会转发 TTL 配置，而不会添加任何额外逻辑，保持可预测的行为。 当组件对过期状态的处理方式不同时，这很有帮助。

当没有指定TTL时，将保留状态存储的默认行为。

## 绕过全局定义的 TTL 进行显式持久化

持久状态适用于允许您指定用于所有数据的默认 TTL 的所有状态存储，或者：
- 通过 Dapr 组件设置全局 TTL 值，或
- 在 Dapr 之外创建状态存储并设置全局 TTL 值时。

当未指定特定的 TTL 时，数据将在全局 TTL 时间段之后过期。 Dapr 没有促进这一点。

此外，所有状态存储还支持选择 _显式_ 持久化数据。 这意味着您可以忽略默认的数据库策略（可能是在 Dapr 外部设置的，或通过 Dapr 组件设置的），以无限期地保留给定的数据库记录。 您可以通过将`ttlInSeconds`设置为`-1`来实现此目的。 此值表示忽略任何设置的TTL值。

## 受支持的组件

请参阅 TTL 列 [状态存储组件指南]({{< ref supported-state-stores >}}).

## 示例

您可以在状态存储设置请求的元数据中设置状态TTL：

{{< tabs Python ".NET" Go "HTTP API (Bash)" "HTTP API (PowerShell)">}}

{{% codetab %}}

<!--python-->

```python
#dependencies

from dapr.clients import DaprClient

#code

DAPR_STORE_NAME = "statestore"

with DaprClient() as client:
        client.save_state(DAPR_STORE_NAME, "order_1", str(orderId), state_metadata={
            'ttlInSeconds': '120'
        }) 

```

要启动 Dapr sidecar 并运行上述示例应用程序，然后运行类似以下命令：

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 -- python3 OrderProcessingService.py
```

{{% /codetab %}}

{{% codetab %}}

<!--dotnet-->

```csharp
// dependencies

using Dapr.Client;

// code

await client.SaveStateAsync(storeName, stateKeyName, state, metadata: new Dictionary<string, string>() { 
    { 
        "ttlInSeconds", "120" 
    } 
});
```

要启动 Dapr sidecar 并运行上述示例应用程序，然后运行类似以下命令：

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 dotnet run
```

{{% /codetab %}}

{{% codetab %}}

<!--go-->

```go
// dependencies

import (
    dapr "github.com/dapr/go-sdk/client"
)

// code

md := map[string]string{"ttlInSeconds": "120"}
if err := client.SaveState(ctx, store, "key1", []byte("hello world"), md); err != nil {
   panic(err)
}
```

要启动 Dapr sidecar 并运行上述示例应用程序，然后运行类似以下命令：

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

- [状态 API 参考指南]({{< ref state_api.md >}}).
- 了解如何 [使用键值对来持久保存状态]({{< ref howto-get-save-state.md >}}).
- [状态存储组件]({{< ref supported-state-stores >}}) 列表.
- 阅读 [API 参考手册]({{< ref state_api.md >}})。
