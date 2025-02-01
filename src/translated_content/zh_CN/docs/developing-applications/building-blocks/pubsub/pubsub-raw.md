---
type: docs
title: "发布和订阅非CloudEvents消息"
linkTitle: "非CloudEvents消息"
weight: 2200
description: "了解何时可能不使用CloudEvents以及如何禁用它们。"
---

在将Dapr集成到您的应用程序时，由于兼容性原因或某些应用程序不使用Dapr，某些服务可能仍需要通过不封装在CloudEvents中的pub/sub消息进行通信。这些消息被称为“原始”pub/sub消息。Dapr允许应用程序[发布和订阅原始事件]({{< ref "pubsub-cloudevents.md#publishing-raw-messages" >}})，这些事件未封装在CloudEvent中以实现兼容性。

## 发布原始消息

Dapr应用程序可以将原始事件发布到pub/sub主题中，而不需要CloudEvent封装，以便与非Dapr应用程序兼容。

<img src="/images/pubsub_publish_raw.png" alt="显示当订阅者不使用Dapr或CloudEvent时如何使用Dapr发布的图示" width=1000>

{{% alert title="警告" color="warning" %}}
不使用CloudEvents会禁用对跟踪、每个messageId的事件去重、内容类型元数据以及任何其他基于CloudEvent架构构建的功能的支持。
{{% /alert %}}

要禁用CloudEvent封装，请在发布请求中将`rawPayload`元数据设置为`true`。这样，订阅者可以接收这些消息而无需解析CloudEvent架构。

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
    # 创建一个带有内容类型和主体的类型化消息
    resp = d.publish_event(
        pubsub_name='pubsub',
        topic_name='TOPIC_A',
        data=json.dumps(req_data),
        publish_metadata={'rawPayload': 'true'}
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
    $publisher->topic('TOPIC_A')->publish('data', ['rawPayload' => 'true']);
});
```

{{% /codetab %}}

{{< /tabs >}}

## 订阅原始消息

Dapr应用程序还可以订阅来自不使用CloudEvent封装的现有pub/sub主题的原始事件。

<img src="/images/pubsub_subscribe_raw.png" alt="显示当发布者不使用Dapr或CloudEvent时如何使用Dapr订阅的图示" width=1000>

### 以编程方式订阅原始事件

在以编程方式订阅时，添加`rawPayload`的额外元数据条目，以便Dapr sidecar自动将负载封装到与当前Dapr SDK兼容的CloudEvent中。

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

同样，您可以通过在订阅规范中添加`rawPayload`元数据条目来声明式地订阅原始事件。

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

- 了解更多关于[发布和订阅消息]({{< ref pubsub-overview.md >}})
- [pub/sub组件]({{< ref supported-pubsub >}})列表
- 阅读[API参考]({{< ref pubsub_api.md >}})
