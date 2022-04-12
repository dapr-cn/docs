---
type: docs
title: "状态存储组件"
linkTitle: "状态存储"
description: "为 Dapr 状态管理建立不同状态存储的指南"
weight: 1000
aliases:
  - "/zh-hans/operations/components/setup-state-store/setup-state-store-overview/"
---

Dapr 与现有数据库集成，为应用程序提供 CRUD 操作、事务等状态管理功能。 Dapr 支持为*每个应用*配置多个命名的状态存储组件。

状态存储可以扩展，可以在 [components-contrib 仓库](https://github.com/dapr/components-contrib)中找到。

Dapr 中的状态存储使用 `Component ` 文件进行描述：

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

数据库的类型由 `type` 字段决定，连接地址和其他元数据等放在 `.metadata` 部分。 即使元数据值可以包含纯文本的秘密，但建议您使用[秘密存储]({{< ref component-secrets.md >}})。

请阅读 [本指南]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) 以获取配置状态存储组件的说明.

## 支持的状态存储

请访问[此参考文档]({{< ref supported-state-stores >}})，以查看 Dapr 中所有受支持的状态存储。

## 相关主题
- [组件概念]({{< ref components-concept.md >}})
- [状态管理概览]({{< ref state-management >}})
- [状态管理 API 规范]({{< ref state_api.md >}})
- [支持的状态存储]({{< ref supported-state-stores >}})
