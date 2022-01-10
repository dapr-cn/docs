---
type: docs
title: "Alibaba Cloud Tablestore binding spec"
linkTitle: "Alibaba Cloud Tablestore"
description: "Detailed documentation on the Alibaba Tablestore binding component"
aliases:
  - "/operations/components/setup-bindings/supported-bindings/alicloudtablestore/"
---

## 配置

To setup an Alibaba Cloud Tablestore binding create a component of type `bindings.alicloud.tablestore`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a secretstore configuration. See this guide on [referencing secrets]({{< ref component-secrets.md >}}) to retrieve and use the secret with Dapr components.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: mytablestore
  namespace: default
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

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## 元数据字段规范

| 字段             | 必填 | 绑定支持 | 详情                            | 示例                                          |
| -------------- | -- | ---- | ----------------------------- | ------------------------------------------- |
| `终结点`          | Y  | 输出   | Alicloud Tablestore endpoint. | https://tablestore-cn-hangzhou.aliyuncs.com |
| `accessKeyID`  | Y  | 输出   | 访问密钥 ID 凭据。                   |                                             |
| `accessKey`    | Y  | 输出   | 访问密钥凭据。                       |                                             |
| `instanceName` | Y  | 输出   | Name of the instance.         |                                             |
| `tableName`    | Y  | 输出   | Name of the table.            |                                             |

## 绑定支持

字段名为 `ttlInSeconds`。
- `create`: [创建对象](#create-object)


### 创建对象

要执行创建对象操作，请使用`POST`方法和以下JSON调用绑定：

```json
{
  "operation": "create",
  "data": "YOUR_CONTENT",
  "metadata": {
    "primaryKeys": "pk1"
  }
} 
```

{{% alert title="Note" color="primary" %}}
Note the `metadata.primaryKeys` field is mandatory.
{{% /alert %}}

### Delete object

To perform a delete object operation, invoke the binding with a `POST` method and the following JSON body:

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

{{% alert title="Note" color="primary" %}}
Note the `metadata.primaryKeys` field is mandatory.
{{% /alert %}}

### List objects

To perform a list objects operation, invoke the binding with a `POST` method and the following JSON body:

```json
{
  "operation": "delete",
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

{{% alert title="Note" color="primary" %}}
Note the `metadata.primaryKeys` field is mandatory.
{{% /alert %}}

### Get object

To perform a get object operation, invoke the binding with a `POST` method and the following JSON body:

```json
{
  "operation": "delete",
  "metadata": {
    "primaryKeys": "pk1"
  },
  "data": {
    "pk1": "data1"
  }
} 
```

{{% alert title="Note" color="primary" %}}
Note the `metadata.primaryKeys` field is mandatory.
{{% /alert %}}

## 相关链接

- [绑定构建块]({{< ref bindings >}})
- [如何处理: 使用绑定对接外部资源]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
