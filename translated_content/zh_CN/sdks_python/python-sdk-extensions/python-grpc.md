---
type: docs
title: "Getting started with the Dapr Python gRPC service extension"
linkTitle: "gRPC"
weight: 20000
description: How to get up and running with the Dapr Python gRPC extension package
---

The Dapr Python SDK provides a built in gRPC server extension module, `dapr.ext.grpc`, for creating Dapr services.

## 安装

You can download and install the Dapr gRPC server extension module with:

{{< tabs Stable Development>}}

{{% codetab %}}
```bash
pip install dapr-ext-grpc
```
{{% /codetab %}}

{{% codetab %}}
{{% alert title="Note" color="warning" %}}
开发包包含的功能和行为将兼容此前发行的 Dapr 运行时。 在安装 dapr-dev 包之前，请务必卸载以前任意稳定版本的 dapr-ext-fastapi 的 Python SDK 扩展包。
{{% /alert %}}

```bash
pip3 install dapr-ext-grpc-dev
```
{{% /codetab %}}

{{< /tabs >}}

## 示例

The `App` object can be used to create a server.

### Listen for service invocation requests

The `InvokeMethodReqest` and `InvokeMethodResponse` objects can be used to handle incoming requests.

A simple service that will listen and respond to requests will look like:

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

A full sample can be found [here](https://github.com/dapr/python-sdk/tree/v1.0.0rc2/examples/invoke-simple).

### Subscribe to a topic

```python
from cloudevents.sdk.event import v1
from dapr.ext.grpc import App

app = App()

@app.subscribe(pubsub_name='pubsub', topic='TOPIC_A')
def mytopic(event: v1.Event) -> None:
    print(event.Data(),flush=True)

app.run(50051)
```

A full sample can be found [here](https://github.com/dapr/python-sdk/blob/v1.0.0rc2/examples/pubsub-simple/subscriber.py).

### Setup input binding trigger

```python
from dapr.ext.grpc import App, BindingRequest

app = App()

@app.binding('kafkaBinding')
def binding(request: BindingRequest):
    print(request.text(), flush=True)

app.run(50051)
```

A full sample can be found [here](https://github.com/dapr/python-sdk/tree/v1.0.0rc2/examples/invoke-binding).

## 相关链接
- [PyPi](https://pypi.org/project/dapr-ext-grpc/)