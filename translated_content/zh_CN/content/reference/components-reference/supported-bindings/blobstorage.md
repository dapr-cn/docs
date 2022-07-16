---
type: docs
title: "Azure Blob Storage绑定规范"
linkTitle: "Azure Blob Storage"
description: "关于 Azure Blob Storage绑定组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/blobstorage/"
---

## 配置

要设置 Azure Blob Storage 绑定，请创建一个类型为 `bindings.azure.blobstorage` 的组件。 请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})，了解如何创建和应用绑定配置。


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.azure.blobstorage
  version: v1
  metadata:
  - name: storageAccount
    value: myStorageAccountName
  - name: storageAccessKey
    value: ***********
  - name: container
    value: container1
  - name: decodeBase64
    value: <bool>
  - name: getBlobRetryCount
    value: <integer>
  - name: publicAccessLevel
    value: <publicAccessLevel>
```
{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| 字段                | 必填 | 绑定支持 | 详情                                                                                                                            | 示例                          |
| ----------------- |:--:| ---- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| storageAccount    | 是  | 输出   | Blob Storage 账户名称                                                                                                             | `myexmapleaccount`          |
| storageAccessKey  | 是  | 输出   | Blob Storage 访问密钥                                                                                                             | `access-key`                |
| container         | 是  | 输出   | 要写入的Blob Storage容器名称                                                                                                          | `myexamplecontainer`        |
| decodeBase64      | 否  | 输出   | 配置在保存到Blob Storage之前对base64文件内容进行解码。 (保存有二进制内容的文件时)。 `true` 是唯一允许的正值。 其他正值，如 `"True"，"1"<code> 是不允许的。 默认值为 <code>false` | `true`, `false`             |
| getBlobRetryCount | 否  | 输出   | 指定从 RetryReader 读取时发出的最大 HTTP GET 请求次数，默认为`10`                                                                                | `1`, `2`                    |
| publicAccessLevel | 否  | 输出   | 指定是否可以公开访问容器中的数据以及访问级别(仅在由 Dapr 创建的容器中使用)。 默认值为 `none`                                                                        | `blob`, `container`, `none` |

### Azure Active Directory (AAD) 认证
Azure Blob Storage绑定组件支持使用所有Azure Active Directory机制进行认证。 更多信息和相关组件的元数据字段根据选择的AAD认证机制，参考[Azure认证文档]({{< ref authenticating-azure.md >}})。

## 绑定支持

该组件支持如下操作的 **输出绑定** ：

- `create` : [创建blob](#create-blob)
- `get` : [获取blob](#get-blob)
- `delete` ：[删除blob](#delete-blob)
- `list`：[遍历blob](#list-blobs)

### 创建blob

要执行创建 blob 操作，请使用 `POST` 方法和以下 JSON 调用 Azure Blob Storage绑定。

> 注意：默认情况下，会随机生成一个UUID。 参见下面所示的支持的元数据设置名称

```json
{
  "operation": "create",
  "data": "YOUR_CONTENT"
}
```

#### 示例


##### 保存到一个随机生成的UUID blob

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

##### 保存文本到指定blob

{{< tabs Windows Linux >}}

  {{% codetab %}}
  ```bash
  curl -d "{ \"operation\": \"create\", \"data\": \"Hello World\", \"metadata\": { \"blobName\": \"my-test-file.txt\" } }" \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

  {{% codetab %}}
  ```bash
  curl -d '{ "operation": "create", "data": "Hello World", "metadata": { "blobName": "my-test-file.txt" } }' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

{{< /tabs >}}


##### 保存文件到blob

要上传一个文件，将其编码为Base64，并让绑定知道要对它进行反序列化：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.azure.blobstorage
  version: v1
  metadata:
  - name: storageAccount
    value: myStorageAccountName
  - name: storageAccessKey
    value: ***********
  - name: container
    value: container1
  - name: decodeBase64
    value: true
```

然后你就可以像平常一样上传了：

{{< tabs Windows Linux >}}

  {{% codetab %}}
  ```bash
  curl -d "{ \"operation\": \"create\", \"data\": \"YOUR_BASE_64_CONTENT\", \"metadata\": { \"blobName\": \"my-test-file.jpg\" } }" http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

  {{% codetab %}}
  ```bash
  curl -d '{ "operation": "create", "data": "YOUR_BASE_64_CONTENT", "metadata": { "blobName": "my-test-file.jpg" } }' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

{{< /tabs >}}

#### 响应

响应体将包含以下JSON：

```json
{
   "blobURL": "https://<your account name>. {
   "blobURL": "https://<your account name>. blob.core.windows.net/<your container name>/<filename>"
}

```

### 获取blob

要执行获取blob操作，请使用`POST`方法和以下JSON体调用Azure Blob Storage绑定:

```json
{
  "operation": "get",
  "metadata": {
    "blobName": "myblob",
    "includeMetadata": "true"
  }
}
```

元数据参数包括：

- `blobName` - blob名
- `includeMetadata`- (可选) 定义是否应返回用户定义的元数据，默认值为：false

#### 示例

{{< tabs Windows Linux >}}

  {{% codetab %}}
  ```bash
  curl -d '{ \"operation\": \"get\", \"metadata\": { \"blobName\": \"myblob\" }}' http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

  {{% codetab %}}
  ```bash
  curl -d '{ "operation": "get", "metadata": { "blobName": "myblob" }}' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

{{< /tabs >}}

#### 响应

响应体包含存储在blob对象中的值。 如果启用，用户定义的元数据将以以下格式的HTTP头返回:

`Metadata.key1: value1` `Metadata.key2: value2`

### 删除blob

要执行删除blob操作，需要使用如下JSON结构数据的`POST`方法去调用Azure Blob Storage绑定:

```json
{
  "operation": "delete",
  "metadata": {
    "blobName": "myblob"
  }
}
```

元数据参数包括：

- `blobName` - blob名
- `deleteSnapshots` - (可选项) 如果blob有关联的快照需要设置。 指定以下两个选项之一：
  - include: 删除基础blob和它所有的快照
  - only: 只删除blob的快照而不删除blob本身

#### 示例

##### 删除blob

{{< tabs Windows Linux >}}

  {{% codetab %}}
  ```bash
  curl -d '{ \"operation\": \"delete\", \"metadata\": { \"blobName\": \"myblob\" }}' http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

  {{% codetab %}}
  ```bash
  curl -d '{ "operation": "delete", "metadata": { "blobName": "myblob" }}' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

{{< /tabs >}}

##### 仅删除 Blob 快照

{{< tabs Windows Linux >}}

  {{% codetab %}}
  ```bash
  curl -d '{ \"operation\": \"delete\", \"metadata\": { \"blobName\": \"myblob\", \"deleteSnapshots\": \"only\" }}' http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

  {{% codetab %}}
  ```bash
  curl -d '{ "operation": "delete", "metadata": { "blobName": "myblob", "deleteSnapshots": "only" }}' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

{{< /tabs >}}

##### 删除 blob包含快照

{{< tabs Windows Linux >}}

  {{% codetab %}}
  ```bash
  curl -d '{ \"operation\": \"delete\", \"metadata\": { \"blobName\": \"myblob\", \"deleteSnapshots\": \"include\" }}' http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

  {{% codetab %}}
  ```bash
  curl -d '{ "operation": "delete", "metadata": { "blobName": "myblob", "deleteSnapshots": "include" }}' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

{{< /tabs >}}

#### 响应

如果成功，将返回 HTTP 204（没有内容）和空报文体。

### Blob列表

要执行获取blob列表的操作, 需要使用如下JSON结构体数据的`POST` 方法调用Azure Blob Storage绑定:

```json
{
  "operation": "list",
  "data": {
    "maxResults": 10,
    "prefix": "file",
    "marker": "2!108!MDAwMDM1IWZpbGUtMDgtMDctMjAyMS0wOS0zOC01NS03NzgtMjEudHh0ITAwMDAyOCE5OTk5LTEyLTMxVDIzOjU5OjU5Ljk5OTk5OTlaIQ--",
    "include": {
      "snapshots": false,
      "metadata": true,
      "uncommittedBlobs": false,
      "copy": false,
      "deleted": false
    }
  }
}
```

参数的含义是：

- `maxResults` - (可选项) 指定要返回的最大blob数量，包括所有BlobPrefix元素。 如果请求没有指定maxresults，服务端将最多返回5000条。
- `prefix` - (可选项) 只返回以指定前缀开头命名的blob
- `marker` - (可选项) 一个字符串值，用于标识下一次列表操作将返回的列表部分。 如果列表数据没有读取完成，本次操作将在响应正文中返回一个标记值。 然后，可以在后续调用中使用标记值来请求下一组数据。
- `include` - (可选项) 指定包含在响应正文中的一个或多个数据集:
  - snapshots: 指定应该被包含在枚举中的快照。 快照在响应正文中从最旧到最新版本列出。 默认为: false
  - metadata: 指定在响应正文中返回的blob元数据。 默认为: false
  - uncommittedBlobs: 为已经上传但是还未使用Put Block List提交的块数据指定blob，同样包含在响应正文中。 默认为: false
  - copy: 2012-02-12以及更新的版本。 指定应该在响应正文中包含的与任何当前或先前Blob副本操作相关的元数据。 默认为: false
  - deleted: 2017-07-29以及更新版本。 指定应该在响应正文中包含的被软删除的blob。 默认为: false

#### 响应

响应正文包含查找到的块数据列表以及如下HTTP头:

`Metadata.marker: 2!108!MDAwMDM1IWZpbGUtMDgtMDctMjAyMS0wOS0zOC0zNC04NjctMTEudHh0ITAwMDAyOCE5OTk5LTEyLTMxVDIzOjU5OjU5Ljk5OTk5OTlaIQ--` `Metadata.number: 10`

- `marker` - 下一次标记值，可以被用在随后调用下一组列表元素的请求中。 请参阅输入绑定数据属性中关于marker的描述。
- `number` - 查询到的blob数量

Blob列表将按照以下JSON数组的格式返回:

```json
[
  {
    "XMLName": {
      "Space": "",
      "Local": "Blob"
    },
    "Name": "file-08-07-2021-09-38-13-776-1.txt",
    "Deleted": false,
    "Snapshot": "",
    "Properties": {
      "XMLName": {
        "Space": "",
        "Local": "Properties"
      },
      "CreationTime": "2021-07-08T07:38:16Z",
      "LastModified": "2021-07-08T07:38:16Z",
      "Etag": "0x8D941E3593C6573",
      "ContentLength": 1,
      "ContentType": "application/octet-stream",
      "ContentEncoding": "",
      "ContentLanguage": "",
      "ContentMD5": "xMpCOKC5I4INzFCab3WEmw==",
      "ContentDisposition": "",
      "CacheControl": "",
      "BlobSequenceNumber": null,
      "BlobType": "BlockBlob",
      "LeaseStatus": "unlocked",
      "LeaseState": "available",
      "LeaseDuration": "",
      "CopyID": null,
      "CopyStatus": "",
      "CopySource": null,
      "CopyProgress": null,
      "CopyCompletionTime": null,
      "CopyStatusDescription": null,
      "ServerEncrypted": true,
      "IncrementalCopy": null,
      "DestinationSnapshot": null,
      "DeletedTime": null,
      "RemainingRetentionDays": null,
      "AccessTier": "Hot",
      "AccessTierInferred": true,
      "ArchiveStatus": "",
      "CustomerProvidedKeySha256": null,
      "AccessTierChangeTime": null
    },
    "Metadata": null
  }
]
```

## 元数据信息

默认情况下，Azure Blob Storage 输出绑定会自动生成一个 UUID 作为 blob 文件名，并且不会为其分配任何系统或自定义元数据。 它可以在消息的元数据属性中配置（都是可选的）。

应用程序发布到 Azure Blob Storage 输出绑定时，应发送格式如下的消息。

```json
{
    "data": "file content",
    "metadata": {
        "blobName"           : "filename.txt",
        "contentType"        : "text/plain",
        "contentMD5"         : "vZGKbMRDAnMs4BIwlXaRvQ==",
        "contentEncoding"    : "UTF-8",
        "contentLanguage"    : "en-us",
        "contentDisposition" : "attachment",
        "cacheControl"       : "no-cache",
        "custom"             : "hello-world"
    },
    "operation": "create"
}
```

## 相关链接

- [Dapr组件的基本格式]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过输入绑定触发应用]({{< ref howto-triggers.md >}})
- [如何处理: 使用绑定对接外部资源]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
