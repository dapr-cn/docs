---
type: docs
title: "OAuth2"
linkTitle: "OAuth2"
description: "Use OAuth2 middleware to secure HTTP endpoints"
aliases:
  - /zh-hans/developing-applications/middleware/supported-middleware/middleware-oauth2/
---

The OAuth2 [HTTP middleware]({{< ref middleware.md >}}) enables the [OAuth2 Authorization Code flow](https://tools.ietf.org/html/rfc6749#section-4.1) on a Web API without modifying the application. This design separates authentication/authorization concerns from the application, so that application operators can adopt and configure authentication/authorization providers without impacting the application code.

## Component format

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: oauth2
spec:
  type: middleware.http.oauth2
  version: v1
  metadata:
  - name: clientId
    value: "<your client ID>"
  - name: clientSecret
    value: "<your client secret>"
  - name: scopes
    value: "https://www.googleapis.com/auth/userinfo.email"
  - name: authURL
    value: "https://accounts.google.com/o/oauth2/v2/auth"
  - name: tokenURL
    value: "https://accounts.google.com/o/oauth2/token"
  - name: redirectURL
    value: "http://dummy.com"
  - name: authHeaderName
    value: "authorization"
  - name: forceHTTPS
    value: "false"
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件，参考 [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| Field          | 详情                                                                                                           | 示例                                                 |
| -------------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------- |
| clientId       | The client ID of your application that is created as part of a credential hosted by a OAuth-enabled platform |                                                    |
| clientSecret   | 您的应用程序的客户密钥，它是作为OAuth平台托管的凭证的一部分而创建的。                                                                        |                                                    |
| scopes         | [作用域](https://tools.ietf.org/html/rfc6749#section-3.3)的列表，通常用于应用程序中的授权，注意格式为空格分隔、大小写敏感的字符串                   | `"https://www.googleapis.com/auth/userinfo.email"` |
| authURL        | OAuth2 授权服务器的端点                                                                                              | `"https://accounts.google.com/o/oauth2/v2/auth"`   |
| tokenURL       | 客户端通过出示其访问许可或刷新令牌来获取access token的端点                                                                          | `"https://accounts.google.com/o/oauth2/token"`     |
| redirectURL    | 用户认证后，授权服务器应重定向到的Web应用程序的URL                                                                                 | `"https://myapp.com"`                              |
| authHeaderName | 转发到您的应用程序的授权头名称                                                                                              | `"authorization"`                                  |
| forceHTTPS     | 如果为true，强制使用TLS/SSL                                                                                          | `"true"`,`"false"`                                 |

## Dapr 配置

To be applied, the middleware must be referenced in [configuration]({{< ref configuration-concept.md >}}). See [middleware pipelines]({{< ref "middleware.md#customize-processing-pipeline">}}).

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  httpPipeline:
    handlers:
    - name: oauth2
      type: middleware.http.oauth2
```

## 相关链接

- [Configure API authorization with OAuth]({{< ref oauth >}})
- [中间件 OAuth 示例（交互式）](https://github.com/dapr/samples/tree/master/middleware-oauth-google)
- [中间件]({{< ref middleware.md >}})
- [配置概念]({{< ref configuration-concept.md >}})
- [配置概览]({{< ref configuration-overview.md >}})
