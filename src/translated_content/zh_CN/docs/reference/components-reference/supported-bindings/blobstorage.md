---
type: docs
title: "Azure Blob Storage 绑定指南"
linkTitle: "Azure Blob Storage"
description: "详细介绍 Azure Blob Storage 绑定组件的文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/blobstorage/"
---

## 组件格式

要配置 Azure Blob Storage 绑定，需创建一个类型为 `bindings.azure.blobstorage` 的组件。请参考[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})了解如何创建和应用绑定配置。

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
{{% alert title="警告" color="warning" %}}
上述示例中，secret 以明文字符串形式使用。建议使用 secret 存储来保护 secret，具体方法请参见[此处]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段说明

| 字段              | 必需 | 绑定支持 | 详情 | 示例 |
|--------------------|:--------:|--------|---------|---------|
| `accountName` | Y | 输入/输出 | Azure 存储账户的名称 | `"myexmapleaccount"` |
| `accountKey` | Y* | 输入/输出 | Azure 存储账户的访问密钥。仅在不使用 Microsoft Entra ID 认证时需要。 | `"access-key"` |
| `containerName` | Y | 输出 | 要写入的 Blob Storage 容器的名称 | `myexamplecontainer` |
| `endpoint` | N | 输入/输出 | 可选的自定义端点 URL。这在使用 [Azurite 模拟器](https://github.com/Azure/azurite)或使用 Azure 存储的自定义域时很有用（尽管这不是官方支持的）。端点必须是完整的基本 URL，包括协议（`http://` 或 `https://`）、IP 或 FQDN，以及可选端口。 | `"http://127.0.0.1:10000"`
| `decodeBase64` | N | 输出 | 配置在保存到 Blob Storage 之前解码 base64 文件内容。（在保存具有二进制内容的文件时）。默认为 `false` | `true`, `false` |
| `getBlobRetryCount` | N | 输出 | 指定在从 RetryReader 读取时将进行的最大 HTTP GET 请求次数。默认为 `10` | `1`, `2`
| `publicAccessLevel` | N | 输出 | 指定容器中的数据是否可以公开访问以及访问级别（仅在容器由 Dapr 创建时使用）。默认为 `none` | `blob`, `container`, `none`

### Microsoft Entra ID 认证

Azure Blob Storage 绑定组件支持使用所有 Microsoft Entra ID 机制进行认证。有关更多信息以及根据选择的 Microsoft Entra ID 认证机制提供的相关组件元数据字段，请参阅[认证到 Azure 的文档]({{< ref authenticating-azure.md >}})。

## 绑定支持

此组件支持以下操作的**输出绑定**：

- `create` : [创建 blob](#create-blob)
- `get` : [获取 blob](#get-blob)
- `delete` : [删除 blob](#delete-blob)
- `list`: [列出 blobs](#list-blobs)

Blob 存储组件的**输入绑定**使用 [Azure Event Grid]({{< ref eventgrid.md >}})触发和推送事件。

请参考[响应 Blob 存储事件](https://learn.microsoft.com/azure/storage/blobs/storage-blob-event-overview)指南以获取更多设置和信息。

### 创建 blob

要执行创建 blob 操作，请使用 `POST` 方法调用 Azure Blob Storage 绑定，并使用以下 JSON 正文：

> 注意：默认情况下，会生成一个随机 UUID。请参阅下文的元数据支持以设置名称

```json
{
  "operation": "create",
  "data": "YOUR_CONTENT"
}
```

#### 示例

##### 将文本保存到随机生成的 UUID blob

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

##### 将文本保存到特定 blob

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

##### 将文件保存到 blob

要上传文件，请将其编码为 Base64 并让绑定知道要反序列化它：

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

然后您可以像往常一样上传它：

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

响应正文将包含以下 JSON：

```json
{
   "blobURL": "https://<your account name>. blob.core.windows.net/<your container name>/<filename>"
}

```

### 获取 blob

要执行获取 blob 操作，请使用 `POST` 方法调用 Azure Blob Storage 绑定，并使用以下 JSON 正文：

```json
{
  "operation": "get",
  "metadata": {
    "blobName": "myblob",
    "includeMetadata": "true"
  }
}
```

元数据参数为：

- `blobName` - blob 的名称
- `includeMetadata`- （可选）定义是否应返回用户定义的元数据，默认为：false

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

响应正文包含存储在 blob 对象中的值。如果启用，用户定义的元数据将作为 HTTP 头返回，格式为：

`Metadata.key1: value1`
`Metadata.key2: value2`

### 删除 blob

要执行删除 blob 操作，请使用 `POST` 方法调用 Azure Blob Storage 绑定，并使用以下 JSON 正文：

```json
{
  "operation": "delete",
  "metadata": {
    "blobName": "myblob"
  }
}
```

元数据参数为：

- `blobName` - blob 的名称
- `deleteSnapshots` - （可选）如果 blob 具有关联的快照，则需要。指定以下两个选项之一：
  - include: 删除基础 blob 及其所有快照
  - only: 仅删除 blob 的快照，而不删除 blob 本身

#### 示例

##### 删除 blob

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

##### 仅删除 blob 快照

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

##### 删除 blob 包括快照

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

如果成功，将返回 HTTP 204（无内容）和空正文。

### 列出 blobs

要执行列出 blobs 操作，请使用 `POST` 方法调用 Azure Blob Storage 绑定，并使用以下 JSON 正文：

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

数据参数为：

- `maxResults` - （可选）指定要返回的最大 blob 数量，包括所有 BlobPrefix 元素。如果请求未指定 maxresults，服务器将返回最多 5,000 个项目。
- `prefix` - （可选）过滤结果以仅返回名称以指定前缀开头的 blob。
- `marker` - （可选）一个字符串值，用于标识下一个列表操作要返回的列表部分。如果返回的列表不完整，操作将在响应正文中返回一个标记值。然后可以在后续调用中使用标记值请求下一组列表项。
- `include` - （可选）指定要在响应中包含的一个或多个数据集：
  - snapshots: 指定快照应包含在枚举中。快照在响应中从旧到新列出。默认为：false
  - metadata: 指定在响应中返回 blob 元数据。默认为：false
  - uncommittedBlobs: 指定应在响应中包含已上传块但未使用 Put Block List 提交的 blob。默认为：false
  - copy: 版本 2012-02-12 及更新版本。指定应在响应中包含与任何当前或先前的 Copy Blob 操作相关的元数据。默认为：false
  - deleted: 版本 2017-07-29 及更新版本。指定应在响应中包含软删除的 blob。默认为：false

#### 响应

响应正文包含找到的块列表以及以下 HTTP 头：

`Metadata.marker: 2!108!MDAwMDM1IWZpbGUtMDgtMDctMjAyMS0wOS0zOC0zNC04NjctMTEudHh0ITAwMDAyOCE5OTk5LTEyLTMxVDIzOjU5OjU5Ljk5OTk5OTlaIQ--`
`Metadata.number: 10`

- `marker` - 下一个标记，可在后续调用中使用以请求下一组列表项。请参阅绑定输入的数据属性上的标记描述。
- `number` - 找到的 blob 数量

blob 列表将作为 JSON 数组返回，格式如下：

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

默认情况下，Azure Blob Storage 输出绑定会自动生成一个 UUID 作为 blob 文件名，并且不会分配任何系统或自定义元数据。可以在消息的元数据属性中进行配置（全部可选）。

发布到 Azure Blob Storage 输出绑定的应用程序应发送以下格式的消息：

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

- [Dapr 组件的基本架构]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何：使用输入绑定触发应用程序]({{< ref howto-triggers.md >}})
- [如何：使用绑定与外部资源接口]({{< ref howto-bindings.md >}})
- [绑定 API 参考]({{< ref bindings_api.md >}})