---
type: docs
title: "HashiCorp Vault"
linkTitle: "HashiCorp Vault"
description: HashiCorp Vault 密钥存储组件的详细信息
aliases:
  - "/zh-hans/operations/components/setup-secret-store/supported-secret-stores/hashicorp-vault/"
---

## 如何创建 Vault 组件

要设置 HashiCorp Vault 密钥存储，请创建一个类型为 `secretstores.hashicorp.vault` 的组件。请参阅[本指南]({{< ref "setup-secret-store.md#apply-the-configuration" >}})以了解如何创建和应用密钥存储配置。请参阅本指南以了解如何[引用密钥]({{< ref component-secrets.md >}})以使用 Dapr 组件检索和使用密钥。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: vault
spec:
  type: secretstores.hashicorp.vault
  version: v1
  metadata:
  - name: vaultAddr
    value: [vault_address] # 可选。默认值："https://127.0.0.1:8200"
  - name: caCert # 可选。此项或 caPath 或 caPem
    value: "[ca_cert]"
  - name: caPath # 可选。此项或 CaCert 或 caPem
    value: "[path_to_ca_cert_file]"
  - name: caPem # 可选。此项或 CaCert 或 CaPath
    value : "[encoded_ca_cert_pem]"
  - name: skipVerify # 可选。默认值：false
    value : "[skip_tls_verification]"
  - name: tlsServerName # 可选。
    value : "[tls_config_server_name]"
  - name: vaultTokenMountPath # 如果未提供 vaultToken 则必填。令牌文件的路径。
    value : "[path_to_file_containing_token]"
  - name: vaultToken # 如果未提供 vaultTokenMountPath 则必填。令牌值。
    value : "[path_to_file_containing_token]"
  - name: vaultKVPrefix # 可选。默认值："dapr"
    value : "[vault_prefix]"
  - name: vaultKVUsePrefix # 可选。默认值："true"
    value: "[true/false]"
  - name: enginePath # 可选。默认值："secret"
    value: "secret"
  - name: vaultValueType # 可选。默认值："map"
    value: "map"
```
{{% alert title="警告" color="warning" %}}
上述示例中，密钥以明文形式使用。建议使用本地密钥存储，如[Kubernetes 密钥存储]({{< ref kubernetes-secret-store.md >}})或[本地文件]({{< ref file-secret-store.md >}})来引导安全密钥存储。
{{% /alert %}}

## 规格元数据字段

| 字段              | 必需 | 详细信息                        | 示例             |
|--------------------|:--------:|--------------------------------|---------------------|
| vaultAddr      | 否 | Vault 服务器的地址。默认为 `"https://127.0.0.1:8200"` | `"https://127.0.0.1:8200"` |
| caPem | 否 | 要使用的 CA 证书的内联内容，PEM 格式。如果定义，则优先于 `caPath` 和 `caCert`。  | 见下文 |
| caPath | 否 | 要使用的 CA 证书文件所在文件夹的路径，PEM 格式。如果文件夹包含多个文件，则仅使用找到的第一个文件。如果定义，则优先于 `caCert`。  |  `"path/to/cacert/holding/folder"` |
| caCert | 否 | 要使用的 CA 证书的路径，PEM 格式。 | `""path/to/cacert.pem"` |
| skipVerify | 否 | 跳过 TLS 验证。默认为 `"false"` | `"true"`, `"false"` |
| tlsServerName | 否 | 在 TLS 握手期间请求的服务器名称，以支持虚拟主机。此值还用于验证 Vault 服务器提供的 TLS 证书。 | `"tls-server"` |
| vaultTokenMountPath | 是 | 包含令牌的文件路径 | `"path/to/file"` |
| vaultToken | 是 | [令牌](https://learn.hashicorp.com/tutorials/vault/tokens) 用于在 Vault 中进行身份验证。  | `"tokenValue"` |
| vaultKVPrefix | 否 | Vault 中的前缀。默认为 `"dapr"` | `"dapr"`, `"myprefix"` |
| vaultKVUsePrefix | 否 | 如果为 false，则强制 vaultKVPrefix 为空。如果未给出值或设置为 true，则在访问 Vault 时使用 vaultKVPrefix。将其设置为 false 是为了能够使用存储的 BulkGetSecret 方法。  | `"true"`, `"false"` |
| enginePath | 否 | Vault 中的[引擎](https://www.vaultproject.io/api-docs/secret/kv/kv-v2)路径。默认为 `"secret"` | `"kv"`, `"any"` |
| vaultValueType | 否 | Vault 值类型。`map` 表示将值解析为 `map[string]string`，`text` 表示将值用作字符串。`map` 设置 `multipleKeyValuesPerSecret` 行为。`text` 使 Vault 表现为具有名称/值语义的密钥存储。默认为 `"map"` | `"map"`, `"text"` |

## 每个请求的可选元数据属性

以下[可选查询参数]({{< ref "secrets_api#query-parameters" >}})可以提供给 Hashicorp Vault 密钥存储组件：

查询参数 | 描述
--------- | -----------
`metadata.version_id` | 给定密钥的版本。

## 设置 Hashicorp Vault 实例

{{< tabs "Self-Hosted" "Kubernetes" >}}

{{% codetab %}}
使用 Vault 文档设置 Hashicorp Vault：https://www.vaultproject.io/docs/install/index.html。
{{% /codetab %}}

{{% codetab %}}
对于 Kubernetes，您可以使用 Helm Chart：<https://github.com/hashicorp/vault-helm>。
{{% /codetab %}}

{{< /tabs >}}

## 每个密钥的多个键值

HashiCorp Vault 支持密钥中的多个键值。虽然这种行为最终取决于由 `enginePath` 配置的底层[密钥引擎](https://www.vaultproject.io/docs/secrets#secrets-engines)，但它可能会改变您从 Vault 存储和检索密钥的方式。例如，密钥中的多个键值是 `secret` 引擎中暴露的行为，这是由 `enginePath` 字段配置的默认引擎。

在检索密钥时，将返回一个 JSON 负载，其中键名作为字段及其各自的值。

假设您将密钥添加到您的 Vault 设置中，如下所示：

```shell
vault kv put secret/dapr/mysecret firstKey=aValue secondKey=anotherValue thirdKey=yetAnotherDistinctValue
```

在上面的示例中，密钥名为 `mysecret`，它下面有 3 个键值。
请注意，密钥是在 `dapr` 前缀下创建的，因为这是 `vaultKVPrefix` 标志的默认值。
从 Dapr 检索它将产生以下输出：

```shell
$ curl http://localhost:3501/v1.0/secrets/my-hashicorp-vault/mysecret
```

```json
{
  "firstKey": "aValue",
  "secondKey": "anotherValue",
  "thirdKey": "yetAnotherDistinctValue"
}
```

请注意，结果中没有重复密钥名称（`mysecret`）。

## TLS 服务器验证

字段 `skipVerify`、`tlsServerName`、`caCert`、`caPath` 和 `caPem` 控制 Dapr 在使用 TLS/HTTPS 连接时是否以及如何验证 Vault 服务器的证书。

### 内联 CA PEM caPem

`caPem` 字段的值应为您要使用的 PEM CA 证书的内容。由于 PEM 证书由多行组成，定义该值可能看起来具有挑战性。YAML 允许有几种[定义多行值](https://yaml-multiline.info/)的方法。

下面是定义 `caPem` 字段的一种方法。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: vault
spec:
  type: secretstores.hashicorp.vault
  version: v1
  metadata:
  - name: vaultAddr
    value: https://127.0.0.1:8200
  - name: caPem
    value: |-
          -----BEGIN CERTIFICATE-----
          << 在此处适当缩进您的 PEM 文件内容的其余部分。 >>
          -----END CERTIFICATE-----
```

## 相关链接
- [密钥构建块]({{< ref secrets >}})
- [操作指南：检索密钥]({{< ref "howto-secrets.md" >}})
- [操作指南：在 Dapr 组件中引用密钥]({{< ref component-secrets.md >}})
- [密钥 API 参考]({{< ref secrets_api.md >}})
