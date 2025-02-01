---
type: docs
title: "HTTPEndpoint 规范"
linkTitle: "HTTPEndpoint"
description: "Dapr HTTPEndpoint 资源的基本说明"
weight: 4000
aliases:
  - "/zh-hans/operations/httpEndpoints/"
---

`HTTPEndpoint` 是一种 Dapr 资源，用于让 Dapr 应用程序能够调用非 Dapr 的端点。

{{% alert title="注意" color="primary" %}}
HTTPEndpoint 资源可以被限制在特定的[命名空间]({{< ref isolation-concept.md >}})中，并通过作用域来限制对特定应用程序集的访问。
{{% /alert %}}

## 格式

```yaml
apiVersion: dapr.io/v1alpha1
kind: HTTPEndpoint
metadata:
  name: <NAME>  
spec:
  baseUrl: <REPLACE-WITH-BASEURL> # 必填。需包含 "http://" 或 "https://" 前缀。
  headers: # 可选
  - name: <REPLACE-WITH-A-HEADER-NAME>
    value: <REPLACE-WITH-A-HEADER-VALUE>
  - name: <REPLACE-WITH-A-HEADER-NAME>
    secretKeyRef:
      name: <REPLACE-WITH-SECRET-NAME>
      key: <REPLACE-WITH-SECRET-KEY>
  clientTLS:
    rootCA:
      secretKeyRef:
        name: <REPLACE-WITH-SECRET-NAME>
        key: <REPLACE-WITH-SECRET-KEY>
    certificate:
      secretKeyRef:
        name: <REPLACE-WITH-SECRET-NAME>
        key: <REPLACE-WITH-SECRET-KEY>
    privateKey:
      secretKeyRef:
        name: <REPLACE-WITH-SECRET-NAME>
        key: <REPLACE-WITH-SECRET-KEY>
scopes: # 可选
  - <REPLACE-WITH-SCOPED-APPIDS>
auth: # 可选
  secretStore: <REPLACE-WITH-SECRETSTORE>
```

## 规范字段

| 字段               | 必填     | 详情    | 示例     |
|--------------------|:--------:|---------|---------|
| baseUrl            | 是       | 非 Dapr 端点的基本 URL | `"https://api.github.com"`, `"http://api.github.com"`
| headers            | 否       | 服务调用的 HTTP 请求头 | `name: "Accept-Language" value: "en-US"` <br/> `name: "Authorization" secretKeyRef.name: "my-secret" secretKeyRef.key: "myGithubToken" `
| clientTLS          | 否       | 启用 TLS 认证到一个端点，支持使用根证书、客户端证书和私钥的标准组合

## 相关链接

[了解如何调用非 Dapr 端点。]({{< ref howto-invoke-non-dapr-endpoints.md >}})
