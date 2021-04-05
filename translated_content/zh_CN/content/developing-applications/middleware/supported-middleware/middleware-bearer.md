---
type: docs
title: "Bearer"
linkTitle: "Bearer"
weight: 4000
description: "使用Bearer中间件，通过验证Bearer token来确保HTTP端点的安全"
---

Bearer [HTTP 中间件]({{< ref middleware-concept.md >}})使用 [OpenID Connect](https://openid.net/connect/)在 Web API 上验证 [Bearer Token](https://tools.ietf.org/html/rfc6750)，而无需修改应用程序。 这种设计将认证/授权的关注点从应用中分离出来，因此应用操作者可以采用和配置认证/授权提供者，而不影响应用代码。

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

| 字段        | 详情                                            | 示例                                                                |
| --------- | --------------------------------------------- | ----------------------------------------------------------------- |
| clientId  | 你的应用程序的客户端ID，它是作为OpenID Connect平台托管的凭证的一部分创建的 |                                                                   |
| issuerURL | 服务的URL标识                                      | `"https://accounts.google.com"`, `"https://login.salesforce.com"` |

## Dapr配置

要应用中间件，必须在[配置]({{< ref configuration-concept.md >}})中进行引用。 请参阅[中间件管道]({{< ref "middleware-concept.md#customize-processing-pipeline">}})。

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
