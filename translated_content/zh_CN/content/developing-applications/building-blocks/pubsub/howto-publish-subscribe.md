---
type: docs
title: "指南：发布消息并订阅主题"
linkTitle: "How-To: Publish & subscribe"
weight: 2000
description: "了解如何使用一个服务向主题发送消息，并在另一个服务中订阅该主题"
---

## 介绍

Pub/Sub 是一个分布式系统中的常见模式，它有许多服务用于解偶、异步消息传递。 使用Pub/Sub，您可以在事件消费者与事件生产者解偶的场景中启用。

Dapr 提供了一个可扩展的 Pub/Sub 系统（保证消息至少传递一次），允许开发者发布和订阅主题。 Dapr provides components for pub/sub, that enable operators to use their preferred infrastructure, for example Redis Streams, Kafka, etc.

## 步骤 1: 设置 Pub/Sub 组件

When publishing a message, it's important to specify the content type of the data being sent. Unless specified, Dapr will assume `text/plain`. When publishing a message, it's important to specify the content type of the data being sent. Unless specified, Dapr will assume `text/plain`. When using Dapr's HTTP API, the content type can be set in a `Content-Type` header. gRPC clients and SDKs have a dedicated content type parameter. gRPC clients and SDKs have a dedicated content type parameter.

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

- **声明**，其中订阅是在外部文件中定义的。
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

#### 示例

{{< tabs Python Node PHP>}}

{{% codetab %}}
Create a file named `app1.py` and paste in the following:
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
After setting up the subscription above, download this javascript (Node > 4.16) into a `app2.js` file:

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

Create a file named `app1.php` and paste in the following:

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

然后运行:

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

#### 示例

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
After creating `app1.py` ensure flask and flask_cors are installed:

```bash
pip install flask
pip install flask_cors
```

然后运行:

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
运行此应用：

```bash
dapr --app-id app2 --app-port 3000 run node app2.js
```
{{% /codetab %}}

{{% codetab %}}

Update `app1.php` with the following:

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

运行此应用：

```bash
dapr --app-id app1 --app-port 3000 run -- php -S 0.0.0.0:3000 app1.php
```

{{% /codetab %}}

{{< /tabs >}}

`/dsstatus` 终结点与订阅中定义的 `route` 相匹配，这是 Dapr 将所有主题消息发送至的位置。

## 步骤 3: 发布主题

To publish a topic you need to run an instance of a Dapr sidecar to use the pubsub Redis component. You can use the default Redis component installed into your local environment. You can use the default Redis component installed into your local environment.

Start an instance of Dapr with an app-id called `testpubsub`:

```bash
dapr run --app-id testpubsub --dapr-http-port 3500 
```
{{< tabs "Dapr CLI" "HTTP API (Bash)" "HTTP API (PowerShell)">}}

{{% codetab %}}

然后发布一条消息给 `deathStarStatus` 主题：

```bash
dapr publish --publish-app-id testpubapp --pubsub pubsub --topic deathStarStatus --data '{"status": "completed"}'
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

#### 示例

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

## (Optional) Step 5: Publishing a topic with code

{{< tabs Node PHP>}}

{{% codetab %}}
If you prefer publishing a topic using code, here is an example.

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

If you prefer publishing a topic using code, here is an example.

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

You can save this to `app2.php` and while `app1` is running in another terminal, execute:

```bash
dapr --app-id app2 run -- php app2.php
```

{{% /codetab %}}

{{< /tabs >}}

## Sending a custom CloudEvent

Dapr automatically takes the data sent on the publish request and wraps it in a CloudEvent 1.0 envelope. If you want to use your own custom CloudEvent, make sure to specify the content type as `application/cloudevents+json`. If you want to use your own custom CloudEvent, make sure to specify the content type as `application/cloudevents+json`.

See info about content types [here](#Content-Types).

## 下一步

- Try the [Pub/Sub quickstart sample](https://github.com/dapr/quickstarts/tree/master/pub-sub)
- Learn about [topic scoping]({{< ref pubsub-scopes.md >}})
- Learn about [message time-to-live]({{< ref pubsub-message-ttl.md >}})
- 您可以重写这个文件以使用另一个 Redis 实例或者另一个 [pubsub component]({{< ref setup-pubsub >}}) ，通过创建 `components` 文件夹（文件夹中包含重写的文件）并在 `dapr run` 命令行界面使用 `--components-path` 标志。
- List of [pub/sub components]({{< ref setup-pubsub >}})
- Read the [API reference]({{< ref pubsub_api.md >}})
