---
type: docs
title: "操作方法：将消息路由到不同的事件处理程序"
linkTitle: "操作方法：路由事件"
weight: 2300
description: "了解如何根据 CloudEvent 字段将消息从主题路由到不同的事件处理程序"
---

发布/订阅路由是 [基于内容的路由](https://www.enterpriseintegrationpatterns.com/ContentBasedRouter.html)，一种利用 DSL 而不是命令式应用程序代码的消息传递模式。 使用 pub/sub 路由，您可以使用表达式将 [CloudEvents](https://cloudevents.io) （根据其内容）路由到您应用程序中的不同 URI/路径和事件处理程序。 如果没有匹配的路由，那么将使用一个可选的默认路由。 当你的应用程序扩展到支持多个事件版本或特殊情况时，这就变得非常有用。

路由可以用代码来实现，然而，将路由规则保持在应用程序的外部可以提高可移植性。

此功能可供 [声明式和程序化订阅方法]({{< ref subscription-methods.md >}}).

## 声明式订阅

对于声明性订阅，请使用 `dapr.io/v2alpha1` 作为 `apiVersion`。 下面是一个 `subscriptions.yaml` 使用路由的例子。

```yaml
apiVersion: dapr.io/v2alpha1
kind: Subscription
metadata:
  name: myevent-subscription
spec:
  pubsubname: pubsub
  topic: inventory
  routes:
    rules:
      - match: event.type == "widget"
        path: /widgets
      - match: event.type == "gadget"
        path: /gadgets
    default: /products
scopes:
  - app1
  - app2
```

## 编程式订阅

在程序化方法中，返回的是 `routes` 结构，而不是 `route`。 JSON 结构与声明性 YAML 相匹配

{{< tabs Python Node "C#" Go PHP>}}

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
    subscriptions = [
      {
        'pubsubname': 'pubsub',
        'topic': 'inventory',
        'routes': {
          'rules': [
            {
              'match': 'event.type == "widget"',
              'path': '/widgets'
            },
            {
              'match': 'event.type == "gadget"',
              'path': '/gadgets'
            },
          ],
          'default': '/products'
        }
      }]
    return jsonify(subscriptions)

@app.route('/products', methods=['POST'])
def ds_subscriber():
    print(request.json, flush=True)
    return json.dumps({'success':True}), 200, {'ContentType':'application/json'}
app.run()
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
      topic: "inventory",
      routes: {
        rules: [
          {
            match: 'event.type == "widget"',
            path: '/widgets'
          },
          {
            match: 'event.type == "gadget"',
            path: '/gadgets'
          },
        ],
        default: '/products'
      }
    }
  ]);
})

app.post('/products', (req, res) => {
  console.log(req.body);
  res.sendStatus(200);
});

app.listen(port, () => console.log(`consumer app listening on port ${port}!`))
```
{{% /codetab %}}

{{% codetab %}}
```csharp
        [Topic("pubsub", "inventory", "event.type ==\"widget\"", 1)]
        [HttpPost("widgets")]
        public async Task<ActionResult<Stock>> HandleWidget(Widget widget, [FromServices] DaprClient daprClient)
        {
            // Logic
            return stock;
        }

        [Topic("pubsub", "inventory", "event.type ==\"gadget\"", 2)]
        [HttpPost("gadgets")]
        public async Task<ActionResult<Stock>> HandleGadget(Gadget gadget, [FromServices] DaprClient daprClient)
        {
            // Logic
            return stock;
        }

        [Topic("pubsub", "inventory")]
        [HttpPost("products")]
        public async Task<ActionResult<Stock>> HandleProduct(Product product, [FromServices] DaprClient daprClient)
        {
            // Logic
            return stock;
        }
```
{{% /codetab %}}

{{% codetab %}}
```golang
package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"

    "github.com/gorilla/mux"
)

const appPort = 3000

type subscription struct {
    PubsubName string            `json:"pubsubname"`
    Topic      string            `json:"topic"`
    Metadata   map[string]string `json:"metadata,omitempty"`
    Routes     routes            `json:"routes"`
}

type routes struct {
    Rules   []rule `json:"rules,omitempty"`
    Default string `json:"default,omitempty"`
}

type rule struct {
    Match string `json:"match"`
    Path  string `json:"path"`
}

// This handles /dapr/subscribe
func configureSubscribeHandler(w http.ResponseWriter, _ *http.Request) {
    t := []subscription{
        {
            PubsubName: "pubsub",
            Topic:      "inventory",
            Routes: routes{
                Rules: []rule{
                    {
                        Match: `event.type == "widget"`,
                        Path:  "/widgets",
                    },
                    {
                        Match: `event.type == "gadget"`,
                        Path:  "/gadgets",
                    },
                },
                Default: "/products",
            },
        },
    }

    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(t)
}

func main() {
    router := mux.NewRouter().StrictSlash(true)
    router.HandleFunc("/dapr/subscribe", configureSubscribeHandler).Methods("GET")
    log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", appPort), router))
}
```
{{% /codetab %}}

{{% codetab %}}
```php
<?php

require_once __DIR__.'/vendor/autoload.php';

$app = \Dapr\App::create(configure: fn(\DI\ContainerBuilder $builder) => $builder->addDefinitions(['dapr.subscriptions' => [
    new \Dapr\PubSub\Subscription(pubsubname: 'pubsub', topic: 'inventory', routes: (
      rules: => [
        ('match': 'event.type == "widget"', path: '/widgets'),
        ('match': 'event.type == "gadget"', path: '/gadgets'),
      ]
      default: '/products')),
]]));
$app->post('/products', function(
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

## 通用表达式语言(CEL)

在这些示例中，取决于 `event.type`，应用程序将被调用：

- `/widgets`
- `/gadgets`
- `/products`

表达式写成 [通用表达式语言（CEL）](https://github.com/google/cel-spec) 其中 `event` 代表 cloud event。 [CloudEvents 核心规范](https://github.com/cloudevents/spec/blob/v1.0.1/spec.md#required-attributes) 中的任何属性都可以在表达式中引用。

### 表达式示例

匹配 "important" 信息:

```javascript
has(event.data.important) && event.data.important == true
```

匹配大于10,000美元的存款:

```javascript
event.type == "deposit" && int(event.data.amount) > 10000
```
{{% alert title="Note" color="primary" %}}
默认情况下，数值以双精度浮点数的形式表示。 数值之间没有自动算术转换。 在这种情况下，如果 `event.data.amount` 没有转换为整数，则不会进行匹配。 有关更多信息，请参阅 [CEL 文档](https://github.com/google/cel-spec/blob/master/doc/langdef.md)。
{{% /alert %}}

匹配一个信息的多个版本:

```javascript
event.type == "mymessage.v1"
```

```javascript
event.type == "mymessage.v2"
```

## CloudEvent 属性

作为参考，以下属性来自 CloudEvents 规范。

### Event Data

#### data

由术语定义的 **data**、CloudEvents _可能_ 包括有关事件的特定于域的信息。 如果存在，该信息将被封装在 `data`中。

- **描述：** 事件负载。 本规范没有对这种信息的类型作出任何限制。 它被编码成由 `datacontenttype` 属性指定的媒体格式（例如application/json），并且当这些各自的属性存在时，遵守 `dataschema` 格式。
- **约束：**
  - 可选的

{{% alert title="Limitation" color="warning" %}}
目前，只有当数据是嵌套的JSON 值而不是在字符串中转义的 JSON 时，才有可能访问数据内部的属性。
{{% /alert %}}

### 必需的属性

以下属性在所有CloudEvents中都是 **必需的** ：

#### id

- **类型**：`字符串`
- **描述:** 识别事件。 生产者 _必须_ 确保 `source` + `id` 对于每个不同的事件都是唯一的。 如果一个重复的事件被重新发送（例如，由于 网络错误），它可能具有相同的 `id`。 使用者可能会认为具有相同 `source` 和 `id` 事件是重复的。
- **约束：**
  - 必需的
  - 必须是一个非空的字符串
  - 在生产者的范围内必须是唯一的。
- **示例:**
  - 一个由生产者维护的事件计数器
  - 一个 UUID

#### source

- **类型：** `URI 引用`
- **描述：** 标识事件发生的上下文。 通常包括以下信息:
  - 事件源的类型
  - 发布事件的组织
  - 生成事件的过程

  URI中编码的数据背后的确切语法和语义是由 事件生产者定义的。

  生产者 _必须_ 确保 `source` + `id` 对于每个不同的事件都是唯一的。

  一个应用程序可能：
  - 分配唯一的 `source` 为每个不同的生产者，从而更容易生成唯一的 ID，并防止其他生产者拥有相同的 ID `source`.
  - 使用UUID、URN、DNS授权或应用程序特定的方案来创建唯一的 `source` 标识符。

  一个来源可以包括一个以上的生产者。 在这种情况下，生产者 _必须_ 合作确保每个不同的事件的 `source` + `id` 都是唯一的。

- **约束：**
  - 必需的
  - 必须是一个非空的 URI-reference
  - 建议使用绝对 URI
- **示例:**
  - 具有 DNS 权限的互联网范围的唯一 URI。
    - https://github.com/cloudevents
    - mailto:cncf-wg-serverless@lists.cncf.io
  - 具有 UUID 的普遍唯一的 URN。
    - urn:uuid:6e8bc430-9c3a-11d9-9669-0800200c9a66
  - 特定应用的标识符:
    - /cloudevents/spec/pull/123
    - /sensors/tn-1234567/alerts
    - 1-555-123-4567

#### specversion

- **类型**：`字符串`
- **描述：** 事件使用的 CloudEvents 规范版本。 这使人们能够对背景进行解释。 合规事件生成者 _必须_ 使用值 `1.0` 当引用此版本的规范时。

  目前，这个属性只包括 '主要' 和 '次要' 版本数字。 这允许对规范进行 '补丁' 修改而不改变序列化中这个属性的值。

  注意：对于 'release candidate' 发布版本，可能会使用一个后缀来测试 目的。

- **约束：**
  - 必需的
  - 必须是一个非空的字符串

#### type

- **类型**：`字符串`
- **描述：** 包含一个值，该值描述与原始事件相关的事件类型。 通常，此属性用于路由、可观测性、策略执行等。 该格式由生产者定义，可能包含以下信息： `type`. 更多信息请参见 [Primer 中的 CloudEvents 的版本控制](https://github.com/cloudevents/spec/blob/v1.0.1/primer.md#versioning-of-cloudevents) 。
- **约束：**
  - 必需的
  - 必须是一个非空的字符串
  - 应该以反向 DNS 名称为前缀。 前缀域指示定义此事件类型的语义组织。
- **示例:**
  - com.github.pull_request. opened
  - com.example.object.delete.v2

### OPTIONAL属性

以下出现在CloudEvents中属性是 **选填的**。 参见 [Notational Conventions](https://github.com/cloudevents/spec/blob/v1.0.1/spec.md#notational-conventions) 部分，了解更多关于 OPTIONAL 定义的信息 。

#### datacontenttype

- **类型：** `字符串` [RFC 2046](https://tools.ietf.org/html/rfc2046)
- **描述：**` data` 的内容类型 值。 这个属性使 `data` 能够 携带任何类型的内容，其格式和编码可能与所选事件格式的 不同。

  例如，使用 [JSON 信封](https://github.com/cloudevents/spec/blob/v1.0.1/json-format.md#3-envelope) 格式呈现的事件可能在 `data`中携带 XML 负载。 此属性设置为 `"application/xml"`，通知消费者。

  如何操作的规则 `data` 内容呈现为不同的 `datacontenttype` 值在事件格式规范中定义。 例如，JSON 事件格式定义了 [第3.1节](https://github.com/cloudevents/spec/blob/v1.0.1/json-format.md#31-handling-of-data).

  对于一些二进制模式的协议绑定，这个字段被直接映射到 各自协议的内容类型元数据属性。 你可以在相应的协议中找到二进制模式和内容类型元数据映射的规范性规则。

  在某些事件格式中，您可以省略 `datacontenttype` 属性。 例如，如果 JSON 格式事件没有 `dataconttype` 属性，则 暗示 `data` 是符合"application/json" 媒体类型的 JSON 值。 换句话说：没有 `datacontenttype` 的 JSON 格式事件与 `datacontenttype="application/json"`的事件完全等效。

  当把一个没有 `datacontenttype` 属性的事件消息翻译成一个 不同的格式或协议绑定。目标 `datacontenttype` 应该被 明确地设置为源的隐含 `datacontenttype` 。

- **约束：**
  - 可选的
  - 如果存在，必须遵守 [RFC 2046](https://tools.ietf.org/html/rfc2046)的格式。
- 媒体类型的例子见 [IANA媒体类型](http://www.iana.org/assignments/media-types/media-types.xhtml)

#### dataschema

- **类型：** `URI`
- **描述：** 识别符合 `data` 的模式。 对模式的不兼容的改变应该由一个不同的URI来反映。 更多信息请参见 [Primer 中的 CloudEvents 的版本控制](https://github.com/cloudevents/spec/blob/v1.0.1/primer.md#versioning-of-cloudevents) 。
- **约束：**
  - 可选的
  - 如果存在，必须是一个非空的 URI

#### subject

- **类型**：`字符串`
- **描述：** 这描述了事件生产者（由 `source`标识）的事件主题。 在发布-订阅场景中，订阅者通常会订阅由 `source`发出的事件。 如果 `source` 的标识符本身可能不足以作为任何特定事件的限定符，因为 `source` 的上下文有内部子结构。

  在上下文元数据中标识事件的主题（而不是仅在 `data` payload） 在通用订阅过滤场景中很有帮助，其中中间件无法解释 `data` 内容。 在上面的示例中，订阅者可能只对以'.jpg'或'.jpeg'结尾的 blob 感兴趣。 使用 `subject` 属性，您可以为该事件子集构建一个简单高效的字符串后缀过滤器。

- **约束：**
  - 可选的
  - 如果存在，必须是一个非空的字符串
- **示例：**  
  当一个订阅者注册了对在 blob 存储容器内创建新 blob 的兴趣时。 本例中：
  - 事件的 `source` 用于标识订阅范围（存储容器）
  - 事件 `type` 用于标识“blob created”事件
  - 事件的 ` Id` 是唯一标识事件实例的，用于区分同名 blob 的独立创建的发生次数。

  新创建的 blob 的名称在 `subject`中传递：
  - `source`: https://example.com/storage/tenant/container
  - `subject`: mynewfile.jpg

#### time

- **类型：** `时间戳`
- **描述：** 发生的时间戳。 如果无法确定发生的时间，则云事件生产者可以将此属性设置为其他时间（例如当前时间）。 但是，所有生产者都一样 `source` _必须_ 在这方面要保持一致。 换句话来说，要么它们都使用实际发生的时间，要么它们都使用相同的算法来确定使用的数值。
- **约束：**
  - 可选的
  - 如果存在，必须遵守 [RFC 3339](https://tools.ietf.org/html/rfc3339)的格式。

{{% alert title="Limitation" color="warning" %}}
目前，不支持对时间的比较（如 "现在"之前或之后）。
{{% /alert %}}

## 社区示例

观看 [这个视频](https://www. youtube. com/watch? v=QqJgRmbH82I& t=1063s) 关于如何使用 pub/sub 的消息路由。

<p class="embed-responsive embed-responsive-16by9">
<iframe width="688" height="430" src="https://www.youtube-nocookie.com/embed/QqJgRmbH82I?start=1063" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</p>

## 下一步

- 尝试 [pub/sub 路由示例](https://github.com/dapr/samples/tree/master/pub-sub-routing)。
- 了解 [主题范围]({{< ref pubsub-scopes.md >}}) 和 [消息存活时间]({{< ref pubsub-message-ttl.md >}})。
- [使用多个命名空间配置发布/订阅组件]({{< ref pubsub-namespaces.md >}})。
- 查看 [发布/订阅 组件列表]({{< ref setup-pubsub >}})。
- 阅读 [API 参考手册]({{< ref pubsub_api.md >}})。
