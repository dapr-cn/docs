---
type: docs
title: "RethinkDB binding spec"
linkTitle: "RethinkDB"
description: "Detailed documentation on the RethinkDB binding component"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/rethinkdb/"
---

## 配置

[RethinkDB 状态存储]({{<ref setup-rethinkdb.md>}})支持事务，意味着它可以被用来支持 Dapr actors。 Dapr只会将actor当前的状态持久化，持久化后将不再允许用户跟踪actor的状态如何随时间推移而变化。

为了使用户能够跟踪actor状态的变化，RethinkDB绑定利用了其内置的对于RethinkDB表和事件`新``旧`状态变化的监控能力。 这个绑定组件创建了一个Dapr状态表和数据流的订阅，他们使用Dapr输入绑定接口传输变更。

要设置RethinkDB状态变更绑定需要创建一个`bindings.rethinkdb.statechange`类型的组件。 请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})，了解如何创建和应用绑定配置。


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

| 字段       | 必填 | 绑定支持 | 详情            | 示例                                                                |
| -------- |:--:| ---- | ------------- | ----------------------------------------------------------------- |
| address  | Y  | 输入   | RethinkDB服务地址 | `"27.0.0.1:28015"`, `"rethinkdb.default.svc.cluster.local:28015"` |
| database | Y  | 输入   | RethinDB数据库名  | `"dapr"`                                                          |

## 绑定支持

该组件只支持**输入** 绑定接口。

## 相关链接

- [将此绑定与 Dapr Pub/Sub](https://github.com/mchmarny/dapr-state-store-change-handler) 结合以将状态更改流式传输到主题
- [Dapr组件的基本格式]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过输入绑定触发应用]({{< ref howto-triggers.md >}})
- [如何处理: 使用绑定对接外部资源]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
