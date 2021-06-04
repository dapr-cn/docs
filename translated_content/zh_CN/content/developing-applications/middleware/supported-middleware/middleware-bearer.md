---
type: docs
title: "Bearer"
linkTitle: "Bearer"
weight: 4000
description: "使用 Bearer 中间件，通过验证 Bearer token 来确保 HTTP 端点的安全"
---

[Bearer 中间件]({{< ref middleware-concept.md >}})在 Web API 上使用 [OpenID Connect](https://openid.net/connect/) 来验证 [Bearer Token](https://tools.ietf.org/html/rfc6750) 而无须修改应用程序。 这种设计将认证/授权的关注点从应用中分离出来，因此应用操作者可以采用和配置认证/授权提供者，而不影响应用代码。

## 配置

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: bearer-token
spec:
  type: middleware.http.bearer
  version: v1
  metadata:
  - name: clientId
    value: "<your client ID>"
  - name: issuerURL
    value: "https://accounts.google.com"
```
## 元数据字段规范

| 字段        | 详情                                            | Example                                                           |
| --------- | --------------------------------------------- | ----------------------------------------------------------------- |
| clientId  | 你的应用程序的客户端ID，它是作为OpenID Connect平台托管的凭证的一部分创建的 |                                                                   |
| issuerURL | 服务的URL标识                                      | `"https://accounts.google.com"`, `"https://login.salesforce.com"` |

## Dapr 配置

To be applied, the middleware must be referenced in [configuration]({{< ref configuration-concept.md >}}). See [middleware pipelines]({{< ref "middleware-concept.md#customize-processing-pipeline">}}).

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

- [中间件概念]({{< ref middleware-concept.md >}})
- [配置概念]({{< ref configuration-concept.md >}})
- [配置概览]({{< ref configuration-overview.md >}})
