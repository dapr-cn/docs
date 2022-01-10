---
type: docs
title: "RethinkDB binding spec"
linkTitle: "RethinkDB"
description: "Detailed documentation on the RethinkDB binding component"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/rethinkdb/"
---

## 配置

The [RethinkDB state store]({{<ref setup-rethinkdb.md>}}) supports transactions which means it can be used to support Dapr actors. Dapr persists only the actor's current state which doesn't allow the users to track how actor's state may have changed over time.

To enable users to track change of the state of actors, this binding leverages RethinkDB's built-in capability to monitor RethinkDB table and event on change with both the `old` and `new` state. This binding creates a subscription on the Dapr state table and streams these changes using the Dapr input binding interface.

To setup RethinkDB statechange binding create a component of type `bindings.rethinkdb.statechange`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.


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
    value: <REPLACE-RETHINKDB-ADDRESS> # Required, e.g. 127.0.0.1:28015 or rethinkdb.default.svc.cluster.local:28015).
  - name: database
    value: <REPLACE-RETHINKDB-DB-NAME> # Required, e.g. dapr (alpha-numerics only)
```

## 元数据字段规范

| 字段       | 必填 | 绑定支持 | 详情                          | 示例                                                                |
| -------- |:--:| ---- | --------------------------- | ----------------------------------------------------------------- |
| address  | Y  | 输入   | Address of RethinkDB server | `"27.0.0.1:28015"`, `"rethinkdb.default.svc.cluster.local:28015"` |
| database | Y  | 输入   | RethinDB database name      | `"dapr"`                                                          |

## 绑定支持

This component only supports **input** binding interface.

## 相关链接

- [Combine this binding with Dapr Pub/Sub](https://github.com/mchmarny/dapr-state-store-change-handler) to stream state changes to a topic
- [Dapr组件的基本格式]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过输入绑定触发应用]({{< ref howto-triggers.md >}})
- [如何处理: 使用绑定对接外部资源]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
