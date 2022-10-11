---
type: docs
title: "开始使用 Dapr 客户端 Python SDK"
linkTitle: "客户端"
weight: 10000
description: 如何使用 Dapr Python SDK 启动和运行
---

Dapr 客户端包允许您从 Python 应用程序中与其他 Dapr 应用程序进行交互。

## 前提

- 安装 [Dapr CLI]({{< ref install-dapr-cli.md >}})
- 初始化[Dapr环境]({{< ref install-dapr-selfhost.md >}})
- 安装[Python 3.7+](https://www.python.org/downloads/)
- 安装[Dapr Python 模块]({{< ref "python#install-the0dapr-module" >}})

## 导入包

Dapr 包包含 `DaprClient` ，该工具包将用于创建和使用客户端。

```python
from dapr.clients import DaprClient
```

## 构建块

Python SDK 允许你与所有的 [Dapr 构建块]({{< ref building-blocks >}}) 进行交互。

### 调用服务

```python 
from dapr.clients import DaprClient

with DaprClient() as d:
    resp = d.invoke_service(id='service-to-invoke', method='method-to-invoke', data='{"message":"Hello World"}')
```

- 有关服务调用的完整指南，请访问 [如何：调用服务]({{< ref howto-invoke-discover-services.md >}})。
- 请访问 [Python SDK 示例](https://github.com/dapr/python-sdk/tree/daprdocs-setup/examples/invoke-simple) ，了解代码示例和说明，尝试服务调用。

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
- 请访问 [Python SDK 示例](https://github.com/dapr/python-sdk/tree/daprdocs-setup/examples/state_store) ，了解代码示例和说明，以尝试使用状态管理。

### 发布消息

```python
from dapr.clients import DaprClient

with DaprClient() as d:
    resp = d.publish_event(pubsub_name='pubsub', topic='TOPIC_A', data='{"message":"Hello World"}')
```

- 有关状态操作的完整列表，请访问 [如何: 发布 & 订阅]({{< ref howto-publish-subscribe.md >}})。
- 请访问 [Python SDK 示例](https://github.com/dapr/python-sdk/tree/daprdocs-setup/examples/pubsub-simple) 以获取代码样本和说明，尝试使用发布和订阅。

### 与输出绑定交互

```python
from dapr.clients import DaprClient

with DaprClient() as d:
    resp = d.invoke_binding(name='kafkaBinding', operation='create', data='{"message":"Hello World"}')
```

- 有关输出绑定的完整指南，请访问 [如何：使用绑定]({{< ref howto-bindings.md >}})。
- 请访问 [Python SDK 示例](https://github.com/dapr/python-sdk/tree/daprdocs-setup/examples/invoke-binding) 以获取代码示例和说明，并使用绑定。

### 检索密钥

```python
from dapr.clients import DaprClient

with DaprClient() as d:
    resp = d.get_secret(store_name='localsecretstore', key='secretKey')
```

- 有关密钥的完整指南，请访问[如何：检索密钥]({{< ref howto-secrets.md >}})。
- 请访问 [Python SDK 示例](https://github.com/dapr/python-sdk/tree/daprdocs-setup/examples/secret_store) 以获取代码示例和说明，以尝试检索密钥。

## 相关链接
- [Python SDK examples](https://github.com/dapr/python-sdk/tree/daprdocs-setup/examples)