---
type: docs
title: 处理 gRPC 错误代码
linkTitle: "gRPC"
weight: 40
description: "关于 Dapr gRPC 错误及其处理方法的信息"
---

最初，错误是按照 [标准 gRPC 错误模型](https://grpc.io/docs/guides/error/#standard-error-model) 进行处理的。然而，为了提供更详细且信息丰富的错误消息，定义了一个增强的错误模型，与 gRPC 的 [更丰富的错误模型](https://grpc.io/docs/guides/error/#richer-error-model) 保持一致。

{{% alert title="注意" color="primary" %}}
并不是所有的 Dapr 错误都已转换为更丰富的 gRPC 错误模型。
{{% /alert %}}

## 标准 gRPC 错误模型

[标准 gRPC 错误模型](https://grpc.io/docs/guides/error/#standard-error-model) 是 gRPC 中的一种错误报告方法。每个错误响应都包含一个错误代码和一条错误消息。错误代码是标准化的，反映了常见的错误情况。

**标准 gRPC 错误响应示例：**
```
ERROR:
  Code: InvalidArgument
  Message: 输入键/键前缀 'bad||keyname' 不能包含 '||'
```

## 更丰富的 gRPC 错误模型

[更丰富的 gRPC 错误模型](https://grpc.io/docs/guides/error/#richer-error-model) 通过提供关于错误的额外上下文和详细信息来扩展标准错误模型。此模型包括标准错误 `code` 和 `message`，以及一个 `details` 部分，可以包含各种类型的信息，如 `ErrorInfo`、`ResourceInfo` 和 `BadRequest` 详细信息。

**更丰富的 gRPC 错误响应示例：**
```
ERROR:
  Code: InvalidArgument
  Message: 输入键/键前缀 'bad||keyname' 不能包含 '||'
  Details:
  1)	{
    	  "@type": "type.googleapis.com/google.rpc.ErrorInfo",
    	  "domain": "dapr.io",
    	  "reason": "DAPR_STATE_ILLEGAL_KEY"
    	}
  2)	{
    	  "@type": "type.googleapis.com/google.rpc.ResourceInfo",
    	  "resourceName": "statestore",
    	  "resourceType": "state"
    	}
  3)	{
    	  "@type": "type.googleapis.com/google.rpc.BadRequest",
    	  "fieldViolations": [
    	    {
    	      "field": "bad||keyname",
    	      "description": "输入键/键前缀 'bad||keyname' 不能包含 '||'"
    	    }
    	  ]
    	}
```

对于 HTTP 客户端，Dapr 会将 gRPC 错误模型转换为类似的 JSON 格式结构。响应包括一个 `errorCode`、一个 `message` 和一个 `details` 数组，反映了更丰富的 gRPC 模型中的结构。

**HTTP 错误响应示例：**
```json
{
    "errorCode": "ERR_MALFORMED_REQUEST",
    "message": "api error: code = InvalidArgument desc = 输入键/键前缀 'bad||keyname' 不能包含 '||'",
    "details": [
        {
            "@type": "type.googleapis.com/google.rpc.ErrorInfo",
            "domain": "dapr.io",
            "metadata": null,
            "reason": "DAPR_STATE_ILLEGAL_KEY"
        },
        {
            "@type": "type.googleapis.com/google.rpc.ResourceInfo",
            "description": "",
            "owner": "",
            "resource_name": "statestore",
            "resource_type": "state"
        },
        {
            "@type": "type.googleapis.com/google.rpc.BadRequest",
            "field_violations": [
                {
                    "field": "bad||keyname",
                    "description": "api error: code = InvalidArgument desc = 输入键/键前缀 'bad||keyname' 不能包含 '||'"
                }
            ]
        }
    ]
}
```

您可以在[这里](https://github.com/googleapis/googleapis/blob/master/google/rpc/error_details.proto)找到所有可能状态详细信息的规范。

## 相关链接

- [编写错误代码](https://github.com/dapr/dapr/tree/master/pkg/api/errors)
- [在 Go SDK 中使用错误代码](https://docs.dapr.io/developing-applications/sdks/go/go-client/#error-handling)