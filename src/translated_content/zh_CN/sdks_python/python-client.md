---
type: docs
title: "使用 Dapr 客户端 Python SDK 入门"
linkTitle: "客户端"
weight: 10000
description: 如何使用 Dapr Python SDK 快速上手
---

Dapr 客户端包使您能够从 Python 应用程序与其他 Dapr 应用程序进行交互。

{{% alert title="注意" color="primary" %}}
 如果您还没有尝试过，[请尝试其中一个快速入门]({{< ref quickstarts >}})，以快速了解如何使用 Dapr Python SDK 和 API 构建块。

{{% /alert %}}

## 准备工作

在开始之前，[安装 Dapr Python 包]({{< ref "python#installation" >}})。

## 导入客户端包

`dapr` 包包含 `DaprClient`，用于创建和使用客户端。

```python
from dapr.clients import DaprClient
```

## 初始化客户端
您可以通过多种方式初始化 Dapr 客户端：

#### 默认值：
如果不提供参数初始化客户端，它将使用 Dapr sidecar 实例的默认值 (`127.0.0.1:50001`)。
```python
from dapr.clients import DaprClient

with DaprClient() as d:
    # 使用客户端
```

#### 在初始化时指定端点：
在构造函数中传递参数时，gRPC 端点优先于任何配置或环境变量。

```python
from dapr.clients import DaprClient

with DaprClient("mydomain:50051?tls=true") as d:
    # 使用客户端
```  

#### 配置选项：

##### Dapr Sidecar 端点
您可以使用标准化的 `DAPR_GRPC_ENDPOINT` 环境变量来指定 gRPC 端点。当设置了此变量时，可以在没有任何参数的情况下初始化客户端：

```bash
export DAPR_GRPC_ENDPOINT="mydomain:50051?tls=true"
```
```python
from dapr.clients import DaprClient

with DaprClient() as d:
    # 客户端将使用环境变量中指定的端点
```  

旧的环境变量 `DAPR_RUNTIME_HOST`、`DAPR_HTTP_PORT` 和 `DAPR_GRPC_PORT` 也被支持，但 `DAPR_GRPC_ENDPOINT` 优先。

##### Dapr API 令牌
如果您的 Dapr 实例配置为需要 `DAPR_API_TOKEN` 环境变量，您可以在环境中设置它，客户端将自动使用它。  
您可以在[这里](https://docs.dapr.io/operations/security/api-token/)阅读更多关于 Dapr API 令牌认证的信息。

##### 健康检查超时
客户端初始化时，会对 Dapr sidecar (`/healthz/outbound`) 进行健康检查。客户端将在 sidecar 启动并运行后继续。

默认的健康检查超时时间为 60 秒，但可以通过设置 `DAPR_HEALTH_TIMEOUT` 环境变量来覆盖。

##### 重试和超时

如果从 sidecar 收到特定错误代码，Dapr 客户端可以重试请求。这可以通过 `DAPR_API_MAX_RETRIES` 环境变量进行配置，并自动获取，不需要任何代码更改。
`DAPR_API_MAX_RETRIES` 的默认值为 `0`，这意味着不会进行重试。

您可以通过创建 `dapr.clients.retry.RetryPolicy` 对象并将其传递给 DaprClient 构造函数来微调更多重试参数：

```python
from dapr.clients.retry import RetryPolicy

retry = RetryPolicy(
    max_attempts=5, 
    initial_backoff=1, 
    max_backoff=20, 
    backoff_multiplier=1.5,
    retryable_http_status_codes=[408, 429, 500, 502, 503, 504],
    retryable_grpc_status_codes=[StatusCode.UNAVAILABLE, StatusCode.DEADLINE_EXCEEDED, ]
)

with DaprClient(retry_policy=retry) as d:
    ...
```

或对于 actor：
```python
factory = ActorProxyFactory(retry_policy=RetryPolicy(max_attempts=3))
proxy = ActorProxy.create('DemoActor', ActorId('1'), DemoActorInterface, factory)
```

**超时**可以通过环境变量 `DAPR_API_TIMEOUT_SECONDS` 为所有调用设置。默认值为 60 秒。

> 注意：您可以通过将 `timeout` 参数传递给 `invoke_method` 方法来单独控制服务调用的超时。

## 错误处理
最初，Dapr 中的错误遵循 [标准 gRPC 错误模型](https://grpc.io/docs/guides/error/#standard-error-model)。然而，为了提供更详细和信息丰富的错误消息，在版本 1.13 中引入了一个增强的错误模型，与 gRPC [更丰富的错误模型](https://grpc.io/docs/guides/error/#richer-error-model) 对齐。作为回应，Python SDK 实现了 `DaprGrpcError`，一个旨在改善开发者体验的自定义异常类。  
需要注意的是，过渡到使用 `DaprGrpcError` 处理所有 gRPC 状态异常仍在进行中。目前，SDK 中的每个 API 调用尚未更新以利用此自定义异常。我们正在积极进行此增强，并欢迎社区的贡献。

使用 Dapr python-SDK 处理 `DaprGrpcError` 异常的示例：

```python
try:
    d.save_state(store_name=storeName, key=key, value=value)
except DaprGrpcError as err:
    print(f'状态代码: {err.code()}')
    print(f"消息: {err.message()}")
    print(f"错误代码: {err.error_code()}")
    print(f"错误信息(原因): {err.error_info.reason}")
    print(f"资源信息 (资源类型): {err.resource_info.resource_type}")
    print(f"资源信息 (资源名称): {err.resource_info.resource_name}")
    print(f"错误请求 (字段): {err.bad_request.field_violations[0].field}")
    print(f"错误请求 (描述): {err.bad_request.field_violations[0].description}")
```

## 构建块

Python SDK 允许您与所有 [Dapr 构建块]({{< ref building-blocks >}}) 进行接口交互。

### 调用服务

Dapr Python SDK 提供了一个简单的 API，用于通过 HTTP 或 gRPC（已弃用）调用服务。可以通过设置 `DAPR_API_METHOD_INVOCATION_PROTOCOL` 环境变量来选择协议，默认情况下未设置时为 HTTP。Dapr 中的 GRPC 服务调用已弃用，建议使用 GRPC 代理作为替代。

```python 
from dapr.clients import DaprClient

with DaprClient() as d:
    # 调用方法 (gRPC 或 HTTP GET)    
    resp = d.invoke_method('service-to-invoke', 'method-to-invoke', data='{"message":"Hello World"}')

    # 对于其他 HTTP 动词，必须指定动词
    # 调用 'POST' 方法 (仅限 HTTP)    
    resp = d.invoke_method('service-to-invoke', 'method-to-invoke', data='{"id":"100", "FirstName":"Value", "LastName":"Value"}', http_verb='post')
```

HTTP API 调用的基本端点在 `DAPR_HTTP_ENDPOINT` 环境变量中指定。
如果未设置此变量，则端点值从 `DAPR_RUNTIME_HOST` 和 `DAPR_HTTP_PORT` 变量派生，其默认值分别为 `127.0.0.1` 和 `3500`。

gRPC 调用的基本端点是用于客户端初始化的端点（[如上所述](#initialising-the-client)）。

- 有关服务调用的完整指南，请访问 [How-To: Invoke a service]({{< ref howto-invoke-discover-services.md >}})。
- 访问 [Python SDK 示例](https://github.com/dapr/python-sdk/tree/master/examples/invoke-simple) 以获取代码示例和尝试服务调用的说明。

### 保存和获取应用程序状态

```python
from dapr.clients import DaprClient

with DaprClient() as d:
    # 保存状态
    d.save_state(store_name="statestore", key="key1", value="value1")

    # 获取状态
    data = d.get_state(store_name="statestore", key="key1").data

    # 删除状态
    d.delete_state(store_name="statestore", key="key1")
```

- 有关状态操作的完整列表，请访问 [How-To: Get & save state]({{< ref howto-get-save-state.md >}})。
- 访问 [Python SDK 示例](https://github.com/dapr/python-sdk/tree/master/examples/state_store) 以获取代码示例和尝试状态管理的说明。

### 查询应用程序状态 (Alpha)

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
            states_metadata={"metakey": "metavalue"},  # 可选
        )
```

- 有关状态存储查询选项的完整列表，请访问 [How-To: Query state]({{< ref howto-state-query-api.md >}})。
- 访问 [Python SDK 示例](https://github.com/dapr/python-sdk/tree/master/examples/state_store_query) 以获取代码示例和尝试状态存储查询的说明。

### 发布和订阅

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

# 默认订阅一个主题
@app.subscribe(pubsub_name='pubsub', topic='TOPIC_A')
def mytopic(event: v1.Event) -> None:
    data = json.loads(event.Data())
    print(f'接收到: id={data["id"]}, message="{data ["message"]}"' 
          ' content_type="{event.content_type}"',flush=True)

# 使用 Pub/Sub 路由的特定处理程序
@app.subscribe(pubsub_name='pubsub', topic='TOPIC_A',
               rule=Rule("event.type == \"important\"", 1))
def mytopic_important(event: v1.Event) -> None:
    data = json.loads(event.Data())
    print(f'接收到: id={data["id"]}, message="{data ["message"]}"' 
          ' content_type="{event.content_type}"',flush=True)
```

- 有关 pub/sub 的更多信息，请访问 [How-To: Publish & subscribe]({{< ref howto-publish-subscribe.md >}})。
- 访问 [Python SDK 示例](https://github.com/dapr/python-sdk/tree/master/examples/pubsub-simple) 以获取代码示例和尝试 pub/sub 的说明。

#### 流式消息订阅

您可以使用 `subscribe` 或 `subscribe_handler` 方法创建对 PubSub 主题的流式订阅。

`subscribe` 方法返回一个 `Subscription` 对象，允许您通过调用 `next_message` 方法从流中提取消息。这将在等待消息时阻塞主线程。完成后，您应该调用 close 方法以终止订阅并停止接收消息。

`subscribe_with_handler` 方法接受一个回调函数，该函数针对从流中接收到的每条消息执行。它在单独的线程中运行，因此不会阻塞主线程。回调应返回一个 `TopicEventResponse`（例如 `TopicEventResponse('success')`），指示消息是否已成功处理、应重试或应丢弃。该方法将根据返回的状态自动管理消息确认。对 `subscribe_with_handler` 方法的调用返回一个关闭函数，完成后应调用该函数以终止订阅。

以下是使用 `subscribe` 方法的示例：

```python
import time

from dapr.clients import DaprClient
from dapr.clients.grpc.subscription import StreamInactiveError

counter = 0


def process_message(message):
    global counter
    counter += 1
    # 在此处处理消息
    print(f'处理消息: {message.data()} 来自 {message.topic()}...')
    return 'success'


def main():
    with DaprClient() as client:
        global counter

        subscription = client.subscribe(
            pubsub_name='pubsub', topic='TOPIC_A', dead_letter_topic='TOPIC_A_DEAD'
        )

        try:
            while counter < 5:
                try:
                    message = subscription.next_message()

                except StreamInactiveError as e:
                    print('流不活跃。重试...')
                    time.sleep(1)
                    continue
                if message is None:
                    print('在超时时间内未收到消息。')
                    continue

                # 处理消息
                response_status = process_message(message)

                if response_status == 'success':
                    subscription.respond_success(message)
                elif response_status == 'retry':
                    subscription.respond_retry(message)
                elif response_status == 'drop':
                    subscription.respond_drop(message)

        finally:
            print("关闭订阅...")
            subscription.close()


if __name__ == '__main__':
    main()
```

以下是使用 `subscribe_with_handler` 方法的示例：

```python
import time

from dapr.clients import DaprClient
from dapr.clients.grpc._response import TopicEventResponse

counter = 0


def process_message(message):
    # 在此处处理消息
    global counter
    counter += 1
    print(f'处理消息: {message.data()} 来自 {message.topic()}...')
    return TopicEventResponse('success')


def main():
    with (DaprClient() as client):
        # 这将启动一个新线程，该线程将监听消息
        # 并在 `process_message` 函数中处理它们
        close_fn = client.subscribe_with_handler(
            pubsub_name='pubsub', topic='TOPIC_A', handler_fn=process_message,
            dead_letter_topic='TOPIC_A_DEAD'
        )

        while counter < 5:
            time.sleep(1)

        print("关闭订阅...")
        close_fn()


if __name__ == '__main__':
    main()
```

- 有关 pub/sub 的更多信息，请访问 [How-To: Publish & subscribe]({{< ref howto-publish-subscribe.md >}})。
- 访问 [Python SDK 示例](https://github.com/dapr/python-sdk/tree/main/examples/pubsub-simple) 以获取代码示例和尝试流式 pub/sub 的说明。

### 与输出绑定交互

```python
from dapr.clients import DaprClient

with DaprClient() as d:
    resp = d.invoke_binding(binding_name='kafkaBinding', operation='create', data='{"message":"Hello World"}')
```

- 有关输出绑定的完整指南，请访问 [How-To: Use bindings]({{< ref howto-bindings.md >}})。
- 访问 [Python SDK 示例](https://github.com/dapr/python-sdk/tree/main/examples/invoke-binding) 以获取代码示例和尝试输出绑定的说明。

### 检索秘密

```python
from dapr.clients import DaprClient

with DaprClient() as d:
    resp = d.get_secret(store_name='localsecretstore', key='secretKey')
```

- 有关秘密的完整指南，请访问 [How-To: Retrieve secrets]({{< ref howto-secrets.md >}})。
- 访问 [Python SDK 示例](https://github.com/dapr/python-sdk/tree/master/examples/secret_store) 以获取代码示例和尝试检索秘密的说明。

### 配置

#### 获取配置

```python
from dapr.clients import DaprClient

with DaprClient() as d:
    # 获取配置
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

        # 在 20 秒内等待 sidecar 启动。
        d.wait(20)

        # 通过键订阅配置。
        configuration = await d.subscribe_configuration(store_name=storeName, keys=[key], config_metadata={})
        while True:
            if configuration != None:
                items = configuration.get_items()
                for key, item in items:
                    print(f"订阅键={key} 值={item.value} 版本={item.version}", flush=True)
            else:
                print("尚无内容")
        sleep(5)

asyncio.run(executeConfiguration())
```

- 了解有关通过 [How-To: Manage configuration]({{< ref howto-manage-configuration.md >}}) 指南管理配置的更多信息。
- 访问 [Python SDK 示例](https://github.com/dapr/python-sdk/tree/master/examples/configuration) 以获取代码示例和尝试配置的说明。

### 分布式锁

```python
from dapr.clients import DaprClient

def main():
    # 锁参数
    store_name = 'lockstore'  # 在 components/lockstore.yaml 中定义
    resource_id = 'example-lock-resource'
    client_id = 'example-client-id'
    expiry_in_seconds = 60

    with DaprClient() as dapr:
        print('将尝试从名为 [%s] 的锁存储中获取锁' % store_name)
        print('锁是为名为 [%s] 的资源准备的' % resource_id)
        print('客户端标识符是 [%s]' % client_id)
        print('锁将在 %s 秒后过期。' % expiry_in_seconds)

        with dapr.try_lock(store_name, resource_id, client_id, expiry_in_seconds) as lock_result:
            assert lock_result.success, '获取锁失败。中止。'
            print('锁获取成功！！！')

        # 此时锁已释放 - 通过 `with` 子句的魔力 ;)
        unlock_result = dapr.unlock(store_name, resource_id, client_id)
        print('我们已经释放了锁，因此解锁将不起作用。')
        print('我们仍然尝试解锁它，并得到了 [%s]' % unlock_result.status)
```

- 了解有关使用分布式锁的更多信息：[How-To: Use a lock]({{< ref howto-use-distributed-lock.md >}})。
- 访问 [Python SDK 示例](https://github.com/dapr/python-sdk/blob/master/examples/distributed_lock) 以获取代码示例和尝试分布式锁的说明。

### 加密

```python
from dapr.clients import DaprClient

message = 'The secret is "passw0rd"'

def main():
    with DaprClient() as d:
        resp = d.encrypt(
            data=message.encode(),
            options=EncryptOptions(
                component_name='crypto-localstorage',
                key_name='rsa-private-key.pem',
                key_wrap_algorithm='RSA',
            ),
        )
        encrypt_bytes = resp.read()

        resp = d.decrypt(
            data=encrypt_bytes,
            options=DecryptOptions(
                component_name='crypto-localstorage',
                key_name='rsa-private-key.pem',
            ),
        )
        decrypt_bytes = resp.read()

        print(decrypt_bytes.decode())  # The secret is "passw0rd"
```

- 有关状态操作的完整列表，请访问 [How-To: Use the cryptography APIs]({{< ref howto-cryptography.md >}})。
- 访问 [Python SDK 示例](https://github.com/dapr/python-sdk/tree/master/examples/crypto) 以获取代码示例和尝试加密的说明。

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

        # 启动工作流
        start_resp = d.start_workflow(instance_id=instanceId, workflow_component=workflowComponent,
                        workflow_name=workflowName, input=inputData, workflow_options=workflowOptions)
        print(f"start_resp {start_resp.instance_id}")

        # ...

        # 暂停测试
        d.pause_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        getResponse = d.get_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        print(f"从 {workflowName} 获取暂停调用后的响应: {getResponse.runtime_status}")

        # 恢复测试
        d.resume_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        getResponse = d.get_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        print(f"从 {workflowName} 获取恢复调用后的响应: {getResponse.runtime_status}")
        
        sleep(1)
        # 触发事件
        d.raise_workflow_event(instance_id=instanceId, workflow_component=workflowComponent,
                    event_name=eventName, event_data=eventData)

        sleep(5)
        # 清除测试
        d.purge_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        try:
            getResponse = d.get_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        except DaprInternalError as err:
            if nonExistentIDError in err._message:
                print("实例成功清除")

        
        # 启动另一个工作流以进行终止
        # 这也将测试在旧实例被清除后在新工作流上使用相同的实例 ID
        start_resp = d.start_workflow(instance_id=instanceId, workflow_component=workflowComponent,
                        workflow_name=workflowName, input=inputData, workflow_options=workflowOptions)
        print(f"start_resp {start_resp.instance_id}")

        # 终止测试
        d.terminate_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        sleep(1)
        getResponse = d.get_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        print(f"从 {workflowName} 获取终止调用后的响应: {getResponse.runtime_status}")

        # 清除测试
        d.purge_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        try:
            getResponse = d.get_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        except DaprInternalError as err:
            if nonExistentIDError in err._message:
                print("实例成功清除")

        workflowRuntime.shutdown()
```

- 了解有关编写和管理工作流的更多信息： 
  - [How-To: Author a workflow]({{< ref howto-author-workflow.md >}})。
  - [How-To: Manage a workflow]({{< ref howto-manage-workflow.md >}})。
- 访问 [Python SDK 示例](https://github.com/dapr/python-sdk/blob/master/examples/demo_workflow/app.py) 以获取代码示例和尝试 Dapr 工作流的说明。

## 相关链接
[Python SDK 示例](https://github.com/dapr/python-sdk/tree/master/examples)
