---
type: docs
title: "名称解析提供方组件规范"
linkTitle: "名称解析"
weight: 5000
description: 与 Dapr 服务调用接口的受支持的名称解析提供方
no_list: true
---

以下组件为服务调用构建块提供名称解析。

表格标题：

> `状态`： [组件认证]({{<ref "certification-lifecycle.md">}}) 状态
  - [Alpha]({{<ref "certification-lifecycle.md#alpha">}})
  - [Beta]({{<ref "certification-lifecycle.md#beta">}})
  - [Stable]({{<ref "certification-lifecycle.md#stable">}}) > `Since`: 定义自哪个 Dapr 运行时版本开始，组件处于当前的状态。

> `组件版本`：代表组件的版本

### 通用

| Name                                               |  状态   | 组件版本 | 自从  |
| -------------------------------------------------- |:-----:|:----:|:---:|
| [HashiCorp Consul]({{< ref setup-nr-consul.md >}}) | Alpha |  v1  | 1.2 |

### 自托管

| Name                           |   状态   | 组件版本 | 自从  |
| ------------------------------ |:------:|:----:|:---:|
| [mDNS]({{< ref nr-mdns.md >}}) | Stable |  v1  | 1.0 |

### Kubernetes

| Name                                       |   状态   | 组件版本 | 自从  |
| ------------------------------------------ |:------:|:----:|:---:|
| [Kubernetes]({{< ref nr-kubernetes.md >}}) | Stable |  v1  | 1.0 |
