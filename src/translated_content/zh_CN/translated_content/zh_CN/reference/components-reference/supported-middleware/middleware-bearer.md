---
type: docs
title: "Bearer"
linkTitle: "Bearer"
description: "Use bearer middleware to secure HTTP endpoints by verifying bearer tokens"
aliases:
  - /zh-hans/developing-applications/middleware/supported-middleware/middleware-bearer/
---

The bearer [HTTP middleware]({{< ref middleware.md >}}) verifies a [Bearer Token](https://tools.ietf.org/html/rfc6750) using [OpenID Connect](https://openid.net/connect/) on a Web API without modifying the application. This design separates authentication/authorization concerns from the application, so that application operators can adopt and configure authentication/authorization providers without impacting the application code.

## Component format

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

| Field     | 详情                                                                                                            | 示例                                                                |
| --------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| clientId  | The client ID of your application that is created as part of a credential hosted by a OpenID Connect platform |                                                                   |
| issuerURL | 服务的URL标识                                                                                                      | `"https://accounts.google.com"`, `"https://login.salesforce.com"` |

## Dapr 配置

要应用中间件，必须在[配置]({{< ref configuration-concept.md >}})中引用中间件。 See [middleware pipelines]({{< ref "middleware.md">}}).

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
