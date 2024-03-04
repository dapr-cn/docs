---
type: docs
title: "开始使用 Dapr 客户端 Python SDK"
linkTitle: "客户端"
weight: 10000
description: 如何使用 Dapr Python SDK 启动和运行
---

Dapr 客户端包允许您从 Python 应用程序中与其他 Dapr 应用程序进行交互。

{{% alert title="Note" color="primary" %}}
 如果您还没有， [试用其中一个快速入门]({{< ref quickstarts >}}) 快速了解如何将 Dapr Python SDK 与 API 构建块一起使用。

{{% /alert %}}

## 前期准备

[安装 Dapr Python 软件包]({{< ref "python#installation" >}}) 在开始之前。

## 导入客户端包

`dapr` 包含 `DaprClient`，用于创建和使用客户端。

```python
from dapr.clients import DaprClient
```

## 构建块

Python SDK 允许你与所有的 [Dapr 构建块]({{< ref building-blocks >}}) 进行交互。

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
- 请访问 [Python SDK 示例](https://github.com/dapr/python-sdk/tree/master/examples/invoke-simple) ，了解代码示例和说明，尝试服务调用。

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

- 有关状态操作的完整列表，请访问 [如何：获取 & 保存 状态。]({{< ref howto-get-save-state.md >}})。
- 请访问 [Python SDK 示例](https://github.com/dapr/python-sdk/tree/master/examples/state_store) ，了解代码示例和说明，以尝试使用状态管理。

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
- 请访问 [Python SDK 示例](https://github.com/dapr/python-sdk/tree/master/examples/state_store_query) ，了解代码示例和说明，以尝试使用状态存储查询。

### 发布 & 订阅消息

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
- 请访问 [Python SDK 示例](https://github.com/dapr/python-sdk/tree/master/examples/pubsub-simple)以获取代码样本和说明，尝试使用 pub/sub.


### 与输出绑定交互

```python
from dapr.clients import DaprClient

with DaprClient() as d:
    resp = d.invoke_binding(binding_name='kafkaBinding', operation='create', data='{"message":"Hello World"}')
```

- 有关输出绑定的完整指南，请访问[操作方法：使用绑定]({{< ref howto-bindings.md >}})。
- 请访问 [Python SDK 示例](https://github.com/dapr/python-sdk/tree/master/examples/invoke-binding)以获取代码样本和说明，尝试输出绑定。

### 检索密钥

```python
from dapr.clients import DaprClient

with DaprClient() as d:
    resp = d.get_secret(store_name='localsecretstore', key='secretKey')
```

- 有关密钥的完整指南，请访问[操作方法：检索密钥]({{< ref howto-secrets.md >}})。
- 请访问 [Python SDK 示例](https://github.com/dapr/python-sdk/tree/master/examples/secret_store)以获取代码样本和说明，以尝试检索秘密。

### 配置

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
- 请访问 [Python SDK 示例](https://github.com/dapr/python-sdk/tree/master/examples/configuration)以获取代码样本和说明，尝试配置。

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

- 了解有关使用分布式锁的详细信息： [操作方法：使用锁]({{< ref howto-use-distributed-lock.md >}}).
- 请访问 [Python SDK 示例](https://github.com/dapr/python-sdk/blob/master/examples/distributed_lock) 以获取代码示例和说明，以尝试分布式锁。

### 工作流

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
  - [操作方法：创作工作流]({{< ref howto-author-workflow.md >}}).
  - [操作方法：管理工作流]({{< ref howto-manage-workflow.md >}}).
- 请访问 [Python SDK 示例](https://github.com/dapr/python-sdk/blob/master/examples/demo_workflow/app.py) 以获取代码示例和说明，以尝试 Dapr 工作流。


## 相关链接
[Python SDK 示例](https://github.com/dapr/python-sdk/tree/master/examples)
