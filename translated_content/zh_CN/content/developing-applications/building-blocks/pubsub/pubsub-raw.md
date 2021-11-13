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

Dapr 应用能够在没有云事件封装的情况下将原始事件发布到 pub/sub，以便与非 Dapr 应用兼容。

<img src="/images/pubsub_publish_raw.png" alt="图表展示了当订阅者没有使用Dapr或者云事件时如何用Dapr进行发布。" width=1000>

要禁用 CloudEvent 包装，请将 `rawPayload` 元数据设置为 `true` ，作为发布的一部分。 这允许订阅者接收这些消息，而不必分析 CloudEvent 。

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

Dapr 应用程序还能够订阅来自不使用 CloudEvent 封装的现有 pub/sub 的原始事件。

<img src="/images/pubsub_subscribe_raw.png" alt="图表展示了当订阅者没有使用Dapr或者云事件时如何用Dapr进行发布。" width=1000>

### 编程式订阅原始事件

在使用编程式订阅时，添加 `rawPayload` 元数据条目，以便 Dapr sidecar 自动将有效载荷包裹到与当前 Dapr SDK 兼容的 CloudEvent 中。

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

## 声明式订阅原始事件

Similarly, you can subscribe to raw events declaratively by adding the `rawPayload` metadata entry to your Subscription Custom Resource Definition (CRD):

```yaml
apiVersion: dapr.io/v1alpha1
kind: Subscription
metadata:
  name: myevent-subscription
spec:
  topic: deathStarStatus
  route: /dsstatus
  pubsubname: pubsub
  metadata:
    rawPayload: "true"
scopes:
- app1
- app2
```

## 相关链接

- 了解有关[如何发布和订阅]({{< ref howto-publish-subscribe.md >}})的详细信息
- [pub/sub组件列表]({{< ref supported-pubsub >}})
- 阅读 [API 引用]({{< ref pubsub_api.md >}})
