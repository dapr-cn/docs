---
type: docs
title: "In-memory"
linkTitle: "In-memory"
description: "关于In Memory pubsub组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-pubsub/supported-pubsub/setup-inmemory/"
---

The in-memory pub/sub component operates within a single Dapr sidecar. This is primarily meant for development purposes. State is not replicated across multiple sidecars and is lost when the Dapr sidecar is restarted.

## Component format

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub
spec:
  type: pubsub.in-memory
  version: v1
  metadata: []
```

> 注意：in-memory的组件不需要任何特定的元数据才能工作，但是 spec.metadata 是必填字段。

## 相关链接

- [Basic schema for a Dapr component]({{< ref component-schema >}}) in the Related links section
- 阅读 [本指南]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}})，了解配置 发布/订阅组件的说明
- [发布/订阅构建块]({{< ref pubsub >}})
