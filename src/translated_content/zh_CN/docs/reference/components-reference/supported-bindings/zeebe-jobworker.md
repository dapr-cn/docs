---
type: docs
title: "Zeebe JobWorker 绑定说明"
linkTitle: "Zeebe JobWorker"
description: "关于 Zeebe JobWorker 绑定组件的详细文档"
---

## 组件配置格式

要配置 Zeebe JobWorker 绑定，请创建一个类型为 `bindings.zeebe.jobworker` 的组件。请参考[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})了解如何创建和应用绑定配置。

有关 Zeebe JobWorker 的详细文档，请查看[此处](https://docs.camunda.io/docs/components/concepts/job-workers/)。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: bindings.zeebe.jobworker
  version: v1
  metadata:
  - name: gatewayAddr
    value: "<host>:<port>"
  - name: gatewayKeepAlive
    value: "45s"
  - name: usePlainTextConnection
    value: "true"
  - name: caCertificatePath
    value: "/path/to/ca-cert"
  - name: workerName
    value: "products-worker"
  - name: workerTimeout
    value: "5m"
  - name: requestTimeout
    value: "15s"
  - name: jobType
    value: "fetch-products"
  - name: maxJobsActive
    value: "32"
  - name: concurrency
    value: "4"
  - name: pollInterval
    value: "100ms"
  - name: pollThreshold
    value: "0.3"
  - name: fetchVariables
    value: "productId, productName, productKey"
  - name: autocomplete
    value: "true"
  - name: retryBackOff
    value: "30s"
  - name: direction
    value: "input"
```

## 元数据字段说明

| 字段                   | 必需 | 绑定支持 |  详情 | 示例 |
|-------------------------|:--------:|------------|-----|---------|
| `gatewayAddr`             | Y | 输入 | Zeebe 网关地址                                                                                                            | `"localhost:26500"` |
| `gatewayKeepAlive`        | N | 输入 | 设置发送到网关的保活消息频率，默认为 45 秒                                         | `"45s"` |
| `usePlainTextConnection`  | N | 输入 | 是否使用纯文本连接                                                                                    | `"true"`, `"false"` |
| `caCertificatePath`       | N | 输入 | CA 证书的路径                                                                                                          | `"/path/to/ca-cert"` |
| `workerName`              | N | 输入 | 激活作业的 worker 名称，主要用于日志记录                                                     | `"products-worker"` |
| `workerTimeout`           | N | 输入 | 在此调用后返回的作业在超时之前不会被另一个调用激活，默认为 5 分钟   | `"5m"` |
| `requestTimeout`          | N | 输入 | 请求将在至少一个作业被激活或达到 requestTimeout 后完成。如果 requestTimeout = 0，则使用默认超时。如果 requestTimeout < 0，则禁用长轮询，即使没有作业被激活，请求也会立即完成。默认为 10 秒  | `"30s"` |
| `jobType`                 | Y | 输入 | 在 BPMN 流程中定义的作业类型（例如 `<zeebe:taskDefinition type="fetch-products" />`）                             | `"fetch-products"` |
| `maxJobsActive`           | N | 输入 | 设置此 worker 同时激活的最大作业数，默认为 32                          | `"32"` |
| `concurrency`             | N | 输入 | 完成作业的最大并发 goroutines 数量，默认为 4                                              | `"4"` |
| `pollInterval`            | N | 输入 | 设置轮询新作业的最大间隔，默认为 100 毫秒                                              | `"100ms"` |
| `pollThreshold`           | N | 输入 | 设置缓冲激活作业的阈值以便轮询新作业，即阈值 * maxJobsActive，默认为 0.3        | `"0.3"` |
| `fetchVariables`          | N | 输入 | 要获取的作业变量列表；如果为空，则在作业激活时返回作用域内的所有可见变量 | `"productId"`, `"productName"`, `"productKey"` |
| `autocomplete`            | N | 输入 | 指示作业是否应自动完成。如果未设置，默认情况下所有作业将自动完成。如果 worker 应手动完成或因业务错误或事件而失败作业，请禁用此选项 | `"true"`, `"false"` |
| `retryBackOff`            | N | 输入 | 作业失败时下次重试的回退超时                                                                           | `15s` |
| `direction`            | N | 输入 | 绑定的方向 | `"input"` |

## 绑定支持

此组件支持**输入**绑定接口。

### 输入绑定

#### 变量

Zeebe 流程引擎处理流程状态，并可以在流程实例化时传递或在流程执行期间更新或创建流程变量。这些变量可以通过在 `fetchVariables` 元数据字段中定义变量名称的逗号分隔列表传递给注册的作业 worker。然后，流程引擎将这些变量及其当前值传递给作业 worker 实现。

如果绑定注册了三个变量 `productId`、`productName` 和 `productKey`，则 worker 将接收到以下 JSON 主体：

```json
{
  "productId": "some-product-id",
  "productName": "some-product-name",
  "productKey": "some-product-key"
}
```

注意：如果未传递 `fetchVariables` 元数据字段，则所有流程变量将传递给 worker。

#### 头信息

Zeebe 流程引擎能够将自定义任务头信息传递给作业 worker。这些头信息可以为每个[服务任务](https://docs.camunda.io/docs/components/best-practices/development/service-integration-patterns/#service-task)定义。任务头信息将作为元数据（HTTP 头信息）由绑定传递给作业 worker。

绑定还将以下与作业相关的变量作为元数据传递。值将作为字符串传递。表格中还包含原始数据类型，以便可以在 worker 使用的编程语言中转换回等效数据类型。

| 元数据                           | 数据类型 | 描述                                                                                     |
|------------------------------------|-----------|-------------------------------------------------------------------------------------------------|
| X-Zeebe-Job-Key                    | int64     | 作业的键，一个唯一标识符                                                        |
| X-Zeebe-Job-Type                   | string    | 作业的类型（应与请求的类型匹配）                                           |
| X-Zeebe-Process-Instance-Key       | int64     | 作业的流程实例键                                                                  |
| X-Zeebe-Bpmn-Process-Id            | string    | 作业流程定义的 bpmn 流程 ID                                               |
| X-Zeebe-Process-Definition-Version | int32     | 作业流程定义的版本                                                       |
| X-Zeebe-Process-Definition-Key     | int64     | 作业流程定义的键                                                           |
| X-Zeebe-Element-Id                 | string    | 关联任务元素 ID                                                                  |
| X-Zeebe-Element-Instance-Key       | int64     | 唯一标识关联任务的唯一键，在流程实例范围内唯一 |
| X-Zeebe-Worker                     | string    | 激活此作业的 worker 名称                                                 |
| X-Zeebe-Retries                    | int32     | 此作业剩余的重试次数（应始终为正）                              |
| X-Zeebe-Deadline                   | int64     | 作业可以再次激活的时间，以 UNIX 纪元时间戳发送                             |
| X-Zeebe-Autocomplete               | bool      | 在绑定元数据中定义的自动完成状态                                 |

## 相关链接

- [Dapr 组件的基本架构]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何：使用输入绑定触发应用程序]({{< ref howto-triggers.md >}})
- [如何：使用绑定与外部资源接口]({{< ref howto-bindings.md >}})
- [绑定 API 参考]({{< ref bindings_api.md >}})
