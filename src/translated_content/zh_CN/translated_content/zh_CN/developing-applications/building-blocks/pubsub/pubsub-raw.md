---
type: docs
title: 发布和订阅没有CloudEvents的消息
linkTitle: 没有 CloudEvents 的消息
weight: 2200
description: 学习何时不使用CloudEvents以及如何禁用它们。
---

当添加 Dapr 到你的应用时，由于兼容性原因或某些应用程序不使用 Dapr，一些服务可能仍需要通过未封装在 CloudEvents 中的发布/订阅消息进行通信。 这些被称为“原始”发布/订阅消息。 Dapr使应用程序能够[发布和订阅原始事件]({{< ref "pubsub-cloudevents.md#publishing-raw-messages" >}})，这些事件未包装在CloudEvent中以实现兼容性。

## 发布原始消息

Dapr 应用能够在没有 CloudEvent 封装的情况下将原始事件发布到 pub/sub，以便与非 Dapr 应用兼容。

<img src="/images/pubsub_publish_raw.png" alt="Diagram showing how to publish with Dapr when subscriber does not use Dapr or CloudEvent" width=1000>

{{% alert title="警告" color="warning" %}}
不使用 CloudEvents 将禁用对追踪、每个 messageId 的事件重复数据删除、content-type 元数据以及使用 CloudEvent 架构构建的任何其他功能的支持。
{{% /alert %}}

要禁用 CloudEvent 包装，请将 `rawPayload` 元数据设置为 `true` ，作为发布的一部分。 这允许订阅者接收这些消息，而不必分析 CloudEvent 。



{{% codetab %}}

```bash
curl -X "POST" http://localhost:3500/v1.0/publish/pubsub/TOPIC_A?metadata.rawPayload=true -H "Content-Type: application/json" -d '{"order-number": "345"}'
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
        topic_name='TOPIC_A',
        data=json.dumps(req_data),
        publish_metadata={'rawPayload': 'true'}
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
    $publisher->topic('TOPIC_A')->publish('data', ['rawPayload' => 'true']);
});
```



{{< /tabs >}}

## 订阅原始消息

Dapr 应用程序还能够订阅来自不使用 CloudEvent 封装的现有 pub/sub 的原始事件。

<img src="/images/pubsub_subscribe_raw.png" alt="Diagram showing how to subscribe with Dapr when publisher does not use Dapr or CloudEvent" width=1000>

### 以编程方式订阅原始事件

在使用编程式订阅时，添加额外的元数据条目`rawPayload`，这样Dapr sidecar就会自动将有效载荷包装到与当前Dapr SDK兼容的CloudEvent中。



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



## 声明式订阅原始事件

同样，您可以通过将`rawPayload`元数据条目添加到您的订阅规范中，以声明方式订阅原始事件。

```yaml
apiVersion: dapr.io/v2alpha1
kind: Subscription
metadata:
  name: myevent-subscription
spec:
  topic: deathStarStatus
  routes: 
    default: /dsstatus
  pubsubname: pubsub
  metadata:
    rawPayload: "true"
scopes:
- app1
- app2
```

## 下一步

- 了解有关[发布和订阅消息]({{< ref pubsub-overview\.md >}})
- List of [pub/sub components]({{< ref supported-pubsub >}})
- Read the [API reference]({{< ref pubsub_api.md >}})
