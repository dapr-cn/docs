---
type: docs
title: "RethinkDB 绑定规范"
linkTitle: "RethinkDB"
description: "关于 RethinkDB 绑定组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/rethinkdb/"
---

## 组件格式

[RethinkDB 状态存储]({{<ref setup-rethinkdb.md>}})支持事务，因此可以用于支持 Dapr actor。Dapr 仅持久化 actor 的当前状态，因此用户无法跟踪 actor 状态随时间的变化。

为了让用户能够跟踪 actor 状态的变化，此绑定利用 RethinkDB 内置的功能来监控表和事件的变化，包括 `old` 和 `new` 状态。此绑定在 Dapr 状态表上创建一个订阅，并通过 Dapr 输入绑定接口流式传输这些变化。

要设置 RethinkDB 状态变化绑定，请创建一个类型为 `bindings.rethinkdb.statechange` 的组件。请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})了解如何创建和应用绑定配置。

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
    value: "<REPLACE-RETHINKDB-ADDRESS>" # 必需，例如 127.0.0.1:28015 或 rethinkdb.default.svc.cluster.local:28015）。
  - name: database
    value: "<REPLACE-RETHINKDB-DB-NAME>" # 必需，例如 dapr（仅限字母数字）
  - name: direction 
    value: "<DIRECTION-OF-RETHINKDB-BINDING>"
```

## 规范元数据字段

| 字段              | 必需 | 绑定支持 |  详情 | 示例 |
|--------------------|:--------:|------------|-----|---------|
| `address` | Y | 输入 | RethinkDB 服务器地址 | `"27.0.0.1:28015"`，`"rethinkdb.default.svc.cluster.local:28015"` |
| `database` | Y | 输入 | RethinkDB 数据库名称 | `"dapr"` |
| `direction` | N | 输入 | 绑定的方向 | `"input"` |

## 绑定支持

此组件仅支持**输入**绑定接口。

## 相关链接

- [将此绑定与 Dapr Pub/Sub 结合使用](https://github.com/mchmarny/dapr-state-store-change-handler)以将状态变化流式传输到主题
- [Dapr 组件的基本架构]({{< ref component-schema >}})
- [Bindings 构建块]({{< ref bindings >}})
- [如何：使用输入绑定触发应用程序]({{< ref howto-triggers.md >}})
- [如何：使用绑定与外部资源接口]({{< ref howto-bindings.md >}})
- [Bindings API 参考]({{< ref bindings_api.md >}})
