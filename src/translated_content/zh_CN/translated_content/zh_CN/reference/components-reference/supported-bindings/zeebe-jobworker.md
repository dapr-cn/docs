---
type: docs
title: "Zeebe JobWorker 绑定规范"
linkTitle: "Zeebe JobWorker"
description: "Zeebe JobWorker 绑定组件详细文档"
---

## Component format

To setup Zeebe JobWorker binding create a component of type `bindings.zeebe.jobworker`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.

See [this](https://docs.camunda.io/docs/components/concepts/job-workers/) for Zeebe JobWorker documentation.

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

## 元数据字段规范

| Field                    | Required | 绑定支持  | 详情                                                                                                                                                                                                                                                                                                      | 示例                                             |
| ------------------------ |:--------:| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `gatewayAddr`            |    是     | Input | Zeebe gateway address                                                                                                                                                                                                                                                                                   | `"localhost:26500"`                            |
| `gatewayKeepAlive`       |    否     | Input | 设置保持会话消息发送到网关的频率 默认45秒                                                                                                                                                                                                                                                                                  | `"45s"`                                        |
| `usePlainTextConnection` |    否     | Input | 是否使用纯文本连接                                                                                                                                                                                                                                                                                               | `"true"`, `"false"`                            |
| `caCertificatePath`      |    否     | Input | CA 证书的路径                                                                                                                                                                                                                                                                                                | `"/path/to/ca-cert"`                           |
| `workerName`             |    否     | Input | The name of the worker activating the jobs, mostly used for logging purposes                                                                                                                                                                                                                            | `"products-worker"`                            |
| `workerTimeout`          |    否     | Input | A job returned after this call will not be activated by another call until the timeout has been reached; defaults to 5 minutes                                                                                                                                                                          | `"5m"`                                         |
| `requestTimeout`         |    否     | Input | The request will be completed when at least one job is activated or after the requestTimeout. If the requestTimeout = 0, a default timeout is used. If the requestTimeout < 0, long polling is disabled and the request is completed immediately, even when no job is activated. Defaults to 10 seconds | `"30s"`                                        |
| `jobType`                |    是     | Input | the job type, as defined in the BPMN process (e.g. `<zeebe:taskDefinition type="fetch-products" />`)                                                                                                                                                                                              | `"fetch-products"`                             |
| `maxJobsActive`          |    否     | Input | Set the maximum number of jobs which will be activated for this worker at the same time. Defaults to 32                                                                                                                                                                                                 | `"32"`                                         |
| `concurrency`            |    否     | Input | The maximum number of concurrent spawned goroutines to complete jobs. Defaults to 4                                                                                                                                                                                                                     | `"4"`                                          |
| `pollInterval`           |    否     | Input | Set the maximal interval between polling for new jobs. Defaults to 100 milliseconds                                                                                                                                                                                                                     | `"100ms"`                                      |
| `pollThreshold`          |    否     | Input | Set the threshold of buffered activated jobs before polling for new jobs, i.e. threshold * maxJobsActive. Defaults to 0.3                                                                                                                                                                               | `"0.3"`                                        |
| `fetchVariables`         |    否     | Input | A list of variables to fetch as the job variables; if empty, all visible variables at the time of activation for the scope of the job will be returned                                                                                                                                                  | `"productId"`, `"productName"`, `"productKey"` |
| `autocomplete`           |    否     | Input | Indicates if a job should be autocompleted or not. If not set, all jobs will be auto-completed by default. Disable it if the worker should manually complete or fail the job with either a business error or an incident                                                                                | `"true"`, `"false"`                            |
| `retryBackOff`           |    否     | Input | The back-off timeout for the next retry if a job fails                                                                                                                                                                                                                                                  | `15s`                                          |
| `direction`              |    否     | Input | The direction of the binding                                                                                                                                                                                                                                                                            | `"input"`                                      |

## 绑定支持

此组件支持 **输入** 绑定接口。

### Input binding

#### Variables

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

Zeebe进程引擎能够将自定义任务请求头传递给作业工作线程。 These headers can be defined for every [service task](https://docs.camunda.io/docs/components/best-practices/development/service-integration-patterns/#service-task). Task headers will be passed by the binding as metadata (HTTP headers) to the job worker.

绑定还将以下作业相关变量作为元数据传递。 这些值将作为字符串传递。 该表单还包含原始数据类型，以便可以将其转换回工作线程使用的编程语言中相同的数据类型。

| Metadata                           | 数据类型   | 说明                                                              |
| ---------------------------------- | ------ | --------------------------------------------------------------- |
| X-Zeebe-Job-Key                    | int64  | The key, a unique identifier for the job                        |
| X-Zeebe-Job-Type                   | string | 工作的类型（应与请求的内容相匹配）                                               |
| X-Zeebe-Process-Instance-Key       | int64  | 作业的进程实例键                                                        |
| X-Zeebe-Bpmn-Process-Id            | string | 作业进程定义的bpmn进程ID                                                 |
| X-Zeebe-Process-Definition-Version | int32  | 作业进程定义的版本                                                       |
| X-Zeebe-Process-Definition-Key     | int64  | 作业进程定义的键值                                                       |
| X-Zeebe-Element-Id                 | string | 关联的任务元素 ID                                                      |
| X-Zeebe-Element-Instance-Key       | int64  | 标识关联任务的唯一键，在进程实例范围内保持唯一                                         |
| X-Zeebe-Worker                     | string | 激活这个作业的工作线程名称                                                   |
| X-Zeebe-Retries                    | int32  | 该作业的重试次数（应始终为正值）                                                |
| X-Zeebe-Deadline                   | int64  | 作业何时可以再次被激活，将以UNIX时间戳格式发送                                       |
| X-Zeebe-Autocomplete               | bool   | The autocomplete status that is defined in the binding metadata |

## 相关链接

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过 input binding 触发应用]({{< ref howto-triggers.md >}})
- [How-To：使用绑定与外部资源进行交互]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})