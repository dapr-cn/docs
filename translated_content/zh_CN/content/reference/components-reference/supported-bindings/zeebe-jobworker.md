---
type: docs
title: "Zeebe JobWorker binding spec"
linkTitle: "Zeebe JobWorker"
description: "Detailed documentation on the Zeebe JobWorker binding component"
---

## 配置

To setup Zeebe JobWorker binding create a component of type `bindings.zeebe.jobworker`. 请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})，了解如何创建和应用绑定配置。

See [this](https://docs.camunda.io/docs/product-manuals/concepts/job-workers) for Zeebe JobWorker documentation.

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

| 字段                     | 必填 | 绑定支持 | 详情                                                                                                                                                                                                                                                                                                      | 示例                                   |
| ---------------------- |:--:| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| gatewayAddr            | Y  | 输入   | Zeebe gateway address                                                                                                                                                                                                                                                                                   | `localhost:26500`                    |
| gatewayKeepAlive       | N  | 输入   | Sets how often keep alive messages should be sent to the gateway. Defaults to 45 seconds                                                                                                                                                                                                                | `45s`                                |
| usePlainTextConnection | N  | 输入   | Whether to use a plain text connection or not                                                                                                                                                                                                                                                           | `true,false`                         |
| caCertificatePath      | N  | 输入   | The path to the CA cert                                                                                                                                                                                                                                                                                 | `/path/to/ca-cert`                   |
| workerName             | N  | 输入   | The name of the worker activating the jobs, mostly used for logging purposes                                                                                                                                                                                                                            | `products-worker`                    |
| workerTimeout          | N  | 输入   | A job returned after this call will not be activated by another call until the timeout has been reached; defaults to 5 minutes                                                                                                                                                                          | `5m`                                 |
| requestTimeout         | N  | 输入   | The request will be completed when at least one job is activated or after the requestTimeout. If the requestTimeout = 0, a default timeout is used. If the requestTimeout < 0, long polling is disabled and the request is completed immediately, even when no job is activated. Defaults to 10 seconds | `30s`                                |
| jobType                | Y  | 输入   | the job type, as defined in the BPMN process (e.g. `<zeebe:taskDefinition type="fetch-products" />`)                                                                                                                                                                                              | `fetch-products`                     |
| maxJobsActive          | N  | 输入   | Set the maximum number of jobs which will be activated for this worker at the same time. Defaults to 32                                                                                                                                                                                                 | `32`                                 |
| concurrency            | N  | 输入   | The maximum number of concurrent spawned goroutines to complete jobs. Defaults to 4                                                                                                                                                                                                                     | `4`                                  |
| pollInterval           | N  | 输入   | Set the maximal interval between polling for new jobs. Defaults to 100 milliseconds                                                                                                                                                                                                                     | `100ms`                              |
| pollThreshold          | N  | 输入   | Set the threshold of buffered activated jobs before polling for new jobs, i.e. threshold * maxJobsActive. Defaults to 0.3                                                                                                                                                                               | `0.3`                                |
| fetchVariables         | N  | 输入   | A list of variables to fetch as the job variables; if empty, all visible variables at the time of activation for the scope of the job will be returned                                                                                                                                                  | `productId, productName, productKey` |

## 绑定支持

This component supports **input** binding interfaces.

### 输入绑定

The Zeebe workflow engine handles the workflow state as also workflow variables which can be passed on workflow instantiation or which can be updated or created during workflow execution. These variables can be passed to a registered job worker by defining the variable names as comma-separated list in the `fetchVariables` metadata field. The workflow engine will then pass these variables with its current values to the job worker implementation.

If the binding will register three variables `productId`, `productName` and `productKey` then the service will be called with the following JSON:

```json
{
  "productId": "some-product-id",  
  "productName": "some-product-name",  
  "productKey": "some-product-key"  
}
```

## 相关链接

- [Dapr组件的基本格式]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过输入绑定触发应用]({{< ref howto-triggers.md >}})
- [如何处理: 使用绑定对接外部资源]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
