---
type: docs
title: "错误概述"
linkTitle: "概述"
weight: 10
description: "Dapr 错误概述"
---

错误代码是用于指示错误性质的数字或字母数字代码，并在可能的情况下，说明其发生的原因。

Dapr 错误代码是标准化的字符串，适用于 Dapr API 中 HTTP 和 gRPC 请求的 80 多种常见错误。这些代码会：
- 在请求的 JSON 响应体中返回。
- 启用后，会在运行时的调试级别日志中记录。
  - 如果您在 Kubernetes 中运行，错误代码会记录在 sidecar 中。
  - 如果您在自托管中运行，可以启用并查看调试日志。

## 错误格式

Dapr 错误代码由前缀、类别和错误本身的简写组成。例如：

| 前缀 | 类别 | 错误简写 |  
| ------ | -------- | --------------- |
| ERR_ | PUBSUB_ | NOT_FOUND |

一些最常见的返回错误包括：

- ERR_ACTOR_TIMER_CREATE
- ERR_PURGE_WORKFLOW
- ERR_STATE_STORE_NOT_FOUND
- ERR_HEALTH_NOT_READY

> **注意：** [查看 Dapr 中错误代码的完整列表。]({{< ref error-codes-reference.md >}})

对于未找到的状态存储返回的错误可能如下所示：

```json
{
  "error": "Bad Request",
  "error_msg": "{\"errorCode\":\"ERR_STATE_STORE_NOT_FOUND\",\"message\":\"state store <name> is not found\",\"details\":[{\"@type\":\"type.googleapis.com/google.rpc.ErrorInfo\",\"domain\":\"dapr.io\",\"metadata\":{\"appID\":\"nodeapp\"},\"reason\":\"DAPR_STATE_NOT_FOUND\"}]}",
  "status": 400
}
```

返回的错误包括：
- 错误代码：`ERR_STATE_STORE_NOT_FOUND`
- 描述问题的错误消息：`state store <name> is not found`
- 发生错误的应用程序 ID：`nodeapp`
- 错误的原因：`DAPR_STATE_NOT_FOUND`

## Dapr 错误代码指标

指标帮助您查看错误在运行时发生的具体时间。错误代码指标通过 `error_code_total` 端点收集。此端点默认情况下是禁用的。您可以[通过配置文件中的 `recordErrorCodes` 字段启用它]({{< ref "metrics-overview.md#configuring-metrics-for-error-codes" >}})。

## 演示

观看 [Diagrid 的 Dapr v1.15 庆祝活动](https://www.diagrid.io/videos/dapr-1-15-deep-dive) 中的演示，了解如何启用错误代码指标以及处理运行时返回的错误代码。

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/NTnwoDhHIcQ?si=I2uCB_TINGxlu-9v&amp;start=2812" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## 下一步

{{< button text="查看所有 Dapr 错误代码的列表" page="error-codes-reference" >}}