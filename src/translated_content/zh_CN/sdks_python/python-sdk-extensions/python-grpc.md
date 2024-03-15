---
type: docs
title: 开始使用 Dapr Python gRPC 进行服务扩展
linkTitle: gRPC
weight: 100000
description: 如何使用 Dapr Python gRPC 扩展启动和运行
---

Dapr Python SDK 提供了一个内置的 gRPC 服务器扩展，`dapr.ext.grpc`，用于创建 Dapr 服务。

## 安装

你可以通过下面的方式下载和安装 Dapr gRPC 服务器扩展模块：

{{< tabs Stable Development>}}

{{% codetab %}}

```bash
pip install dapr-ext-grpc
```

{{% /codetab %}}

{{% codetab %}}
{{% alert title="Note" color="warning" %}}
The development package will contain features and behavior that will be compatible with the pre-release version of the Dapr runtime. 在安装 `dapr-dev` 包之前，请务必卸载任何稳定版本的 Python SDK 扩展。
{{% /alert %}}

```bash
pip3 install dapr-ext-grpc-dev
```

{{% /codetab %}}

{{< /tabs >}}

## 示例

`App` 对象可以用来创建服务器。

### 监听服务调用请求状态

`InvokeMethodReqest` 和 `InvokeMethodResponse` 对象可用于处理传入请求。

一个将侦听和响应请求的简单服务将如下所示：

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

完整的示例可以在[这里](https://github.com/dapr/python-sdk/tree/v1.0.0rc2/examples/invoke-simple)找到。

### 订阅主题

当订阅一个主题时，您可以指示 Dapr 是否接受已传递的事件，或者是否应该丢弃它，或稍后重试。

```python
from typing import Optional
from cloudevents.sdk.event import v1
from dapr.ext.grpc import App
from dapr.clients.grpc._response import TopicEventResponse

app = App()

# Default subscription for a topic
@app.subscribe(pubsub_name='pubsub', topic='TOPIC_A')
def mytopic(event: v1.Event) -> Optional[TopicEventResponse]:
    print(event.Data(),flush=True)
    # Returning None (or not doing a return explicitly) is equivalent
    # to returning a TopicEventResponse("success").
    # You can also return TopicEventResponse("retry") for dapr to log
    # the message and retry delivery later, or TopicEventResponse("drop")
    # for it to drop the message
    return TopicEventResponse("success")

# Specific handler using Pub/Sub routing
@app.subscribe(pubsub_name='pubsub', topic='TOPIC_A',
               rule=Rule("event.type == \"important\"", 1))
def mytopic_important(event: v1.Event) -> None:
    print(event.Data(),flush=True)

# Handler with disabled topic validation
@app.subscribe(pubsub_name='pubsub-mqtt', topic='topic/#', disable_topic_validation=True,)
def mytopic_wildcard(event: v1.Event) -> None:
    print(event.Data(),flush=True)

app.run(50051)
```

完整的示例可以在[这里](https://github.com/dapr/python-sdk/blob/v1.0.0rc2/examples/pubsub-simple/subscriber.py)找到。

### 设置输入绑定触发器

```python
from dapr.ext.grpc import App, BindingRequest

app = App()

@app.binding('kafkaBinding')
def binding(request: BindingRequest):
    print(request.text(), flush=True)

app.run(50051)
```

完整的示例可以在[这里](https://github.com/dapr/python-sdk/tree/v1.0.0rc2/examples/invoke-binding)找到。

## 相关链接

- [PyPi](https://pypi.org/project/dapr-ext-grpc/)
