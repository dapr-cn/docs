---
type: docs
title: "Zeebe 命令行绑定规范"
linkTitle: "Zeebe 命令行"
description: "Zeebe 命令行绑定组件详细文档"
---

## Component format

To setup Zeebe command binding create a component of type `bindings.zeebe.command`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.

See [this](https://docs.camunda.io/docs/components/zeebe/zeebe-overview/) for Zeebe documentation.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: bindings.zeebe.command
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
```

## 元数据字段规范

| Field                  | 必填 | 绑定支持   | 详情                     | 示例                 |
| ---------------------- |:--:| ------ | ---------------------- | ------------------ |
| gatewayAddr            | 是  | Output | Zeebe gateway address  | `localhost:26500`  |
| gatewayKeepAlive       | 否  | 输出     | 设置保持会话消息发送到网关的频率 默认45秒 | `45s`              |
| usePlainTextConnection | 否  | 输出     | 是否使用纯文本连接              | `true,false`       |
| caCertificatePath      | 否  | 输出     | CA 证书的路径               | `/path/to/ca-cert` |

## 绑定支持

该组件支持如下操作的 **输出绑定** ：

- `topology`
- `deploy-process`
- `create-instance`
- `cancel-instance`
- `set-variables`
- `resolve-incident`
- `publish-message`
- `activate-jobs`
- `complete-job`
- `fail-job`
- `update-job-retries`
- `throw-error`

### Output binding

我们在绑定中使用的Zeebe客户端在底层使用gRPC协议。 Please consult the [gRPC API reference](https://docs.camunda.io/docs/apis-clients/grpc/) for more information.

#### topology

`topology` 操作将获取当前网关所属集群的拓扑结构。

为了演示`topology` 操作，使用发送如下JSON结构数据的`POST` 方法调用Zeebe命令行绑定：

```json
{
  "data": {},
  "operation": "topology"
}
```

##### 响应

绑定返回一个如下JSON结构的数据：

```json
{
  "brokers": [
    {
      "nodeId": null,
      "host": "172.18.0.5",
      "port": 26501,
      "partitions": [
        {
          "partitionId": 1,
          "role": null,
          "health": null
        }
      ],
      "version": "0.26.0"
    }
  ],
  "clusterSize": 1,
  "partitionsCount": 1,
  "replicationFactor": 1,
  "gatewayVersion": "0.26.0"
}
```

响应值为：

- `brokers` - list of brokers part of this cluster
    - `nodeId` - 代理的唯一节点 ID（在集群内）
    - `host` - hostname of the broker
    - `port` - port for the broker
    - `port` - port for the broker
    - `partitions` - list of partitions managed or replicated on this broker
        - `partitionId` - the unique ID of this partition
        - `role` - the role of the broker for this partition
        - `health` - the health of this partition
  - `version` - broker version
- `clusterSize` - 集群内节点的数量
- ` partitionsCount ` - 群集中分布的分区数
- ` replicationFactor ` - 为此群集配置的复制因子
- `gatewayVersion` - 网关版本

#### deploy-process

`deploy-process` 操作将单个进程部署到 Zeebe。

为了演示`deploy-process`操作，通过使用发送如下JSON格式数据的`POST` 方法调用Zeebe命令行绑定：

```json
{
  "data": "YOUR_FILE_CONTENT",
  "metadata": {
    "fileName": "products-process.bpmn"
  },
  "operation": "deploy-process"
}
```

The metadata parameters are:

- `fileName` - 进程文件的名称

##### 响应

绑定返回一个如下JSON结构的数据：

```json
{
  "key": 2251799813687320,
  "processes": [
    {
      "bpmnProcessId": "products-process",
      "version": 3,
      "processDefinitionKey": 2251799813685895,
      "resourceName": "products-process.bpmn"
    }
  ]
}
```

响应值为：

- `key` - the unique key identifying the deployment
- ` processes ` - 已部署进程的列表
    - `bpmnProcessId` - the bpmn process ID, as parsed during deployment; together with the version forms a unique identifier for a specific process definition
    - `version` - 分配的进程版本
    - `processDefinitionKey` - 配置的键值，此进程唯一标识符
    - `resourceName` - 进程解析的资源名称

#### create-instance

`create-instance` 操作将创建并启动一个指定进程实例。 该进程定义可以指定，或者使用唯一键值(例如， 通过 `deploy-process` 操作返回)，或者使用BPMN进程ID和版本号来创建实例。

请注意，只有没有启动事件的进程才能通过此命令启动。

##### 使用BPMN进程ID

为了演示`create-instance` 操作，使用发送如下JSON结构数据的`POST` 方法调用Zeebe命令行绑定：

```json
{
  "data": {
    "bpmnProcessId": "products-process",
    "variables": {
      "productId": "some-product-id",
      "productName": "some-product-name",
      "productKey": "some-product-key"
    }
  },
  "operation": "create-instance"
}
```

The data parameters are:

- `bpmnProcessId` - the BPMN process ID of the process definition to instantiate
- `version` - (可选项, 默认: 最新版本) 进程实例的版本
- `variables` - (可选参数) JSON文档，将为根变量实例化的作用范围仅限于进程实例的变量；它必须是一个JSON对象，因为它将作为键值对进行映射。 例如 { "a": 1, "b": 2 } 将创建两个变量，分别命名为 "a" 和 "b"，以及它们的关联值。 [{ "a": 1, "b": 2 }] 不会是 有效参数，因为 JSON 文档的根是数组而不是对象

##### 使用进程定义的键值

为了演示`create-instance` 操作，使用发送如下JSON结构数据的`POST` 方法调用Zeebe命令行绑定：

```json
{
  "data": {
    "processDefinitionKey": 2251799813685895,
    "variables": {
      "productId": "some-product-id",
      "productName": "some-product-name",
      "productKey": "some-product-key"
    }
  },
  "operation": "create-instance"
}
```

The data parameters are:

- `processDefinitionKey` - the unique key identifying the process definition to instantiate
- `variables` - (可选参数) JSON文档，将为根变量实例化的作用范围仅限于进程实例的变量；它必须是一个JSON对象，因为它将作为键值对进行映射。 例如 { "a": 1, "b": 2 } 将创建两个变量，分别命名为 "a" 和 "b"，以及它们的关联值。 [{ "a": 1, "b": 2 }] 不会是 有效参数，因为 JSON 文档的根是数组而不是对象

##### 响应

绑定返回一个如下JSON结构的数据：

```json
{
  "processDefinitionKey": 2251799813685895,
  "bpmnProcessId": "products-process",
  "version": 3,
  "processInstanceKey": 2251799813687851
}
```

响应值为：

- `processDefinitionKey` - the key of the process definition which was used to create the process instance
- `bpmnProcessId` - 进程定义的用于创建进程实例的 BPMN 进程 ID
- ` version ` - 进程定义用于创建进程实例的版本
- `processInstanceKey` - 创建的进程实例的唯一标识符

#### cancel-instance

`cancel-instance` 执行将取消正在运行的进程实例。

为了演示`create-instance` 操作，使用发送如下JSON结构数据的`POST` 方法调用Zeebe命令行绑定：

```json
{
  "data": {
    "processInstanceKey": 2251799813687851
  },
  "metadata": {},
  "operation": "cancel-instance"
}
```

The data parameters are:

- `processInstanceKey` - 进程实例键值

##### 响应

绑定不返回响应正文。

#### set-variables

`set-variables`操作为元素实例(例如进程实例、元素流实例)创建或更新变量。

为了演示 `set-variables`操作，使用发送如下JSON结构数据的`POST` 方法调用Zeebe命令行绑定：

```json
{
  "data": {
    "elementInstanceKey": 2251799813687880,
    "variables": {
      "productId": "some-product-id",
      "productName": "some-product-name",
      "productKey": "some-product-key"
    }
  },
  "metadata": {},
  "operation": "set-variables"
}
```

The data parameters are:

- `elementInstanceKey` - the unique identifier of a particular element; can be the process instance key (as obtained during instance creation), or a given element, such as a service task (see elementInstanceKey on the job message)
- `local` - （可选参数，默认： `false`）如果为真，变量将严格合并到本地作用域内（如elementInstanceKey 所示）；这意味着变量不会传播到上层作用域。 例如，假设我们有两个作用域，作用域“1”和作用域“2”，每个作用域的有效变量为： 1 => `{ "foo" : 2 }`和 2 => `{ "bar" : 1 }`。 如果我们发送一个更新请求，其中 elementInstanceKey = 2, variables `{ "foo" : 5 }`，并且 local 为真，那么作用域 1 的变量将不变，作用域 2 的变量现在将是 `{ "bar" : 1, “foo” 5 }`。 但是，如果 local 为 false，那么，则作用域 1 的变量将更新为为 `{ "foo": 5 }`，作用域 2的变量任然是 `{ "bar" : 1 }`
- `变量` - 将变量描述为键值对的 JSON 序列化文档；文档的根必须是一个对象

##### 响应

绑定返回一个如下JSON结构的数据：

```json
{
  "key": 2251799813687896
}
```

响应值为：

- `key` - 设置变量命令的唯一键值

#### resolve-incident

`resolve-incident` 操作将解决一个事件。

为了演示`create-instance` 操作，使用发送如下JSON结构数据的`POST` 方法调用Zeebe命令行绑定：

```json
{
  "data": {
    "incidentKey": 2251799813686123
  },
  "metadata": {},
  "operation": "resolve-incident"
}
```

The data parameters are:

- ` incidentKey ` - 要解决的事件的唯一 ID

##### 响应

绑定不返回响应正文。

#### publish-message

`publish-message` 操作发布一条消息。 消息将被发布到根据它们相关键计算而指定的特定分区。

为了演示`publish-message` 操作，使用发送如下JSON结构数据的`POST` 方法调用Zeebe命令行绑定：

```json
{
  "messageName": "",
  "correlationKey": "2",
  "timeToLive": "1m",
  "variables": {
    "productId": "some-product-id",
    "productName": "some-product-name",
    "productKey": "some-product-key"
  }
}
```

The data parameters are:

- `messageName` - the name of the message
- `correlationKey` -（可选）消息的相关键
- `timeToLive` -（可选）消息应该在代理上缓冲多长时间
- `messageId` -（可选）消息的唯一 ID；可以省略。 只有在确认一个给定ID的消息是否被发布时有用（在其生命周期内）
- ` variables ` -（可选）JSON 文档格式的消息变量；为了生效，文档的根必须是一个对象，例如 { "a": "foo" }。 [ “foo” ] 是无效的

##### 响应

绑定返回一个如下JSON结构的数据：

```json
{
  "key": 2251799813688225
}
```

响应值为：

- `key` - 已发布消息的唯一 ID

#### activate-jobs

`activate-jobs` 操作循环遍历所有已知分区，并激活到请求的最大值，并在激活后，将它们流式返回给客户端。

为了演示 `activate-jobs`操作，使用发送如下JSON结构数据的`POST` 方法调用Zeebe命令行绑定：

```json
{
  "data": {
    "jobType": "fetch-products",
    "maxJobsToActivate": 5,
    "timeout": "5m",
    "workerName": "products-worker",
    "fetchVariables": [
      "productId",
      "productName",
      "productKey"
    ]
  },
  "metadata": {},
  "operation": "activate-jobs"
}
```

The data parameters are:

- `jobType` - the job type, as defined in the BPMN process (e.g. `<zeebe:taskDefinition type="fetch-products" />`)
- `maxJobsToActivate` - 此请求激活的最大作业数
- `timeout` -（可选，默认值：5 分钟）直到达到超时时间，否则本次调用返回的作业，将不会被下一次调用激活。
- `workerName` -（可选，默认值： `default`）激活作业的工作线程的名称，主要用于记录目的
- `fetchVariables` -（可选）将作为作业变量获取的变量列表；如果为空，则将返回激活时的作业作用域内所有的可见变量。

##### 响应

绑定返回一个如下JSON结构的数据：

```json
[
  {

  }
]
```

响应值为：

- `key` - the key, a unique identifier for the job
- `type` - 作业的类型（应该与请求相匹配）
- `processInstanceKey` - 作业进程实例的键值
- `bpmnProcessId` - 作业进程定义的BPMN进程ID
- `processDefinitionVersion` - 作业进程定义的版本
- `processDefinitionKey` - 作业进程定义的键值
- `elementId` - 关联的任务元素 ID
- `elementInstanceKey` - 标识关联任务的唯一键，在进程实例范围内保持唯一
- `customHeaders` - 建模期间定义的一组自定义header头；将作为序列化的 JSON 文档返回
- `worker` - 激活这个作业的工作线程名称
- ` retries` - 该作业的重试次数（应始终为正值）
- ` deadline ` - 作业何时可以再次被激活，将以UNIX时间戳格式发送
- ` variables ` - JSON 文档，在激活时计算，由任务作用域内所有可见变量组成

#### complete-job

`complete-job` 操作使用给定的有效负载完结作业，这将允许完结关联的服务任务。

为了演示 `complete-job`操作，使用发送如下JSON结构数据的`POST` 方法调用Zeebe命令行绑定：

```json
{
  "data": {
    "jobKey": 2251799813686172,
    "variables": {
      "productId": "some-product-id",
      "productName": "some-product-name",
      "productKey": "some-product-key"
    }
  },
  "metadata": {},
  "operation": "complete-job"
}
```

The data parameters are:

- `jobKey` - the unique job identifier, as obtained from the activate jobs response
- `variables` -（可选）JSON 文档，标识当前任务作用域内的变量

##### 响应

绑定不返回响应正文。

#### fail-job

`fail-job` 操作将作业标记为失败；如果重试次数参数为正，则作业将立即再次激活，并且工作线程可以再次尝试处理它。 但是如果它为零或负数，将会引发事件，并且使用给定的错误信息进行标记，并且在事件解决之前，作业将无法被激活。

为了演示 `fail-job`操作，使用发送如下JSON结构数据的`POST` 方法调用Zeebe命令行绑定：

```json
{
  "data": {
    "jobKey": 2251799813685739,
    "retries": 5,
    "errorMessage": "some error occurred"
  },
  "metadata": {},
  "operation": "fail-job"
}
```

The data parameters are:

- `jobKey` - the unique job identifier, as obtained when activating the job
- ` retries ` - 作业剩余的重试次数
- `errorMessage` - （可选）描述作业失败原因的信息，如果作业重试次数用完并引发事件，此信息将特别有用，因为这条信息可以帮助解释引发事件的原因

##### 响应

绑定不返回响应正文。

#### update-job-retries

`update-job-retries` 操作更新作业剩余的重试次数。 如果解决了潜在问题，这对于重试次数已用完的作业非常有用。

为了演示 `update-job-retries`操作，使用发送如下JSON结构数据的`POST` 方法调用Zeebe命令行绑定：

```json
{
  "data": {
    "jobKey": 2251799813686172,
    "retries": 10
  },
  "metadata": {},
  "operation": "update-job-retries"
}
```

The data parameters are:

- `jobKey` - the unique job identifier, as obtained through the activate-jobs operation
- `retries` - 作业的新重试次数；必须是正值

##### 响应

绑定不返回响应正文。

#### throw-error

`throw-error` 操作抛出一个错误表示在处理作业时发生了业务错误。 该错误定义为一个错误码并且被进程中具有相同错误码的错误捕捉事件处理。

为了演示`throw-error`操作，使用发送如下JSON结构数据的`POST` 方法调用Zeebe命令行绑定：

```json
{
  "data": {
    "jobKey": 2251799813686172,
    "errorCode": "product-fetch-error",
    "errorMessage": "The product could not be fetched"
  },
  "metadata": {},
  "operation": "throw-error"
}
```

参数的含义是：

- `jobKey` - the unique job identifier, as obtained when activating the job
- `errorCode` - 将与错误捕获事件匹配的错误代码
- `errorMessage` -（可选）提供附加上下文的错误信息

##### 响应

绑定不返回响应正文。

## 相关链接

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过 input binding 触发应用]({{< ref howto-triggers.md >}})
- [How-To：使用绑定与外部资源进行交互]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
