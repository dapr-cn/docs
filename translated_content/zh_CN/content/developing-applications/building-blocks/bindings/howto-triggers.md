---
type: docs
title: "How-To: 使用输入绑定来触发应用程序"
linkTitle: "How-To: 触发器"
description: "使用 Dapr 输入绑定来触发由事件驱动的程序"
weight: 200
---

使用绑定，代码可以被来自不同资源的传入事件触发，这些事件可以是任何内容：队列、消息传递管道、云服务、文件系统等。

这对于事件驱动的处理，数据管道或只是对事件作出反应并进一步处理都很理想。

Dapr 绑定允许您 :

* 接收不包含特定 SDK 或库的事件
* 在不更改代码的情况下替换绑定
* 关注业务逻辑而不是事件资源实现

更多关于绑定的信息，请查阅[概览]({{<ref bindings-overview.md>}})

有关展示绑定的快速入门示例，请访问此 [链接](https://github.com/dapr/quickstarts/tree/master/bindings)。

## 1. 创建绑定

输入绑定表示 Dapr 用于读取事件并推送到应用程序的事件资源。

就本指南的目的，我们会使用 Kafka 绑定。 不同绑定规范请查阅[>这里]({{< ref supported-bindings >}})。

创建以下 YAML 文件，名为 binding.yaml，并将其保存到应用程序的 `components` 子文件夹中。 （使用具有 `--components-path` 标记 的 `dapr run` 命令来指向自定义组件目录）

*注: 在 Kubernetes 中运行时，使用 `kubectl apply -f binding.yaml` 将此文件应用于您的集群*

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: myevent
  namespace: default
spec:
  type: bindings.kafka
  version: v1
  metadata:
  - name: topics
    value: topic1
  - name: brokers
    value: localhost:9092
  - name: consumerGroup
    value: group1
```

在这里，创建一个新的名称为 `myevent` 的绑定组件。

在 `metadata` 部分中，配置 Kafka 相关属性，如要监听的topics，代理或者更多。

## 2. 监听传入事件

现在配置您的应用程序来接收传入事件。 如果使用 HTTP ，那么需要监听在文件 `metadata.name` 中指定的绑定名称所对应的`POST` 终结点。  在此示例中，是 `myevent`。

*以下示例演示了在 Node.js 中您该如何监听事件，但这适用于任何编程语言*

```javascript
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.json())

const port = 3000

app.post('/myevent', (req, res) => {
    console.log(req.body)
    res.status(200).send()
})

app.listen(port, () => console.log(`Kafka consumer app listening on port ${port}!`))
```

### 确认事件

为了告诉 Dapr 您成功处理了应用程序中的事件，请从 http 处理程序 返回 `200 OK` 响应。

```javascript
res.status(200).send()
```

### 拒绝事件

为了告知 Dapr 事件未在应用程序中正确处理事件并将其调度为重新交付，请返回与 `200 OK` 不同的响应。 例如， `500 Error`。

```javascript
res.status(500).send()
```

### Specifying a custom route

By default, incoming events will be sent to an HTTP endpoint that corresponds to the name of the input binding. You can override this by setting the following metadata property:

```yaml
name: mybinding
spec:
  type: binding.rabbitmq
  metadata:
  - name: route
    value: /onevent
```

### 事件传递保证
事件传递保证由绑定实现控制。 根据绑定实现，事件传递可以正好一次或至少一次。


## 参考资料

* [绑定构建块]({{< ref bindings >}})
* [绑定 API]({{< ref bindings_api.md >}})
* [Components concept]({{< ref components-concept.md >}})
* [Supported bindings]({{< ref supported-bindings >}})
