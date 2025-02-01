---
type: docs
title: "内存"
linkTitle: "内存"
description: "关于内存 pubsub 组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-pubsub/supported-pubsub/setup-inmemory/"
---

内存 pub/sub 组件运行在单个 Dapr sidecar 中。这主要用于开发目的。状态不会在多个 sidecar 之间复制，并且在 Dapr sidecar 重启时会丢失。

## 组件格式

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

> 注意：内存组件不需要特定的元数据即可工作，但 spec.metadata 是必填字段。

## 相关链接

- [Dapr 组件的基本架构]({{< ref component-schema >}})
- 阅读[本指南]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}}) 以获取配置 pub/sub 组件的说明
- [Pub/Sub 构建块]({{< ref pubsub >}})
