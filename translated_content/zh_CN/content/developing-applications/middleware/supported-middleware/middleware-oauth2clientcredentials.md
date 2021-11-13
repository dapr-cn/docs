---
type: docs
title: "OAuth2 client credentials"
linkTitle: "OAuth2 client credentials"
weight: 3000
description: "使用 OAuth2 客户端认证中间件来保护HTTP端点的安全"
---

OAuth2 客户端认证[HTTP中间件]({{< ref middleware-concept.md >}})在 Web API 上启用 [OAuth2 客户端认证流程](https://tools.ietf.org/html/rfc6749#section-4.4)，而无需修改应用程序。 这种设计将认证/授权的关注点从应用中分离出来，因此应用操作者可以采用和配置认证/授权提供者，而不影响应用代码。

## 配置

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
## 元数据字段规范

| 字段                  | 详情                                                                                         | Example                                            |
| ------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------- |
| clientId            | 您的应用程序的客户端ID，它是作为OAuth平台托管的凭证的一部分而创建的                                                      |                                                    |
| clientSecret        | 您的应用程序的客户密钥，它是作为OAuth平台托管的凭证的一部分而创建的。                                                      |                                                    |
| scopes              | [作用域](https://tools.ietf.org/html/rfc6749#section-3.3)的列表，通常用于应用程序中的授权，注意格式为空格分隔、大小写敏感的字符串 | `"https://www.googleapis.com/auth/userinfo.email"` |
| tokenURL            | 客户端通过出示其访问许可或刷新令牌来获取access token的端点                                                        | `"https://accounts.google.com/o/oauth2/token"`     |
| headerName          | 转发到您的应用程序的授权头名称                                                                            | `"authorization"`                                  |
| endpointParamsQuery | 指定令牌端点请求的额外参数                                                                              | `true`                                             |
| authStyle           | 可选择指定端点希望 客户端ID & 客户端密钥 的发送方式。 请参阅下面可能的值表                                                  | `0`                                                |

### authStyle 的可能值

| 值   | 含义                                                                                                                                       |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `1` | 将POST body中的"client_id"和"client_secret"作为 application/x-www-form-urlencoded 参数发送。                                                      |
| `2` | 使用 HTTP Basic授权发送"client_id" 和 "client_secret" 这是 [OAuth2 RFC 6749 节 2.31](https://tools.ietf.org/html/rfc6749#section-2.3.1)中描述的可选风格。 |
| `0` | 是指通过两种方式的尝试，自动检测提供者想要的认证方式，并将成功的方式缓存起来，以备将来使用。                                                                                           |

## Dapr配置

要应用，必须在[配置]({{< ref configuration-concept.md >}})中引用中间件。 参考[中间件管道]({{< ref "middleware-concept.md#customize-processing-pipeline">}})。

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
- [中间件概念]({{< ref middleware-concept.md >}})
- [配置概念]({{< ref configuration-concept.md >}})
- [配置概览]({{< ref configuration-overview.md >}})
