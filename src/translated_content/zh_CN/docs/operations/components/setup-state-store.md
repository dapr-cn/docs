---
type: docs
title: "状态存储组件"
linkTitle: "状态存储"
description: "关于为 Dapr 状态管理设置不同状态存储的指导"
weight: 600
aliases:
  - "/zh-hans/operations/components/setup-state-store/setup-state-store-overview/"
---

Dapr 集成现有数据库，为应用提供 CRUD 操作、事务等状态管理功能。它还支持为每个应用配置多个独立的状态存储组件。

状态存储具有可扩展性，可以在 [components-contrib 仓库](https://github.com/dapr/components-contrib)中找到。

在 Dapr 中，状态存储通过 `Component` 文件进行描述：

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

数据库的类型由 `type` 字段决定，连接字符串和其他元数据信息放在 `.metadata` 部分。即使元数据值可以包含明文的密钥，仍建议使用 [密钥存储]({{< ref component-secrets.md >}})。

请参考[本指南]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}})了解如何配置状态存储组件。

## 支持的状态存储

请访问[此参考]({{< ref supported-state-stores >}})查看 Dapr 中支持的所有状态存储。

## 相关主题
- [组件概念]({{< ref components-concept.md >}})
- [状态管理概述]({{< ref state-management >}})
- [状态管理 API 规范]({{< ref state_api.md >}})
- [支持的状态存储]({{< ref supported-state-stores >}})
