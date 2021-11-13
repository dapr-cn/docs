---
type: docs
title: "消息生存时间"
linkTitle: "消息 TTL"
weight: 6000
description: "在 Pub/Sub 消息中使用生存时间。"
---

## 介绍

Dapr 允许对每个消息设置生存时间(TTL)。 这意味着应用程序可以设置每条消息的生存时间，并且这些消息过期后订阅者不会收到。

所有 Dapr [Pub/Sub组件]({{< ref supported-pubsub >}}) 与消息 TTL 兼容，因为 Dapr 在运行时内处理 TTL 逻辑。 只需在发布消息时设置 `ttlInseconds` 元数据。

在 Kafka 等组件中，可以通过[文档中](https://kafka.apache.org/documentation/#topicconfigs_retention.ms) `retention.ms` 在主题配置 TTL。 在 Dapr 中使用 TTL 消息时，使用 Kafka 的应用程序现在除了每个主题外，还可以设定每条消息的 TTL。

## 本机消息TTL支持

当消息的 TTL 在 Pub/Sub 组件中得到本机支持时，Dapr 仅仅 TTL 的配置，不会增加任何额外的逻辑，保持可预见的行为。 当组件以不同方式处理过期消息时，这是很有帮助的。 例如，使用 Azure Service Bus 时，过期的消息存储在死信队列中，而不仅仅是删除。

### 受支持的组件

#### Azure Service Bus

Azure Service Bus 支持 [实体级别的 TTL](https://docs.microsoft.com/azure/service-bus-messaging/message-expiration)。 这意味着消息有默认的 TTL，但也可以在发布时间设置更短的时间。 Dapr 会为消息传播 TTL 元数据，并允许 Azure Service Bus 直接处理过期时间。

## 非 Dapr 订阅者

如果订阅者不使用 Dapr 消费消息，则不会自动丢弃过期消息，因为过期时间是通过 Dapr 运行时在 Dapr sidecar 收到消息时处理的。 虽然，订阅者依然可以通过在CloudEvent中的 `expiration` 属性上添加代码来删掉过期消息。遵循 [RFC3339](https://tools.ietf.org/html/rfc3339) 格式.

当非 Dapr 订阅者使用 Azure Service Bus 等组件时，也就是在本机处理消息 TTL，就收不到过期的消息。 在这方面，不需要额外的逻辑。

## Example

消息 TTL 可以设置在元数据中，作为发布请求的一部分：

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
        metadata=(
                     ('ttlInSeconds', '120')
                 )
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

请参阅 [本指南]({{< ref pubsub_api.md >}}) 以获取关于 Pub/Sub API的参考。

## 相关链接

- 了解 [Topic 作用域]({{< ref pubsub-scopes.md >}})
- 学习 [如何配置具有多个命名空间的 Pub/Sub 组件]({{< ref pubsub-namespaces.md >}})
- [pub/sub组件列表]({{< ref supported-pubsub >}})
- 阅读 [API 引用]({{< ref pubsub_api.md >}})
