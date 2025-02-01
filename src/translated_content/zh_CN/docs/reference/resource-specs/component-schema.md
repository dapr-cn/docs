---
type: docs
title: "组件规范"
linkTitle: "组件"
weight: 1000
description: "Dapr 组件的基本规范"
---

Dapr 通过[资源规范](https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/)来定义和注册组件。所有组件都被定义为资源，可以应用于任何运行 Dapr 的托管环境，不仅限于 Kubernetes。

通常，组件会被限制在特定的[命名空间]({{< ref isolation-concept.md >}})内，并通过作用域来限制对特定应用程序的访问。命名空间可以在组件清单中显式指定，或者由 API 服务器根据 Kubernetes 的上下文来自动分配。

{{% alert title="注意" color="primary" %}}
在自托管模式下，如果省略命名空间字段，daprd 会自动加载组件资源。然而，安全配置文件不会生效，因为 daprd 无论如何都能访问清单，这与 Kubernetes 的行为不同。
{{% /alert %}}

## 格式

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
auth: 
 secretstore: <REPLACE-WITH-SECRET-STORE-NAME>
metadata:
  name: <REPLACE-WITH-COMPONENT-NAME>
  namespace: <REPLACE-WITH-COMPONENT-NAMESPACE>
spec:
  type: <REPLACE-WITH-COMPONENT-TYPE>
  version: v1
  initTimeout: <REPLACE-WITH-TIMEOUT-DURATION>
  ignoreErrors: <REPLACE-WITH-BOOLEAN>
  metadata:
  - name: <REPLACE-WITH-METADATA-NAME>
    value: <REPLACE-WITH-METADATA-VALUE>
scopes:
  - <REPLACE-WITH-APPID>
  - <REPLACE-WITH-APPID>
```

## 规范字段

| 字段              | 必需 | 详情 | 示例 |
|--------------------|:--------:|---------|---------|
| apiVersion         | Y        | 您调用的 Dapr（和 Kubernetes 如果适用）API 的版本 | `dapr.io/v1alpha1`
| kind               | Y        | 资源的类型。对于组件，必须始终是 `Component` | `Component`
| auth               | N        | secret 存储的名称，其中 `secretKeyRef` 在元数据中查找组件中使用的 secret 名称 | 参见 [如何：在组件中引用 secret]({{< ref component-secrets >}})
| scopes             | N        | 组件限制的应用程序，由其应用程序 ID 指定 | `order-processor`, `checkout`  
| **metadata**       | -        | **关于组件注册的信息** |
| metadata.name      | Y        | 组件的名称 | `prod-statestore`
| metadata.namespace | N        | 具有命名空间的托管环境中组件的命名空间 | `myapp-namespace`
| **spec**           | -        | **关于组件资源的详细信息**
| spec.type          | Y        | 组件的类型 | `state.redis`
| spec.version       | Y        | 组件的版本 | `v1`
| spec.initTimeout   | N        | 组件初始化的超时时间。默认是 5s  | `5m`, `1h`, `20s`
| spec.ignoreErrors  | N        | 告诉 Dapr sidecar 如果组件加载失败继续初始化。默认是 false  | `false`
| **spec.metadata**  | -        | **组件特定配置的键/值对。请参阅您的组件定义以获取字段**|
| spec.metadata.name | Y        | 组件特定属性的名称及其值 | `- name: secretsFile` <br>   `value: secrets.json`

### 模板化的元数据值

元数据值可以包含在 Dapr sidecar 启动时解析的模板标签。下表显示了可以在组件中使用的当前模板标签。

| 标签         | 详情                                                            | 示例用例                                                                                                                                                       |
|-------------|--------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| {uuid}      | 随机生成的 UUIDv4                                          | 当您在自托管模式下需要唯一标识符时；例如，多个应用程序实例消费[共享 MQTT 订阅]({{< ref "setup-mqtt3.md" >}}) |
| {podName}   | 包含 Dapr sidecar 的 pod 的名称                        | 用于持久化行为，当使用 StatefulSets 在 Kubernetes 中重启时 ConsumerID 不会改变                                                |
| {namespace} | Dapr sidecar 所在的命名空间与其 appId 结合   | 当多个应用程序实例在 Kubernetes 中消费 Kafka 主题时使用共享的 `clientId`                                                                      |
| {appID}     | 包含 Dapr sidecar 的资源的配置 `appID` | 当多个应用程序实例在自托管模式下消费 Kafka 主题时使用共享的 `clientId`                                                              |

下面是一个在 MQTT pubsub 组件中使用 `{uuid}` 标签的示例。请注意，在单个元数据值中可以使用多个模板标签。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: messagebus
spec:
  type: pubsub.mqtt3
  version: v1
  metadata:
    - name: consumerID
      value: "{uuid}"
    - name: url
      value: "tcp://admin:public@localhost:1883"
    - name: qos
      value: 1
    - name: retain
      value: "false"
    - name: cleanSession
      value: "false"
```

## 相关链接
- [组件概念]({{< ref components-concept.md >}})
- [在组件定义中引用 secret]({{< ref component-secrets.md >}})
- [支持的状态存储]({{< ref supported-state-stores >}})
- [支持的发布/订阅代理]({{< ref supported-pubsub >}})
- [支持的 secret 存储]({{< ref supported-secret-stores >}})
- [支持的绑定]({{< ref supported-bindings >}})
- [设置组件作用域]({{< ref component-scopes.md >}})
