---
type: docs
title: "SFTP 绑定规范"
linkTitle: "SFTP"
description: "关于安全文件传输协议（SFTP）绑定组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/sftp/"
---

## 组件格式

要配置 SFTP 绑定，创建一个类型为 `bindings.sftp` 的组件。请参阅[本指南]({{ ref bindings-overview.md }})以了解如何创建和应用绑定配置。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: bindings.sftp
  version: v1
  metadata:
  - name: rootPath
    value: "<string>"
  - name: address
    value: "<string>"
  - name: username
    value: "<string>"
  - name: password
    value: "*****************"
  - name: privateKey
    value: "*****************"
  - name: privateKeyPassphrase
    value: "*****************"
  - name: hostPublicKey
    value: "*****************"
  - name: knownHostsFile
    value: "<string>"
  - name: insecureIgnoreHostKey
    value: "<bool>"
```

## 元数据字段说明

| 字段              | 必需 | 绑定支持 |  详情 | 示例 |
|--------------------|:--------:|------------|-----|---------|
| `rootPath` | Y | 输出 | 默认工作目录的根路径 | `"/path"` |
| `address`             | Y        | 输出 |  SFTP 服务器地址 | `"localhost:22"` |
| `username`           | Y        | 输出 | 用于身份验证的用户名 | `"username"` |
| `password`          | N        | 输出 | 用户名/密码身份验证的密码 | `"password"` |
| `privateKey`          | N        | 输出 | 公钥身份验证的私钥 | <pre>"\|-<br>-----BEGIN OPENSSH PRIVATE KEY-----<br>*****************<br>-----END OPENSSH PRIVATE KEY-----"</pre> |
| `privateKeyPassphrase`       | N        | 输出 | 公钥身份验证的私钥密码 | `"passphrase"`    |
| `hostPublicKey`       | N        | 输出 | 主机验证的主机公钥 | `"ecdsa-sha2-nistp256 *** root@openssh-server"`    |
| `knownHostsFile`       | N        | 输出 | 主机验证的已知主机文件 | `"/path/file"` |
| `insecureIgnoreHostKey`       | N        | 输出 | 允许跳过主机验证。默认为 `"false"` | `"true"`, `"false"` |

## 绑定功能支持

此组件支持以下操作的**输出绑定**：

- `create` : [创建文件](#create-file)
- `get` : [获取文件](#get-file)
- `list` : [列出文件](#list-files)
- `delete` : [删除文件](#delete-file)

### 创建文件

要执行创建文件操作，请使用 `POST` 方法调用 SFTP 绑定，并提供以下 JSON 正文：

```json
{
  "operation": "create",
  "data": "<YOUR_BASE_64_CONTENT>",
  "metadata": {
    "fileName": "<filename>"
  }
}
```

#### 示例

{{< tabs Windows Linux >}}

  {{% codetab %}}
  ```bash
  curl -d "{ \"operation\": \"create\", \"data\": \"YOUR_BASE_64_CONTENT\", \"metadata\": { \"fileName\": \"my-test-file.jpg\" } }" http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

  {{% codetab %}}
  ```bash
  curl -d '{ "operation": "create", "data": "YOUR_BASE_64_CONTENT", "metadata": { "fileName": "my-test-file.jpg" } }' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

{{< /tabs >}}

#### 响应

响应正文将返回以下 JSON：

```json
{
   "fileName": "<filename>"
}
```

### 获取文件

要执行获取文件操作，请使用 `POST` 方法调用 SFTP 绑定，并提供以下 JSON 正文：

```json
{
  "operation": "get",
  "metadata": {
    "fileName": "<filename>"
  }
}
```

#### 示例

{{< tabs Windows Linux >}}

  {{% codetab %}}
  ```bash
  curl -d '{ \"operation\": \"get\", \"metadata\": { \"fileName\": \"filename\" }}' http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

  {{% codetab %}}
  ```bash
  curl -d '{ "operation": "get", "metadata": { "fileName": "filename" }}' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

{{< /tabs >}}

#### 响应

响应正文将包含文件中的内容。

### 列出文件

要执行列出文件操作，请使用 `POST` 方法调用 SFTP 绑定，并提供以下 JSON 正文：

```json
{
  "operation": "list"
}
```

如果您只想列出 `rootPath` 下某个特定目录中的文件，请在元数据中指定该目录的相对路径作为 `fileName`。

```json
{
  "operation": "list",
  "metadata": {
    "fileName": "my/cool/directory"
  }
}
```

#### 示例

{{< tabs Windows Linux >}}

  {{% codetab %}}
  ```bash
  curl -d '{ \"operation\": \"list\", \"metadata\": { \"fileName\": \"my/cool/directory\" }}' http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

  {{% codetab %}}
  ```bash
  curl -d '{ "operation": "list", "metadata": { "fileName": "my/cool/directory" }}' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

{{< /tabs >}}

#### 响应

响应将是一个包含文件名的 JSON 数组。

### 删除文件

要执行删除文件操作，请使用 `POST` 方法调用 SFTP 绑定，并提供以下 JSON 正文：

```json
{
  "operation": "delete",
  "metadata": {
    "fileName": "myfile"
  }
}
```

#### 示例

{{< tabs Windows Linux >}}

  {{% codetab %}}
  ```bash
  curl -d '{ \"operation\": \"delete\", \"metadata\": { \"fileName\": \"myfile\" }}' http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

  {{% codetab %}}
  ```bash
  curl -d '{ "operation": "delete", "metadata": { "fileName": "myfile" }}' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

{{< /tabs >}}

#### 响应

如果成功，将返回 HTTP 204（无内容）和空响应正文。

## 相关链接

- [Dapr 组件的基本架构]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何：使用绑定与外部资源接口]({{< ref howto-bindings.md >}})
- [绑定 API 参考]({{< ref bindings_api.md >}})