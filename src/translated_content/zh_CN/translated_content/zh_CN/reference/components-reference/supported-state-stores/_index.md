---
type: docs
title: "State store 组件规范"
linkTitle: "状态存储"
description: "Dapr支持的状态存储组件"
weight: 1000
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/"
no_list: true
---

The following table lists state stores supported, at various levels, by the Dapr state management building block. [Learn how to set up different state stores for Dapr state management.]({{< ref setup-state-store.md >}})

{{< partial "components/description.html" >}}

{{% alert title="Note" color="primary" %}}
State stores can be used for actors if it supports both transactional operations and ETag.
{{% /alert %}}

{{< partial "components/state-stores.html" >}}
