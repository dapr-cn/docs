---
type: docs
title: "RethinkDB 绑定规范"
linkTitle: "RethinkDB"
description: "RethinkDB绑定组件详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/rethinkdb/"
---

## Component format

The [RethinkDB state store]({{<ref setup-rethinkdb.md>}}) supports transactions which means it can be used to support Dapr actors. Dapr persists only the actor's current state which doesn't allow the users to track how actor's state may have changed over time.

为了使用户能够跟踪actor状态的变化，RethinkDB绑定利用了其内置的对于RethinkDB表和事件`新``旧`状态变化的监控能力。 这个绑定组件创建了一个Dapr状态表和数据流的订阅，他们使用Dapr输入绑定接口传输变更。

要设置RethinkDB状态变更绑定需要创建一个`bindings.rethinkdb.statechange`类型的组件。 See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: changes
spec:
  type: bindings.rethinkdb.statechange
  version: v1
  metadata:
  - name: address
    value: "<REPLACE-RETHINKDB-ADDRESS>" # Required, e.g. 127.0.0.1:28015 or rethinkdb.default.svc.cluster.local:28015).
  - name: database
    value: "<REPLACE-RETHINKDB-DB-NAME>" # Required, e.g. dapr (alpha-numerics only)
  - name: direction 
    value: "<DIRECTION-OF-RETHINKDB-BINDING>"
```

## 元数据字段规范

| Field       | Required | 绑定支持  | 详情                          | 示例                                                                |
| ----------- |:--------:| ----- | --------------------------- | ----------------------------------------------------------------- |
| `address`   |    是     | Input | Address of RethinkDB server | `"27.0.0.1:28015"`, `"rethinkdb.default.svc.cluster.local:28015"` |
| `database`  |    是     | Input | RethinDB数据库名                | `"dapr"`                                                          |
| `direction` |    否     | Input | Direction of the binding    | `"input"`                                                         |

## 绑定支持

该组件只支持**输入** 绑定接口。

## 相关链接

- [Combine this binding with Dapr Pub/Sub](https://github.com/mchmarny/dapr-state-store-change-handler) to stream state changes to a topic
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过 input binding 触发应用]({{< ref howto-triggers.md >}})
- [How-To：使用绑定与外部资源进行交互]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
