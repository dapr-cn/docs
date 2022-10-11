---
type: docs
title: "开始使用 Dapr Python gRPC 进行服务扩展"
linkTitle: "gRPC"
weight: 20000
description: 如何使用 Dapr Python gRPC 扩展包启动和运行
---

Dapr Python SDK 提供了一个内置的 gRPC 服务器扩展模块 `dapr.ext.grpc`，用于创建 Dapr 服务。

## 安装

您可以使用以下命令下载并安装 Dapr gRPC 服务器扩展模块：

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

`App` 对象可以用来创建服务器。

### 监听服务调用请求状态

`InvokeServiceReqest` 和 `InvokeServiceResponse` 对象可用于处理传入请求。

一个将侦听和响应请求的简单服务将如下所示：

```python
from dapr.ext.grpc import App, InvokeServiceRequest, InvokeServiceResponse

app = App()

@app.method(name='my-method')
def mymethod(request: InvokeServiceRequest) -> InvokeServiceResponse:
    print(request.metadata, flush=True)
    print(request.text(), flush=True)

    return InvokeServiceResponse(b'INVOKE_RECEIVED', "text/plain; charset=UTF-8")

app.run(50051)
```

完整的示例可以在 [这里](https://github.com/dapr/python-sdk/tree/v1.0.0rc2/examples/invoke-simple) 找到。

### 订阅主题

```python
from cloudevents.sdk.event import v1
from dapr.ext.grpc import App

app = App()

@app.subscribe(pubsub_name='pubsub', topic='TOPIC_A')
def mytopic(event: v1.Event) -> None:
    print(event.Data(),flush=True)

app.run(50051)
```

完整的示例可以在 [这里](https://github.com/dapr/python-sdk/blob/v1.0.0rc2/examples/pubsub-simple/subscriber.py) 找到。

### 设置输入绑定触发器

```python
from dapr.ext.grpc import App, BindingRequest

app = App()

@app.binding('kafkaBinding')
def binding(request: BindingRequest):
    print(request.text(), flush=True)

app.run(50051)
```

完整的示例可以在 [这里](https://github.com/dapr/python-sdk/tree/v1.0.0rc2/examples/invoke-binding) 找到。

## 相关链接
- [PyPi](https://pypi.org/project/dapr-ext-grpc/)