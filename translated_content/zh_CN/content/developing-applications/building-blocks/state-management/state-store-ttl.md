---
type: docs
title: "指南：设置状态生存时间 （TTL）"
linkTitle: "指南：设置状态 TTL"
weight: 500
description: "通过生存时间管理状态。"
---

## 介绍

Dapr 允许对每个消息设置生存时间(TTL)。 这意味着应用程序可以为每个存储的状态设置生存时间，而这些状态在到期后不能被检索。

只有Dapr [状态存储组件]({{< ref supported-state-stores >}}) 的一个子集与状态TTL兼容。 对于支持的状态存储，只需在发布消息时设置 `ttlInSeconds` 元数据。 其他的状态存储将忽略这个值。

一些状态存储可以在每个表/容器的基础上指定一个默认的到期时间。 请参考这些 state stores 的官方文档，以利用所需的这一功能。 Dapr支持支持的状态存储的每状态TTL。

## 原生状态 TTL 支持

当状态存储组件中具有原生支持的状态实时性时，Dapr简单地转发实时性配置，不添加任何额外的逻辑，保持可预测的行为。 当组件对过期状态的处理方式不同时，这很有帮助。 当没有指定TTL时，将保留状态存储的默认行为。

## 持久状态（忽略现有 TTL）

若要显式保留状态（忽略为密钥设置的任何 TTL），请指定 `ttlInSeconds` 值 `-1`。

## 受支持的组件

请参考 [状态存储组件]({{< ref supported-state-stores >}})的表格中的TTL列。

## Example

消息 TTL 可以设置在元数据中，作为发布请求的一部分：

{{< tabs Python "HTTP API (Bash)" "HTTP API (PowerShell)">}}

{{% codetab %}}

```python
#dependencies

from dapr.clients import DaprClient

#code

DAPR_STORE_NAME = "statestore"

with DaprClient() as client:
        client.save_state(DAPR_STORE_NAME, "order_1", str(orderId), metadata=(
            ('ttlInSeconds', '120')
        )) 

```

导航到包含上述代码的目录，然后运行以下命令以启动 Dapr sidecar 并运行该应用程序：

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

参见 [本指南]({{< ref state_api.md >}}) 关于状态API的参考。

## 相关链接

- 了解如何 [使用键值对来持久保存状态]({{< ref howto-get-save-state.md >}})
- [状态存储组件]({{< ref supported-state-stores >}}) 列表
- 阅读 [API 引用]({{< ref state_api.md >}})