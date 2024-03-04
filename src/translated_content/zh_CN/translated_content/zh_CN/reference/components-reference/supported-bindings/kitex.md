---
type: docs
title: "Kitex"
linkTitle: "Kitex"
description: "Detailed documentation on the Kitex binding component"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/kitex/"
---

## 概述

The binding for Kitex mainly utilizes the generic-call feature in Kitex. Learn more from the official documentation around [Kitex generic-call](https://www.cloudwego.io/docs/kitex/tutorials/advanced-feature/generic-call/). Currently, Kitex only supports Thrift generic calls. The implementation integrated into [components-contrib](https://github.com/dapr/components-contrib/tree/master/bindings/kitex) adopts binary generic calls.


## Component format

To setup an Kitex binding, create a component of type `bindings.kitex`. See the [How-to: Use output bindings to interface with external resources]({{< ref "howto-bindings.md#1-create-a-binding" >}}) guide on creating and applying a binding configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: bindings.kitex
spec:
  type: bindings.kitex
  version: v1
  metadata: 
  - name: hostPorts
    value: "127.0.0.1:8888"
  - name: destService
    value: "echo"
  - name: methodName
    value: "echo"
  - name: version
    value: "0.5.0"
```

## 元数据字段规范

The `InvokeRequest.Metadata` for `bindings.kitex` requires the client to fill in four required items when making a call:

- `hostPorts`
- `destService`
- `methodName`
- `version`

| Field         | Required | 绑定支持   | 详情                                                                     | 示例                 |
| ------------- |:--------:| ------ | ---------------------------------------------------------------------- | ------------------ |
| `hostPorts`   |    是     | Output | IP address and port information of the Kitex server (Thrift)           | `"127.0.0.1:8888"` |
| `destService` |    是     | Output | Service name of the Kitex server (Thrift)                              | `"echo"`           |
| `methodName`  |    是     | Output | Method name under a specific service name of the Kitex server (Thrift) | `"echo"`           |
| `version`     |    是     | Output | Kitex version                                                          | `"0.5.0"`          |

## 绑定支持

该组件支持如下操作的 **输出绑定** ：

- `get`

## 示例

When using Kitex binding:
- The client needs to pass in the correct Thrift-encoded binary
- The server needs to be a Thrift Server.

The [kitex_output_test](https://github.com/dapr/components-contrib/blob/master/bindings/kitex/kitex_output_test.go) can be used as a reference. For example, the variable `reqData` needs to be _encoded_ by the Thrift protocol before sending, and the returned data needs to be decoded by the Thrift protocol.

**Request**

```json
{
  "operation": "get",
  "metadata": {
    "hostPorts": "127.0.0.1:8888",
    "destService": "echo",
    "methodName": "echo",
    "version":"0.5.0"
  },
  "data": reqdata
}
```

## 相关链接

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过 input binding 触发应用]({{< ref howto-triggers.md >}})
- [How-To：使用绑定与外部资源进行交互]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
