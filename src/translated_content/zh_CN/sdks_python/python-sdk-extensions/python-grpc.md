---
type: docs
title: "开始使用 Dapr Python gRPC 服务扩展"
linkTitle: "gRPC"
weight: 100000
description: 如何启动并运行 Dapr Python gRPC 扩展
---

Dapr Python SDK 提供了一个用于创建 Dapr 服务的内置 gRPC 服务器扩展 `dapr.ext.grpc`。

## 安装

您可以通过以下命令下载并安装 Dapr gRPC 服务器扩展：

{{< tabs 稳定版 开发版>}}

{{% codetab %}}
```bash
pip install dapr-ext-grpc
```
{{% /codetab %}}

{{% codetab %}}
{{% alert title="注意" color="warning" %}}
开发包包含与 Dapr 运行时预发布版本兼容的功能和行为。在安装 `dapr-dev` 包之前，请确保卸载任何稳定版本的 Python SDK 扩展。
{{% /alert %}}

```bash
pip3 install dapr-ext-grpc-dev
```
{{% /codetab %}}

{{< /tabs >}}

## 示例

您可以使用 `App` 对象来创建一个服务器。

### 监听服务调用请求

可以使用 `InvokeMethodRequest` 和 `InvokeMethodResponse` 对象来处理传入的请求。

以下是一个简单的服务示例，它会监听并响应请求：

```python
from dapr.ext.grpc import App, InvokeMethodRequest, InvokeMethodResponse

app = App()

@app.method(name='my-method')
def mymethod(request: InvokeMethodRequest) -> InvokeMethodResponse:
    print(request.metadata, flush=True)
    print(request.text(), flush=True)

    return InvokeMethodResponse(b'INVOKE_RECEIVED', "text/plain; charset=UTF-8")

app.run(50051)
```

完整示例可以在[这里](https://github.com/dapr/python-sdk/tree/v1.0.0rc2/examples/invoke-simple)找到。

### 订阅主题

在订阅主题时，您可以指示 dapr 事件是否已被接受，或者是否应该丢弃或稍后重试。

```python
from typing import Optional
from cloudevents.sdk.event import v1
from dapr.ext.grpc import App
from dapr.clients.grpc._response import TopicEventResponse

app = App()

# 默认的主题订阅
@app.subscribe(pubsub_name='pubsub', topic='TOPIC_A')
def mytopic(event: v1.Event) -> Optional[TopicEventResponse]:
    print(event.Data(), flush=True)
    # 返回 None（或不显式返回）等同于返回 TopicEventResponse("success")。
    # 您还可以返回 TopicEventResponse("retry") 以便 dapr 记录消息并稍后重试交付，
    # 或者返回 TopicEventResponse("drop") 以丢弃消息
    return TopicEventResponse("success")

# 使用发布/订阅路由的特定处理程序
@app.subscribe(pubsub_name='pubsub', topic='TOPIC_A',
               rule=Rule("event.type == \"important\"", 1))
def mytopic_important(event: v1.Event) -> None:
    print(event.Data(), flush=True)

# 禁用主题验证的处理程序
@app.subscribe(pubsub_name='pubsub-mqtt', topic='topic/#', disable_topic_validation=True,)
def mytopic_wildcard(event: v1.Event) -> None:
    print(event.Data(), flush=True)

app.run(50051)
```

完整示例可以在[这里](https://github.com/dapr/python-sdk/blob/v1.0.0rc2/examples/pubsub-simple/subscriber.py)找到。

### 设置输入绑定触发器

```python
from dapr.ext.grpc import App, BindingRequest

app = App()

@app.binding('kafkaBinding')
def binding(request: BindingRequest):
    print(request.text(), flush=True)

app.run(50051)
```

完整示例可以在[这里](https://github.com/dapr/python-sdk/tree/v1.0.0rc2/examples/invoke-binding)找到。

## 相关链接
- [PyPi](https://pypi.org/project/dapr-ext-grpc/)
