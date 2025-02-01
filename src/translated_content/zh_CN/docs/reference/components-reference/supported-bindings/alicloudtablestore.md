---
type: docs
title: "阿里云 Tablestore 绑定组件规范"
linkTitle: "阿里云 Tablestore"
description: "关于阿里云 Tablestore 绑定组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/alicloudtablestore/"
---

## 组件格式

要配置阿里云 Tablestore 绑定组件，请创建一个类型为 `bindings.alicloud.tablestore` 的组件。请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})了解如何创建和应用 secretstore 配置。有关如何[引用 secrets]({{< ref component-secrets.md >}})以获取和使用 Dapr 组件的机密信息，请参阅此指南。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: mytablestore
spec:
  type: bindings.alicloud.tablestore
  version: v1
  metadata:
  - name: endpoint
    value: "[endpoint]"
  - name: accessKeyID
    value: "[key-id]"
  - name: accessKey
    value: "[access-key]"
  - name: instanceName
    value: "[instance]"
  - name: tableName
    value: "[table]"
  - name: endpoint
    value: "[endpoint]"
```

{{% alert title="警告" color="warning" %}}
上述示例中使用了明文字符串作为机密信息。建议使用 secret store 来存储机密信息，详情请参阅[此处]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段说明

| 字段         | 必需 | 绑定支持  | 说明 | 示例 |
|---------------|----------|---------|---------|---------|
| `endpoint`    | 是 | 输出 | 阿里云 Tablestore 的访问端点。 | https://tablestore-cn-hangzhou.aliyuncs.com
| `accessKeyID` | 是 | 输出 | 访问密钥 ID。 |
| `accessKey`   | 是 | 输出 | 访问密钥。 |
| `instanceName`      | 是 | 输出 | 实例名称。 |
| `tableName`      | 是 | 输出 | 表名称。 |

## 绑定功能支持

此组件支持以下操作的**输出绑定**：

- `create`: [创建对象](#create-object)

### 创建对象

要执行创建对象操作，请使用 `POST` 方法调用绑定，并提供以下 JSON 正文：

```json
{
  "operation": "create",
  "data": "YOUR_CONTENT",
  "metadata": {
    "primaryKeys": "pk1"
  }
} 
```

{{% alert title="注意" color="primary" %}}
请确保 `metadata.primaryKeys` 字段是必填项。
{{% /alert %}}

### 删除对象

要执行删除对象操作，请使用 `POST` 方法调用绑定，并提供以下 JSON 正文：

```json
{
  "operation": "delete",
  "metadata": {
   "primaryKeys": "pk1",
   "columnToGet": "name,age,date"
  },
  "data": {
    "pk1": "data1"
  }
} 
```

{{% alert title="注意" color="primary" %}}
请确保 `metadata.primaryKeys` 字段是必填项。
{{% /alert %}}

### 列出对象

要执行列出对象操作，请使用 `POST` 方法调用绑定，并提供以下 JSON 正文：

```json
{
  "operation": "list",
  "metadata": {
    "primaryKeys": "pk1",
    "columnToGet": "name,age,date"
  },
  "data": {
    "pk1": "data1",
    "pk2": "data2"
  }
} 
```

{{% alert title="注意" color="primary" %}}
请确保 `metadata.primaryKeys` 字段是必填项。
{{% /alert %}}

### 获取对象

要执行获取对象操作，请使用 `POST` 方法调用绑定，并提供以下 JSON 正文：

```json
{
  "operation": "get",
  "metadata": {
    "primaryKeys": "pk1"
  },
  "data": {
    "pk1": "data1"
  }
} 
```

{{% alert title="注意" color="primary" %}}
请确保 `metadata.primaryKeys` 字段是必填项。
{{% /alert %}}

## 相关链接

- [绑定构建块]({{< ref bindings >}})
- [操作指南：使用绑定与外部资源接口]({{< ref howto-bindings.md >}})
- [绑定 API 参考]({{< ref bindings_api.md >}})
