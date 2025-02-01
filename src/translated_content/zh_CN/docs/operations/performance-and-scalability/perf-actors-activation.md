---
type: docs
title: "actor 性能激活"
linkTitle: "actor 性能激活"
weight: 20000
description: ""
---

本文介绍了在 Kubernetes 上 Dapr 中 actor 的服务调用 API 的性能基准和资源使用情况。

## 系统概述

在 Dapr 中使用 actor 的应用程序需要考虑两个方面。首先，actor 调用的路由由 Dapr 的边车（sidecar）处理。其次，actor 的运行时在应用程序端实现和处理，这依赖于所使用的 SDK。目前，性能测试使用 Java SDK 在应用程序中提供 actor 运行时。

### Kubernetes 组件

* 边车（数据平面）
* Placement（actor 所需，控制平面将 actor 类型映射到主机）
* Operator（控制平面）
* 边车注入器（控制平面）
* Sentry（可选，控制平面）

## Dapr v1.0 的性能总结

Dapr 边车中的 actor API 负责识别注册了特定 actor 类型的主机，并将请求路由到拥有该 actor ID 的合适主机。主机运行应用程序的一个实例，并使用 Dapr SDK（.Net、Java、Python 或 PHP）通过 HTTP 处理 actor 请求。

本次测试通过 Dapr 的 HTTP API 直接调用 actor。

有关更多信息，请参见 [actor 概述]({{< ref actors-overview.md >}})。

### Kubernetes 性能测试设置

测试在一个由 3 个节点组成的 Kubernetes 集群上进行，使用普通硬件，每个节点配备 4 核 CPU 和 8GB RAM，没有网络加速。
设置包括一个负载测试器（[Fortio](https://github.com/fortio/fortio)）pod，其中注入了一个 Dapr 边车，调用服务 API 以访问不同节点上的 pod。

测试参数：

* 每秒 500 个请求
* 1 个副本
* 持续 1 分钟
* 边车限制为 0.5 vCPU
* 启用 mTLS
* 启用边车遥测（采样率为 0.1 的跟踪）
* 空 JSON 对象的负载：`{}`

### 结果

* 实际吞吐量约为 500 qps。
* tp90 延迟约为 3ms。
* tp99 延迟约为 6.2ms。
* Dapr 应用程序消耗约 523m CPU 和约 304.7Mb 内存
* Dapr 边车消耗 2m CPU 和约 18.2Mb 内存
* 无应用程序重启
* 无边车重启

## 相关链接

* 有关更多信息，请参见 [Kubernetes 上的 Dapr 概述]({{< ref kubernetes-overview.md >}})
