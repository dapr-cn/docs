---
type: docs
title: "Middleware component specs"
linkTitle: "中间件"
weight: 6000
description: 所有支持的中间件组件的列表，这些组件可以注入到Dapr的处理管道中。
no_list: true
aliases:
  - /zh-hans/developing-applications/middleware/supported-middleware/
---

表格标题：

> `状态`： [组件认证]({{<ref "certification-lifecycle.md">}}) 状态
  - [Alpha]({{<ref "certification-lifecycle.md#alpha">}})
  - [Beta]({{<ref "certification-lifecycle.md#beta">}})
  - [Stable]({{<ref "certification-lifecycle.md#stable">}}) > `Since`: 定义自哪个 Dapr 运行时版本开始，组件处于当前的状态。

> `组件版本`：代表组件的版本

### HTTP

| Name                                                                           | 说明                                                                                                                | 状态                            | 组件版本 |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- | ----------------------------- | ---- |
| [Rate limit]({{< ref middleware-rate-limit.md >}})                             | 限制每秒允许的 HTTP 请求的最大数量                                                                                              | Alpha                         | v1   |
| [OAuth2]({{< ref middleware-oauth2.md >}})                                     | 在Web API上启用[OAuth2授权授权流程](https://tools.ietf.org/html/rfc6749#section-4.1)                                        | Alpha                         | v1   |
| [OAuth2 client credentials]({{< ref middleware-oauth2clientcredentials.md >}}) | 在Web API上启用[OAuth2客户端凭证授予流程](https://tools.ietf.org/html/rfc6749#section-4.4)                                     | Alpha                         | v1   |
| [Bearer]({{< ref middleware-bearer.md >}})                                     | 使用 [OpenID Connect](https://tools.ietf.org/html/rfc6750)在 Web API 上验证 [Bearer Token](https://openid.net/connect/) | Alpha                         | v1   |
| [Open Policy Agent]({{< ref middleware-opa.md >}})                             | 将[Rego/OPA策略](https://www.openpolicyagent.org/)应用到传入的Dapr HTTP请求中                                                 | Alpha                         | v1   |
| [Uppercase]({{< ref middleware-uppercase.md >}})                               | 将请求的正文转换为大写字母                                                                                                     | Stable(For local development) | v1   |
