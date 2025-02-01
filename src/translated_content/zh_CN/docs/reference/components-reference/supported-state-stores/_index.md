---
type: docs
title: "状态存储组件说明"
linkTitle: "状态存储"
description: "支持与Dapr接口的状态存储"
weight: 4000
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/"
no_list: true
---

下表列出了Dapr状态管理模块在不同层次上支持的状态存储。[了解如何为Dapr状态管理配置不同的状态存储。]({{< ref setup-state-store.md >}})

{{< partial "components/description.html" >}}

{{% alert title="提示" color="primary" %}}
如果状态存储支持事务操作和ETag，则可以用于Dapr的actor模型。
{{% /alert %}}

{{< partial "components/state-stores.html" >}}
