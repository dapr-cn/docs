---
type: docs
title: "OAuth2"
linkTitle: "OAuth2"
weight: 2000
description: "使用OAuth2中间件来保护HTTP端点的安全"
---

OAuth2 [HTTP中间件]({{< ref middleware-concept.md >}})在 Web API 上启用 [OAuth2 授权码流程](https://tools.ietf.org/html/rfc6749#section-4.1)，而无需修改应用程序。 这种设计将认证/授权的关注点从应用中分离出来，因此应用操作者可以采用和配置认证/授权提供者，而不影响应用代码。

## 配置

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
## 元数据字段规范
| 字段             | 详情                                                                                         | 示例                                                 |
| -------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------- |
| clientId       | 您的应用程序的客户端ID，它是作为OAuth平台托管的凭证的一部分而创建的                                                      |                                                    |
| clientSecret   | 您的应用程序的客户密钥，它是作为OAuth平台托管的凭证的一部分而创建的。                                                      |                                                    |
| scopes         | [作用域](https://tools.ietf.org/html/rfc6749#section-3.3)的列表，通常用于应用程序中的授权，注意格式为空格分隔、大小写敏感的字符串 | `"https://www.googleapis.com/auth/userinfo.email"` |
| authURL        | OAuth2 授权服务器的端点                                                                            | `"https://accounts.google.com/o/oauth2/v2/auth"`   |
| tokenURL       | 客户端通过出示其访问许可或刷新令牌来获取access token的端点                                                        | `"https://accounts.google.com/o/oauth2/token"`     |
| redirectURL    | 用户认证后，授权服务器应重定向到的Web应用程序的URL                                                               | `"https://myapp.com"`                              |
| authHeaderName | 转发到您的应用程序的授权头名称                                                                            | `"authorization"`                                  |
| forceHTTPS     | 如果为true，强制使用TLS/SSL                                                                        | `"true"`,`"false"`                                 |

## Dapr配置

要应用中间件，必须在[配置]({{< ref configuration-concept.md >}})中引用中间件。 参考[中间件管道]({{< ref "middleware-concept.md#customize-processing-pipeline">}})。

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
- [使用 OAuth 配置 API 授权]({{< ref oauth >}})
- [中间件概念]({{< ref middleware-concept.md >}})
- [配置概念]({{< ref configuration-concept.md >}})
- [配置概览]({{< ref configuration-overview.md >}})
