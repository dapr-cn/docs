---
type: docs
title: "In Memory"
linkTitle: "In Memory"
description: "关于In Memory pubsub组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-pubsub/supported-pubsub/setup-inmemory/"
---

内存中发布/订阅组件对于开发目的非常有用，并且可以在单个计算机边界内工作。

## 配置

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub
  namespace: default
spec:
  type: pubsub.in-memory
  version: v1
  metadata: []
```

> 注意：in-memory的组件不需要任何特定的元数据才能工作，但是 spec.metadata 是必填字段。

## 相关链接
- 相关链接部分中的[Dapr组件的基本格式]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}})，了解配置 发布/订阅组件的说明
- [发布/订阅构建块]({{< ref pubsub >}})
