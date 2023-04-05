---
type: docs
title: "状态生存时间（TTL）。"
linkTitle: "State TTL"
weight: 500
description: "Manage state with TTL."
---

Dapr 允许对每个消息设置生存时间(TTL)。 这意味着应用程序可以为每个存储的状态设置生存时间，并且在过期后无法检索这些状态。

For [supported state stores]({{< ref supported-state-stores >}}), you simply set the `ttlInSeconds` metadata when publishing a message. 其他的状态存储将忽略这个值。 For some state stores, you can specify a default expiration on a per-table/container basis.

## 原生状态 TTL 支持

When state TTL has native support in the state store component, Dapr forwards the TTL configuration without adding any extra logic, maintaining predictable behavior. 当组件对过期状态的处理方式不同时，这很有帮助。

When a TTL is not specified, the default behavior of the state store is retained.

## 持久状态（忽略现有 TTL）

若要显式保留状态（忽略为密钥设置的任何 TTL），请指定 `ttlInSeconds` 值 `-1`。

## 受支持的组件

Refer to the TTL column in the [state store components guide]({{< ref supported-state-stores >}}).

## 示例

You can set state TTL in the metadata as part of the state store set request:

{{< tabs Python "HTTP API (Bash)" "HTTP API (PowerShell)">}}

{{% codetab %}}

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

To launch a Dapr sidecar and run the above example application, you'd then run a command similar to the following:

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 -- python3 OrderProcessingService.py
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

- See [the state API reference guide]({{< ref state_api.md >}}).
- 了解如何 [使用键值对来持久保存状态]({{< ref howto-get-save-state.md >}}).
- [状态存储组件]({{< ref supported-state-stores >}}) 列表.
- 阅读 [API 引用]({{< ref state_api.md >}}).
