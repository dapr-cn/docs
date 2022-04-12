---
type: docs
title: "Getting started with the Dapr client Python SDK"
linkTitle: "客户端"
weight: 10000
description: How to get up and running with the Dapr Python SDK
---

The Dapr client package allows you to interact with other Dapr applications from a Python application.

## 前提

- 安装 [Dapr CLI]({{< ref install-dapr-cli.md >}})
- 初始化[Dapr环境]({{< ref install-dapr-selfhost.md >}})
- 安装[Python 3.7+](https://www.python.org/downloads/)
- 安装[Dapr Python 模块]({{< ref "python#install-the0dapr-module" >}})

## 导入包

The dapr package contains the `DaprClient` which will be used to create and use a client.

```python
from dapr.clients import DaprClient
```

## 构建块

The Python SDK allows you to interface with all of the [Dapr building blocks]({{< ref building-blocks >}}).

### 调用服务

```python 
from dapr.clients import DaprClient

with DaprClient() as d:
    # invoke a method (gRPC or HTTP GET)    
    resp = d.invoke_method('service-to-invoke', 'method-to-invoke', data='{"message":"Hello World"}')

    # for other HTTP verbs the verb must be specified
    # invoke a 'POST' method (HTTP only)    
    resp = d.invoke_method('service-to-invoke', 'method-to-invoke', data='{"id":"100", "FirstName":"Value", "LastName":"Value"}', http_verb='post')
```

- 有关服务调用的完整指南，请访问 [如何：调用服务]({{< ref howto-invoke-discover-services.md >}})。
- Visit [Python SDK examples](https://github.com/dapr/python-sdk/tree/master/examples/invoke-simple) for code samples and instructions to try out service invocation

### 保存 & 获取 应用程序状态

```python
from dapr.clients import DaprClient

with DaprClient() as d:
    # Save state
    d.save_state(store_name="statestore", key="key1", value="value1")

    # Get state
    data = d.get_state(store_name="statestore", key="key1").data

    # Delete state
    d.delete_state(store_name="statestore", key="key1")
```

- 有关状态操作的完整列表，请访问 [如何：获取 & 保存 状态。]({{< ref howto-get-save-state.md >}})。
- Visit [Python SDK examples](https://github.com/dapr/python-sdk/tree/master/examples/state_store) for code samples and instructions to try out state management

### Publish & subscribe to messages

##### 发布消息

```python
from dapr.clients import DaprClient

with DaprClient() as d:
    resp = d.publish_event(pubsub_name='pubsub', topic='TOPIC_A', data='{"message":"Hello World"}')
```

##### Subscribe to messages

```python
from cloudevents.sdk.event import v1
from dapr.ext.grpc import App
import json

app = App()

@app.subscribe(pubsub_name='pubsub', topic='TOPIC_A')
def mytopic(event: v1.Event) -> None:
    data = json.loads(event.Data())
    print(f'Received: id={data["id"]}, message="{data ["message"]}"' 
          ' content_type="{event.content_type}"',flush=True)
```

- 有关状态操作的完整列表，请访问 [如何: 发布 & 订阅]({{< ref howto-publish-subscribe.md >}})。
- Visit [Python SDK examples](https://github.com/dapr/python-sdk/tree/master/examples/pubsub-simple) for code samples and instructions to try out pub/sub

### 与输出绑定交互

```python
from dapr.clients import DaprClient

with DaprClient() as d:
    resp = d.invoke_binding(name='kafkaBinding', operation='create', data='{"message":"Hello World"}')
```

- 有关输出绑定的完整指南，请访问 [如何：使用绑定]({{< ref howto-bindings.md >}})。
- Visit [Python SDK examples](https://github.com/dapr/python-sdk/tree/master/examples/invoke-binding) for code samples and instructions to try out output bindings

### 检索密钥

```python
from dapr.clients import DaprClient

with DaprClient() as d:
    resp = d.get_secret(store_name='localsecretstore', key='secretKey')
```

- 有关密钥的完整指南，请访问[如何：检索密钥]({{< ref howto-secrets.md >}})。
- Visit [Python SDK examples](https://github.com/dapr/python-sdk/tree/master/examples/secret_store) for code samples and instructions to try out retrieving secrets

## 相关链接
- [Python SDK examples](https://github.com/dapr/python-sdk/tree/master/examples)