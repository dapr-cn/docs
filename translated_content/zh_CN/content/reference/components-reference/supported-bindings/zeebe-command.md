---
type: docs
title: "Zeebe command binding spec"
linkTitle: "Zeebe command"
description: "Detailed documentation on the Zeebe command binding component"
---

## 配置

To setup Zeebe command binding create a component of type `bindings.zeebe.command`. 请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})，了解如何创建和应用绑定配置。

See [this](https://docs.camunda.io/docs/product-manuals/zeebe/zeebe-overview) for Zeebe documentation.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
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

| 字段                     | 必填 | 绑定支持 | 详情                                                                                       | 示例                 |
| ---------------------- |:--:| ---- | ---------------------------------------------------------------------------------------- | ------------------ |
| gatewayAddr            | Y  | 输出   | Zeebe gateway address                                                                    | `localhost:26500`  |
| gatewayKeepAlive       | 否  | 输出   | Sets how often keep alive messages should be sent to the gateway. Defaults to 45 seconds | `45s`              |
| usePlainTextConnection | 否  | 输出   | Whether to use a plain text connection or not                                            | `true,false`       |
| caCertificatePath      | 否  | 输出   | The path to the CA cert                                                                  | `/path/to/ca-cert` |

## 绑定支持

字段名为 `ttlInSeconds`。

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

### 输出绑定

Zeebe uses gRPC under the hood for the Zeebe client we use in this binding. Please consult the [gRPC API reference](https://stage.docs.zeebe.io/reference/grpc.html) for more information.

#### topology

The `topology` operation obtains the current topology of the cluster the gateway is part of.

To perform a `topology` operation, invoke the Zeebe command binding with a `POST` method, and the following JSON body:

```json
{
  "data": {},
  "operation": "topology"
}
```

##### 响应

The binding returns a JSON with the following response:

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

The response values are:

- `brokers` - list of brokers part of this cluster
    - `nodeId` - unique (within a cluster) node ID for the broker
    - `host` - hostname of the broker
    - `port` - port for the broker
    - `port` - port for the broker
    - `partitions` - list of partitions managed or replicated on this broker
        - `partitionId` - the unique ID of this partition
        - `role` - the role of the broker for this partition
        - `health` - the health of this partition
  - `version` - broker version
- `clusterSize` - how many nodes are in the cluster
- `partitionsCount` - how many partitions are spread across the cluster
- `replicationFactor` - configured replication factor for this cluster
- `gatewayVersion` - gateway version

#### deploy-process

The `deploy-process` operation deploys a single process to Zeebe.

To perform a `deploy-process` operation, invoke the Zeebe command binding with a `POST` method, and the following JSON body:

```json
{
  "data": "YOUR_FILE_CONTENT",
  "metadata": {
    "fileName": "products-process.bpmn"
  },
  "operation": "deploy-process"
}
```

元数据参数包括：

- `fileName` - the name of the process file

##### 响应

The binding returns a JSON with the following response:

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

The response values are:

- `key` - the unique key identifying the deployment
- `processes` - a list of deployed processes
    - `bpmnProcessId` - the bpmn process ID, as parsed during deployment; together with the version forms a unique identifier for a specific process definition
    - `version` - the assigned process version
    - `processDefinitionKey` - the assigned key, which acts as a unique identifier for this process
    - `resourceName` - the resource name from which this process was parsed

#### create-instance

The `create-instance` operation creates and starts an instance of the specified process. The process definition to use to create the instance can be specified either using its unique key (as returned by the `deploy-process` operation), or using the BPMN process ID and a version.

Note that only processes with none start events can be started through this command.

##### By BPMN process ID

To perform a `create-instance` operation, invoke the Zeebe command binding with a `POST` method, and the following JSON body:

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

参数的含义是：

- `bpmnProcessId` - the BPMN process ID of the process definition to instantiate
- `version` - (optional, default: latest version) the version of the process to instantiate
- `variables` - (optional) JSON document that will instantiate the variables for the root variable scope of the process instance; it must be a JSON object, as variables will be mapped in a key-value fashion. e.g. { "a": 1, "b": 2 } will create two variables, named "a" and "b" respectively, with their associated values. [{ "a": 1, "b": 2 }] would not be a valid argument, as the root of the JSON document is an array and not an object

##### By process definition key

To perform a `create-instance` operation, invoke the Zeebe command binding with a `POST` method, and the following JSON body:

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

参数的含义是：

- `processDefinitionKey` - the unique key identifying the process definition to instantiate
- `variables` - (optional) JSON document that will instantiate the variables for the root variable scope of the process instance; it must be a JSON object, as variables will be mapped in a key-value fashion. e.g. { "a": 1, "b": 2 } will create two variables, named "a" and "b" respectively, with their associated values. [{ "a": 1, "b": 2 }] would not be a valid argument, as the root of the JSON document is an array and not an object

##### 响应

The binding returns a JSON with the following response:

```json
{
  "processDefinitionKey": 2251799813685895,
  "bpmnProcessId": "products-process",
  "version": 3,
  "processInstanceKey": 2251799813687851
}
```

The response values are:

- `processDefinitionKey` - the key of the process definition which was used to create the process instance
- `bpmnProcessId` - the BPMN process ID of the process definition which was used to create the process instance
- `version` - the version of the process definition which was used to create the process instance
- `processInstanceKey` - the unique identifier of the created process instance

#### cancel-instance

The `cancel-instance` operation cancels a running process instance.

To perform a `cancel-instance` operation, invoke the Zeebe command binding with a `POST` method, and the following JSON body:

```json
{
  "data": {
    "processInstanceKey": 2251799813687851
  },
  "metadata": {},
  "operation": "cancel-instance"
}
```

参数的含义是：

- `processInstanceKey` - the process instance key

##### 响应

The binding does not return a response body.

#### set-variables

The `set-variables` operation creates or updates variables for an element instance (e.g. process instance, flow element instance).

To perform a `set-variables` operation, invoke the Zeebe command binding with a `POST` method, and the following JSON body:

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

参数的含义是：

- `elementInstanceKey` - the unique identifier of a particular element; can be the process instance key (as obtained during instance creation), or a given element, such as a service task (see elementInstanceKey on the job message)
- `local` - (optional, default: `false`) if true, the variables will be merged strictly into the local scope (as indicated by elementInstanceKey); this means the variables is not propagated to upper scopes. for example, let's say we have two scopes, '1' and '2', with each having effective variables as: 1 => `{ "foo" : 2 }`, and 2 => `{ "bar" : 1 }`. if we send an update request with elementInstanceKey = 2, variables `{ "foo" : 5 }`, and local is true, then scope 1 will be unchanged, and scope 2 will now be `{ "bar" : 1, "foo" 5 }`. if local was false, however, then scope 1 would be `{ "foo": 5 }`, and scope 2 would be `{ "bar" : 1 }`
- `variables` - a JSON serialized document describing variables as key value pairs; the root of the document must be an object

##### 响应

The binding returns a JSON with the following response:

```json
{
  "key": 2251799813687896
}
```

The response values are:

- `key` - the unique key of the set variables command

#### resolve-incident

The `resolve-incident` operation resolves an incident.

To perform a `resolve-incident` operation, invoke the Zeebe command binding with a `POST` method, and the following JSON body:

```json
{
  "data": {
    "incidentKey": 2251799813686123
  },
  "metadata": {},
  "operation": "resolve-incident"
}
```

参数的含义是：

- `incidentKey` - the unique ID of the incident to resolve

##### 响应

The binding does not return a response body.

#### publish-message

The `publish-message` operation publishes a single message. Messages are published to specific partitions computed from their correlation keys.

To perform a `publish-message` operation, invoke the Zeebe command binding with a `POST` method, and the following JSON body:

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

参数的含义是：

- `messageName` - the name of the message
- `correlationKey` - (optional) the correlation key of the message
- `timeToLive` - (optional)  how long the message should be buffered on the broker
- `messageId` - (optional) the unique ID of the message; can be omitted. only useful to ensure only one message with the given ID will ever be published (during its lifetime)
- `variables` - (optional) the message variables as a JSON document; to be valid, the root of the document must be an object, e.g. { "a": "foo" }. [ "foo" ] would not be valid

##### 响应

The binding returns a JSON with the following response:

```json
{
  "key": 2251799813688225
}
```

The response values are:

- `key` - the unique ID of the message that was published

#### activate-jobs

The `activate-jobs` operation iterates through all known partitions round-robin and activates up to the requested maximum and streams them back to the client as they are activated.

To perform a `activate-jobs` operation, invoke the Zeebe command binding with a `POST` method, and the following JSON body:

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

参数的含义是：

- `jobType` - the job type, as defined in the BPMN process (e.g. `<zeebe:taskDefinition type="fetch-products" />`)
- `maxJobsToActivate` - the maximum jobs to activate by this request
- `timeout` - (optional, default: 5 minutes) a job returned after this call will not be activated by another call until the timeout has been reached
- `workerName` - (optional, default: `default`) the name of the worker activating the jobs, mostly used for logging purposes
- `fetchVariables` - (optional) a list of variables to fetch as the job variables; if empty, all visible variables at the time of activation for the scope of the job will be returned

##### 响应

The binding returns a JSON with the following response:

```json
[
  {

  }
]
```

The response values are:

- `key` - the key, a unique identifier for the job
- `type` - the type of the job (should match what was requested)
- `processInstanceKey` - the job's process instance key
- `bpmnProcessId` - the bpmn process ID of the job process definition
- `processDefinitionVersion` - the version of the job process definition
- `processDefinitionKey` - the key of the job process definition
- `elementId` - the associated task element ID
- `elementInstanceKey` - the unique key identifying the associated task, unique within the scope of the process instance
- `customHeaders` - a set of custom headers defined during modelling; returned as a serialized JSON document
- `worker` - the name of the worker which activated this job
- `retries` - the amount of retries left to this job (should always be positive)
- `deadline` - when the job can be activated again, sent as a UNIX epoch timestamp
- `variables` - JSON document, computed at activation time, consisting of all visible variables to the task scope

#### complete-job

The `complete-job` operation completes a job with the given payload, which allows completing the associated service task.

To perform a `complete-job` operation, invoke the Zeebe command binding with a `POST` method, and the following JSON body:

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

参数的含义是：

- `jobKey` - the unique job identifier, as obtained from the activate jobs response
- `variables` - (optional) a JSON document representing the variables in the current task scope

##### 响应

The binding does not return a response body.

#### fail-job

The `fail-job` operation marks the job as failed; if the retries argument is positive, then the job will be immediately activatable again, and a worker could try again to process it. If it is zero or negative however, an incident will be raised, tagged with the given errorMessage, and the job will not be activatable until the incident is resolved.

To perform a `fail-job` operation, invoke the Zeebe command binding with a `POST` method, and the following JSON body:

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

参数的含义是：

- `jobKey` - the unique job identifier, as obtained when activating the job
- `retries` - the amount of retries the job should have left
- `errorMessage` - (optional) an message describing why the job failed this is particularly useful if a job runs out of retries and an incident is raised, as it this message can help explain why an incident was raised

##### 响应

The binding does not return a response body.

#### update-job-retries

The `update-job-retries` operation updates the number of retries a job has left. This is mostly useful for jobs that have run out of retries, should the underlying problem be solved.

To perform a `update-job-retries` operation, invoke the Zeebe command binding with a `POST` method, and the following JSON body:

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

参数的含义是：

- `jobKey` - the unique job identifier, as obtained through the activate-jobs operation
- `retries` - the new amount of retries for the job; must be positive

##### 响应

The binding does not return a response body.

#### throw-error

The `throw-error` operation throw an error to indicate that a business error is occurred while processing the job. The error is identified by an error code and is handled by an error catch event in the process with the same error code.

To perform a `throw-error` operation, invoke the Zeebe command binding with a `POST` method, and the following JSON body:

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
- `errorCode` - the error code that will be matched with an error catch event
- `errorMessage` - (optional) an error message that provides additional context

##### 响应

The binding does not return a response body.

## 相关链接

- [Dapr组件的基本格式]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过输入绑定触发应用]({{< ref howto-triggers.md >}})
- [如何处理: 使用绑定对接外部资源]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
