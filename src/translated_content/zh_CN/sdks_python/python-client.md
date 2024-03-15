---
type: docs
title: 开始使用 Dapr 客户端 Python SDK
linkTitle: Client
weight: 10000
description: 如何使用 Dapr Python SDK 启动和运行
---

Dapr 客户端包允许您从 Python 应用程序中与其他 Dapr 应用程序进行交互。

{{% alert title="注意" color="primary" %}}
如果你还没有，请[尝试使用一个快速入门]({{< ref quickstarts >}})快速了解如何使用 Dapr Python SDK 与 API 构建块。

{{% /alert %}}

## 前期准备

在开始之前，请[安装 Dapr Python 包]({{< ref "python#installation" >}})。

## 导入客户端包

`dapr` 包包含 `DaprClient`，该工具包将用于创建和使用客户端。

```python
from dapr.clients import DaprClient
```

## 初始化客户端

您可以以多种方式初始化 Dapr 客户端：

#### 默认值:

当您在不带任何参数的情况下初始化客户端时，它将使用默认值作为 Dapr sidecar 实例（`127.0.0.1:50001`）。

```python
from dapr.clients import DaprClient

with DaprClient() as d:
    # use the client
```

#### 在初始化时指定一个端点：

当作为构造函数的参数传递时，gRPC端点优先于任何配置或环境变量。

```python
from dapr.clients import DaprClient

with DaprClient("mydomain:50051?tls=true") as d:
    # use the client
```

#### 环境变量:

##### Dapr Sidecar 终端点

您可以使用标准化的`DAPR_GRPC_ENDPOINT`环境变量来指定gRPC端点。 当设置了这个变量时，客户端可以在没有任何参数的情况下进行初始化：

```bash
export DAPR_GRPC_ENDPOINT="mydomain:50051?tls=true"
```

```python
from dapr.clients import DaprClient

with DaprClient() as d:
    # the client will use the endpoint specified in the environment variables
```

遗留的环境变量 `DAPR_RUNTIME_HOST`、`DAPR_HTTP_PORT` 和 `DAPR_GRPC_PORT` 也被支持，但是 `DAPR_GRPC_ENDPOINT` 优先级更高。

##### Dapr API 令牌

如果您的 Dapr 实例配置需要 `DAPR_API_TOKEN` 环境变量，您可以在环境中设置它，客户端将自动使用它。\
您可以在此处阅读有关 Dapr API 令牌身份验证的更多信息（[链接](https://docs.dapr.io/operations/security/api-token/)）。

##### 健康超时

在客户端初始化时，会对Dapr sidecar（`/healthz/outboud`）进行健康检查。
客户端将在 sidecar 启动并运行后继续进行。

默认超时时间为60秒，但可以通过设置`DAPR_HEALTH_TIMEOUT`环境变量来覆盖。

## 错误处理

最初，Dapr中的错误遵循了[标准的gRPC错误模型](https://grpc.io/docs/guides/error/#standard-error-model)。 然而，为了提供更详细和信息丰富的错误消息，在版本1.13中引入了一个增强的错误模型，与gRPC的[更丰富的错误模型](https://grpc.io/docs/guides/error/#richer-error-model)保持一致。 作为回应，Python SDK 实现了 `DaprGrpcError`，一个专门设计用于改善开发者体验的自定义异常类。\
需要注意的是，将所有gRPC状态异常转换为`DaprGrpcError`仍在进行中。 目前，SDK中并非每个API调用都已更新以利用此自定义异常。 我们正在积极推进这项改进，并欢迎社区的贡献。

使用 Dapr python-SDK 时处理 `DaprGrpcError` 异常的示例：

```python
try:
    d.save_state(store_name=storeName, key=key, value=value)
except DaprGrpcError as err:
    print(f'Status code: {err.code()}')
    print(f"Message: {err.message()}")
    print(f"Error code: {err.error_code()}")
    print(f"Error info(reason): {err.error_info.reason}")
    print(f"Resource info (resource type): {err.resource_info.resource_type}")
    print(f"Resource info (resource name): {err.resource_info.resource_name}")
    print(f"Bad request (field): {err.bad_request.field_violations[0].field}")
    print(f"Bad request (description): {err.bad_request.field_violations[0].description}")
```

## 构建块

Python SDK 允许您与所有的[Dapr构建块]({{< ref building-blocks >}})}进行接口交互。

### 调用服务

Dapr Python SDK 提供了一个简单的 API，用于通过 HTTP 或 gRPC（已弃用）调用服务。 可以通过设置 `DAPR_API_METHOD_INVOCATION_PROTOCOL` 环境变量来选择协议，默认情况下未设置时为HTTP。 在 Dapr 中，GRPC 服务调用已被弃用，推荐使用 GRPC 代理作为替代方案。

```python
from dapr.clients import DaprClient

with DaprClient() as d:
    # invoke a method (gRPC or HTTP GET)    
    resp = d.invoke_method('service-to-invoke', 'method-to-invoke', data='{"message":"Hello World"}')

    # for other HTTP verbs the verb must be specified
    # invoke a 'POST' method (HTTP only)    
    resp = d.invoke_method('service-to-invoke', 'method-to-invoke', data='{"id":"100", "FirstName":"Value", "LastName":"Value"}', http_verb='post')
```

HTTP api调用的基本终结点在`DAPR_HTTP_ENDPOINT`环境变量中指定。
如果未设置此变量，则端点值将从`DAPR_RUNTIME_HOST`和`DAPR_HTTP_PORT`变量中派生，其默认值分别为`127.0.0.1`和`3500`。

gRPC调用的基本终端点是用于客户端初始化的终端点（[上面解释了](#initialising-the-client)）。

- 有关服务调用的完整指南，请访问[操作方法: 调用服务]({{< ref howto-invoke-discover-services.md >}})。
- 访问[Python SDK示例](https://github.com/dapr/python-sdk/tree/master/examples/invoke-simple)获取代码示例和指南，尝试服务调用。

### 保存和获取应用程序状态

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

- 有关状态操作的完整列表，请访问 [操作方法：获取和保存状态]({{< ref howto-get-save-state.md >}}).
- 访问[Python SDK示例](https://github.com/dapr/python-sdk/tree/master/examples/state_store)获取代码示例和说明，以尝试状态管理。

### 查询应用程序状态（Alpha）

```python
    from dapr import DaprClient

    query = '''
    {
        "filter": {
            "EQ": { "state": "CA" }
        },
        "sort": [
            {
                "key": "person.id",
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

- 有关状态存储查询选项的完整列表，请访问 [操作方法：查询状态]({{< ref howto-state-query-api.md >}}).
- 访问[Python SDK示例](https://github.com/dapr/python-sdk/tree/master/examples/state_store_query)获取代码示例和指南，尝试使用状态存储查询。

### 发布和订阅消息

#### 发布消息

```python
from dapr.clients import DaprClient

with DaprClient() as d:
    resp = d.publish_event(pubsub_name='pubsub', topic_name='TOPIC_A', data='{"message":"Hello World"}')
```

#### 订阅消息

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

- 有关发布/订阅的更多信息，请访问 [操作方法：发布 & 订阅]({{< ref howto-publish-subscribe.md >}}).
- 访问[Python SDK示例](https://github.com/dapr/python-sdk/tree/master/examples/pubsub-simple)获取代码示例和说明，以尝试发布/订阅。

### 与输出绑定交互

```python
from dapr.clients import DaprClient

with DaprClient() as d:
    resp = d.invoke_binding(binding_name='kafkaBinding', operation='create', data='{"message":"Hello World"}')
```

- 有关输出绑定的完整指南，请访问[操作方法：使用绑定]({{< ref howto-bindings.md >}})。
- 访问[Python SDK示例](https://github.com/dapr/python-sdk/tree/master/examples/invoke-binding)获取代码示例和指南，尝试使用输出绑定。

### 检索密钥

```python
from dapr.clients import DaprClient

with DaprClient() as d:
    resp = d.get_secret(store_name='localsecretstore', key='secretKey')
```

- 有关秘密的完整指南，请访问[操作方法: 检索秘密]({{< ref howto-secrets.md >}})。
- 访问[Python SDK示例](https://github.com/dapr/python-sdk/tree/master/examples/secret_store)获取代码示例和指南，尝试检索秘密

### Configuration

#### 获取配置

```python
from dapr.clients import DaprClient

with DaprClient() as d:
    # Get Configuration
    configuration = d.get_configuration(store_name='configurationstore', keys=['orderId'], config_metadata={})
```

#### 订阅配置

```python
import asyncio
from time import sleep
from dapr.clients import DaprClient

async def executeConfiguration():
    with DaprClient() as d:
        storeName = 'configurationstore'

        key = 'orderId'

        # Wait for sidecar to be up within 20 seconds.
        d.wait(20)

        # Subscribe to configuration by key.
        configuration = await d.subscribe_configuration(store_name=storeName, keys=[key], config_metadata={})
        while True:
            if configuration != None:
                items = configuration.get_items()
                for key, item in items:
                    print(f"Subscribe key={key} value={item.value} version={item.version}", flush=True)
            else:
                print("Nothing yet")
        sleep(5)

asyncio.run(executeConfiguration())
```

- 了解有关通过 [操作方法：管理配置]({{< ref howto-manage-configuration.md >}}) 指导。
- 访问[Python SDK示例](https://github.com/dapr/python-sdk/tree/master/examples/configuration)获取代码示例和指南，尝试配置。

### 分布式锁

```python
from dapr.clients import DaprClient

def main():
    # Lock parameters
    store_name = 'lockstore'  # as defined in components/lockstore.yaml
    resource_id = 'example-lock-resource'
    client_id = 'example-client-id'
    expiry_in_seconds = 60

    with DaprClient() as dapr:
        print('Will try to acquire a lock from lock store named [%s]' % store_name)
        print('The lock is for a resource named [%s]' % resource_id)
        print('The client identifier is [%s]' % client_id)
        print('The lock will will expire in %s seconds.' % expiry_in_seconds)

        with dapr.try_lock(store_name, resource_id, client_id, expiry_in_seconds) as lock_result:
            assert lock_result.success, 'Failed to acquire the lock. Aborting.'
            print('Lock acquired successfully!!!')

        # At this point the lock was released - by magic of the `with` clause ;)
        unlock_result = dapr.unlock(store_name, resource_id, client_id)
        print('We already released the lock so unlocking will not work.')
        print('We tried to unlock it anyway and got back [%s]' % unlock_result.status)
```

- 了解有关使用分布式锁的详细信息：[操作方法：使用锁]({{< ref howto-use-distributed-lock.md >}}).
- 访问[Python SDK示例](https://github.com/dapr/python-sdk/blob/master/examples/distributed_lock)获取代码示例和指南，尝试使用分布式锁。

### Workflow

```python
from dapr.ext.workflow import WorkflowRuntime, DaprWorkflowContext, WorkflowActivityContext
from dapr.clients import DaprClient

instanceId = "exampleInstanceID"
workflowComponent = "dapr"
workflowName = "hello_world_wf"
eventName = "event1"
eventData = "eventData"

def main():
    with DaprClient() as d:
        host = settings.DAPR_RUNTIME_HOST
        port = settings.DAPR_GRPC_PORT
        workflowRuntime = WorkflowRuntime(host, port)
        workflowRuntime = WorkflowRuntime()
        workflowRuntime.register_workflow(hello_world_wf)
        workflowRuntime.register_activity(hello_act)
        workflowRuntime.start()

        # Start the workflow
        start_resp = d.start_workflow(instance_id=instanceId, workflow_component=workflowComponent,
                        workflow_name=workflowName, input=inputData, workflow_options=workflowOptions)
        print(f"start_resp {start_resp.instance_id}")

        # ...

        # Pause Test
        d.pause_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        getResponse = d.get_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        print(f"Get response from {workflowName} after pause call: {getResponse.runtime_status}")

        # Resume Test
        d.resume_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        getResponse = d.get_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        print(f"Get response from {workflowName} after resume call: {getResponse.runtime_status}")
        
        sleep(1)
        # Raise event
        d.raise_workflow_event(instance_id=instanceId, workflow_component=workflowComponent,
                    event_name=eventName, event_data=eventData)

        sleep(5)
        # Purge Test
        d.purge_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        try:
            getResponse = d.get_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        except DaprInternalError as err:
            if nonExistentIDError in err._message:
                print("Instance Successfully Purged")

        
        # Kick off another workflow for termination purposes 
        # This will also test using the same instance ID on a new workflow after
        # the old instance was purged
        start_resp = d.start_workflow(instance_id=instanceId, workflow_component=workflowComponent,
                        workflow_name=workflowName, input=inputData, workflow_options=workflowOptions)
        print(f"start_resp {start_resp.instance_id}")

        # Terminate Test
        d.terminate_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        sleep(1)
        getResponse = d.get_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        print(f"Get response from {workflowName} after terminate call: {getResponse.runtime_status}")

        # Purge Test
        d.purge_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        try:
            getResponse = d.get_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        except DaprInternalError as err:
            if nonExistentIDError in err._message:
                print("Instance Successfully Purged")

        workflowRuntime.shutdown()
```

- 了解更多关于编写和管理工作流的信息：
  - [操作方法：编写工作流]({{< ref howto-author-workflow.md >}}).
  - [操作方法：管理工作流]({{< ref howto-manage-workflow.md >}}).
- 访问[Python SDK示例](https://github.com/dapr/python-sdk/blob/master/examples/demo_workflow/app.py)获取代码示例和指南，尝试使用Dapr工作流。

## 相关链接

[Python SDK示例](https://github.com/dapr/python-sdk/tree/master/examples)
