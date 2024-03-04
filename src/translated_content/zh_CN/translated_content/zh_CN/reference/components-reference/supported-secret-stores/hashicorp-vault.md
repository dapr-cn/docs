---
type: docs
title: "HashiCorp Vault"
linkTitle: "HashiCorp Vault"
description: 详细介绍了关于 HashiCorp Vault密钥仓库组件的信息
aliases:
  - "/zh-hans/operations/components/setup-secret-store/supported-secret-stores/hashicorp-vault/"
---

## Create the Vault component

To setup HashiCorp Vault secret store create a component of type `secretstores.hashicorp.vault`. See [this guide]({{< ref "setup-secret-store.md#apply-the-configuration" >}}) on how to create and apply a secretstore configuration. See this guide on [referencing secrets]({{< ref component-secrets.md >}}) to retrieve and use the secret with Dapr components.

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
    value: [vault_address] # Optional. Default: "https://127.0.0.1:8200"
  - name: caCert # Optional. This or caPath or caPem
    value: "[ca_cert]"
  - name: caPath # Optional. This or CaCert or caPem
    value: "[path_to_ca_cert_file]"
  - name: caPem # Optional. This or CaCert or CaPath
    value : "[encoded_ca_cert_pem]"
  - name: skipVerify # Optional. Default: false
    value : "[skip_tls_verification]"
  - name: tlsServerName # Optional.
    value : "[tls_config_server_name]"
  - name: vaultTokenMountPath # Required if vaultToken not provided. Path to token file.
    value : "[path_to_file_containing_token]"
  - name: vaultToken # Required if vaultTokenMountPath not provided. Token value.
    value : "[path_to_file_containing_token]"
  - name: vaultKVPrefix # Optional. Default: "dapr"
    value : "[vault_prefix]"
  - name: vaultKVUsePrefix # Optional. default: "true"
    value: "[true/false]"
  - name: enginePath # Optional. default: "secret"
    value: "secret"
  - name: vaultValueType # Optional. default: "map"
    value: "map"
```
{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 建议将密钥存储在本地，如[Kubernetes密钥存储]({{< ref kubernetes-secret-store.md >}})或 [本地文件]({{< ref file-secret-store.md >}})来安全地存储密钥。
{{% /alert %}}

## 元数据字段规范

| Field               | Required | 详情                                                                                                                                                                                                                                                                      | 示例                                |
| ------------------- |:--------:| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| vaultAddr           |    否     | The address of the Vault server. Defaults to `"https://127.0.0.1:8200"`                                                                                                                                                                                                 | `"https://127.0.0.1:8200"`        |
| caPem               |    否     | The inlined contents of the CA certificate to use, in PEM format. If defined, takes precedence over `caPath` and `caCert`.                                                                                                                                              | See below                         |
| caPath              |    否     | The path to a folder holding the CA certificate file to use, in PEM format. If the folder contains multiple files, only the first file found will be used. If defined, takes precedence over `caCert`.                                                                  | `"path/to/cacert/holding/folder"` |
| caCert              |    否     | The path to the CA certificate to use, in PEM format.                                                                                                                                                                                                                   | `""path/to/cacert.pem"`           |
| skipVerify          |    否     | Skip TLS verification. 默认值为 `"false"`                                                                                                                                                                                                                                   | `"true"`, `"false"`               |
| tlsServerName       |    否     | The name of the server requested during TLS handshake in order to support virtual hosting. This value is also used to verify the TLS certificate presented by Vault server.                                                                                             | `"tls-server"`                    |
| vaultTokenMountPath |    是     | Path to file containing token                                                                                                                                                                                                                                           | `"path/to/file"`                  |
| vaultToken          |    是     | [Token](https://learn.hashicorp.com/tutorials/vault/tokens) for authentication within Vault.                                                                                                                                                                            | `"tokenValue"`                    |
| vaultKVPrefix       |    否     | The prefix in vault. 默认值为 `"dapr"`                                                                                                                                                                                                                                      | `"dapr"`, `"myprefix"`            |
| vaultKVUsePrefix    |    否     | If false, vaultKVPrefix is forced to be empty. If the value is not given or set to true, vaultKVPrefix is used when accessing the vault. Setting it to false is needed to be able to use the BulkGetSecret method of the store.                                         | `"true"`, `"false"`               |
| enginePath          |    否     | The [engine](https://www.vaultproject.io/api-docs/secret/kv/kv-v2) path in vault. Defaults to `"secret"`                                                                                                                                                                | `"kv"`, `"any"`                   |
| vaultValueType      |    否     | Vault value type. `map` means to parse the value into `map[string]string`, `text` means to use the value as a string. 'map' sets the `multipleKeyValuesPerSecret` behavior. `text` makes Vault behave as a secret store with name/value semantics.  Defaults to `"map"` | `"map"`, `"text"`                 |

## Optional per-request metadata properties

The following [optional query parameters]({{< ref "secrets_api#query-parameters" >}}) can be provided to Hashicorp Vault secret store component:

| Query Parameter       | 说明                                |
| --------------------- | --------------------------------- |
| `metadata.version_id` | Version for the given secret key. |

## 设置 Hashicorp Vault实例

{{< tabs "Self-Hosted" "Kubernetes" >}}

{{% codetab %}}
参考Vault文档设置Hashicorp Vault：https://www.vaultproject.io/docs/install/index.html。
{{% /codetab %}}

{{% codetab %}}
对于Kubernetes，你可以使用Helm Chart：<https://github.com/hashicorp/vault-helm>。
{{% /codetab %}}

{{< /tabs >}}


## Multiple key-values per secret

HashiCorp Vault supports multiple key-values in a secret. While this behavior is ultimately dependent on the underlying [secret engine](https://www.vaultproject.io/docs/secrets#secrets-engines) configured by `enginePath`, it may change the way you store and retrieve keys from Vault. For instance, multiple key-values in a secret is the behavior exposed in the `secret` engine, the default engine configured by the `enginePath` field.

When retrieving secrets, a JSON payload is returned with the key names as fields and their respective values.

Suppose you add a secret to your Vault setup as follows:

```shell
vault kv put secret/dapr/mysecret firstKey=aValue secondKey=anotherValue thirdKey=yetAnotherDistinctValue
```

In the example above, the secret is named `mysecret` and it has 3 key-values under it. Observe that the secret is created under a `dapr` prefix, as this is the default value for the `vaultKVPrefix` flag. Retrieving it from Dapr would result in the following output:

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

Notice that the name of the secret (`mysecret`) is not repeated in the result.


## TLS Server verification

The fields `skipVerify`, `tlsServerName`, `caCert`, `caPath`, and `caPem` control if and how Dapr verifies the vault server's certificate while connecting using TLS/HTTPS.

### Inline CA PEM caPem

The `caPem` field value should be the contents of the PEM CA certificate you want to use. Given PEM certificates are made of multiple lines, defining that value might seem challenging at first. YAML allows for a few ways of [defining a multiline values](https://yaml-multiline.info/).

Below is one way to define a `caPem` field.

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
          << the rest of your PEM file content's here, indented appropriately. >>
          -----END CERTIFICATE-----
```

## 相关链接
- [Secrets building block]({{< ref secrets >}})
- [指南：获取密钥]({{< ref "howto-secrets.md" >}})
- [指南：在Dapr组件中引用密钥]({{< ref component-secrets.md >}})
- [Secret API 参考]({{< ref secrets_api.md >}})
