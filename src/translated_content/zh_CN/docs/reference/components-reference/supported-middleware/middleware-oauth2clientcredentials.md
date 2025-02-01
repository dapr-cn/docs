---
type: docs
title: "OAuth2 客户端凭证"
linkTitle: "OAuth2 客户端凭证"
description: "使用 OAuth2 客户端凭证中间件保护 HTTP 端点"
aliases:
- /zh-hans/developing-applications/middleware/supported-middleware/middleware-oauth2clientcredentials/
---

OAuth2 客户端凭证的 HTTP 中间件可以在 Web API 上启用 [OAuth2 客户端凭证流程](https://tools.ietf.org/html/rfc6749#section-4.4)，而无需对应用程序进行任何修改。这种设计将身份验证和授权与应用程序逻辑分离，使得应用程序的操作员可以独立于应用程序代码来选择和配置身份验证/授权提供者。

## 组件格式

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

{{% alert title="警告" color="warning" %}}
上述示例中使用了明文字符串来表示 secret。建议使用 secret 存储来安全地存储这些敏感信息，具体方法请参见[这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 规范元数据字段

| 字段      | 详情 | 示例 |
|------------|---------|---------|
| clientId | 您的应用程序的客户端 ID，是由支持 OAuth 的平台生成的凭证的一部分
| clientSecret | 您的应用程序的客户端 secret，是由支持 OAuth 的平台生成的凭证的一部分
| scopes | 空格分隔的、区分大小写的 [scopes](https://tools.ietf.org/html/rfc6749#section-3.3) 字符串列表，通常用于定义应用程序的授权范围 | `"https://www.googleapis.com/auth/userinfo.email"`
| tokenURL | 客户端通过提供授权授予或刷新令牌来获取访问令牌的端点 | `"https://accounts.google.com/o/oauth2/token"`
| headerName | 转发到您的应用程序的授权头名称 | `"authorization"`
| endpointParamsQuery | 指定请求令牌端点的附加参数 | `true`
| authStyle | 可选地指定端点希望客户端 ID 和客户端 secret 发送的方式。请参阅下表中的可能值 | `0`

### `authStyle` 的可能值

| 值 | 含义 |
|-------|---------|
| `1`   | 在 POST 请求体中以 application/x-www-form-urlencoded 参数的形式发送 "client_id" 和 "client_secret"。 |
| `2`   | 使用 HTTP 基本授权方式发送 "client_id" 和 "client_secret"。这是 [OAuth2 RFC 6749 第 2.3.1 节](https://tools.ietf.org/html/rfc6749#section-2.3.1) 中描述的可选方式。 |
| `0`   | 自动检测提供者期望的身份验证方式，通过尝试两种方式并缓存成功的方式以备将来使用。 |

## Dapr 配置

要应用中间件，必须在 [配置]({{< ref configuration-concept.md >}})中引用。请参阅 [中间件管道]({{< ref "middleware.md#customize-processing-pipeline">}})。

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
