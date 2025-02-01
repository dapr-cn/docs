---
type: docs
title: "处理 HTTP 错误代码"
linkTitle: "HTTP"
description: "Dapr HTTP 错误代码的详细参考及其处理方法"
weight: 30
---

在向 Dapr 运行时发出的 HTTP 调用中，如果发生错误，响应体会返回一个错误的 JSON。该 JSON 包含错误代码和描述性错误信息。

```
{
    "errorCode": "ERR_STATE_GET",
    "message": "请求的状态键在状态存储中不存在。"
}
```

## 相关内容

- [错误代码参考列表]({{< ref error-codes-reference.md >}})
- [处理 gRPC 错误代码]({{< ref grpc-error-codes.md >}})
