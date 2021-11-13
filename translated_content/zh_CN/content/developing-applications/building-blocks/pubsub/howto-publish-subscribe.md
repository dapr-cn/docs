---
type: docs
title: "指南：发布消息并订阅主题"
linkTitle: "How-To: Publish & subscribe"
weight: 2000
description: "了解如何使用一个服务向主题发送消息，并在另一个服务中订阅该主题"
---

## 介绍

Pub/Sub 是一个分布式系统中的常见模式，它有许多服务用于解偶、异步消息传递。 使用Pub/Sub，您可以在事件消费者与事件生产者解偶的场景中启用。

Dapr 提供了一个可扩展的 Pub/Sub 系统（保证消息至少传递一次），允许开发者发布和订阅主题。 Dapr 为 Pub/Sub 提供组件，使操作者能够使用他们所喜欢的基础设施，例如 Redis Streams 和 Kafka 等。

## 步骤 1: 设置 Pub/Sub 组件

当发布消息时，必须指定所发送数据的内容类型。 除非指定, Dapr 将假定类型为 `text/plain`。 当使用 Dapr 的 HTTP API时，内容类型可以设置在 `Content-Type` 头中。 gRPC 客户端和 SDK 有一个专用的内容类型参数。

## 步骤 1: 设置 Pub/Sub 组件
然后发布一条消息给 `deathStarStatus` 主题：

<img src="/images/pubsub-publish-subscribe-example.png" width=1000>
<br></br>

第一步是设置 Pub/Sub 组件：

{{< tabs "Self-Hosted (CLI)" Kubernetes >}}

{{% codetab %}}
运行 `dapr init` 时默认在本地机器上安装 Redis 流。

在 Linux/MacOS 上打开 `~/.dapr/components/pubsub.yam` 或在 Windows 上打开`%UserProfile%\.dapr\components\pubsub.yaml` 组件文件以验证:
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub
spec:
  type: pubsub.redis
  version: v1
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: ""
```

您可以重写这个文件以使用另一个 Redis 实例或者另一个 [pubsub component]({{< ref setup-pubsub >}}) ，通过创建 `components` 文件夹（文件夹中包含重写的文件）并在 `dapr run` 命令行界面使用 `--components-path` 标志。
{{% /codetab %}}

{{% codetab %}}
要将其部署到 Kubernetes 群集中，请为你想要的[ pubsub 组件]({{< ref setup-pubsub >}}) 在下面的 yaml `metadata` 中填写链接详情，保存为 `pubsub.yaml`，然后运行 `kubectl apply -f pubsub.yaml`。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub
  namespace: default
spec:
  type: pubsub.redis
  version: v1
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: ""
```
{{% /codetab %}}

{{< /tabs >}}


## 步骤 2: 订阅主题

Dapr 允许两种方法订阅主题：

- **声明式**，其中定义在外部文件中。
- **编程方式**，订阅在用户代码中定义

{{% alert title="Note" color="primary" %}}
 声明和编程方式都支持相同的功能。 声明的方式从用户代码中移除对 Dapr 的依赖性，并允许使用现有应用程序订阅主题。 编程方法在用户代码中实现订阅。

{{% /alert %}}

### 声明式订阅

您可以使用以下自定义资源定义 （CRD） 订阅主题。 创建名为 `subscription.yaml` 的文件并粘贴以下内容:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Subscription
metadata:
  name: myevent-subscription
spec:
  topic: deathStarStatus
  route: /dsstatus
  pubsubname: pubsub
scopes:
- app1
- app2
```

上面的示例显示了 `deathStarStatus`主题的事件订阅，对于pubsub 组件 `pubsub`。
- `route` 告诉 Dapr 将所有主题消息发送到应用程序中的 `/dsstatus` 端点。
- `scopes` 为 `app1` 和 `app2` 启用订阅。

设置组件：
{{< tabs "Self-Hosted (CLI)" Kubernetes>}}

{{% codetab %}}
将 CRD 放在 `./components` 目录中。 当 Dapr 启动时，它将加载组件和订阅。

注意：默认情况下，在 MacOS/Linux 上从 `$HOME/.dapr/components` 加载组件，以及 `%USERPROFILE%\.dapr\components` 在Windows上。

还可以通过将 Dapr CLI 指向组件路径来覆盖默认目录：

```bash
dapr run --app-id myapp --components-path ./myComponents -- python3 app1.py
```

*注意：如果你将订阅置于自定义组件路径中，请确保Pub/Sub 组件也存在。*

{{% /codetab %}}

{{% codetab %}}
在 Kubernetes 中，将 CRD 保存到文件中并将其应用于群集：

```bash
kubectl apply -f subscription.yaml
```
{{% /codetab %}}

{{< /tabs >}}

#### Example

{{< tabs Python Node PHP>}}

{{% codetab %}}
创建名为 `app1.py` 的文件，并粘贴以下内容：
```python
import flask
from flask import request, jsonify
from flask_cors import CORS
import json
import sys

app = flask.Flask(__name__)
CORS(app)

@app.route('/dsstatus', methods=['POST'])
def ds_subscriber():
    print(request.json, flush=True)
    return json.dumps({'success':True}), 200, {'ContentType':'application/json'}

app.run()
```
创建名为" `app1.py` 的文件，并粘贴如下内容：

```bash
pip install flask
pip install flask_cors
```

创建 `app1.py` 后，确保 flask 和 flask_cors 已经安装了：

```bash
dapr --app-id app1 --app-port 5000 run python app1.py
```
{{% /codetab %}}

{{% codetab %}}
设置上述订阅后，将此 javascript（Node > 4.16）下载到 `app2.js` 文件中：

```javascript
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.json({ type: 'application/*+json' }));

const port = 3000

app.post('/dsstatus', (req, res) => {
    console.log(req.body);
    res.sendStatus(200);
});

app.listen(port, () => console.log(`consumer app listening on port ${port}!`))
```
设置上述订阅后，将此 javascript（Node > 4.16）下载到 `app2.js` 文件中：

```bash
dapr --app-id app2 --app-port 3000 run node app2.js
```
{{% /codetab %}}

{{% codetab %}}

创建名为 `app1.py` 的文件，并粘贴以下内容：

```php
<?php

require_once __DIR__.'/vendor/autoload.php';

$app = \Dapr\App::create();
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

在创建 `app1.php`并安装 [SDK](https://docs.dapr.io/developing-applications/sdks/php/)后， 继续启动应用程序：

```bash
dapr --app-id app1 --app-port 3000 run -- php -S 0.0.0.0:3000 app1.php
```

{{% /codetab %}}

{{< /tabs >}}

### 编程方式订阅

若要订阅主题，请使用您选择的编程语言启动 Web 服务器，并监听以下 `GET` 终结点： `/dapr/subscribe`。 Dapr 实例将在启动时调用到您的应用，并期望对的订阅主题响应 JOSN：
- `pubsubname`: Dapr 用到的 pub/sub 组件
- `topic`: 订阅的主题
- `route`：当消息来到该主题时，Dapr 需要调用哪个终结点

#### Example

{{< tabs Python Node PHP>}}

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
                      'route': 'dsstatus'}]
    return jsonify(subscriptions)

@app.route('/dsstatus', methods=['POST'])
def ds_subscriber():
    print(request.json, flush=True)
    return json.dumps({'success':True}), 200, {'ContentType':'application/json'}
app.run()
```
创建名为" `app1.py` 的文件，并粘贴如下内容：

```bash
pip install flask
pip install flask_cors
```

创建 `app1.py` 后，确保 flask 和 flask_cors 已经安装了：

```bash
dapr --app-id app1 --app-port 5000 run python app1.py
```
{{% /codetab %}}

{{% codetab %}}
```javascript
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.json({ type: 'application/*+json' }));

const port = 3000

app.get('/dapr/subscribe', (req, res) => {
    res.json([
        {
            pubsubname: "pubsub",
            topic: "deathStarStatus",
            route: "dsstatus"
        }
    ]);
})

app.post('/dsstatus', (req, res) => {
    console.log(req.body);
    res.sendStatus(200);
});

app.listen(port, () => console.log(`consumer app listening on port ${port}!`))
```
设置上述订阅后，将此 javascript（Node > 4.16）下载到 `app2.js` 文件中：

```bash
dapr --app-id app2 --app-port 3000 run node app2.js
```
{{% /codetab %}}

{{% codetab %}}

更新 `app1.php`

```php
<?php

require_once __DIR__.'/vendor/autoload.php';

$app = \Dapr\App::create(configure: fn(\DI\ContainerBuilder $builder) => $builder->addDefinitions(['dapr.subscriptions' => [
    new \Dapr\PubSub\Subscription(pubsubname: 'pubsub', topic: 'deathStarStatus', route: '/dsstatus'),
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

设置上述订阅后，将此 javascript（Node > 4.16）下载到 `app2.js` 文件中：

```bash
dapr --app-id app1 --app-port 3000 run -- php -S 0.0.0.0:3000 app1.php
```

{{% /codetab %}}

{{< /tabs >}}

`/dsstatus` 终结点与订阅中定义的 `route` 相匹配，这是 Dapr 将所有主题消息发送至的位置。

## 步骤 3: 发布主题

要发布主题，您需要运行一个 Dapr sidecar 的实例才能使用 Pub/Sub Redis 组件。 您可以使用安装在您本地环境中的默认的Redis组件。

用名为 `testpubsub` 的 app-id 启动一个 Dapr 实例：

```bash
dapr run --app-id testpubsub --dapr-http-port 3500
```
{{< tabs "Dapr CLI" "HTTP API (Bash)" "HTTP API (PowerShell)">}}

{{% codetab %}}

然后发布一条消息给 `deathStarStatus` 主题：

```bash
dapr publish --publish-app-id testpubsub --pubsub pubsub --topic deathStarStatus --data '{"status": "completed"}'
```
{{% /codetab %}}

{{% codetab %}}
然后发布一条消息给 `deathStarStatus` 主题：
```bash
curl -X POST http://localhost:3500/v1.0/publish/pubsub/deathStarStatus -H "Content-Type: application/json" -d '{"status": "completed"}'
```
{{% /codetab %}}

{{% codetab %}}
然后发布一条消息给 `deathStarStatus` 主题：
```powershell
Invoke-RestMethod -Method Post -ContentType 'application/json' -Body '{"status": "completed"}' -Uri 'http://localhost:3500/v1.0/publish/pubsub/deathStarStatus'
```
{{% /codetab %}}

{{< /tabs >}}

Dapr 将在符合 Cloud Events v1.0 的信封中自动包装用户有效负载，对 `datacontenttype` 属性使用 `Content-Type` 头值。

## 步骤 4: ACK-ing 消息

为了告诉Dapr 消息处理成功，返回一个 `200 OK` 响应。 如果 Dapr 收到超过 `200` 的返回状态代码，或者你的应用崩溃，Dapr 将根据 At-Least-Once 语义尝试重新传递消息。

#### Example

{{< tabs Python Node>}}

{{% codetab %}}
```python
@app.route('/dsstatus', methods=['POST'])
def ds_subscriber():
    print(request.json, flush=True)
    return json.dumps({'success':True}), 200, {'ContentType':'application/json'}
```
{{% /codetab %}}

{{% codetab %}}
```javascript
app.post('/dsstatus', (req, res) => {
    res.sendStatus(200);
});
```
{{% /codetab %}}

{{< /tabs >}}

## (可选) 步骤5：发布带有代码的主题

{{< tabs Node PHP>}}

{{% codetab %}}
如果您喜欢使用代码发布一个主题，下面就是一个例子。

```javascript
const express = require('express');
const path = require('path');
const request = require('request');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const daprPort = process.env.DAPR_HTTP_PORT || 3500;
const daprUrl = `http://localhost:${daprPort}/v1.0`;
const port = 8080;
const pubsubName = 'pubsub';

app.post('/publish', (req, res) => {
  console.log("Publishing: ", req.body);
  const publishUrl = `${daprUrl}/publish/${pubsubName}/deathStarStatus`;
  request( { uri: publishUrl, method: 'POST', json: req.body } );
  res.sendStatus(200);
});

app.listen(process.env.PORT || port, () => console.log(`Listening on port ${port}!`));
```
{{% /codetab %}}

{{% codetab %}}

如果您喜欢使用代码发布一个主题，下面就是一个例子。

```php
<?php

require_once __DIR__.'/vendor/autoload.php';

$app = \Dapr\App::create();
$app->run(function(\DI\FactoryInterface $factory, \Psr\Log\LoggerInterface $logger) {
    $publisher = $factory->make(\Dapr\PubSub\Publish::class, ['pubsub' => 'pubsub']);
    $publisher->topic('deathStarStatus')->publish('operational');
    $logger->alert('published!');
});
```

您可以将此保存到 `app2.php` 当 `app1` 正在另一个终端中运行时，执行：

```bash
dapr --app-id app2 run -- php app2.php
```

{{% /codetab %}}

{{< /tabs >}}

## 发送自定义 CloudEvent

Dapr 自动接收发布请求上发送的数据，并将其包装在CloudEvent 1.0 信封中。 如果您想使用自己自定义的 CloudEvent，请确保指定内容类型为 `application/ cloudevents+json`。

[请在此处阅读有关内容类型](#content-types)，以及有关 [ Cloud Events 消息格式]({{< ref "pubsub-overview.md#cloud-events-message-format" >}})。

## 下一步

- 试试 [Pub/Sub 快速启动示例](https://github.com/dapr/quickstarts/tree/master/pub-sub)
- 了解 [Topic 作用域]({{< ref pubsub-scopes.md >}})
- 了解 [消息存活时间]({{< ref pubsub-message-ttl.md >}})
- 学习 [如何配置具有多个命名空间的 Pub/Sub 组件]({{< ref pubsub-namespaces.md >}})
- Pub/sub组件是可扩展的， [这里]({{< ref setup-pubsub >}})有支持的pub/sub组件列表，实现可以在[components-contrib repo](https://github.com/dapr/components-contrib)中找到。
- 阅读 [API 引用]({{< ref pubsub_api.md >}})
