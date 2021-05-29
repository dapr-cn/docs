---
type: docs
title: "Getting started with the Dapr client Python SDK"
linkTitle: "客户端"
weight: 10000
description: How to get up and running with the Dapr Python SDK
---

The Dapr client package allows you to interact with other Dapr applications from a Python application.

## 前提

- [Dapr CLI]({{< ref install-dapr-cli.md >}}) installed
- Initialized [Dapr environment]({{< ref install-dapr-selfhost.md >}})
- [Python 3.7+](https://www.python.org/downloads/) installed
- [Dapr Python module]({{< ref "python#install-the0dapr-module" >}}) installed

## Import the client package

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
    resp = d.invoke_service(id='service-to-invoke', method='method-to-invoke', data='{"message":"Hello World"}')
```

- For a full guide on service invocation visit [How-To: Invoke a service]({{< ref howto-invoke-discover-services.md >}}).
- Visit [Python SDK examples](https://github.com/dapr/python-sdk/tree/daprdocs-setup/examples/invoke-simple) for code samples and instructions to try out service invocation

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

- For a full list of state operations visit [How-To: Get & save state]({{< ref howto-get-save-state.md >}}).
- Visit [Python SDK examples](https://github.com/dapr/python-sdk/tree/daprdocs-setup/examples/state_store) for code samples and instructions to try out state management

### 发布消息

```python
from dapr.clients import DaprClient

with DaprClient() as d:
    resp = d.publish_event(pubsub_name='pubsub', topic='TOPIC_A', data='{"message":"Hello World"}')
```

- For a full list of state operations visit [How-To: Publish & subscribe]({{< ref howto-publish-subscribe.md >}}).
- Visit [Python SDK examples](https://github.com/dapr/python-sdk/tree/daprdocs-setup/examples/pubsub-simple) for code samples and instructions to try out pub/sub

### 与输出绑定交互

```python
from dapr.clients import DaprClient

with DaprClient() as d:
    resp = d.invoke_binding(name='kafkaBinding', operation='create', data='{"message":"Hello World"}')
```

- For a full guide on output bindings visit [How-To: Use bindings]({{< ref howto-bindings.md >}}).
- Visit [Python SDK examples](https://github.com/dapr/python-sdk/tree/daprdocs-setup/examples/invoke-binding) for code samples and instructions to try out output bindings

### 检索密钥

```python
from dapr.clients import DaprClient

with DaprClient() as d:
    resp = d.get_secret(store_name='localsecretstore', key='secretKey')
```

- For a full guide on secrets visit [How-To: Retrieve secrets]({{< ref howto-secrets.md >}}).
- Visit [Python SDK examples](https://github.com/dapr/python-sdk/tree/daprdocs-setup/examples/secret_store) for code samples and instructions to try out retrieving secrets

## 相关链接
- [Python SDK examples](https://github.com/dapr/python-sdk/tree/daprdocs-setup/examples)