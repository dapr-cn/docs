---
type: docs
title: "消息生存时间"
linkTitle: "消息 TTL"
weight: 7000
description: "Use time-to-live in pub/sub messages."
---

## Introduction

Dapr enables per-message time-to-live (TTL). This means that applications can set time-to-live per message, and subscribers do not receive those messages after expiration.

所有 Dapr [Pub/Sub组件]({{< ref supported-pubsub >}}) 与消息 TTL 兼容，因为 Dapr 在运行时内处理 TTL 逻辑。 只需在发布消息时设置 `ttlInseconds` 元数据。

在 Kafka 等组件中，可以通过[文档中](https://kafka.apache.org/documentation/#topicconfigs_retention.ms) `retention.ms` 在主题配置 TTL。 在 Dapr 中使用 TTL 消息时，使用 Kafka 的应用程序现在除了每个主题外，还可以设定每条消息的 TTL。

## 本机消息 TTL 支持

当消息的 TTL 在 Pub/Sub 组件中得到本机支持时，Dapr 仅仅 TTL 的配置，不会增加任何额外的逻辑，保持可预见的行为。 当组件以不同方式处理过期消息时，这是很有帮助的。 例如，使用 Azure Service Bus 时，过期的消息存储在死信队列中，而不仅仅是删除。

{{% alert title="Note" color="primary" %}}
 您还可以在创建时为给定的消息代理设置消息 TTL。 Look at the specific characteristic of the component that you are using to see if this is suitable.

{{% /alert %}}

### 受支持的组件

#### Azure Service Bus

Azure Service Bus supports [entity level time-to-live](https://docs.microsoft.com/azure/service-bus-messaging/message-expiration). This means that messages have a default time-to-live but can also be set with a shorter timespan at publishing time. Dapr propagates the time-to-live metadata for the message and lets Azure Service Bus handle the expiration directly.

## 非 Dapr 订阅者

If messages are consumed by subscribers not using Dapr, the expired messages are not automatically dropped, as expiration is handled by the Dapr runtime when a Dapr sidecar receives a message. However, subscribers can programmatically drop expired messages by adding logic to handle the `expiration` attribute in the cloud event, which follows the [RFC3339](https://tools.ietf.org/html/rfc3339) format.

When non-Dapr subscribers use components such as Azure Service Bus, which natively handle message TTL, they do not receive expired messages. Here, no extra logic is needed.

## 示例

Message TTL can be set in the metadata as part of the publishing request:

{{< tabs curl "Python SDK" "PHP SDK">}}

{{% codetab %}}
```bash
curl -X "POST" http://localhost:3500/v1.0/publish/pubsub/TOPIC_A?metadata.ttlInSeconds=120 -H "Content-Type: application/json" -d '{"order-number": "345"}'
```
{{% /codetab %}}

{{% codetab %}}
```python
from dapr.clients import DaprClient

with DaprClient() as d:
    req_data = {
        'order-number': '345'
    }
    # Create a typed message with content type and body
    resp = d.publish_event(
        pubsub_name='pubsub',
        topic='TOPIC_A',
        data=json.dumps(req_data),
        publish_metadata={'ttlInSeconds': '120'}
    )
    # Print the request
    print(req_data, flush=True)
```
{{% /codetab %}}

{{% codetab %}}

```php
<?php

require_once __DIR__.'/vendor/autoload.php';

$app = \Dapr\App::create();
$app->run(function(\DI\FactoryInterface $factory) {
    $publisher = $factory->make(\Dapr\PubSub\Publish::class, ['pubsub' => 'pubsub']);
    $publisher->topic('TOPIC_A')->publish('data', ['ttlInSeconds' => '120']);
});
```

{{% /codetab %}}

{{< /tabs >}}

See [this guide]({{< ref pubsub_api.md >}}) for a reference on the pub/sub API.

## 下一步

- 了解 [主题作用域]({{< ref pubsub-scopes.md >}})
- 学习 [如何配置具有多个命名空间的 Pub/Sub 组件]({{< ref pubsub-namespaces.md >}})
- [发布/订阅组件列表]({{< ref supported-pubsub >}})
- 阅读 [API 参考文档]({{< ref pubsub_api.md >}})
