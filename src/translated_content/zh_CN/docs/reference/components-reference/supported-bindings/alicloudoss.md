---
type: docs
title: "阿里云对象存储服务绑定指南"
linkTitle: "阿里云对象存储"
description: "关于阿里云对象存储绑定组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/alicloudoss/"
---

## 组件格式

要配置阿里云对象存储绑定，请创建一个类型为 `bindings.alicloud.oss` 的组件。请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})了解如何创建和应用secretstore配置。有关如何[引用secrets]({{< ref component-secrets.md >}})以检索和使用Dapr组件的secret，请参阅此指南。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: alicloudobjectstorage
spec:
  type: bindings.alicloud.oss
  version: v1
  metadata:
  - name: endpoint
    value: "[endpoint]"
  - name: accessKeyID
    value: "[key-id]"
  - name: accessKey
    value: "[access-key]"
  - name: bucket
    value: "[bucket]"
```

{{% alert title="警告" color="warning" %}}
上述示例中使用了明文字符串作为secrets。建议使用secret store来存储secrets，详情请见[此处]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段说明

| 字段          | 必需 | 绑定功能  | 详情 | 示例 |
|---------------|------|---------|---------|---------|
| `endpoint`    | 是   | 输出    | 阿里云OSS端点。 | https://oss-cn-hangzhou.aliyuncs.com
| `accessKeyID` | 是   | 输出    | 访问密钥ID凭证。 |
| `accessKey`   | 是   | 输出    | 访问密钥凭证。 |
| `bucket`      | 是   | 输出    | 存储桶的名称。 |

## 绑定功能

此组件支持**输出绑定**，具有以下操作：

- `create`: [创建对象](#create-object)

### 创建对象

要执行创建对象操作，请使用`POST`方法调用绑定，并使用以下JSON主体：

```json
{
  "operation": "create",
  "data": "YOUR_CONTENT"
}
```

{{% alert title="注意" color="primary" %}}
默认情况下，会自动生成一个随机UUID作为对象键。请参阅下面的元数据支持以设置对象的键。
{{% /alert %}}

#### 示例

**保存到随机生成的UUID文件**

{{< tabs "Windows" "Linux/MacOS" >}}

{{% codetab %}}

```bash
curl -d "{ \"operation\": \"create\", \"data\": \"Hello World\" }" http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
```

{{% /codetab %}}

{{% codetab %}}

```bash
curl -d '{ "operation": "create", "data": "Hello World" }' http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
```

{{% /codetab %}}

{{< /tabs >}}

<br />

**保存到特定文件**
{{< tabs "Windows" "Linux/MacOS" >}}

{{% codetab %}}

```bash
curl -d "{ \"operation\": \"create\", \"data\": \"Hello World\", \"metadata\": { \"key\": \"my-key\" } }" http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
```

{{% /codetab %}}

{{% codetab %}}

```bash
curl -d '{ "operation": "create", "data": "Hello World", "metadata": { "key": "my-key" } }' http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
```

{{% /codetab %}}

{{< /tabs >}}

{{% alert title="注意" color="primary" %}}
在Windows CMD中需要对`"`字符进行转义。
{{% /alert %}}

## 元数据信息

### 对象键

默认情况下，阿里云OSS输出绑定会自动生成一个UUID作为对象键。您可以使用以下元数据来设置自定义键：

```json
{
    "data": "file content",
    "metadata": {
        "key": "my-key"
    },
    "operation": "create"
}
```

## 相关链接

- [Bindings构建块]({{< ref bindings >}})
- [如何：使用输入绑定触发应用程序]({{< ref howto-triggers.md >}})
- [如何：使用bindings与外部资源接口]({{< ref howto-bindings.md >}})
- [Bindings API参考]({{< ref bindings_api.md >}})
