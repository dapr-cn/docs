---
type: docs
title: "OAuth2 客户端认证"
linkTitle: "OAuth2 客户端认证"
description: "Use OAuth2 client credentials middleware to secure HTTP endpoints"
aliases:
  - /zh-hans/developing-applications/middleware/supported-middleware/middleware-oauth2clientcredentials/
---

The OAuth2 client credentials [HTTP middleware]({{< ref middleware.md >}}) enables the [OAuth2 Client Credentials flow](https://tools.ietf.org/html/rfc6749#section-4.4) on a Web API without modifying the application. This design separates authentication/authorization concerns from the application, so that application operators can adopt and configure authentication/authorization providers without impacting the application code.

## Component format

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: oauth2clientcredentials
spec:
  type: middleware.http.oauth2clientcredentials
  version: v1
  metadata:
  - name: clientId
    value: "<your client ID>"
  - name: clientSecret
    value: "<your client secret>"
  - name: scopes
    value: "https://www.googleapis.com/auth/userinfo.email"
  - name: tokenURL
    value: "https://accounts.google.com/o/oauth2/token"
  - name: headerName
    value: "authorization"
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件，参考 [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| Field               | 详情                                                                                                                     | 示例                                                 |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| clientId            | The client ID of your application that is created as part of a credential hosted by a OAuth-enabled platform           |                                                    |
| clientSecret        | 您的应用程序的客户密钥，它是作为OAuth平台托管的凭证的一部分而创建的。                                                                                  |                                                    |
| scopes              | [作用域](https://tools.ietf.org/html/rfc6749#section-3.3)的列表，通常用于应用程序中的授权，注意格式为空格分隔、大小写敏感的字符串                             | `"https://www.googleapis.com/auth/userinfo.email"` |
| tokenURL            | 客户端通过出示其访问许可或刷新令牌来获取access token的端点                                                                                    | `"https://accounts.google.com/o/oauth2/token"`     |
| headerName          | 转发到您的应用程序的授权头名称                                                                                                        | `"authorization"`                                  |
| endpointParamsQuery | Specifies additional parameters for requests to the token endpoint                                                     | `true`                                             |
| authStyle           | Optionally specifies how the endpoint wants the client ID & client secret sent. See the table of possible values below | `0`                                                |

### authStyle 的可能值

| Value | 含义                                                                                                                                       |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `1`   | Sends the "client_id" and "client_secret" in the POST body as application/x-www-form-urlencoded parameters.                            |
| `2`   | 使用 HTTP Basic授权发送"client_id" 和 "client_secret" 这是 [OAuth2 RFC 6749 节 2.31](https://tools.ietf.org/html/rfc6749#section-2.3.1)中描述的可选风格。 |
| `0`   | 是指通过两种方式的尝试，自动检测提供者想要的认证方式，并将成功的方式缓存起来，以备将来使用。                                                                                           |

## Dapr 配置

To be applied, the middleware must be referenced in a [configuration]({{< ref configuration-concept.md >}}). See [middleware pipelines]({{< ref "middleware.md#customize-processing-pipeline">}}).

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  httpPipeline:
    handlers:
    - name: oauth2clientcredentials
      type: middleware.http.oauth2clientcredentials
```

## 相关链接
- [中间件]({{< ref middleware.md >}})
- [配置概念]({{< ref configuration-concept.md >}})
- [配置概览]({{< ref configuration-overview.md >}})
