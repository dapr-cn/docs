---
type: docs
title: "Zeebe 命令绑定说明"
linkTitle: "Zeebe 命令"
description: "关于 Zeebe 命令绑定组件的详细文档"
---

## 组件格式说明

要配置 Zeebe 命令绑定，请创建一个类型为 `bindings.zeebe.command` 的组件。请参考[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})了解如何创建和应用绑定配置。

有关 Zeebe 的更多信息，请查看[此处](https://docs.camunda.io/docs/components/zeebe/zeebe-overview/)的文档。

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
    value: "<host>:<port>"
  - name: gatewayKeepAlive
    value: "45s"
  - name: usePlainTextConnection
    value: "true"
  - name: caCertificatePath
    value: "/path/to/ca-cert"
```

## 元数据字段说明

| 字段                   | 必需 | 绑定支持 |  详情 | 示例 |
|-------------------------|:--------:|------------|-----|---------|
| `gatewayAddr`             | Y | 输出 | Zeebe 网关地址                                                                     | `"localhost:26500"` |
| `gatewayKeepAlive`        | N | 输出 | 设置发送到网关的保活消息的频率。默认为 45 秒  | `"45s"` |
| `usePlainTextConnection`  | N | 输出 | 是否使用纯文本连接                                             | `"true"`, `"false"` |
| `caCertificatePath`       | N | 输出 | CA 证书的路径                                                                    | `"/path/to/ca-cert"` |

## 绑定支持

此组件支持以下操作的**输出绑定**：

- `topology`
- `deploy-process`
- `deploy-resource`
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

### 输出绑定

Zeebe 在此绑定中使用的客户端底层依赖 gRPC。请查阅 [gRPC API 参考](https://docs.camunda.io/docs/apis-clients/grpc/)以获取更多信息。

#### topology

`topology` 操作用于获取网关所属集群的当前拓扑。

要执行 `topology` 操作，请通过 `POST` 方法调用 Zeebe 命令绑定，并使用以下 JSON 正文：

```json
{
  "data": {},
  "operation": "topology"
}
```

##### 响应

绑定返回一个包含以下信息的 JSON：

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

- `brokers` - 集群中的 broker 列表
    - `nodeId` - broker 的唯一节点 ID
    - `host` - broker 的主机名
    - `port` - broker 的端口
    - `partitions` - 此 broker 管理或复制的分区列表
        - `partitionId` - 分区的唯一 ID
        - `role` - broker 在此分区中的角色
        - `health` - 分区的健康状况
  - `version` - broker 版本
- `clusterSize` - 集群中的节点数量
- `partitionsCount` - 集群中分布的分区数量
- `replicationFactor` - 集群配置的复制因子
- `gatewayVersion` - 网关版本

#### deploy-process

`deploy-process` 的弃用别名为 'deploy-resource'。

#### deploy-resource

`deploy-resource` 操作用于将单个资源部署到 Zeebe。资源可以是流程（BPMN）或决策和决策需求（DMN）。

要执行 `deploy-resource` 操作，请通过 `POST` 方法调用 Zeebe 命令绑定，并使用以下 JSON 正文：

```json
{
  "data": "YOUR_FILE_CONTENT",
  "metadata": {
    "fileName": "products-process.bpmn"
  },
  "operation": "deploy-resource"
}
```

元数据参数为：

- `fileName` - 资源文件的名称

##### 响应

绑定返回一个包含以下信息的 JSON：

{{< tabs "BPMN" "DMN" >}}

{{% codetab %}}

```json
{
  "key": 2251799813685252,
  "deployments": [
    {
      "Metadata": {
        "Process": {
          "bpmnProcessId": "products-process",
          "version": 2,
          "processDefinitionKey": 2251799813685251,
          "resourceName": "products-process.bpmn"
        }
      }
    }
  ]
}
```

{{% /codetab %}}

{{% codetab %}}

```json
{
  "key": 2251799813685253,
  "deployments": [
    {
      "Metadata": {
        "Decision": {
          "dmnDecisionId": "products-approval",
          "dmnDecisionName": "Products approval",
          "version": 1,
          "decisionKey": 2251799813685252,
          "dmnDecisionRequirementsId": "Definitions_0c98xne",
          "decisionRequirementsKey": 2251799813685251
        }
      }
    },
    {
      "Metadata": {
        "DecisionRequirements": {
          "dmnDecisionRequirementsId": "Definitions_0c98xne",
          "dmnDecisionRequirementsName": "DRD",
          "version": 1,
          "decisionRequirementsKey": 2251799813685251,
          "resourceName": "products-approval.dmn"
        }
      }
    }
  ]
}
```

{{% /codetab %}}

{{< /tabs >}}

响应值为：

- `key` - 部署的唯一标识键
- `deployments` - 已部署资源的列表，例如流程
    - `metadata` - 部署元数据，每个部署只有一个元数据
        - `process`- 已部署流程的元数据
            - `bpmnProcessId` - 部署期间解析的 bpmn 流程 ID；与版本一起构成特定流程定义的唯一标识符
            - `version` - 分配的流程版本
            - `processDefinitionKey` - 分配的键，作为此流程的唯一标识符
            - `resourceName` - 解析此流程的资源名称
        - `decision` - 已部署决策的元数据
            - `dmnDecisionId` - 部署期间解析的 dmn 决策 ID；与版本一起构成特定决策的唯一标识符
            - `dmnDecisionName` - 部署期间解析的决策的 dmn 名称
            - `version` - 分配的决策版本
            - `decisionKey` - 分配的决策键，作为此决策的唯一标识符
            - `dmnDecisionRequirementsId` - 部署期间解析的决策需求图的 dmn ID，此决策是其一部分
            - `decisionRequirementsKey` - 此决策所属的决策需求图的分配键
        - `decisionRequirements` - 已部署决策需求的元数据
            - `dmnDecisionRequirementsId` - 部署期间解析的 dmn 决策需求 ID；与版本一起构成特定决策的唯一标识符
            - `dmnDecisionRequirementsName` - 部署期间解析的决策需求的 dmn 名称
            - `version` - 分配的决策需求版本
            - `decisionRequirementsKey` - 分配的决策需求键，作为此决策需求的唯一标识符
            - `resourceName` - 解析此决策需求的资源名称

#### create-instance

`create-instance` 操作用于创建并启动指定流程的实例。可以使用其唯一键（由 `deploy-process` 操作返回）或使用 BPMN 流程 ID 和版本来指定要用于创建实例的流程定义。

请注意，只有具有无启动事件的流程才能通过此命令启动。

通常，流程创建和执行是解耦的。这意味着命令创建一个新的流程实例并立即响应流程实例 ID。流程的执行在响应发送后发生。然而，有些用例需要在流程执行完成时收集结果。通过定义 `withResult` 属性，命令允许“同步”执行流程并通过一组变量接收结果。响应在流程执行完成时发送。

有关更多信息，请访问[官方文档](https://docs.camunda.io/docs/components/concepts/process-instance-creation/)。

要执行 `create-instance` 操作，请通过 `POST` 方法调用 Zeebe 命令绑定，并使用以下 JSON 正文：

{{< tabs "通过 BPMN 流程 ID" "通过流程定义键" "同步执行" >}}

{{% codetab %}}

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

{{% /codetab %}}

{{% codetab %}}

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

{{% /codetab %}}

{{% codetab %}}

```json
{
  "data": {
    "bpmnProcessId": "products-process",
    "variables": {
      "productId": "some-product-id",
      "productName": "some-product-name",
      "productKey": "some-product-key"
    },
    "withResult": true,
    "requestTimeout": "30s",
    "fetchVariables": ["productId"]
  },
  "operation": "create-instance"
}
```

{{% /codetab %}}

{{< /tabs >}}

数据参数为：

- `bpmnProcessId` - 要实例化的流程定义的 BPMN 流程 ID
- `processDefinitionKey` - 要实例化的流程定义的唯一键
- `version` - （可选，默认：最新版本）要实例化的流程版本
- `variables` - （可选）JSON 文档，将为流程实例的根变量范围实例化变量；它必须是一个 JSON 对象，因为变量将以键值对的方式映射。例如，{ "a": 1, "b": 2 } 将创建两个变量，分别命名为 "a" 和 "b"，并具有其关联的值。[{ "a": 1, "b": 2 }] 将不是有效参数，因为 JSON 文档的根是一个数组而不是对象
- `withResult` - （可选，默认：false）如果设置为 true，流程将被同步实例化和执行
- `requestTimeout` - （可选，仅在 withResult=true 时使用）如果流程在 requestTimeout 之前未完成，请求将被关闭。如果 requestTimeout = 0，则使用网关中配置的通用 requestTimeout。
- `fetchVariables` - （可选，仅在 withResult=true 时使用）要包含在响应的 `variables` 属性中的变量名称列表。如果为空，将返回根范围内的所有可见变量。

##### 响应

绑定返回一个包含以下信息的 JSON：

```json
{
  "processDefinitionKey": 2251799813685895,
  "bpmnProcessId": "products-process",
  "version": 3,
  "processInstanceKey": 2251799813687851,
  "variables": "{\"productId\":\"some-product-id\"}"
}
```

响应值为：

- `processDefinitionKey` - 用于创建流程实例的流程定义的键
- `bpmnProcessId` - 用于创建流程实例的流程定义的 BPMN 流程 ID
- `version` - 用于创建流程实例的流程定义的版本
- `processInstanceKey` - 创建的流程实例的唯一标识符
- `variables` - （可选，仅在请求中使用了 withResult=true 时）JSON 文档，由根范围内的可见变量组成；作为序列化的 JSON 文档返回

#### cancel-instance

`cancel-instance` 操作用于取消正在运行的流程实例。

要执行 `cancel-instance` 操作，请通过 `POST` 方法调用 Zeebe 命令绑定，并使用以下 JSON 正文：

```json
{
  "data": {
    "processInstanceKey": 2251799813687851
  },
  "operation": "cancel-instance"
}
```

数据参数为：

- `processInstanceKey` - 流程实例键

##### 响应

绑定不返回响应正文。

#### set-variables

`set-variables` 操作用于为元素实例（例如流程实例、流程元素实例）创建或更新变量。

要执行 `set-variables` 操作，请通过 `POST` 方法调用 Zeebe 命令绑定，并使用以下 JSON 正文：

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
  "operation": "set-variables"
}
```

数据参数为：

- `elementInstanceKey` - 特定元素的唯一标识符；可以是流程实例键（在实例创建期间获得），或给定元素，例如服务任务（请参阅 job 消息上的 elementInstanceKey）
- `local` - （可选，默认：`false`）如果为 true，变量将严格合并到本地范围（由 elementInstanceKey 指示）；这意味着变量不会传播到上层范围。
  例如，假设我们有两个范围，'1' 和 '2'，每个范围的有效变量为：
  1 => `{ "foo" : 2 }`，和 2 => `{ "bar" : 1 }`。如果我们发送一个更新请求，elementInstanceKey = 2，变量 `{ "foo" : 5 }`，并且 local 为 true，那么范围 1 将保持不变，范围 2 将变为 `{ "bar" : 1, "foo" 5 }`。然而，如果 local 为 false，那么范围 1 将为 `{ "foo": 5 }`，范围 2 将为 `{ "bar" : 1 }`
- `variables` - 描述变量的键值对的 JSON 序列化文档；文档的根必须是一个对象

##### 响应

绑定返回一个包含以下信息的 JSON：

```json
{
  "key": 2251799813687896
}
```

响应值为：

- `key` - 设置变量命令的唯一键

#### resolve-incident

`resolve-incident` 操作用于解决一个事件。

要执行 `resolve-incident` 操作，请通过 `POST` 方法调用 Zeebe 命令绑定，并使用以下 JSON 正文：

```json
{
  "data": {
    "incidentKey": 2251799813686123
  },
  "operation": "resolve-incident"
}
```

数据参数为：

- `incidentKey` - 要解决的事件的唯一 ID

##### 响应

绑定不返回响应正文。

#### publish-message

`publish-message` 操作用于发布一条消息。消息发布到从其关联键计算出的特定分区。

要执行 `publish-message` 操作，请通过 `POST` 方法调用 Zeebe 命令绑定，并使用以下 JSON 正文：

```json
{
  "data": {
    "messageName": "product-message",
    "correlationKey": "2",
    "timeToLive": "1m",
    "variables": {
      "productId": "some-product-id",
      "productName": "some-product-name",
      "productKey": "some-product-key"
    },
  },  
  "operation": "publish-message"
}
```

数据参数为：

- `messageName` - 消息的名称
- `correlationKey` - （可选）消息的关联键
- `timeToLive` - （可选）消息在 broker 上缓冲的时间
- `messageId` - （可选）消息的唯一 ID；可以省略。仅用于确保在其生命周期内只有一条具有给定 ID 的消息会被发布
- `variables` - （可选）消息变量作为 JSON 文档；要有效，文档的根必须是一个对象，例如 { "a": "foo" }。[ "foo" ] 将不是有效的

##### 响应

绑定返回一个包含以下信息的 JSON：

```json
{
  "key": 2251799813688225
}
```

响应值为：

- `key` - 发布的消息的唯一 ID

#### activate-jobs

`activate-jobs` 操作以轮询方式遍历所有已知分区并激活最多请求的最大数量，并在激活时将其流式传输回客户端。

要执行 `activate-jobs` 操作，请通过 `POST` 方法调用 Zeebe 命令绑定，并使用以下 JSON 正文：

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
    ],
    "requestTimeout": "30s"
  },
  "operation": "activate-jobs"
}
```

数据参数为：

- `jobType` - 作业类型，如 BPMN 流程中定义的（例如 `<zeebe:taskDefinition type="fetch-products" />`）
- `maxJobsToActivate` - 此请求要激活的最大作业数
- `timeout` - （可选，默认：5 分钟）此调用返回的作业在超时之前不会被另一个调用激活
- `workerName` - （可选，默认：`default`）激活作业的工作者的名称，主要用于日志记录目的
- `fetchVariables` - （可选）要作为作业变量获取的变量列表；如果为空，将返回作业范围内激活时的所有可见变量
- `requestTimeout` - （可选）请求将在至少一个作业被激活或在 requestTimeout 之后完成。如果 requestTimeout = 0，则使用默认超时。如果 requestTimeout < 0，则禁用长轮询，并且请求立即完成，即使没有作业被激活。

##### 响应

绑定返回一个包含以下信息的 JSON：

```json
[
  {
    "key": 2251799813685267,
    "type": "fetch-products",
    "processInstanceKey": 2251799813685260,
    "bpmnProcessId": "products",
    "processDefinitionVersion": 1,
    "processDefinitionKey": 2251799813685249,
    "elementId": "Activity_test",
    "elementInstanceKey": 2251799813685266,
    "customHeaders": "{\"process-header-1\":\"1\",\"process-header-2\":\"2\"}",
    "worker": "test", 
    "retries": 1,
    "deadline": 1694091934039,
    "variables":"{\"productId\":\"some-product-id\"}"
  }
]
```

响应值为：

- `key` - 作业的键，作业的唯一标识符
- `type` - 作业的类型（应与请求的类型匹配）
- `processInstanceKey` - 作业的流程实例键
- `bpmnProcessId` - 作业流程定义的 bpmn 流程 ID
- `processDefinitionVersion` - 作业流程定义的版本
- `processDefinitionKey` - 作业流程定义的键
- `elementId` - 关联的任务元素 ID
- `elementInstanceKey` - 唯一标识关联任务的唯一键，在流程实例范围内唯一
- `customHeaders` - 在建模期间定义的一组自定义头；作为序列化的 JSON 文档返回
- `worker` - 激活此作业的工作者的名称
- `retries` - 此作业剩余的重试次数（应始终为正）
- `deadline` - 作业可以再次激活的时间，以 UNIX 纪元时间戳发送
- `variables` - 在激活时计算，由任务范围内的所有可见变量组成；作为序列化的 JSON 文档返回

#### complete-job

`complete-job` 操作使用给定的负载完成作业，从而允许完成关联的服务任务。

要执行 `complete-job` 操作，请通过 `POST` 方法调用 Zeebe 命令绑定，并使用以下 JSON 正文：

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
  "operation": "complete-job"
}
```

数据参数为：

- `jobKey` - 唯一的作业标识符，从激活作业响应中获得
- `variables` - （可选）表示当前任务范围内变量的 JSON 文档

##### 响应

绑定不返回响应正文。

#### fail-job

`fail-job` 操作将作业标记为失败；如果重试参数为正，则作业将立即可再次激活，并且工作者可以再次尝试处理它。然而，如果为零或负数，则会引发事件，并标记为给定的错误消息，并且作业在事件解决之前不会被激活。

要执行 `fail-job` 操作，请通过 `POST` 方法调用 Zeebe 命令绑定，并使用以下 JSON 正文：

```json
{
  "data": {
    "jobKey": 2251799813685739,
    "retries": 5,
    "errorMessage": "some error occurred",
    "retryBackOff": "30s",
    "variables": {
      "productId": "some-product-id",
      "productName": "some-product-name",
      "productKey": "some-product-key"
    }
  },
  "operation": "fail-job"
}
```

数据参数为：

- `jobKey` - 激活作业时获得的唯一作业标识符
- `retries` - 作业应剩余的重试次数
- `errorMessage ` - （可选）描述作业失败原因的消息，这在作业用尽重试次数并引发事件时特别有用，因为此消息可以帮助解释为什么引发事件
- `retryBackOff` - （可选）下次重试的回退超时
- `variables` - （可选）JSON 文档，将在作业关联任务的本地范围内实例化变量；它必须是一个 JSON 对象，因为变量将以键值对的方式映射。例如，{ "a": 1, "b": 2 } 将创建两个变量，分别命名为 "a" 和 "b"，并具有其关联的值。[{ "a": 1, "b": 2 }] 将不是有效参数，因为 JSON 文档的根是一个数组而不是对象。

##### 响应

绑定不返回响应正文。

#### update-job-retries

`update-job-retries` 操作用于更新作业剩余的重试次数。这对于作业用尽重试次数的情况特别有用，假设底层问题已解决。

要执行 `update-job-retries` 操作，请通过 `POST` 方法调用 Zeebe 命令绑定，并使用以下 JSON 正文：

```json
{
  "data": {
    "jobKey": 2251799813686172,
    "retries": 10
  },
  "operation": "update-job-retries"
}
```

数据参数为：

- `jobKey` - 通过 activate-jobs 操作获得的唯一作业标识符
- `retries` - 作业的新重试次数；必须为正

##### 响应

绑定不返回响应正文。

#### throw-error

`throw-error` 操作用于抛出一个错误，以指示在处理作业时发生了业务错误。错误由错误代码标识，并由流程中具有相同错误代码的错误捕获事件处理。

要执行 `throw-error` 操作，请通过 `POST` 方法调用 Zeebe 命令绑定，并使用以下 JSON 正文：

```json
{
  "data": {
    "jobKey": 2251799813686172,
    "errorCode": "product-fetch-error",
    "errorMessage": "The product could not be fetched",
    "variables": {
      "productId": "some-product-id",
      "productName": "some-product-name",
      "productKey": "some-product-key"
    }
  },
  "operation": "throw-error"
}
```

数据参数为：

- `jobKey` - 激活作业时获得的唯一作业标识符
- `errorCode` - 将与错误捕获事件匹配的错误代码
- `errorMessage` - （可选）提供附加上下文的错误消息
- `variables` - （可选）JSON 文档，将在作业关联任务的本地范围内实例化变量；它必须是一个 JSON 对象，因为变量将以键值对的方式映射。例如，{ "a": 1, "b": 2 } 将创建两个变量，分别命名为 "a" 和 "b"，并具有其关联的值。[{ "a": 1, "b": 2 }] 将不是有效参数，因为 JSON 文档的根是一个数组而不是对象。

##### 响应

绑定不返回响应正文。

## 相关链接

- [Dapr 组件的基本架构]({{< ref component-schema >}})
- [Bindings 构建块]({{< ref bindings >}})
- [如何：使用输入绑定触发应用程序]({{< ref howto-triggers.md >}})
- [如何：使用绑定与外部资源接口]({{< ref howto-bindings.md >}})
- [Bindings API 参考]({{< ref bindings_api.md >}})