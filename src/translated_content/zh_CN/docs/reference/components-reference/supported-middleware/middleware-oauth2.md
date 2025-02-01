---
type: docs
title: "OAuth2"
linkTitle: "OAuth2"
description: "使用OAuth2中间件来保护HTTP端点"
aliases:
- /zh-hans/developing-applications/middleware/supported-middleware/middleware-oauth2/
---

OAuth2 [HTTP中间件]({{< ref middleware.md >}})在Web API上启用[OAuth2授权码流程](https://tools.ietf.org/html/rfc6749#section-4.1)，无需修改应用程序代码。这种设计将身份验证和授权问题与应用程序分离开来，使应用程序操作员可以独立采用和配置身份验证/授权提供者，而不影响应用程序的代码。

## 组件格式

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

{{% alert title="警告" color="warning" %}}
上述示例中使用了明文字符串来表示secret。建议使用secret存储来安全地存储这些secret，具体方法请参见[此处]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 规范元数据字段

| 字段 | 详情 | 示例 |
|-------|---------|---------|
| clientId | 您的应用程序的客户端ID，是在启用OAuth的平台上创建的凭据的一部分 | `"your-client-id"`
| clientSecret | 您的应用程序的客户端secret，是在启用OAuth的平台上创建的凭据的一部分 | `"your-client-secret"`
| scopes | 空格分隔的、区分大小写的[范围](https://tools.ietf.org/html/rfc6749#section-3.3)字符串列表，通常用于应用程序中的授权 | `"https://www.googleapis.com/auth/userinfo.email"`
| authURL | OAuth2授权服务器的端点 | `"https://accounts.google.com/o/oauth2/v2/auth"`
| tokenURL | 客户端通过提供其授权授予或刷新令牌来获取访问令牌的端点 | `"https://accounts.google.com/o/oauth2/token"`
| redirectURL | 用户认证后授权服务器应重定向到的Web应用程序的URL | `"https://myapp.com"`
| authHeaderName | 转发到应用程序的授权头名称 | `"authorization"`
| forceHTTPS | 如果为true，则强制使用TLS/SSL | `"true"`,`"false"` |

## Dapr配置

要应用中间件，必须在[配置]({{< ref configuration-concept.md >}})中引用。请参阅[中间件处理管道]({{< ref "middleware.md#customize-processing-pipeline">}})。

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

- [使用OAuth配置API授权]({{< ref oauth >}})
- [中间件OAuth示例（交互式）](https://github.com/dapr/samples/tree/master/middleware-oauth-google)
- [中间件]({{< ref middleware.md >}})
- [配置概念]({{< ref configuration-concept.md >}})
- [配置概览]({{< ref configuration-overview.md >}})
