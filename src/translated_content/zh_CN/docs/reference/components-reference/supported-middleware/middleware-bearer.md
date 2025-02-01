---
type: docs
title: "Bearer"
linkTitle: "Bearer"
description: "通过验证 bearer 令牌，使用 bearer 中间件保护 HTTP 端点"
aliases:
- /zh-hans/developing-applications/middleware/supported-middleware/middleware-bearer/
---

Bearer [HTTP 中间件]({{< ref middleware.md >}}) 利用 [OpenID Connect](https://openid.net/connect/) 在 Web API 上验证 [Bearer Token](https://tools.ietf.org/html/rfc6750)，无需修改应用程序代码。此设计将身份验证和授权与应用程序逻辑分离，使应用程序管理员可以配置身份验证和授权提供者，而不影响应用程序的正常运行。

## 组件格式

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: bearer-token
spec:
  type: middleware.http.bearer
  version: v1
  metadata:
    - name: audience
      value: "<您的令牌受众，例如应用程序的客户端 ID>"
    - name: issuer
      value: "<您的令牌发行者，例如 'https://accounts.google.com'>"

    # 可选项
    - name: jwksURL
      value: "<JWKS URL，例如 'https://accounts.google.com/.well-known/openid-configuration'>"
```

## 规格元数据字段

| 字段 | 必需 | 详情 | 示例 |
|-------|:--------:|---------|---------|
| `audience` | Y | 令牌中预期的受众，通常是您的应用程序的客户端 ID，由 OpenID Connect 平台提供。 | 
| `issuer` | Y | 令牌发行者，即令牌中发行者声明的预期值。 | `"https://accounts.google.com"`
| `jwksURL` | N | JWKS（包含用于验证令牌的公钥的 JWK 集）的地址。如果未设置，将尝试从 OpenID 配置文档 `<issuer>/.well-known/openid-configuration` 中获取 URL。  | `"https://accounts.google.com/.well-known/openid-configuration"`

`issuer` 的常见值包括：

- Auth0: `https://{domain}`，其中 `{domain}` 是您的 Auth0 应用程序的域名
- Microsoft Entra ID: `https://login.microsoftonline.com/{tenant}/v2.0`，其中 `{tenant}` 是您的应用程序的租户 ID，格式为 UUID
- Google: `https://accounts.google.com`
- Salesforce (Force.com): `https://login.salesforce.com`

## Dapr 配置

要应用此中间件，必须在 [配置]({{< ref configuration-concept.md >}}) 中进行引用。请参阅 [中间件管道]({{< ref "middleware.md">}})。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  httpPipeline:
    handlers:
    - name: bearer-token
      type: middleware.http.bearer
```

## 相关链接

- [中间件]({{< ref middleware.md >}})
- [配置概念]({{< ref configuration-concept.md >}})
- [配置概览]({{< ref configuration-overview.md >}})
