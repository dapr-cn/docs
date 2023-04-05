---
type: docs
title: "Zeebe JobWorker 绑定规范"
linkTitle: "Zeebe JobWorker"
description: "Zeebe JobWorker 绑定组件详细文档"
---

## 配置

要设置 Zeebe JobWorker绑定，需要创建一个类型为 `bindings.zeebe.jobworker` 的组件。 请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})，了解如何创建和应用绑定配置。

参照[此处](https://docs.camunda.io/docs/product-manuals/concepts/job-workers)了解Zeebe JobWorker文档。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.zeebe.jobworker
  version: v1
  metadata:
  - name: gatewayAddr
    value: <host>:<port>
  - name: gatewayKeepAlive
    value: 45s
  - name: usePlainTextConnection
    value: true
  - name: caCertificatePath
    value: /path/to/ca-cert
  - name: workerName
    value: products-worker
  - name: workerTimeout
    value: 5m
  - name: requestTimeout
    value: 15s
  - name: jobType
    value: fetch-products
  - name: maxJobsActive
    value: 32
  - name: concurrency
    value: 4
  - name: pollInterval
    value: 100ms
  - name: pollThreshold
    value: 0.3
  - name: fetchVariables
    value: productId, productName, productKey
```

## 元数据字段规范

| 字段                     | 必填 | 绑定支持 | 详情                                                                                                                          | 示例                                   |
| ---------------------- |:--:| ---- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| gatewayAddr            | 是  | 输入   | Zeebe网关地址                                                                                                                   | `localhost:26500`                    |
| gatewayKeepAlive       | 否  | 输入   | 设置保持会话消息发送到网关的频率 默认45秒                                                                                                      | `45s`                                |
| usePlainTextConnection | 否  | 输入   | 是否使用纯文本连接                                                                                                                   | `true,false`                         |
| caCertificatePath      | 否  | 输入   | CA 证书的路径                                                                                                                    | `/path/to/ca-cert`                   |
| workerName             | 否  | 输入   | 激活作业的工作线程的名称，主要用于记录目的                                                                                                       | `products-worker`                    |
| workerTimeout          | 否  | 输入   | 本次调用返回的作业在超时之前不会被另一个调用激活；默认为 5 分钟                                                                                           | `5m`                                 |
| requestTimeout         | 否  | 输入   | 当至少一个作业被激活或在 requestTimeout 之后，该请求将完成。 如果 requestTimeout = 0，则使用默认超时。 如果 requestTimeout < 0，则禁用长轮询并立即完成请求，即使没有激活任何作业。 默认10秒 | `30s`                                |
| jobType                | 是  | 输入   | 作业类型，在 BPMN 进程中定义（例如 `<zeebe:taskDefinition type="fetch-products" />`）                                                | `fetch-products`                     |
| maxJobsActive          | 否  | 输入   | 设置同时为此工作线程激活的最大作业数。 默认值为 32。                                                                                                | `32`                                 |
| concurrency            | 否  | 输入   | 完成作业的并发生成的 goroutine 的最大数量。 默认值为 4。                                                                                         | `4`                                  |
| pollInterval           | 否  | 输入   | 设置轮询新作业的最大间隔。 默认100秒                                                                                                        | `100ms`                              |
| pollThreshold          | 否  | 输入   | 设置在轮询新作业之前缓冲已激活作业的阈值，例如 threshold* maxJobsActive。 默认值为 0.3。                                                                 | `0.3`                                |
| fetchVariables         | 否  | 输入   | 作为作业变量获取的变量列表；如果为空，则将返回作业激活时作业作用域内的所有可见变量                                                                                   | `productId, productName, productKey` |

## 绑定支持

此组件支持 **输入** 绑定接口。

### 输入绑定

#### 变量

Zeebe进程引擎也会将进程状态作为变量处理，这些进程变量可以在进程实例化时传递或者进程执行过程中被更新或者创建。 这些变量可以通过将变量名定义为在元数据`fetchVariables`字段中以逗号分隔的列表传递给已注册的作业。 然后，处理引擎会将这些变量以及他们当前的值传递给作业线程。

如果绑定要注册三个变量 `productId`、 `productName` 和 `productKey` ，那么将使用以下 JSON 格式数据调用 worker线程：

```json
{
  "productId": "some-product-id",
  "productName": "some-product-name",
  "productKey": "some-product-key"
}
```

注意：如果不传递 `fetchVariables` 元数据字段，那么所有进程变量都会传递给worker线程。

#### Headers

Zeebe进程引擎能够将自定义任务请求头传递给作业工作线程。 可以为每个 [服务任务](https://stage.docs.zeebe.io/bpmn-workflows/service-tasks/service-tasks.html)定义这些请求头。 任务请求头将通过绑定元数据（HTTP 请求头）传递给作业工作线程 。

绑定还将以下作业相关变量作为元数据传递。 这些值将作为字符串传递。 该表单还包含原始数据类型，以便可以将其转换回工作线程使用的编程语言中相同的数据类型。

| 元数据                                | 数据类型   | 说明                        |
| ---------------------------------- | ------ | ------------------------- |
| X-Zeebe-Job-Key                    | int64  | 键值，作业的唯一标识符               |
| X-Zeebe-Job-Type                   | string | 工作的类型（应与请求的内容相匹配）         |
| X-Zeebe-Process-Instance-Key       | int64  | 作业的进程实例键                  |
| X-Zeebe-Bpmn-Process-Id            | string | 作业进程定义的bpmn进程ID           |
| X-Zeebe-Process-Definition-Version | int32  | 作业进程定义的版本                 |
| X-Zeebe-Process-Definition-Key     | int64  | 作业进程定义的键值                 |
| X-Zeebe-Element-Id                 | string | 关联的任务元素 ID                |
| X-Zeebe-Element-Instance-Key       | int64  | 标识关联任务的唯一键，在进程实例范围内保持唯一   |
| X-Zeebe-Worker                     | string | 激活这个作业的工作线程名称             |
| X-Zeebe-Retries                    | int32  | 该作业的重试次数（应始终为正值）          |
| X-Zeebe-Deadline                   | int64  | 作业何时可以再次被激活，将以UNIX时间戳格式发送 |

## 相关链接

- [Dapr组件的基本格式]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过输入绑定触发应用]({{< ref howto-triggers.md >}})
- [如何处理: 使用绑定对接外部资源]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})