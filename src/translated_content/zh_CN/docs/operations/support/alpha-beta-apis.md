---
type: docs
title: "Alpha 和 Beta API"
linkTitle: "Alpha & Beta API"
weight: 5000
description: "当前 Alpha 和 Beta API 列表"
---

## Alpha API

| 模块/API | gRPC | HTTP | 描述 | 文档 | 引入版本 | 
| ------------------ | ---- | ---- | ----------- | ------------- | ------------------ |
| 查询状态    | [查询状态 proto](https://github.com/dapr/dapr/blob/5aba3c9aa4ea9b3f388df125f9c66495b43c5c9e/dapr/proto/runtime/v1/dapr.proto#L44)     | `v1.0-alpha1/state/statestore/query` | 状态查询 API 可以让您检索、过滤和排序存储在状态存储组件中的键值数据。 | [查询状态 API]({{< ref "howto-state-query-api.md" >}}) | v1.5 |
| 分布式锁    | [锁 proto](https://github.com/dapr/dapr/blob/5aba3c9aa4ea9b3f388df125f9c66495b43c5c9e/dapr/proto/runtime/v1/dapr.proto#L112)     | `/v1.0-alpha1/lock` | 分布式锁 API 可以让您对资源进行锁定。	 | [分布式锁 API]({{< ref "distributed-lock-api-overview.md" >}}) | v1.8 |
| 批量发布    | [批量发布 proto](https://github.com/dapr/dapr/blob/5aba3c9aa4ea9b3f388df125f9c66495b43c5c9e/dapr/proto/runtime/v1/dapr.proto#L59)     | `v1.0-alpha1/publish/bulk` | 批量发布 API 允许您在单个请求中向主题发布多条消息。 | [批量发布和订阅 API]({{< ref "pubsub-bulk.md" >}}) | v1.10 |
| 批量订阅   | [批量订阅 proto](https://github.com/dapr/dapr/blob/5aba3c9aa4ea9b3f388df125f9c66495b43c5c9e/dapr/proto/runtime/v1/appcallback.proto#L57)     | N/A | 批量订阅应用程序回调可以在一次调用中接收来自主题的多条消息。 | [批量发布和订阅 API]({{< ref "pubsub-bulk.md" >}}) | v1.10 |
| 加密    |  [加密 proto](https://github.com/dapr/dapr/blob/5aba3c9aa4ea9b3f388df125f9c66495b43c5c9e/dapr/proto/runtime/v1/dapr.proto#L118)    | `v1.0-alpha1/crypto` | 加密 API 可以执行复杂的加密操作来加密和解密消息。 | [加密 API]({{< ref "cryptography-overview.md" >}}) | v1.11 |
| 任务    |  [任务 proto](https://github.com/dapr/dapr/blob/master/dapr/proto/runtime/v1/dapr.proto#L212-219)    | `v1.0-alpha1/jobs` | 任务 API 可以让您调度和编排任务。 | [任务 API]({{< ref "jobs-overview.md" >}}) | v1.14 |
| 对话    |  [对话 proto](https://github.com/dapr/dapr/blob/master/dapr/proto/runtime/v1/dapr.proto#L221-222)    | `v1.0-alpha1/conversation` | 使用对话 API 可以在不同的大型语言模型之间进行交流。 | [对话 API]({{< ref "conversation-overview.md" >}}) | v1.15 |


## Beta API

当前没有 Beta API。

## 相关链接

[了解有关 Alpha、Beta 和稳定生命周期阶段的更多信息。]({{< ref "certification-lifecycle.md#certification-levels" >}})