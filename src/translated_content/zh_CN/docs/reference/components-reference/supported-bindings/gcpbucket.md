---
type: docs
title: "GCP 存储桶绑定指南"
linkTitle: "GCP 存储桶"
description: "关于 GCP 存储桶绑定组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/gcpbucket/"
---

## 组件格式

要配置 GCP 存储桶绑定，请创建一个类型为 `bindings.gcp.bucket` 的组件。请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})了解如何创建和应用绑定配置。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: bindings.gcp.bucket
  version: v1
  metadata:
  - name: bucket
    value: "mybucket"
  - name: type
    value: "service_account"
  - name: project_id
    value: "project_111"
  - name: private_key_id
    value: "*************"
  - name: client_email
    value: "name@domain.com"
  - name: client_id
    value: "1111111111111111"
  - name: auth_uri
    value: "https://accounts.google.com/o/oauth2/auth"
  - name: token_uri
    value: "https://oauth2.googleapis.com/token"
  - name: auth_provider_x509_cert_url
    value: "https://www.googleapis.com/oauth2/v1/certs"
  - name: client_x509_cert_url
    value: "https://www.googleapis.com/robot/v1/metadata/x509/<project-name>.iam.gserviceaccount.com"
  - name: private_key
    value: "PRIVATE KEY"
  - name: decodeBase64
    value: "<bool>"
  - name: encodeBase64
    value: "<bool>"
```

{{% alert title="警告" color="warning" %}}
上述示例中使用了明文字符串来存储密钥。建议使用密钥存储来保护这些信息，具体方法请参阅[此处]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段说明

| 字段              | 必需 | 绑定支持 |  详情 | 示例 |
|--------------------|:--------:|------------|-----|---------|
| `bucket` | Y | 输出 | 存储桶名称 | `"mybucket"` |
| `type` | Y | 输出 | GCP 凭证类型 | `"service_account"` |
| `project_id`     | Y | 输出 | GCP 项目 ID| `projectId`
| `private_key_id` | Y | 输出 | GCP 私钥 ID | `"privateKeyId"`
| `private_key`    | Y | 输出 | GCP 凭证私钥。替换为 x509 证书 | `12345-12345`
| `client_email`   | Y | 输出 | GCP 客户端邮箱  | `"client@email.com"`
| `client_id`      | Y |  输出 | GCP 客户端 ID | `0123456789-0123456789`
| `auth_uri`       | Y | 输出 | Google 账户 OAuth 端点 | `https://accounts.google.com/o/oauth2/auth`
| `token_uri`      | Y | 输出 | Google 账户令牌 URI | `https://oauth2.googleapis.com/token`
| `auth_provider_x509_cert_url` | Y | 输出 | GCP 凭证证书 URL | `https://www.googleapis.com/oauth2/v1/certs`
| `client_x509_cert_url` | Y | 输出 | GCP 凭证项目 x509 证书 URL | `https://www.googleapis.com/robot/v1/metadata/x509/<PROJECT_NAME>.iam.gserviceaccount.com`
| `decodeBase64` | N | 输出 | 在保存到存储桶之前解码 base64 文件内容的配置。适用于保存二进制内容的文件。`true` 是唯一允许的正值。其他正值变体如 `"True", "1"` 不可接受。默认为 `false` | `true`, `false` |
| `encodeBase64` | N | 输出 | 在返回内容之前编码 base64 文件内容的配置。适用于打开二进制内容的文件。`true` 是唯一允许的正值。其他正值变体如 `"True", "1"` 不可接受。默认为 `false` | `true`, `false` |

## 绑定支持

此组件支持 **输出绑定**，支持以下操作：

- `create` : [创建文件](#create-file)
- `get` : [获取文件](#get-file)
- `delete` : [删除文件](#delete-file)
- `list`: [列出文件](#list-files)

### 创建文件

要执行创建操作，请使用 `POST` 方法调用 GCP 存储桶绑定，并使用以下 JSON 正文：

> 注意：默认情况下，会生成一个随机 UUID。请参阅下文的元数据支持以设置名称

```json
{
  "operation": "create",
  "data": "YOUR_CONTENT"
}
```
元数据参数为：
- `key` - （可选）对象的名称
- `decodeBase64` - （可选）在保存到存储之前解码 base64 文件内容的配置

#### 示例
##### 将文本保存到随机生成的 UUID 文件

{{< tabs Windows Linux >}}
  {{% codetab %}}
  在 Windows 上，使用 cmd 提示符（PowerShell 有不同的转义机制）
  ```bash
  curl -d "{ \"operation\": \"create\", \"data\": \"Hello World\" }" http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

  {{% codetab %}}
  ```bash
  curl -d '{ "operation": "create", "data": "Hello World" }' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

{{< /tabs >}}

##### 将文本保存到特定文件

{{< tabs Windows Linux >}}

  {{% codetab %}}
  ```bash
  curl -d "{ \"operation\": \"create\", \"data\": \"Hello World\", \"metadata\": { \"key\": \"my-test-file.txt\" } }" \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

  {{% codetab %}}
  ```bash
  curl -d '{ "operation": "create", "data": "Hello World", "metadata": { "key": "my-test-file.txt" } }' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

{{< /tabs >}}

##### 上传文件

要上传文件，请将文件内容作为数据负载传递；您可能需要对其进行编码，例如 Base64 以处理二进制内容。

然后您可以像往常一样上传它：

{{< tabs Windows Linux >}}

  {{% codetab %}}
  ```bash
  curl -d "{ \"operation\": \"create\", \"data\": \"(YOUR_FILE_CONTENTS)\", \"metadata\": { \"key\": \"my-test-file.jpg\" } }" http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

  {{% codetab %}}
  ```bash
  curl -d '{ "operation": "create", "data": "$(cat my-test-file.jpg)", "metadata": { "key": "my-test-file.jpg" } }' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

{{< /tabs >}}
#### 响应

响应正文将包含以下 JSON：

```json
{
    "objectURL":"https://storage.googleapis.com/<your bucket>/<key>",
}
```

### 获取对象

要执行获取文件操作，请使用 `POST` 方法调用 GCP 存储桶绑定，并使用以下 JSON 正文：

```json
{
  "operation": "get",
  "metadata": {
    "key": "my-test-file.txt"
  }
}
```

元数据参数为：

- `key` - 对象的名称
- `encodeBase64` - （可选）在返回内容之前编码 base64 文件内容的配置。

#### 示例

{{< tabs Windows Linux >}}

  {{% codetab %}}
  ```bash
  curl -d '{ \"operation\": \"get\", \"metadata\": { \"key\": \"my-test-file.txt\" }}' http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

  {{% codetab %}}
  ```bash
  curl -d '{ "operation": "get", "metadata": { "key": "my-test-file.txt" }}' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

{{< /tabs >}}

#### 响应

响应正文包含存储在对象中的值。

### 删除对象

要执行删除对象操作，请使用 `POST` 方法调用 GCP 存储桶绑定，并使用以下 JSON 正文：

```json
{
  "operation": "delete",
  "metadata": {
    "key": "my-test-file.txt"
  }
}
```

元数据参数为：

- `key` - 对象的名称

#### 示例

##### 删除对象

{{< tabs Windows Linux >}}

  {{% codetab %}}
  ```bash
  curl -d '{ \"operation\": \"delete\", \"metadata\": { \"key\": \"my-test-file.txt\" }}' http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

  {{% codetab %}}
  ```bash
  curl -d '{ "operation": "delete", "metadata": { "key": "my-test-file.txt" }}' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

{{< /tabs >}}

#### 响应
如果成功，将返回 HTTP 204（无内容）和空正文。

### 列出对象

要执行列出对象操作，请使用 `POST` 方法调用 S3 绑定，并使用以下 JSON 正文：

```json
{
  "operation": "list",
  "data": {
    "maxResults": 10,
    "prefix": "file",
    "delimiter": "i0FvxAn2EOEL6"
  }
}
```

数据参数为：

- `maxResults` - （可选）设置响应中返回的最大键数。默认情况下，操作最多返回 1,000 个键名。响应可能包含更少的键，但绝不会包含更多。
- `prefix` - （可选）可用于过滤以 prefix 开头的对象。
- `delimiter` - （可选）可用于限制结果仅限于给定“目录”中的对象。没有分隔符，前缀下的整个树都会返回。

#### 响应

响应正文包含找到的对象列表。

对象列表将作为 JSON 数组返回，格式如下：

```json
[
	{
		"Bucket": "<your bucket>",
		"Name": "02WGzEdsUWNlQ",
		"ContentType": "image/png",
		"ContentLanguage": "",
		"CacheControl": "",
		"EventBasedHold": false,
		"TemporaryHold": false,
		"RetentionExpirationTime": "0001-01-01T00:00:00Z",
		"ACL": null,
		"PredefinedACL": "",
		"Owner": "",
		"Size": 5187,
		"ContentEncoding": "",
		"ContentDisposition": "",
		"MD5": "aQdLBCYV0BxA51jUaxc3pQ==",
		"CRC32C": 1058633505,
		"MediaLink": "https://storage.googleapis.com/download/storage/v1/b/<your bucket>/o/02WGzEdsUWNlQ?generation=1631553155678071&alt=media",
		"Metadata": null,
		"Generation": 1631553155678071,
		"Metageneration": 1,
		"StorageClass": "STANDARD",
		"Created": "2021-09-13T17:12:35.679Z",
		"Deleted": "0001-01-01T00:00:00Z",
		"Updated": "2021-09-13T17:12:35.679Z",
		"CustomerKeySHA256": "",
		"KMSKeyName": "",
		"Prefix": "",
		"Etag": "CPf+mpK5/PICEAE="
	}
]
```
## 相关链接

- [Dapr 组件的基本架构]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何：使用输入绑定触发应用程序]({{< ref howto-triggers.md >}})
- [如何：使用绑定与外部资源接口]({{< ref howto-bindings.md >}})
- [绑定 API 参考]({{< ref bindings_api.md >}})
