---
type: docs
title: "操作方法：将消息路由到不同的事件处理程序"
linkTitle: "操作方法：路由事件"
weight: 2100
description: "了解如何根据 CloudEvent 字段将消息从主题路由到不同的事件处理程序"
---

{{% alert title="Preview feature" color="warning" %}}
Pub/Sub 消息路由目前处于 [预览]({{< ref preview-features.md >}}) 中。
{{% /alert %}}

## 介绍

[基于内容的路由](https://www.enterpriseintegrationpatterns.com/ContentBasedRouter.html) 是一种消息传递模式，它利用 DSL 而不是指令性应用代码。 PubSub 路由是这种模式的一种实现，它允许开发者使用表达式将 [CloudEvents](https://cloudevents.io) 根据其内容路由到你的应用程序中的不同 URI/paths 和事件处理程序。 如果没有匹配的路由，那么将使用一个可选的默认路由。 当你的应用程序扩展到支持多个事件版本或特殊情况时，这就变得非常有用。 路由可以用代码来实现；然而，将路由规则保持在应用程序的外部可以提高可移植性。

声明式和编程式订阅方法都可以使用这一功能。

## 启用信息路由

这是一个预览功能。 若要启用它，请将 `PubSub.Routing` 功能条目添加到应用程序配置中，如下所示：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: pubsubroutingconfig
spec:
  features:
    - name: PubSub.Routing
      enabled: true
```
了解更多关于启用 [预览功能]({{<ref preview-features>}}) 的信息。
## 声明式订阅

对于声明式订阅，你必须使用 `dapr.io/v2alpha1` 作为 `apiVersion`。 下面是一个 `subscriptions.yaml` 使用路由的例子。

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

另外，编程式订阅的方法略有不同，即返回 `routes` 结构而不是 `route`。 JSON 结构与声明性 YAML 相匹配

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

在这些例子中，根据事件的类型（`event.type`），应用程序将在 `/widgets`, `/gadgets` 或 `/products`上调用。 表达式写成 [通用表达式语言（CEL）](https://github.com/google/cel-spec) 其中 `event` 代表 cloud event。 [CloudEvents 核心规范](https://github.com/cloudevents/spec/blob/v1.0.1/spec.md#required-attributes) 中的任何属性都可以在表达式中引用。

### 表达式示例

匹配 "important" 信息

```javascript
has(event.data.important) && event.data.important == true
```

匹配大于10000美元的存款

```javascript
event.type == "deposit" && event.data.amount > 10000
```

匹配一个信息的多个版本

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

根据术语 "Data" 的定义，CloudEvents 可能包括有关事件的特定于域的信息。 如果存在，该信息将被封装在 `data`中。

- 描述：事件负载。 本规范没有对这种信息的类型作出任何限制。 它被编码成由 `datacontenttype` 属性指定的媒体格式（例如application/json），并且当这些各自的属性存在时，遵守 `dataschema` 格式。
- 约束：
  - 可选的

{{% alert title="Limitation" color="warning" %}}
目前，只有当数据是嵌套的JSON 值而不是在字符串中转义的 JSON 时，才有可能访问数据内部的属性。
{{% /alert %}}

### 必需的属性

以下属性必须存在于所有 CloudEvent 中：

#### id

- 类型：`String`
- 描述：标识事件。 生产者必须确保 `source` + `id` 对于每个不同的事件是唯一的。 如果一个重复的事件被重新发送（例如，由于 网络错误），它可能具有相同的 `id`。 使用者可能会认为具有相同 `source` 和 `id` 事件是重复的。
- 约束：
  - 必需的
  - 必须是一个非空的字符串
  - 在生产者的范围内必须是唯一的。
- 示例:
  - 一个由生产者维护的事件计数器
  - 一个 UUID

#### source

- 类型: `URI-reference`
- 描述：标识事件发生的上下文。 通常这个 将包括诸如事件源的类型、发布事件的 组织或产生事件的过程等信息。 URI中编码的数据背后的确切语法和语义是由 事件生产者定义的。

  生产者必须确保 `source` + `id` 对于每个不同的事件是唯一的。

  一个应用程序可以给每个不同的生产者分配一个唯一的 `source` ，这使得生成唯一的ID很容易，因为没有其他生产者会有相同的源。 应用程序可以使用UUIDs、URNs、DNS授权或 应用程序特定的方案来创建唯一的 `source` 标识。

  一个来源可以包括一个以上的生产者。 生产者必须确保 `source` + `id` 对于每个不同的事件是唯一的。

- 约束：
  - 必需的
  - 必须是一个非空的 URI-reference
  - 建议使用绝对 URI
- 示例
  - 具有 DNS 权限的互联网范围的唯一 URI。
    - https://github.com/cloudevents
    - mailto:cncf-wg-serverless@lists.cncf.io
  - 具有 UUID 的普遍唯一的 URN。
    - urn:uuid:6e8bc430-9c3a-11d9-9669-0800200c9a66
  - 特定应用的标识符
    - /cloudevents/spec/pull/123
    - /sensors/tn-1234567/alerts
    - 1-555-123-4567

#### specversion

- 类型：`String`
- 描述：事件使用的 CloudEvents 规范版本。 这使人们能够对背景进行解释。 符合要求的事件 生产者在提到这个版本的 规范时，必须使用 `1.0的值` 。

  目前，这个属性只包括 "主要 "和 "次要 "版本 数字。 这允许对规范 进行 "补丁 "修改而不改变序列化中这个属性的值。 注意：对于 "候选发布版本"，可能会使用一个后缀来测试 目的。

- 约束：
  - 必需的
  - 必须是一个非空的字符串

#### type

- 类型：`String`
- Description：此属性包含一个值，该值描述与原始事件相关的事件 类型。 通常这个属性用于 路由、可观察性、策略执行等。 其格式是 生产者定义的，可能包括诸如 `类型` 的版本等信息--详见 [入门手册](https://github.com/cloudevents/spec/blob/v1.0.1/primer.md#versioning-of-cloudevents) 中CloudEvents的版本划分。
- 约束：
  - 必需的
  - 必须是一个非空的字符串
  - 应该以反向 DNS 名称为前缀。 前缀域指示定义此事件类型的语义组织。
- 示例
  - com.github.pull_request. opened
  - com.example.object.delete.v2

### OPTIONAL属性

以下属性是出现在 CloudEvents 中的可选属性。 参见 [Notational Conventions](https://github.com/cloudevents/spec/blob/v1.0.1/spec.md#notational-conventions) 部分，了解更多关于 OPTIONAL 定义的信息 。

#### datacontenttype

- 类型： `String` ，每个 [RFC 2046](https://tools.ietf.org/html/rfc2046)
- 描述： `data` 值的内容类型。 这个属性使 `data` 能够 携带任何类型的内容，其格式和编码可能与所选事件格式的 不同。 例如，一个使用 [JSON封装](https://github.com/cloudevents/spec/blob/v1.0.1/json-format.md#3-envelope) 格式渲染的事件可能在 `data`中携带一个XML有效载荷，并且消费者通过这个属性被设置为 "application/xml "来通知。 对于不同的 `data` 内容如何呈现的规则 `datacontenttype` 值在事件格式规范中定义；对于 例子，JSON事件格式在定义了这种关系 [ 部分 3.1](https://github.com/cloudevents/spec/blob/v1.0.1/json-format.md#31-handling-of-data)。

  对于一些二进制模式的协议绑定，这个字段被直接映射到 各自协议的内容类型元数据属性。 关于 二进制模式和内容类型元数据映射的规范性规则，可以在 各自的协议中找到。

  在某些事件格式中， `datacontenttype` 属性可以被省略。 例如，如果 JSON 格式事件没有 `dataconttype` 属性，则 暗示 `data` 是符合"application/json" 媒体类型的 JSON 值。 换句话说：没有 `datacontenttype` 的 JSON 格式事件 与 `datacontenttype="application/json"`的事件完全等效。

  当把一个没有 `datacontenttype` 属性的事件消息翻译成一个 不同的格式或协议绑定。目标 `datacontenttype` 应该被 明确地设置为源的隐含 `datacontenttype` 。

- 约束：
  - 可选的
  - 如果存在，必须遵守 [RFC 2046](https://tools.ietf.org/html/rfc2046)中规定的格式。
- 媒体类型的例子见 [IANA媒体类型](http://www.iana.org/assignments/media-types/media-types.xhtml)

#### dataschema

- 类型： `URI`
- 描述：确定 `Data` 所遵循的模式。 对模式的不兼容的 改变应该由一个不同的URI来反映。 更多信息请参见 [Primer 中的 CloudEvents 的版本控制](https://github.com/cloudevents/spec/blob/v1.0.1/primer.md#versioning-of-cloudevents) 。
- 约束：
  - 可选的
  - 如果存在，必须是一个非空的URI

#### subject

- Type：`String`
- 描述: 这是在事件生产者（由 `source`标识）的上下文中描述事件的主题。 在发布-订阅场景中，一个 订阅者通常会订阅由 `source` 发出的事件。但如果 `source` 标识符本身可能不足以作为任何 特定事件的限定符，因为 `source` 上下文有内部子结构。

  在上下文元数据中识别事件的主题（而不是只在 `data` 有效载荷中识别）在通用订阅过滤 场景中特别有帮助，因为中间件无法解释 `data` 内容。 在上面的例子中，订阅者可能只对名字以 '.jpg' 或 '.jpeg' 结尾的 blob 感兴趣，而 `subject` 属性允许为该子集的事件构建一个简单而高效的字符串后缀过滤器。

- 约束：
  - 可选的
  - 如果存在，必须是一个非空的 URI
- 示例:
  - 订阅者可能会在 blob-storage 容器内创建新的 blob 时注册兴趣。 在这种情况下，事件 `source` 标识了订阅范围（存储容器）， `type` 标识了 "blob create"事件。而 `id` 唯一标识事件实例，以区分已创建的同名 blob 的不同发生情况。新创建的 blob 的名称在 `subject`中。
    - `source`: https://example.com/storage/tenant/container
    - `subject`: mynewfile.jpg

#### time

- 类型: `Timestamp`
- 描述: 事件发生时间的时间戳。 如果不能确定 发生的时间，那么该属性可能会被云事件生产者设置为其他 时间（如当前时间），但是，对于同一个 `source` 的所有 生产者在这方面必须保持一致。 换句话来说，要么它们都使用实际发生的时间，要么它们都使用 相同的算法来确定使用的数值。
- 约束：
  - 可选的
  - 如果存在，必须遵守 [RFC 3339](https://tools.ietf.org/html/rfc3339) 中规定的格式。

{{% alert title="限制" color="warning" %}}
目前，不支持对时间的比较（如 "现在"之前或之后）。
{{% /alert %}}

## 社区示例

观看 [这个视频](https://www. youtube. com/watch? v=QqJgRmbH82I& t=1063s) 关于如何使用 pub/sub 的消息路由。

<p class="embed-responsive embed-responsive-16by9">
<iframe width="688" height="430" src="https://www.youtube.com/embed/QqJgRmbH82I?start=1063" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</p>

## 下一步

- 试试 [Pub/Sub 路由示例](https://github. com/dapr/samples/tree/master/pub-sub-routing)
- 了解 [Topic 作用域]({{< ref pubsub-scopes.md >}})
- 了解 [消息存活时间]({{< ref pubsub-message-ttl.md >}})
- 学习 [如何配置具有多个命名空间的 Pub/Sub 组件]({{< ref pubsub-namespaces.md >}})
- Pub/sub 组件是可扩展的， [这里]({{< ref setup-pubsub >}})有支持的 pub/sub 组件列表，实现可以在 [components-contrib repo](https://github. com/dapr/components-contrib) 中找到。
- 阅读 [API 参考文档]({{< ref pubsub_api.md >}})
