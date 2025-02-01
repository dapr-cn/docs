---
type: docs
title: "Secrets API 参考"
linkTitle: "Secrets API"
description: "关于 secrets API 的详细文档"
weight: 700
---

## 获取 Secret

此接口允许您获取指定 secret 存储中的 secret 值。

### HTTP 请求

```
GET http://localhost:<daprPort>/v1.0/secrets/<secret-store-name>/<name>
```

#### URL 参数

参数 | 描述
--------- | -----------
daprPort | Dapr 端口
secret-store-name | 要从中获取 secret 的 secret 存储名称
name | 要获取的 secret 名称

> 请注意，所有 URL 参数区分大小写。

#### 查询参数

某些 secret 存储支持**可选**的、每个请求的元数据属性。您可以通过查询参数来提供这些属性。例如：

```
GET http://localhost:<daprPort>/v1.0/secrets/<secret-store-name>/<name>?metadata.version_id=15
```

请注意，并非所有 secret 存储都支持相同的参数集。例如：
- Hashicorp Vault、GCP Secret Manager 和 AWS Secret Manager 支持 `version_id` 参数
- 只有 AWS Secret Manager 支持 `version_stage` 参数
- 只有 Kubernetes Secrets 支持 `namespace` 参数
请查阅每个 [secret 存储的文档]({{< ref supported-secret-stores.md >}}) 以获取支持的参数列表。

### HTTP 响应

#### 响应体

如果 secret 存储支持 secret 中的多个键值，将返回一个 JSON 负载，其中键名作为字段及其各自的值。

如果 secret 存储仅具有名称/值语义，将返回一个 JSON 负载，其中 secret 的名称作为字段，secret 的值作为值。

[查看支持 secret 中多个键和名称/值语义的 secret 存储的分类]({{< ref supported-secret-stores.md >}})。

##### secret 中有多个键的响应（例如 Kubernetes）：

```shell
curl http://localhost:3500/v1.0/secrets/kubernetes/db-secret
```

```json
{
  "key1": "value1",
  "key2": "value2"
}
```

上面的示例展示了来自具有多个键的 secret 存储的响应。请注意，secret 名称 (`db-secret`) **不**作为结果的一部分返回。

##### 具有名称/值语义的 secret 存储的响应：

```shell
curl http://localhost:3500/v1.0/secrets/vault/db-secret
```

```json
{
  "db-secret": "value1"
}
```

上面的示例展示了来自具有名称/值语义的 secret 存储的响应。与来自具有多个键的 secret 存储的结果相比，此结果返回一个键值对，其中 secret 名称 (`db-secret`) 作为键返回。

#### 响应代码

代码 | 描述
---- | -----------
200  | OK
204  | Secret 未找到
400  | Secret 存储缺失或配置错误
403  | 访问被拒绝
500  | 获取 secret 失败或未定义 secret 存储

### 示例

```shell
curl http://localhost:3500/v1.0/secrets/mySecretStore/db-secret
```

```shell
curl http://localhost:3500/v1.0/secrets/myAwsSecretStore/db-secret?metadata.version_id=15&metadata.version_stage=production
```

## 获取批量 Secret

此接口允许您获取 secret 存储中的所有 secret。
建议为 Dapr 配置 secret 存储时使用 [令牌认证]({{<ref "api-token.md">}})。

### HTTP 请求

```
GET http://localhost:<daprPort>/v1.0/secrets/<secret-store-name>/bulk
```

#### URL 参数

参数 | 描述
--------- | -----------
daprPort | Dapr 端口
secret-store-name | 要从中获取 secret 的 secret 存储名称

> 请注意，所有 URL 参数区分大小写。

### HTTP 响应

#### 响应体

返回的响应是一个包含 secrets 的 JSON。JSON 对象将包含 secret 名称作为字段，并将 secret 键和值的映射作为字段值。

##### 具有多个 secrets 和 secret 中多个键/值的响应（例如 Kubernetes）：

```shell
curl http://localhost:3500/v1.0/secrets/kubernetes/bulk
```

```json
{
    "secret1": {
        "key1": "value1",
        "key2": "value2"
    },
    "secret2": {
        "key3": "value3",
        "key4": "value4"
    }
}
```

#### 响应代码

代码 | 描述
---- | -----------
200  | OK
400  | Secret 存储缺失或配置错误
403  | 访问被拒绝
500  | 获取 secret 失败或未定义 secret 存储

### 示例

```shell
curl http://localhost:3500/v1.0/secrets/vault/bulk
```

```json
{
    "key1": {
        "key1": "value1"
    },
    "key2": {
        "key2": "value2"
    }
}
