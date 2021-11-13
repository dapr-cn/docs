---
type: docs
title: "概述"
linkTitle: "概述"
description: "状态管理组件的设置指导"
weight: 10000
---

Dapr 与现有数据库集成，为应用程序提供CRUD操作、事务等状态管理功能。 Dapr 支持为*每个应用*配置多个命名的状态存储组件。

状态存储可以扩展，可以在 [components-contrib repo](https://github.com/dapr/components-contrib) 中找到。

Dapr 的使用 `Component` 文件来描述状态存储：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
  namespace: default
spec:
  type: state.<DATABASE>
  version: v1
  metadata:
  - name: <KEY>
    value: <VALUE>
  - name: <KEY>
    value: <VALUE>
...
```

数据库的类型由`type`字段决定，连接地址和其他元数据等放在`.metadata`部分。 Even though metadata values can contain secrets in plain text, it is recommended you use a [secret store]({{< ref component-secrets.md >}}).

Visit [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) on how to configure a state store component.

## 相关主题
- [组件概念]({{< ref components-concept.md >}})
- [状态管理概览]({{< ref state-management >}})
- [状态管理 API 规范]({{< ref state_api.md >}})
