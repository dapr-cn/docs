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

| 字段                | 必填 | 绑定支持 | 详情                                                                                                                                                                                   | 示例                          |
| ----------------- |:--:| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------- |
| storageAccount    | Y  | 输出   | Blob Storage 账户名称                                                                                                                                                                    | `myexmapleaccount`          |
| storageAccessKey  | Y  | 输出   | Blob Storage 访问密钥                                                                                                                                                                    | `access-key`                |
| container         | Y  | 输出   | 要写入的Blob Storage容器名称                                                                                                                                                                 | `myexamplecontainer`        |
| decodeBase64      | N  | 输出   | 配置在保存到Blob Storage之前对base64文件内容进行解码。 (保存有二进制内容的文件时)。 `true` is the only allowed positive value. Other positive variations like `"True", "1"` are not acceptable. Defaults to `false` | `true`, `false`             |
| getBlobRetryCount | N  | 输出   | Specifies the maximum number of HTTP GET requests that will be made while reading from a RetryReader Defaults to `10`                                                                | `1`, `2`                    |
| publicAccessLevel | N  | 输出   | Specifies whether data in the container may be accessed publicly and the level of access (only used if the container is created by Dapr). Defaults to `none`                         | `blob`, `container`, `none` |


## 绑定支持

字段名为 `ttlInSeconds`。

- `create` : [创建blob](#create-blob)
- `get` : [获取blob](#get-blob)
- `delete` : [Delete blob](#delete-blob)
- `list`: [List blobs](#list-blobs)

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

The metadata parameters are:

- `blobName` - the name of the blob
- `includeMetadata`- (optional) defines if the user defined metadata should be returned or not, defaults to: false

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

响应体包含存储在blob对象中的值。 If enabled, the user defined metadata will be returned as HTTP headers in the form:

`Metadata.key1: value1` `Metadata.key2: value2`

### Delete blob

To perform a delete blob operation, invoke the Azure Blob Storage binding with a `POST` method and the following JSON body:

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
- `deleteSnapshots` - (optional) required if the blob has associated snapshots. Specify one of the following two options:
  - include: Delete the base blob and all of its snapshots
  - only: Delete only the blob's snapshots and not the blob itself

#### 示例

##### Delete blob

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

##### Delete blob snapshots only

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

##### Delete blob including snapshots

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

An HTTP 204 (No Content) and empty body will be retuned if successful.

### List blobs

To perform a list blobs operation, invoke the Azure Blob Storage binding with a `POST` method and the following JSON body:

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
- `prefix` - (optional) filters the results to return only blobs whose names begin with the specified prefix.
- `marker` - (optional) a string value that identifies the portion of the list to be returned with the next list operation. The operation returns a marker value within the response body if the list returned was not complete. The marker value may then be used in a subsequent call to request the next set of list items.
- `include` - (optional) Specifies one or more datasets to include in the response:
  - snapshots: Specifies that snapshots should be included in the enumeration. Snapshots are listed from oldest to newest in the response. Defaults to: false
  - metadata: Specifies that blob metadata be returned in the response. Defaults to: false
  - uncommittedBlobs: Specifies that blobs for which blocks have been uploaded, but which have not been committed using Put Block List, be included in the response. Defaults to: false
  - copy: Version 2012-02-12 and newer. Specifies that metadata related to any current or previous Copy Blob operation should be included in the response. Defaults to: false
  - deleted: Version 2017-07-29 and newer. Specifies that soft deleted blobs should be included in the response. Defaults to: false

#### 响应

The response body contains the list of found blocks as also the following HTTP headers:

`Metadata.marker: 2!108!MDAwMDM1IWZpbGUtMDgtMDctMjAyMS0wOS0zOC0zNC04NjctMTEudHh0ITAwMDAyOCE5OTk5LTEyLTMxVDIzOjU5OjU5Ljk5OTk5OTlaIQ--` `Metadata.number: 10`

- `marker` - the next marker which can be used in a subsequent call to request the next set of list items. See the marker description on the data property of the binding input.
- `number` - the number of found blobs

The list of blobs will be returned as JSON array in the following form:

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
