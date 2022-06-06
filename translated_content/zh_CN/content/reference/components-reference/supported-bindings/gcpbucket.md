---
type: docs
title: "GCP 存储桶绑定规范"
linkTitle: "GCP Storage Bucket"
description: "关于本地存储桶绑定组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/gcpbucket/"
---

## 配置

要设置 GCP 存储桶绑定，需要先创建一个类型为 `bindings.gcp.bucket` 的组件。 请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})，了解如何创建和应用绑定配置。


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.gcp.bucket
  version: v1
  metadata:
  - name: bucket
    value: mybucket
  - name: type
    value: service_account
  - name: project_id
    value: project_111
  - name: private_key_id
    value: *************
  - name: client_email
    value: name@domain.com
  - name: client_id
    value: '1111111111111111'
  - name: auth_uri
    value: https://accounts.google.com/o/oauth2/auth
  - name: token_uri
    value: https://oauth2.googleapis.com/token
  - name: auth_provider_x509_cert_url
    value: https://www.googleapis.com/oauth2/v1/certs
  - name: client_x509_cert_url
    value: https://www.googleapis.com/robot/v1/metadata/x509/<project-name>.iam.gserviceaccount.com
  - name: private_key
    value: PRIVATE KEY
  - name: decodeBase64
    value: <bool>
  - name: encodeBase64
    value: <bool>
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| 字段                              | 必填 | 绑定支持 | 详情                                                                                                                        | 示例                                                                                               |
| ------------------------------- |:--:| ---- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| bucket                          | Y  | 输出   | 存储桶名称                                                                                                                     | `"mybucket"`                                                                                     |
| type                            | Y  | 输出   | GCP 凭证类型                                                                                                                  | `"service_account"`                                                                              |
| project_id                      | Y  | 输出   | GCP 项目 id                                                                                                                 | `project_id`                                                                                     |
| private_key_id                | Y  | 输出   | GCP 私钥 id                                                                                                                 | `"privateKeyId"`                                                                                 |
| private_key                     | Y  | 输出   | GCP凭证私钥 替换为x509证书                                                                                                         | `12345-12345`                                                                                    |
| client_email                    | Y  | 输出   | GCP 客户端邮箱地址                                                                                                               | `"client@email.com"`                                                                             |
| client_id                       | Y  | 输出   | GCP 客户端 id                                                                                                                | `0123456789-0123456789`                                                                          |
| auth_uri                        | Y  | 输出   | Google帐户 OAuth 端点                                                                                                         | `https://accounts.google.com/o/oauth2/auth`                                                      |
| token_uri                       | Y  | 输出   | Google帐户token地址                                                                                                           | `https://oauth2.googleapis.com/token`                                                            |
| auth_provider_x509_cert_url | Y  | 输出   | GCP凭证证书地址                                                                                                                 | `https://www.googleapis.com/oauth2/v1/certs`                                                     |
| client_x509_cert_url          | Y  | 输出   | GCP凭证项目x509证书地址                                                                                                           | `https://www.googleapis.com/robot/v1/metadata/x509/<PROJECT_NAME>.iam.gserviceaccount.com` |
| decodeBase64                    | N  | 输出   | 在保存到存储桶之前解码 base64 文件内容的配置。 (保存有二进制内容的文件时)。 `true` 是唯一允许的正值。 其他正值，如 `"True"，"1"<code> 是不允许的。 默认值为 <code>false`      | `true`, `false`                                                                                  |
| encodeBase64                    | N  | 输出   | 在返回内容之前对 base64 文件内容进行编码的配置。 (在打开带有二进制内容的文件时有用)。 `true` 是唯一允许的正值。 其他正值，如 `"True"，"1"<code> 是不允许的。 默认值为 <code>false` | `true`, `false`                                                                                  |

## 绑定支持

该组件支持如下操作的 **输出绑定** ：

- `create` : [创建文件](#create-file)
- `get` : [获取文件](#get-file)
- `delete` ：[删除文件](#delete-file)
- `list`：[列出文件](#list-files)

### 创建文件

要执行一个创建操作，需要一个 `POST` 方法和下面的 JSON 调用 GCP 存储桶绑定：

> 注意：默认情况下，会随机生成一个UUID。 参见下面所示的支持的元数据设置名称

```json
{
  "operation": "create",
  "data": "YOUR_CONTENT"
}
```
元数据参数包括：
- `key` - （可选）对象的名称
- `decodeBase64` - （可选）在保存到存储之前解码 base64 文件内容的配置

#### 示例
##### 把文本保存到一个随机生成的 UUID 文件

{{< tabs Windows Linux >}}
  {{% codetab %}}
  在Windows上，使用cmd提示符（PowerShell有不同的转义机制）。
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

##### 将文本保存到指定文件

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

要上传文件，请将文件内容作为数据负载传递；你可能想用 Base64 来编码二进制内容。

然后你就可以像平常一样上传了：

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

响应体将包含以下JSON：

```json
{
    "objectURL":"https://storage.googleapis.com/<your bucket>/<key>",
}
```

### 获取对象

要执行获取文件操作，请使用 `POST` 方法和以下 JSON 调用 GCP 存储桶绑定：

```json
{
  "operation": "get",
  "metadata": {
    "key": "my-test-file.txt"
  }
}
```

元数据参数包括：

- `key` - 对象的名称
- ` encodeBase64 ` - （可选）在保存到存储之前编码 base64 文件内容的配置


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

要执行删除对象操作，请使用 `POST` 方法和以下 JSON 调用 GCP 存储桶绑定：

```json
{
  "operation": "delete",
  "metadata": {
    "key": "my-test-file.txt"
  }
}
```

元数据参数包括：

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
如果成功，将返回 HTTP 204（没有内容）和空报文体。


### 列出对象

要执行列出对象操作，请使用 `POST` 和以下 JSON 调用 S3 绑定：

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

参数的含义是：

- `maxResults` - （可选）设置响应中返回的最大键数。 默认情况下，该操作最多返回 1000 个键名。 响应可能包含较少的键，但永远不会包含更多键
- `prefix` - （可选）它可用于筛选以前缀开头的对象
- ` delimiter ` - （可选）它可用于将结果限制为仅给定“目录”中的对象。 如果没有分隔符，将返回前缀下的所有对象

#### 响应

响应正文包含找到的对象列表。

对象列表将以以下格式的 JSON 数组返回：

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

- [Dapr组件的基本格式]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过输入绑定触发应用]({{< ref howto-triggers.md >}})
- [如何处理: 使用绑定对接外部资源]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
