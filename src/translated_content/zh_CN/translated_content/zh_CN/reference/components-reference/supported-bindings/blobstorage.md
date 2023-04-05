---
type: docs
title: "Azure Blob Storage绑定规范"
linkTitle: "Azure Blob Storage"
description: "关于 Azure Blob Storage绑定组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/blobstorage/"
---

## Component format

To setup Azure Blob Storage binding create a component of type `bindings.azure.blobstorage`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: bindings.azure.blobstorage
  version: v1
  metadata:
  - name: accountName
    value: myStorageAccountName
  - name: accountKey
    value: ***********
  - name: containerName
    value: container1
# - name: decodeBase64
#   value: <bool>
# - name: getBlobRetryCount
#   value: <integer>
# - name: publicAccessLevel
#   value: <publicAccessLevel>
```
{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件，参考 [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| Field               | 必填 | 绑定支持   | 详情                                                                                                                                                                                                                                                                                                                                        | 示例                          |
| ------------------- |:--:| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| `accountName`       | 是  | 输入/输出  | The name of the Azure Storage account                                                                                                                                                                                                                                                                                                     | `"myexmapleaccount"`        |
| `accountKey`        | Y* | 输入/输出  | The access key of the Azure Storage account. Only required when not using Azure AD authentication.                                                                                                                                                                                                                                        | `"access-key"`              |
| `containerName`     | 是  | 输出     | 要写入的Blob Storage容器名称                                                                                                                                                                                                                                                                                                                      | `myexamplecontainer`        |
| `终结点`               | 否  | 输入/输出  | Optional custom endpoint URL. This is useful when using the [Azurite emulator](https://github.com/Azure/azurite) or when using custom domains for Azure Storage (although this is not officially supported). The endpoint must be the full base URL, including the protocol (`http://` or `https://`), the IP or FQDN, and optional port. | `"http://127.0.0.1:10000"`  |
| `decodeBase64`      | 否  | 输出     | Configuration to decode base64 file content before saving to Blob Storage. (In case of saving a file with binary content). 默认值为 `false`                                                                                                                                                                                                   | `true`, `false`             |
| `getBlobRetryCount` | 否  | Output | Specifies the maximum number of HTTP GET requests that will be made while reading from a RetryReader Defaults to `10`                                                                                                                                                                                                                     | `1`, `2`                    |
| `publicAccessLevel` | 否  | Output | Specifies whether data in the container may be accessed publicly and the level of access (only used if the container is created by Dapr). Defaults to `none`                                                                                                                                                                              | `blob`, `container`, `none` |

### Azure Active Directory (AAD) 认证

Azure Blob Storage绑定组件支持使用所有Azure Active Directory机制进行认证。 关于更多信息和相关组件的元数据字段请根据选择的AAD认证机制，参考[Azure认证文档]({{< ref authenticating-azure.md >}})。

## 绑定支持

该组件支持如下操作的 **输出绑定** ：

- `create` : [Create blob](#create-blob)
- `get` : [Get blob](#get-blob)
- `delete` : [Delete blob](#delete-blob)
- `list`: [List blobs](#list-blobs)

### Create blob

To perform a create blob operation, invoke the Azure Blob Storage binding with a `POST` method and the following JSON body:

> 注意：默认情况下，会随机生成一个UUID。 参见下面所示的支持的元数据设置名称

```json
{
  "operation": "create",
  "data": "YOUR_CONTENT"
}
```

#### Examples


##### Save text to a random generated UUID blob

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

To upload a file, encode it as Base64 and let the Binding know to deserialize it:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: bindings.azure.blobstorage
  version: v1
  metadata:
  - name: accountName
    value: myStorageAccountName
  - name: accountKey
    value: ***********
  - name: containerName
    value: container1
  - name: decodeBase64
    value: true
```

Then you can upload it as you would normally:

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

The response body will contain the following JSON:

```json
{
   "blobURL": "https://<your account name>. {
   "blobURL": "https://<your account name>. blob.core.windows.net/<your container name>/<filename>"
}

```

### Get blob

To perform a get blob operation, invoke the Azure Blob Storage binding with a `POST` method and the following JSON body:

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

- `blobName` - the name of the blob
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

The response body contains the value stored in the blob object. 如果启用，用户定义的元数据将以以下格式的HTTP头返回:

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

The metadata parameters are:

- `blobName` - the name of the blob
- `deleteSnapshots` - (可选项) 如果blob有关联的快照需要设置。 指定以下两个选项之一：
  - include: Delete the base blob and all of its snapshots
  - only: 只删除blob的快照而不删除blob本身

#### Examples

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

The data parameters are:

- `maxResults` - (optional) specifies the maximum number of blobs to return, including all BlobPrefix elements. If the request does not specify maxresults the server will return up to 5,000 items.
- `prefix` - (可选项) 只返回以指定前缀开头命名的blob
- `marker` - (可选项) 一个字符串值，用于标识下一次列表操作将返回的列表部分。 如果列表数据没有读取完成，本次操作将在响应正文中返回一个标记值。 The marker value may then be used in a subsequent call to request the next set of list items.
- `include` - (可选项) 指定包含在响应正文中的一个或多个数据集:
  - snapshots: Specifies that snapshots should be included in the enumeration. Snapshots are listed from oldest to newest in the response. Defaults to: false
  - metadata: 指定在响应正文中返回的blob元数据。 默认为: false
  - uncommittedBlobs: 为已经上传但是还未使用Put Block List提交的块数据指定blob，同样包含在响应正文中。 默认为: false
  - copy: 2012-02-12以及更新的版本。 指定应该在响应正文中包含的与任何当前或先前Blob副本操作相关的元数据。 默认为: false
  - deleted: 2017-07-29以及更新版本。 指定应该在响应正文中包含的被软删除的blob。 默认为: false

#### 响应

响应正文包含查找到的块数据列表以及如下HTTP头:

`Metadata.marker: 2!108!MDAwMDM1IWZpbGUtMDgtMDctMjAyMS0wOS0zOC0zNC04NjctMTEudHh0ITAwMDAyOCE5OTk5LTEyLTMxVDIzOjU5OjU5Ljk5OTk5OTlaIQ--` `Metadata.number: 10`

- `marker` - the next marker which can be used in a subsequent call to request the next set of list items. See the marker description on the data property of the binding input.
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

By default the Azure Blob Storage output binding auto generates a UUID as the blob filename and is not assigned any system or custom metadata to it. It is configurable in the metadata property of the message (all optional).

Applications publishing to an Azure Blob Storage output binding should send a message with the following format:

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

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过 input binding 触发应用]({{< ref howto-triggers.md >}})
- [How-To：使用绑定与外部资源进行交互]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
