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

Python SDK 允许你与所有的 [Dapr 构建块]({{< ref building-blocks >}})交互。

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
- 请访问 [Python SDK 示例](https://github.com/dapr/python-sdk/tree/master/examples/invoke-simple) ，了解代码样本和说明，尝试服务调用。

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
- 请访问 [Python SDK 示例](https://github.com/dapr/python-sdk/tree/master/examples/state_store) ，了解代码样本和说明，以尝试使用状态管理。

### 查询应用状态（Alpha）

```python
    from dapr import DaprClient

    query = '''
    {
        "filter": {
            "EQ": { "value.state": "CA" }
        },
        "sort": [
            {
                "key": "value.person.id",
                "order": "DESC"
            }
        ]
    }
    '''

    with DaprClient() as d:
        resp = d.query_state(
            store_name='state_store',
            query=query,
            states_metadata={"metakey": "metavalue"},  # optional
        )
```

- 有关状态存储查询选项的完整列表，请访问[操作方法：查询状态]({{< ref howto-state-query-api.md >}})。
- 请访问 [Python SDK 示例](https://github.com/dapr/python-sdk/tree/master/examples/state_store_query) ，了解代码样本和说明，以尝试使用状态管理。

### 发布 & 订阅消息

##### 发布消息

```python
from dapr.clients import DaprClient

with DaprClient() as d:
    resp = d.publish_event(pubsub_name='pubsub', topic='TOPIC_A', data='{"message":"Hello World"}')
```

##### 订阅消息

```python
from cloudevents.sdk.event import v1
from dapr.ext.grpc import App
import json

app = App()

# Default subscription for a topic
@app.subscribe(pubsub_name='pubsub', topic='TOPIC_A')
def mytopic(event: v1.Event) -> None:
    data = json.loads(event.Data())
    print(f'Received: id={data["id"]}, message="{data ["message"]}"' 
          ' content_type="{event.content_type}"',flush=True)

# Specific handler using Pub/Sub routing
@app.subscribe(pubsub_name='pubsub', topic='TOPIC_A',
               rule=Rule("event.type == \"important\"", 1))
def mytopic_important(event: v1.Event) -> None:
    data = json.loads(event.Data())
    print(f'Received: id={data["id"]}, message="{data ["message"]}"' 
          ' content_type="{event.content_type}"',flush=True)
```

- 有关状态操作的完整列表，请访问 [如何: 发布 & 订阅]({{< ref howto-publish-subscribe.md >}})。
- 请访问 [Python SDK 示例](https://github.com/dapr/python-sdk/tree/master/examples/pubsub-simple)以获取代码样本和说明，尝试使用发布/订阅

### 与输出绑定交互

```python
from dapr.clients import DaprClient

with DaprClient() as d:
    resp = d.invoke_binding(name='kafkaBinding', operation='create', data='{"message":"Hello World"}')
```

- 有关输出绑定的完整指南，请访问 [如何：使用绑定]({{< ref howto-bindings.md >}})。
- 请访问 [Python SDK 示例](https://github.com/dapr/python-sdk/tree/master/examples/invoke-binding)以获取代码样本和说明，尝试输出绑定。

### 检索密钥

```python
from dapr.clients import DaprClient

with DaprClient() as d:
    resp = d.get_secret(store_name='localsecretstore', key='secretKey')
```

- 有关密钥的完整指南，请访问[如何：检索密钥]({{< ref howto-secrets.md >}})。
- 请访问 [Python SDK 示例](https://github.com/dapr/python-sdk/tree/master/examples/secret_store)以获取代码样本和说明，以尝试检索秘密。

### 获取配置

```python
from dapr.clients import DaprClient

with DaprClient() as d:
    # Get Configuration
    configuration = d.get_configuration(store_name='configurationstore', keys=['orderId'], config_metadata={})
```

- 有关状态操作的完整列表，请访问[如何：获取 & 保存状态]({{< ref howto-manage-configuration.md >}})。
- 请访问 [Python SDK 示例](https://github.com/dapr/python-sdk/tree/master/examples/configuration) ，了解代码样本和说明，以尝试使用状态管理。

## 相关链接
- [Python SDK 示例](https://github.com/dapr/python-sdk/tree/master/examples)