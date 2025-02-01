---
type: docs
title: "Azure API Management 与 Dapr 的集成策略"
linkTitle: "Azure API Management"
description: "通过 Azure API Management 策略发布 Dapr 服务和组件的 API"
weight: 2000
---

[Azure API Management](https://learn.microsoft.com/azure/api-management/api-management-key-concepts) 是一种用于为后端服务创建一致且现代的 API 网关的方法，其中也包括使用 Dapr 构建的服务。您可以在自托管的 API Management 网关中启用 Dapr 支持，从而实现以下功能：
- 将请求转发至 Dapr 服务
- 向 Dapr 发布/订阅主题发送消息
- 激活 Dapr 输出绑定

试用 [Dapr & Azure API Management 集成示例](https://github.com/dapr/samples/tree/master/dapr-apim-integration)。

{{< button text="了解更多关于 Dapr 集成策略的信息" link="https://docs.microsoft.com/azure/api-management/api-management-dapr-policies" >}}
`