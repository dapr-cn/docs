---
type: docs
title: "服务调用性能"
linkTitle: "服务调用性能"
weight: 10000
description: ""
---

本文提供了在不同托管环境中运行Dapr所需组件的服务调用API性能基准和资源利用率。

## 系统概述

Dapr由两个主要部分组成：数据平面和控制平面。数据平面是运行在应用程序旁边的sidecar，而控制平面负责配置sidecar并提供证书和身份管理等功能。

### 自托管组件

* sidecar（数据平面）
* Sentry（可选，控制平面）
* Placement（可选，控制平面）

更多信息请参见[Dapr自托管模式概述]({{< ref self-hosted-overview.md >}})。

### Kubernetes组件

* sidecar（数据平面）
* Sentry（可选，控制平面）
* Placement（可选，控制平面）
* Operator（控制平面）
* sidecar注入器（控制平面）

更多信息请参见[Dapr在Kubernetes上的概述]({{< ref kubernetes-overview.md >}})。

## Dapr v1.0的性能总结

服务调用API是一个反向代理，内置了服务发现功能，用于连接其他服务。这包括跟踪、指标、用于流量传输加密的mTLS，以及通过重试网络分区和连接错误来实现的弹性。

通过服务调用，您可以实现从HTTP到HTTP、HTTP到gRPC、gRPC到HTTP和gRPC到gRPC的调用。Dapr在sidecar之间的通信中始终使用gRPC，但保留了应用程序调用时使用的协议语义。服务调用是与Dapr actor通信的底层机制。

更多信息请参见[服务调用概述]({{< ref service-invocation-overview.md >}})。

### Kubernetes性能测试设置

测试在一个3节点的Kubernetes集群上进行，使用普通硬件，每个节点配备4核CPU和8GB RAM，没有任何网络加速。
设置包括一个负载测试器（[Fortio](https://github.com/fortio/fortio)）pod，其中注入了一个Dapr sidecar，调用服务调用API以到达不同节点上的pod。

测试参数：

* 每秒1000个请求
* sidecar限制为0.5 vCPU
* 启用sidecar mTLS
* 启用sidecar遥测（采样率为0.1的跟踪）
* 1KB的负载

基准测试包括直接、未加密的流量，没有遥测，直接从负载测试器到目标应用程序。

### 控制平面性能

Dapr控制平面在非高可用模式下运行时使用总共0.009 vCPU和61.6 Mb，这意味着每个系统组件只有一个副本。
在高可用生产设置中运行时，Dapr控制平面消耗约0.02 vCPU和185 Mb。

| 组件  | vCPU | 内存
| ------------- | ------------- | -------------
| Operator  | 0.001  | 12.5 Mb
| Sentry  | 0.005  | 13.6 Mb
| sidecar注入器  | 0.002  | 14.6 Mb
| Placement | 0.001  | 20.9 Mb

有许多因素会影响每个系统组件的CPU和内存消耗。这些因素在下表中显示。

| 组件  | vCPU | 内存
| ------------- | ------------- | ------------------------
| Operator  | 请求组件、配置和订阅的pod数量  |
| Sentry  | 证书请求数量  |
| sidecar注入器 | 准入请求数量 |
| Placement | actor重新平衡操作数量 | 连接的actor主机数量

### 数据平面性能

Dapr sidecar每秒处理1000个请求时使用0.48 vCPU和23Mb内存。
在端到端的调用中，Dapr sidecar（客户端和服务器）在第90百分位延迟中增加约1.40 ms，在第99百分位延迟中增加约2.10 ms。端到端是指从一个应用程序发出请求到另一个应用程序接收响应的全过程。这在[此图]({{< ref service-invocation-overview.md >}})的步骤1-7中显示。

这种性能与常用的服务网格相当或更好。

### 延迟

在测试设置中，请求通过Dapr sidecar在客户端（从负载测试工具服务请求）和服务器端（目标应用程序）进行。
在Dapr测试中启用了mTLS和遥测（采样率为0.1的跟踪）和指标，而在基准测试中禁用了这些功能。

<img src="/images/perf_invocation_p90.png" alt="第90百分位延迟">

<br>

<img src="/images/perf_invocation_p99.png" alt="第99百分位延迟">