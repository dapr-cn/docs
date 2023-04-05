---
type: docs
title: "状态存储组件"
linkTitle: "状态存储"
description: "为 Dapr 状态管理建立不同状态存储的指南"
weight: 600
aliases:
  - "/zh-hans/operations/components/setup-state-store/setup-state-store-overview/"
---

Dapr integrates with existing databases to provide apps with state management capabilities for CRUD operations, transactions and more. It also supports the configuration of multiple, named, state store components *per application*.

状态存储可以扩展，可以在 [components-contrib 仓库](https://github.com/dapr/components-contrib)中找到。

Dapr 中的状态存储使用 `Component ` 文件进行描述：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
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

## Supported state stores

访问 [参考手册]({{< ref supported-state-stores >}}) 查看所有支持的 Dapr 状态存储库。

## 相关主题
- [Component concept]({{< ref components-concept.md >}})
- [状态管理概览]({{< ref state-management >}})
- [状态管理 API 规范]({{< ref state_api.md >}})
- [Supported state stores]({{< ref supported-state-stores >}})
