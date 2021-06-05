---
type: docs
title: "无 CloudEvents 的发布/订阅"
linkTitle: "无 CloudEvents 的发布/订阅"
weight: 7000
description: "在没有 CloudEvents 的情况下使用发布订阅"
---

## 介绍

Dapr 使用 CloudEvents 为事件负载提供额外的上下文，从而启用以下功能：
* 追踪
* 按消息 Id 进行重复数据删除
* 用于正确反序列化事件数据的 Content-type

更多关于 CloudEvents 的信息，查看 [ CloudEvents 规范](https://github.com/cloudevents/spec)。

当添加 Dapr 到你的应用时，某些服务可能仍需要通过未封装在 CloudEvents 中的原始发布/订阅消息进行通信。 这可能是出于兼容性原因，或者因为某些应用程序没有使用 Dapr。 Dapr 允许应用程序发布和订阅未包装在 CloudEvent 中的原始事件。

{{% alert title="Warning" color="warning" %}}
不使用 CloudEvents 将禁用对追踪、每个 messageId 的事件重复数据删除、content-type 元数据以及使用 CloudEvent 架构构建的任何其他功能的支持。
{{% /alert %}}

## 发布原始消息

Dapr apps are able to publish raw events to pub/sub topics without CloudEvent encapsulation, for compatibility with non-Dapr apps.

<img src="/images/pubsub_publish_raw.png" alt="Diagram showing how to publish with Dapr when subscriber does not use Dapr or CloudEvent" width=1000>

To disable CloudEvent wrapping, set the `rawPayload` metadata to `true` as part of the publishing request. This allows subscribers to receive these messages without having to parse the CloudEvent schema.

{{< tabs curl "Python SDK" "PHP SDK">}}

{{% codetab %}}
```bash
curl -X "POST" http://localhost:3500/v1.0/publish/pubsub/TOPIC_A?metadata.rawPayload=true -H "Content-Type: application/json" -d '{"order-number": "345"}'
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
                     ('rawPayload', 'true')
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
    $publisher->topic('TOPIC_A')->publish('data', ['rawPayload' => 'true']);
});
```

{{% /codetab %}}

{{< /tabs >}}

## 订阅原始消息

Dapr apps are also able to subscribe to raw events coming from existing pub/sub topics that do not use CloudEvent encapsulation.

<img src="/images/pubsub_subscribe_raw.png" alt="Diagram showing how to subscribe with Dapr when publisher does not use Dapr or CloudEvent" width=1000>


### Programmatically subscribe to raw events

When subscribing programmatically, add the additional metadata entry for `rawPayload` so the Dapr sidecar automatically wraps the payloads into a CloudEvent that is compatible with current Dapr SDKs.

{{< tabs "Python" "PHP SDK" >}}

{{% codetab %}}

```python
import flask
from flask import request, jsonify
from flask_cors import CORS
import json
import sys

app = flask.Flask(__name__)
CORS(app)

@app.route('/dapr/subscribe', methods=['GET'])
def subscribe():
    subscriptions = [{'pubsubname': 'pubsub',
                      'topic': 'deathStarStatus',
                      'route': 'dsstatus',
                      'metadata': {
                          'rawPayload': 'true',
                      } }]
    return jsonify(subscriptions)

@app.route('/dsstatus', methods=['POST'])
def ds_subscriber():
    print(request.json, flush=True)
    return json.dumps({'success':True}), 200, {'ContentType':'application/json'}

app.run()
```

{{% /codetab %}}
{{% codetab %}}

```php
<?php

require_once __DIR__.'/vendor/autoload.php';

$app = \Dapr\App::create(configure: fn(\DI\ContainerBuilder $builder) => $builder->addDefinitions(['dapr.subscriptions' => [
    new \Dapr\PubSub\Subscription(pubsubname: 'pubsub', topic: 'deathStarStatus', route: '/dsstatus', metadata: [ 'rawPayload' => 'true'] ),
]]));

$app->post('/dsstatus', function(
    #[\Dapr\Attributes\FromBody]
    \Dapr\PubSub\CloudEvent $cloudEvent,
    \Psr\Log\LoggerInterface $logger
    ) {
        $logger->alert('Received event: {event}', ['event' => $cloudEvent]);
        return ['status' => 'SUCCESS'];
    }
);

$app->start();
```
{{% /codetab %}}

{{< /tabs >}}


## Declaratively subscribe to raw events

Subscription Custom Resources Definitions (CRDs) do not currently contain metadata attributes ([issue #3225](https://github.com/dapr/dapr/issues/3225)). At this time subscribing to raw events can only be done through programmatic subscriptions.

## 相关链接

- 了解有关[如何发布和订阅]({{< ref howto-publish-subscribe.md >}})的详细信息
- [pub/sub组件列表]({{< ref supported-pubsub >}})
- 阅读 [API 引用]({{< ref pubsub_api.md >}})
