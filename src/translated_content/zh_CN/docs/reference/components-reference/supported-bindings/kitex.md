---
type: docs
title: "Kitex"
linkTitle: "Kitex"
description: "Kitex 绑定组件的详细文档"
aliases:
- "/zh-hans/operations/components/setup-bindings/supported-bindings/kitex/"
---

## 概述

Kitex 绑定主要利用其通用调用功能。可以从官方文档中了解更多关于 [Kitex 通用调用的详细信息](https://www.cloudwego.io/docs/kitex/tutorials/advanced-feature/generic-call/)。
目前，Kitex 仅支持 Thrift 通用调用。集成到 [components-contrib](https://github.com/dapr/components-contrib/tree/master/bindings/kitex) 的实现采用了二进制通用调用方式。

## 组件格式

要设置 Kitex 绑定，创建一个类型为 `bindings.kitex` 的组件。请参阅[如何：使用输出绑定与外部资源接口]({{< ref "howto-bindings.md#1-create-a-binding" >}})指南，了解如何创建和应用绑定配置。

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

## 元数据字段说明

`bindings.kitex` 的 `InvokeRequest.Metadata` 要求客户端在调用时填写以下四个必需项：

- `hostPorts`
- `destService`
- `methodName`
- `version`

| 字段         | 必需 | 绑定支持 | 详情                                                                                                 | 示例                |
|-------------|:----:|--------|-----------------------------------------------------------------------------------------------------|--------------------|
| `hostPorts`   |  是  | 输出   | Kitex 服务器（Thrift）的 IP 地址和端口信息                                                          | `"127.0.0.1:8888"` |
| `destService` |  是  | 输出   | Kitex 服务器（Thrift）的服务名称                                                                    | `"echo"`           |
| `methodName`  |  是  | 输出   | Kitex 服务器（Thrift）中某个服务名称下的方法名称                                                    | `"echo"`           |
| `version`     |  是  | 输出   | Kitex 的版本号                                                                                       | `"0.5.0"`          |

## 绑定支持

此组件支持具有以下操作的**输出绑定**：

- `get`

## 示例

使用 Kitex 绑定时：
- 客户端需要传入经过 Thrift 编码的二进制数据
- 服务器需要是一个 Thrift 服务器。

可以参考 [kitex_output_test](https://github.com/dapr/components-contrib/blob/master/bindings/kitex/kitex_output_test.go)。
例如，变量 `reqData` 需要在发送前通过 Thrift 协议进行编码，返回的数据需要通过 Thrift 协议进行解码。

**请求**

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

- [Dapr 组件的基本架构]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何：使用输入绑定触发应用程序]({{< ref howto-triggers.md >}})
- [如何：使用绑定与外部资源接口]({{< ref howto-bindings.md >}})
- [绑定 API 参考]({{< ref bindings_api.md >}})
