---
type: docs
title: "消息生存时间 (TTL)"
linkTitle: "消息 TTL"
weight: 7000
description: "在发布/订阅消息中使用生存时间。"
---

## 介绍

Dapr 支持为每条消息设置生存时间 (TTL)。这意味着应用程序可以为每条消息指定生存时间，过期后订阅者将不会收到这些消息。

所有 Dapr [发布/订阅组件]({{< ref supported-pubsub >}}) 都兼容消息 TTL，因为 Dapr 在运行时内处理 TTL 逻辑。只需在发布消息时设置 `ttlInSeconds` 元数据即可。

在某些组件中，例如 Kafka，可以通过 `retention.ms` 在主题中配置生存时间，详见[文档](https://kafka.apache.org/documentation/#topicconfigs_retention.ms)。使用 Dapr 的消息 TTL，使用 Kafka 的应用程序现在可以为每条消息设置生存时间，而不仅限于每个主题。

## 原生消息 TTL 支持

当发布/订阅组件原生支持消息生存时间时，Dapr 仅转发生存时间配置而不添加额外逻辑，保持行为的可预测性。这在组件以不同方式处理过期消息时非常有用。例如，在 Azure Service Bus 中，过期消息会被存储在死信队列中，而不是简单地删除。

{{% alert title="注意" color="primary" %}}
您还可以在创建时为给定的消息代理设置消息 TTL。查看您正在使用的组件的特定特性，以确定这是否合适。

{{% /alert %}}

### 支持的组件

#### Azure Service Bus

Azure Service Bus 支持[实体级别的生存时间](https://docs.microsoft.com/azure/service-bus-messaging/message-expiration)。这意味着消息有默认的生存时间，但也可以在发布时设置为更短的时间跨度。Dapr 传播消息的生存时间元数据，并让 Azure Service Bus 直接处理过期。

## 非 Dapr 订阅者

如果消息由不使用 Dapr 的订阅者消费，过期消息不会自动丢弃，因为过期是由 Dapr 运行时在 Dapr sidecar 接收到消息时处理的。然而，订阅者可以通过在云事件中添加逻辑来处理 `expiration` 属性，以编程方式丢弃过期消息，该属性遵循 [RFC3339](https://tools.ietf.org/html/rfc3339) 格式。

当非 Dapr 订阅者使用诸如 Azure Service Bus 等原生处理消息 TTL 的组件时，他们不会收到过期消息。在这种情况下，不需要额外的逻辑。

## 示例

消息 TTL 可以在发布请求的元数据中设置：

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
    # 创建一个带有内容类型和主体的类型化消息
    resp = d.publish_event(
        pubsub_name='pubsub',
        topic='TOPIC_A',
        data=json.dumps(req_data),
        publish_metadata={'ttlInSeconds': '120'}
    )
    # 打印请求
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

请参阅[本指南]({{< ref pubsub_api.md >}})以获取发布/订阅 API 的参考。

## 下一步

- 了解[主题范围]({{< ref pubsub-scopes.md >}})
- 学习[如何配置具有多个命名空间的发布/订阅组件]({{< ref pubsub-namespaces.md >}})
- [发布/订阅组件]({{< ref supported-pubsub >}})列表
- 阅读[API 参考]({{< ref pubsub_api.md >}})
