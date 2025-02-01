---
type: docs
title: "操作指南：启用事务性 Outbox 模式"
linkTitle: "操作指南：启用事务性 Outbox 模式"
weight: 400
description: "在状态存储和发布/订阅消息代理之间提交单个事务"
---

事务性 Outbox 模式是一种广为人知的设计模式，用于发送应用程序状态变化的通知。它通过一个跨越数据库和消息代理的单一事务来传递通知。

开发人员在尝试自行实现此模式时会遇到许多技术难题，通常需要编写复杂且容易出错的中央协调管理器，这些管理器最多支持一种或两种数据库和消息代理的组合。

例如，您可以使用 Outbox 模式来：
1. 向账户数据库写入新的用户记录。
2. 发送账户成功创建的通知消息。

通过 Dapr 的 Outbox 支持，您可以在调用 Dapr 的[事务 API]({{< ref "state_api.md#state-transactions" >}})时通知订阅者应用程序的状态何时被创建或更新。

下图概述了 Outbox 功能的工作原理：

1) 服务 A 使用事务将状态保存/更新到状态存储。
2) 在同一事务下将消息写入消息代理。当消息成功传递到消息代理时，事务完成，确保状态和消息一起被事务化。
3) 消息代理将消息主题传递给任何订阅者 - 在此情况下为服务 B。

<img src="/images/state-management-outbox.png" width=800 alt="显示 Outbox 模式步骤的图示">

## 要求

Outbox 功能可以与 Dapr 支持的任何[事务性状态存储]({{< ref supported-state-stores >}})一起使用。所有[发布/订阅代理]({{< ref supported-pubsub >}})都支持 Outbox 功能。

[了解更多关于您可以使用的事务方法。]({{< ref "howto-get-save-state.md#perform-state-transactions" >}})

{{% alert title="注意" color="primary" %}} 
建议与竞争消费者模式（例如，[Apache Kafka]({{< ref setup-apache-kafka>}})）一起使用的消息代理减少重复事件的可能性。
{{% /alert %}}

## 启用 Outbox 模式

要启用 Outbox 功能，请在状态存储组件上添加以下必需和可选字段：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: mysql-outbox
spec:
  type: state.mysql
  version: v1
  metadata:
  - name: connectionString
    value: "<CONNECTION STRING>"
  - name: outboxPublishPubsub # 必需
    value: "mypubsub"
  - name: outboxPublishTopic # 必需
    value: "newOrder"
  - name: outboxPubsub # 可选
    value: "myOutboxPubsub"
  - name: outboxDiscardWhenMissingState # 可选，默认为 false
    value: false
```

### 元数据字段

| 名称                | 必需    | 默认值 | 描述                                            |
| --------------------|-------------|---------------|------------------------------------------------------- |
| outboxPublishPubsub | 是         | N/A           | 设置发布状态更改时传递通知的发布/订阅组件的名称
| outboxPublishTopic  | 是         | N/A           | 设置接收在配置了 `outboxPublishPubsub` 的发布/订阅上的状态更改的主题。消息体将是 `insert` 或 `update` 操作的状态事务项
| outboxPubsub        | 否          | `outboxPublishPubsub`           | 设置 Dapr 用于协调状态和发布/订阅事务的发布/订阅组件。如果未设置，则使用配置了 `outboxPublishPubsub` 的发布/订阅组件。如果您希望将用于发送通知状态更改的发布/订阅组件与用于协调事务的组件分开，这将很有用
| outboxDiscardWhenMissingState  | 否         | `false`           | 通过将 `outboxDiscardWhenMissingState` 设置为 `true`，如果 Dapr 无法在数据库中找到状态且不重试，则 Dapr 将丢弃事务。如果在 Dapr 能够传递消息之前，状态存储数据因任何原因被删除，并且您希望 Dapr 从发布/订阅中删除项目并停止重试获取状态，此设置可能会很有用

## 其他配置

### 在同一状态存储上组合 Outbox 和非 Outbox 消息

如果您希望使用相同的状态存储来发送 Outbox 和非 Outbox 消息，只需定义两个连接到相同状态存储的状态存储组件，其中一个具有 Outbox 功能，另一个没有。

#### 没有 Outbox 的 MySQL 状态存储

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: mysql
spec:
  type: state.mysql
  version: v1
  metadata:
  - name: connectionString
    value: "<CONNECTION STRING>"
```

#### 具有 Outbox 的 MySQL 状态存储

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: mysql-outbox
spec:
  type: state.mysql
  version: v1
  metadata:
  - name: connectionString
    value: "<CONNECTION STRING>"
  - name: outboxPublishPubsub # 必需
    value: "mypubsub"
  - name: outboxPublishTopic # 必需
    value: "newOrder"
```

### 形状 Outbox 模式消息

您可以通过设置另一个不保存到数据库并明确提及为投影的事务来覆盖发布到发布/订阅代理的 Outbox 模式消息。此事务添加了一个名为 `outbox.projection` 的元数据键，值设置为 `true`。当添加到事务中保存的状态数组时，此负载在写入状态时被忽略，数据用作发送到上游订阅者的负载。

要正确使用，`key` 值必须在状态存储上的操作和消息投影之间匹配。如果键不匹配，则整个事务失败。

如果您为同一键启用了两个或多个 `outbox.projection` 状态项，则使用第一个定义的项，其他项将被忽略。

[了解更多关于默认和自定义 CloudEvent 消息。]({{< ref pubsub-cloudevents.md >}})

{{< tabs Python JavaScript ".NET" Java Go HTTP >}}

{{% codetab %}}

<!--python-->

在以下 Python SDK 的状态事务示例中，值 `"2"` 被保存到数据库，但值 `"3"` 被发布到最终用户主题。

```python
DAPR_STORE_NAME = "statestore"

async def main():
    client = DaprClient()

    # 定义第一个状态操作以保存值 "2"
    op1 = StateItem(
        key="key1",
        value=b"2"
    )

    # 定义第二个状态操作以带有元数据发布值 "3"
    op2 = StateItem(
        key="key1",
        value=b"3",
        options=StateOptions(
            metadata={
                "outbox.projection": "true"
            }
        )
    )

    # 创建状态操作列表
    ops = [op1, op2]

    # 执行状态事务
    await client.state.transaction(DAPR_STORE_NAME, operations=ops)
    print("状态事务已执行。")
```

通过将元数据项 `"outbox.projection"` 设置为 `"true"` 并确保 `key` 值匹配（`key1`）：
- 第一个操作被写入状态存储，消息未写入消息代理。
- 第二个操作值被发布到配置的发布/订阅主题。

{{% /codetab %}}

{{% codetab %}}

<!--javascript-->

在以下 JavaScript SDK 的状态事务示例中，值 `"2"` 被保存到数据库，但值 `"3"` 被发布到最终用户主题。

```javascript
const { DaprClient, StateOperationType } = require('@dapr/dapr');

const DAPR_STORE_NAME = "statestore";

async function main() {
  const client = new DaprClient();

  // 定义第一个状态操作以保存值 "2"
  const op1 = {
    operation: StateOperationType.UPSERT,
    request: {
      key: "key1",
      value: "2"
    }
  };

  // 定义第二个状态操作以带有元数据发布值 "3"
  const op2 = {
    operation: StateOperationType.UPSERT,
    request: {
      key: "key1",
      value: "3",
      metadata: {
        "outbox.projection": "true"
      }
    }
  };

  // 创建状态操作列表
  const ops = [op1, op2];

  // 执行状态事务
  await client.state.transaction(DAPR_STORE_NAME, ops);
  console.log("状态事务已执行。");
}

main().catch(err => {
  console.error(err);
});
```

通过将元数据项 `"outbox.projection"` 设置为 `"true"` 并确保 `key` 值匹配（`key1`）：
- 第一个操作被写入状态存储，消息未写入消息代理。
- 第二个操作值被发布到配置的发布/订阅主题。

{{% /codetab %}}

{{% codetab %}}

<!--dotnet-->

在以下 .NET SDK 的状态事务示例中，值 `"2"` 被保存到数据库，但值 `"3"` 被发布到最终用户主题。

```csharp
public class Program
{
    private const string DAPR_STORE_NAME = "statestore";

    public static async Task Main(string[] args)
    {
        var client = new DaprClientBuilder().Build();

        // 定义第一个状态操作以保存值 "2"
        var op1 = new StateTransactionRequest(
            key: "key1",
            value: Encoding.UTF8.GetBytes("2"),
            operationType: StateOperationType.Upsert
        );

        // 定义第二个状态操作以带有元数据发布值 "3"
        var metadata = new Dictionary<string, string>
        {
            { "outbox.projection", "true" }
        };
        var op2 = new StateTransactionRequest(
            key: "key1",
            value: Encoding.UTF8.GetBytes("3"),
            operationType: StateOperationType.Upsert,
            metadata: metadata
        );

        // 创建状态操作列表
        var ops = new List<StateTransactionRequest> { op1, op2 };

        // 执行状态事务
        await client.ExecuteStateTransactionAsync(DAPR_STORE_NAME, ops);
        Console.WriteLine("状态事务已执行。");
    }
}
```

通过将元数据项 `"outbox.projection"` 设置为 `"true"` 并确保 `key` 值匹配（`key1`）：
- 第一个操作被写入状态存储，消息未写入消息代理。
- 第二个操作值被发布到配置的发布/订阅主题。

{{% /codetab %}}

{{% codetab %}}

<!--java-->

在以下 Java SDK 的状态事务示例中，值 `"2"` 被保存到数据库，但值 `"3"` 被发布到最终用户主题。

```java
public class Main {
    private static final String DAPR_STORE_NAME = "statestore";

    public static void main(String[] args) {
        try (DaprClient client = new DaprClientBuilder().build()) {
            // 定义第一个状态操作以保存值 "2"
            StateOperation<String> op1 = new StateOperation<>(
                    StateOperationType.UPSERT,
                    "key1",
                    "2"
            );

            // 定义第二个状态操作以带有元数据发布值 "3"
            Map<String, String> metadata = new HashMap<>();
            metadata.put("outbox.projection", "true");

            StateOperation<String> op2 = new StateOperation<>(
                    StateOperationType.UPSERT,
                    "key1",
                    "3",
                    metadata
            );

            // 创建状态操作列表
            List<StateOperation<?>> ops = new ArrayList<>();
            ops.add(op1);
            ops.add(op2);

            // 执行状态事务
            client.executeStateTransaction(DAPR_STORE_NAME, ops).block();
            System.out.println("状态事务已执行。");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

通过将元数据项 `"outbox.projection"` 设置为 `"true"` 并确保 `key` 值匹配（`key1`）：
- 第一个操作被写入状态存储，消息未写入消息代理。
- 第二个操作值被发布到配置的发布/订阅主题。

{{% /codetab %}}

{{% codetab %}}

<!--go-->

在以下 Go SDK 的状态事务示例中，值 `"2"` 被保存到数据库，但值 `"3"` 被发布到最终用户主题。

```go
ops := make([]*dapr.StateOperation, 0)

op1 := &dapr.StateOperation{
    Type: dapr.StateOperationTypeUpsert,
    Item: &dapr.SetStateItem{
        Key:   "key1",
        Value: []byte("2"),
    },
}
op2 := &dapr.StateOperation{
    Type: dapr.StateOperationTypeUpsert,
    Item: &dapr.SetStateItem{
        Key:   "key1",
				Value: []byte("3"),
         // 覆盖保存到数据库的数据负载 
				Metadata: map[string]string{
					"outbox.projection": "true",
        },
    },
}
ops = append(ops, op1, op2)
meta := map[string]string{}
err := testClient.ExecuteStateTransaction(ctx, store, meta, ops)
```

通过将元数据项 `"outbox.projection"` 设置为 `"true"` 并确保 `key` 值匹配（`key1`）：
- 第一个操作被写入状态存储，消息未写入消息代理。
- 第二个操作值被发布到配置的发布/订阅主题。

{{% /codetab %}}

{{% codetab %}}

<!--http-->

您可以使用以下 HTTP 请求传递消息覆盖：

```bash
curl -X POST http://localhost:3500/v1.0/state/starwars/transaction \
  -H "Content-Type: application/json" \
  -d '{
  "operations": [
    {
      "operation": "upsert",
      "request": {
        "key": "order1",
        "value": {
            "orderId": "7hf8374s",
            "type": "book",
            "name": "The name of the wind"
        }
      }
    },
    {
      "operation": "upsert",
      "request": {
        "key": "order1",
        "value": {
            "orderId": "7hf8374s"
        },
        "metadata": {
           "outbox.projection": "true"
        },
        "contentType": "application/json"
      }
    }
  ]
}'
```

通过将元数据项 `"outbox.projection"` 设置为 `"true"` 并确保 `key` 值匹配（`key1`）：
- 第一个操作被写入状态存储，消息未写入消息代理。
- 第二个操作值被发布到配置的发布/订阅主题。

{{% /codetab %}}

{{< /tabs >}}

### 覆盖 Dapr 生成的 CloudEvent 字段

您可以使用自定义 CloudEvent 元数据覆盖发布的 Outbox 事件上的[Dapr 生成的 CloudEvent 字段]({{< ref "pubsub-cloudevents.md#dapr-generated-cloudevents-example" >}})。

{{< tabs Python JavaScript ".NET" Java Go HTTP >}}

{{% codetab %}}

<!--python-->

```python
async def execute_state_transaction():
    async with DaprClient() as client:
        # 定义状态操作
        ops = []

        op1 = {
            'operation': 'upsert',
            'request': {
                'key': 'key1',
                'value': b'2',  # 将字符串转换为字节数组
                'metadata': {
                    'cloudevent.id': 'unique-business-process-id',
                    'cloudevent.source': 'CustomersApp',
                    'cloudevent.type': 'CustomerCreated',
                    'cloudevent.subject': '123',
                    'my-custom-ce-field': 'abc'
                }
            }
        }

        ops.append(op1)

        # 执行状态事务
        store_name = 'your-state-store-name'
        try:
            await client.execute_state_transaction(store_name, ops)
            print('状态事务已执行。')
        except Exception as e:
            print('执行状态事务时出错：', e)

# 运行异步函数
if __name__ == "__main__":
    asyncio.run(execute_state_transaction())
```
{{% /codetab %}}

{{% codetab %}}

<!--javascript-->

```javascript
const { DaprClient } = require('dapr-client');

async function executeStateTransaction() {
    // 初始化 Dapr 客户端
    const daprClient = new DaprClient();

    // 定义状态操作
    const ops = [];

    const op1 = {
        operationType: 'upsert',
        request: {
            key: 'key1',
            value: Buffer.from('2'),
            metadata: {
                'id': 'unique-business-process-id',
                'source': 'CustomersApp',
                'type': 'CustomerCreated',
                'subject': '123',
                'my-custom-ce-field': 'abc'
            }
        }
    };

    ops.push(op1);

    // 执行状态事务
    const storeName = 'your-state-store-name';
    const metadata = {};
}

executeStateTransaction();
```
{{% /codetab %}}

{{% codetab %}}

<!--csharp-->

```csharp
public class StateOperationExample
{
    public async Task ExecuteStateTransactionAsync()
    {
        var daprClient = new DaprClientBuilder().Build();

        // 将值 "2" 定义为字符串并序列化为字节数组
        var value = "2";
        var valueBytes = JsonSerializer.SerializeToUtf8Bytes(value);

        // 定义第一个状态操作以保存值 "2" 并带有元数据
       // 覆盖 Cloudevent 元数据
        var metadata = new Dictionary<string, string>
        {
            { "cloudevent.id", "unique-business-process-id" },
            { "cloudevent.source", "CustomersApp" },
            { "cloudevent.type", "CustomerCreated" },
            { "cloudevent.subject", "123" },
            { "my-custom-ce-field", "abc" }
        };

        var op1 = new StateTransactionRequest(
            key: "key1",
            value: valueBytes,
            operationType: StateOperationType.Upsert,
            metadata: metadata
        );

        // 创建状态操作列表
        var ops = new List<StateTransactionRequest> { op1 };

        // 执行状态事务
        var storeName = "your-state-store-name";
        await daprClient.ExecuteStateTransactionAsync(storeName, ops);
        Console.WriteLine("状态事务已执行。");
    }

    public static async Task Main(string[] args)
    {
        var example = new StateOperationExample();
        await example.ExecuteStateTransactionAsync();
    }
}
```
{{% /codetab %}}

{{% codetab %}}

<!--java-->

```java
public class StateOperationExample {

    public static void main(String[] args) {
        executeStateTransaction();
    }

    public static void executeStateTransaction() {
        // 构建 Dapr 客户端
        try (DaprClient daprClient = new DaprClientBuilder().build()) {

            // 定义值 "2"
            String value = "2";

            // 覆盖 CloudEvent 元数据
            Map<String, String> metadata = new HashMap<>();
            metadata.put("cloudevent.id", "unique-business-process-id");
            metadata.put("cloudevent.source", "CustomersApp");
            metadata.put("cloudevent.type", "CustomerCreated");
            metadata.put("cloudevent.subject", "123");
            metadata.put("my-custom-ce-field", "abc");

            // 定义状态操作
            List<StateOperation<?>> ops = new ArrayList<>();
            StateOperation<String> op1 = new StateOperation<>(
                    StateOperationType.UPSERT,
                    "key1",
                    value,
                    metadata
            );
            ops.add(op1);

            // 执行状态事务
            String storeName = "your-state-store-name";
            daprClient.executeStateTransaction(storeName, ops).block();
            System.out.println("状态事务已执行。");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```
{{% /codetab %}}

{{% codetab %}}

<!--go-->

```go
func main() {
	// 创建 Dapr 客户端
	client, err := dapr.NewClient()
	if err != nil {
		log.Fatalf("创建 Dapr 客户端失败: %v", err)
	}
	defer client.Close()

	ctx := context.Background()
	store := "your-state-store-name"

	// 定义状态操作
	ops := make([]*dapr.StateOperation, 0)
	op1 := &dapr.StateOperation{
		Type: dapr.StateOperationTypeUpsert,
		Item: &dapr.SetStateItem{
			Key:   "key1",
			Value: []byte("2"),
			// 覆盖 Cloudevent 元数据
			Metadata: map[string]string{
				"cloudevent.id":                "unique-business-process-id",
				"cloudevent.source":            "CustomersApp",
				"cloudevent.type":              "CustomerCreated",
				"cloudevent.subject":           "123",
				"my-custom-ce-field":           "abc",
			},
		},
	}
	ops = append(ops, op1)

	// 事务的元数据（如果有）
	meta := map[string]string{}

	// 执行状态事务
	err = client.ExecuteStateTransaction(ctx, store, meta, ops)
	if err != nil {
		log.Fatalf("执行状态事务失败: %v", err)
	}

	log.Println("状态事务已执行。")
}
```
{{% /codetab %}}

{{% codetab %}}

<!--http-->

```bash
curl -X POST http://localhost:3500/v1.0/state/starwars/transaction \
  -H "Content-Type: application/json" \
  -d '{
        "operations": [
          {
            "operation": "upsert",
            "request": {
              "key": "key1",
              "value": "2"
            }
          },
        ],
        "metadata": {
          "id": "unique-business-process-id",
          "source": "CustomersApp",
          "type": "CustomerCreated",
          "subject": "123",
          "my-custom-ce-field": "abc",
        }
      }'
```

{{% /codetab %}}

{{< /tabs >}}

{{% alert title="注意" color="primary" %}}
`data` CloudEvent 字段仅供 Dapr 使用，且不可自定义。

{{% /alert %}}

## 演示

观看[此视频以了解 Outbox 模式的概述](https://youtu.be/rTovKpG0rhY?t=1338)：

<div class="embed-responsive embed-responsive-16by9">
<iframe width="360" height="315" src="https://www.youtube-nocookie.com/embed/rTovKpG0rhY?si=1xlS54vcdYnLLtOL&amp;start=1338" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
