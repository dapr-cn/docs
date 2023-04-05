---
type: docs
title: "组件schema"
linkTitle: "组件schema"
weight: 100
description: "Dapr 组件的基本 schema"
---

Dapr defines and registers components using a [CustomResourceDefinition](https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/). All components are defined as a CRD and can be applied to any hosting environment where Dapr is running, not just Kubernetes.

## Format

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

| Field              | 必填 | 详情                                                                                                 | 示例                 |
| ------------------ |:--:| -------------------------------------------------------------------------------------------------- | ------------------ |
| apiVersion         | 是  | The version of the Dapr (and Kubernetes if applicable) API you are calling                         | `dapr.io/v1alpha1` |
| kind               | 是  | The type of CRD. For components is must always be `Component`                                      | `Component`        |
| **metadata**       | -  | **Information about the component registration**                                                   |                    |
| metadata.name      | 是  | The name of the component                                                                          | `prod-statestore`  |
| metadata.namespace | 否  | The namespace for the component for hosting environments with namespaces                           | `myapp-namespace`  |
| **spec**           | -  | **Detailed information on the component resource**                                                 |                    |
| spec.type          | 是  | The type of the component                                                                          | `state.redis`      |
| spec.version       | 是  | The version of the component                                                                       | `v1`               |
| spec.initTimeout   | 否  | The timeout duration for the initialization of the component. Default is 5s                        | `5m`, `1h`, `20s`  |
| spec.ignoreErrors  | 否  | Tells the Dapr sidecar to continue initialization if the component fails to load. Default is false | `false`            |
| **spec.metadata**  | -  | **A key/value pair of component specific configuration. See your component definition for fields** |                    |

### Templated metadata values

Metadata values can contain template tags that are resolved on Dapr sidecar startup. The table below shows the current templating tags that can be used in components.

| Tag         | 详情                                                                 | Example use case                                                                                                                                                        |
| ----------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| {uuid}      | Randomly generated UUIDv4                                          | When you need a unique identifier in self-hosted mode; for example, multiple application instances consuming a [shared MQTT subscription]({{< ref "setup-mqtt3.md" >}}) |
| {podName}   | Name of the pod containing the Dapr sidecar                        | Use to have a persisted behavior, where the ConsumerID does not change on restart when using StatefulSets in Kubernetes                                                 |
| {namespace} | Namespace where the Dapr sidecar resides combined with its appId   | Using a shared `clientId` when multiple application instances consume a Kafka topic in Kubernetes                                                                       |
| {appID}     | The configured `appID` of the resource containing the Dapr sidecar | Having a shared `clientId` when multiple application instances consumer a Kafka topic in self-hosted mode                                                               |

Below is an example of using the `{uuid}` tag in an MQTT pubsub component. Note that multiple template tags can be used in a single metadata value.

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

## 深入阅读
- [组件概念]({{< ref components-concept.md >}})
- [组件定义中的引用秘密]({{< ref component-secrets.md >}})
- [支持的状态存储]({{< ref supported-state-stores >}})
- [支持的发布/订阅消息代理]({{< ref supported-pubsub >}})
- [支持的秘密存储]({{< ref supported-secret-stores >}})
- [Supported bindings]({{< ref supported-bindings >}})
- [设置组件作用域]({{< ref component-scopes.md >}})
