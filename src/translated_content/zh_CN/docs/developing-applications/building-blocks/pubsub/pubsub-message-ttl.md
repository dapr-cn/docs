---
type: docs
title: 消息生存时间 (TTL)
linkTitle: 消息 TTL
weight: 7000
description: 在 Pub/Sub 消息中使用生存时间。
---

## 介绍

Dapr 允许对每个消息设置生存时间(TTL)。 这意味着应用程序可以为每个消息设置生存时间，并且在过期后订阅者将不会收到这些消息。

所有Dapr [pub/sub组件]({{< ref supported-pubsub >}})都与消息TTL兼容，因为Dapr在运行时内处理TTL逻辑。 只需在发布消息时设置 `ttlInSeconds` 元数据。

在一些组件中，例如Kafka，可以根据[文档](https://kafka.apache.org/documentation/#topicconfigs_retention.ms)通过`retention.ms`在主题中配置消息的存活时间。 在 Dapr 中使用 TTL 消息时，使用 Kafka 的应用程序现在除了每个主题外，还可以设定每条消息的 TTL。

## 本机消息 TTL 支持

当消息的 TTL 在 Pub/Sub 组件中得到本机支持时，Dapr 仅仅 TTL 的配置，不会增加任何额外的逻辑，保持可预见的行为。 当组件以不同方式处理过期消息时，这是很有帮助的。 例如，使用 Azure Service Bus 时，过期的消息存储在死信队列中，而不仅仅是删除。

{{% alert title="注意" color="primary" %}}
您还可以在创建时为给定的消息代理设置消息 TTL。 根据你正在使用的组件的具体特性，看看这是否合适。



### 受支持的组件

#### Azure Service Bus

Azure Service Bus支持[实体级别的生存时间](https://docs.microsoft.com/azure/service-bus-messaging/message-expiration)。 这意味着消息有默认的 TTL，但也可以在发布时间设置更短的时间。 Dapr 会为消息传播 TTL 元数据，并允许 Azure Service Bus 直接处理过期时间。

## 非 Dapr 订阅者

如果订阅者不使用 Dapr 消费消息，则不会自动丢弃过期消息，因为过期时间是通过 Dapr 运行时在 Dapr sidecar 收到消息时处理的。 然而，订阅者可以通过在云事件中添加逻辑来处理 `expiration` 属性，以编程方式删除过期消息，该属性遵循[RFC3339](https://tools.ietf.org/html/rfc3339)格式。

当非 Dapr 订阅者使用 Azure Service Bus 等组件时，也就是在本机处理消息 TTL，就收不到过期的消息。 在这方面，不需要额外的逻辑。

## 如何使用Dapr扩展来开发和运行Dapr应用程序

消息 TTL 可以设置在元数据中，作为发布请求的一部分：



{{% codetab %}}

```bash
curl -X "POST" http://localhost:3500/v1.0/publish/pubsub/TOPIC_A?metadata.ttlInSeconds=120 -H "Content-Type: application/json" -d '{"order-number": "345"}'
```



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



{{< /tabs >}}

请参阅 [本指南]({{< ref pubsub_api.md >}}) 以获取关于Pub/sub（发布/订阅）API的参考。

## 下一步

- Learn about [topic scoping]({{< ref pubsub-scopes.md >}})
- 学习 [如何配置具有多个命名空间的 Pub/Sub 组件]({{< ref pubsub-namespaces.md >}})
- List of [pub/sub components]({{< ref supported-pubsub >}})
- Read the [API reference]({{< ref pubsub_api.md >}})
