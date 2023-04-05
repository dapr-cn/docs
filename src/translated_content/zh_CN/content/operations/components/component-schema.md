---
type: docs
title: "组件schema"
linkTitle: "组件schema"
weight: 100
description: "Dapr组件的基本 schema"
---

Dapr 使用 [CustomResourceDefinition](https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/) 定义和注册组件。 所有组件都定义为 CRD，可应用于 Dapr 运行的任何托管环境，而不仅仅是 Kubernetes。

## 格式

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: [COMPONENT-NAME]
  namespace: [COMPONENT-NAMESPACE]
spec:
  type: [COMPONENT-TYPE]
  version: v1
  initTimeout: [TIMEOUT-DURATION]
  ignoreErrors: [BOOLEAN]
  metadata:
  - name: [METADATA-NAME]
    value: [METADATA-VALUE]
```

## 字段

| 字段                 | 必填 | 详情                                        | 示例                 |
| ------------------ |:--:| ----------------------------------------- | ------------------ |
| apiVersion         | 是  | 您正在调用的Dapr版本(如果适用的话为 Kubernetes) API      | `dapr.io/v1alpha1` |
| kind               | 是  | CRD的类型。 组件必须始终是 `Component`               | `Component`        |
| **metadata**       | -  | **有关组件注册的信息**                             |                    |
| metadata.name      | 是  | 组件的名称                                     | `prod-statestore`  |
| metadata.namespace | 否  | 主机环境的命名空间                                 | `myapp-namespace`  |
| **spec**           | -  | **关于组件资源的详细信息**                           |                    |
| spec.type          | 是  | 组件类型                                      | `state.redis`      |
| spec.version       | 是  | 组件版本                                      | `v1`               |
| spec.initTimeout   | 否  | 组件初始化的超时时间 默认值为 5s                        | `5m`, `1h`, `20s`  |
| spec.ignoreErrors  | 否  | 如果组件加载失败，请告诉Dapr sidecar 继续初始化。 默认为 false | `false`            |
| **spec.metadata**  | -  | **一个组件特定配置的键/值。 查看你的组件字段定义**              |                    |

### 特殊的元数据值

元数据值可以包含一个 `{uuid}` 标签，当 Dapr sidecar 启动时，该标记将被随机生成的 UUID 所取代。 每个启动都会生成新的 UUID。 它可以用来在 Kubernetes 上区分同一个 pod 的多个实例 ，比如[共享的 MQTT 订阅]({{< ref "setup-mqtt.md" >}})。 下面是一个使用 ` {uuid}` 选项的示例。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: messagebus
spec:
  type: pubsub.mqtt
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

ConsumerID 元数据值还可以包含一个 `{podName}` 标签，当 Dapr sidecar 启动时，该标签会被替换为 Kubernetes POD 的名称。 这可用于持久化行为，其中在 Kubernetes 中使用 StatefulSets 时，ConsumerID 在重新启动时不会更改。


## 深入阅读
- [Components concept]({{< ref components-concept.md >}})
- [组件定义中的引用密钥]({{< ref component-secrets.md >}})
- [支持的状态存储]({{< ref supported-state-stores >}})
- [支持的 发布/订阅 消息代理]({{< ref supported-pubsub >}})
- [支持的密钥存储]({{< ref supported-secret-stores >}})
- [Supported bindings]({{< ref supported-bindings >}})
- [设置组件作用域]({{< ref component-scopes.md >}})
