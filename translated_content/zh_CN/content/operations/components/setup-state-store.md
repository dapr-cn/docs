---
type: docs
title: "状态存储组件"
linkTitle: "状态存储"
description: "为 Dapr 状态管理建立不同状态存储的指导"
weight: 1000
aliases:
  - "/zh-hans/operations/components/setup-state-store/setup-state-store-overview/"
---

Dapr 与现有数据库集成，为应用程序提供 CRUD 操作、事务等状态管理功能。 Dapr 支持为*每个应用*配置多个命名的状态存储组件。

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

数据库的类型由 `type` 字段决定，连接地址和其他元数据等放在 `.metadata` 部分。 即使元数据值可以在纯文本中包含密钥，但建议您使用 [secret store]({{< ref component-secrets.md >}})。

阅读 [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) 以获取配置状态存储组件的说明.

## 支持的状态存储

访问 [参考手册]({{< ref supported-state-stores >}}) 查看所有支持的 Dapr 状态存储库。

## 相关主题
- [组件概念]({{< ref components-concept.md >}})
- [状态管理概览]({{< ref state-management >}})
- [状态管理 API 规范]({{< ref state_api.md >}})
- [支持的状态存储]({{< ref supported-state-stores >}})
