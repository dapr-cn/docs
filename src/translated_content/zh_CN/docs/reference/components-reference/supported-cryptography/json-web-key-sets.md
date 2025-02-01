---
type: docs
title: "JSON Web Key Sets (JWKS)"
linkTitle: "JSON Web Key Sets (JWKS)"
description: JWKS 加密组件的详细信息
---

## 组件格式

该组件用于从 JSON Web Key Set ([RFC 7517](https://www.rfc-editor.org/rfc/rfc7517)) 中加载密钥。JSON Web Key Set 是包含一个或多个密钥的 JSON 文档，密钥以 JWK (JSON Web Key) 格式表示；这些密钥可以是公钥、私钥或共享密钥。

该组件支持从以下来源加载 JWKS：

- 本地文件；在这种情况下，Dapr 会监视文件的变化并自动重新加载。
- HTTP(S) URL，定期刷新。
- 通过 `jwks` 元数据属性直接传递实际的 JWKS，作为字符串（可以选择使用 base64 编码）。

{{% alert title="注意" color="primary" %}}
此组件使用 Dapr 的加密引擎来执行操作。虽然密钥不会直接暴露给您的应用程序，但 Dapr 可以访问原始密钥数据。

{{% /alert %}}

一个 Dapr `crypto.yaml` 组件文件的结构如下：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: jwks
spec:
  type: crypto.dapr.jwks
  version: v1
  metadata:
    # 示例 1：从文件加载 JWKS
    - name: "jwks"
      value: "fixtures/crypto/jwks/jwks.json"
    # 示例 2：从 HTTP(S) URL 加载 JWKS
    # 仅 "jwks" 是必需的
    - name: "jwks"
      value: "https://example.com/.well-known/jwks.json"
    - name: "requestTimeout"
      value: "30s"
    - name: "minRefreshInterval"
      value: "10m"
    # 示例 3：直接包含实际的 JWKS
    - name: "jwks"
      value: |
        {
          "keys": [
            {
              "kty": "RSA",
              "use": "sig",
              "kid": "…",
              "n": "…",
              "e": "…",
              "issuer": "https://example.com"
            }
          ]
        }
    # 示例 3b：包含 base64 编码的 JWKS
    - name: "jwks"
      value: |
        eyJrZXlzIjpbeyJ…
```

{{% alert title="警告" color="warning" %}}
上述示例中使用了明文字符串作为密钥。建议使用密钥存储来保护密钥，详情请参阅[此处]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 规格元数据字段

| 字段                | 必需 | 详情 | 示例 |
|--------------------|:----:|------|------|
| `jwks`               | 是   | JWKS 文档的路径 | 本地文件: `"fixtures/crypto/jwks/jwks.json"`<br>HTTP(S) URL: `"https://example.com/.well-known/jwks.json"`<br>嵌入的 JWKS: `{"keys": […]}` (可以是 base64 编码)
| `requestTimeout`     | 否   | 从 HTTP(S) URL 获取 JWKS 文档时的网络请求超时时间，格式为 Go duration。默认值: "30s" | `"5s"`
| `minRefreshInterval` | 否   | 从 HTTP(S) 源刷新 JWKS 文档前的最小等待时间，格式为 Go duration。默认值: "10m" | `"1h"`

## 相关链接
[加密构建块]({{< ref cryptography >}})
