---
type: docs
title: "内存"
linkTitle: "内存"
description: "关于内存状态组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-inmemory/"
---

内存状态存储组件在Dapr sidecar中维护状态，主要用于开发目的。状态不会在多个sidecar之间共享，并且在Dapr sidecar重启时会丢失。

## 组件格式

要设置内存状态存储，创建一个类型为`state.in-memory`的组件。请参阅[本指南]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}})了解如何创建和应用状态存储配置。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: state.in-memory
  version: v1
  metadata: 
  # 如果希望将内存用作actor模型的状态存储，请取消注释此行（可选）
  #- name: actorStateStore
  #  value: "true"
```

> 注意：虽然内存组件不需要特定的元数据，但`spec.metadata`字段仍然是必填的。

## 相关链接

- [Dapr组件的基本架构]({{< ref component-schema >}})
- 学习[如何创建和配置状态存储组件]({{< ref howto-get-save-state.md >}})
- 阅读更多关于[状态管理构建块]({{< ref state-management >}})
