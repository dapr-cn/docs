---
type: docs
title: "Secret API 参考"
linkTitle: "Secret API"
description: "有关 Secret API 的详细文档"
weight: 600
---

## Get Secret

This endpoint lets you get the value of a secret for a given secret store.

### HTTP Request

```
GET http://localhost:<daprPort>/v1.0/secrets/<secret-store-name>/<name>
```

#### URL 参数

| Parameter         | 说明                                                  |
| ----------------- | --------------------------------------------------- |
| daprPort          | the Dapr port                                       |
| secret-store-name | the name of the secret store to get the secret from |
| name              | the name of the secret to get                       |

> 注意：所有的 URL 参数都是大小写敏感的。

#### 查询参数

一些 secret stores 有 **optional** 元数据属性。 元数据使用查询参数：

```
GET http://localhost:<daprPort>/v1.0/secrets/<secret-store-name>/<name>?metadata.version_id=15
```

##### GCP Secret Manager
以下可选 meta 可以提供给 GCP Secret Manager 组件

| Query Parameter     | 说明           |
| ------------------- | ------------ |
| metadata.version_id | 给定 Secret 版本 |

##### AWS Secret Manager
以下可选 meta 可提供给 AWS Secret Manager组件

| Query Parameter        | 说明                  |
| ---------------------- | ------------------- |
| metadata.version_id    | 给定 Secret 版本        |
| metadata.version_stage | 给定 Secret key 的版本阶段 |

### HTTP 响应

#### 响应正文

If a secret store has support for multiple key-values in a secret, a JSON payload is returned with the key names as fields and their respective values.

如果密钥存储仅具有键值语义，则会返回 JSON 有效负载，其中密钥的名称作为字段，密钥的值作为值。

[See the classification of secret stores]({{< ref supported-secret-stores.md >}}) that support multiple keys in a secret and name/value semantics.

##### 多密钥（如Kubernetes）响应：

```shell
curl http://localhost:3500/v1.0/secrets/kubernetes/db-secret
```

```json
{
  "key1": "value1",
  "key2": "value2"
}
```

The above example demonstrates a response from a secret store with multiple keys in a secret. Note that the secret name (`db-secret`) **is not** returned as part of the result.

##### Response from a secret store with name/value semantics:

```shell
curl http://localhost:3500/v1.0/secrets/vault/db-secret
```

```json
{
  "db-secret": "value1"
}
```

The above example demonstrates a response from a secret store with name/value semantics. Compared to the result from a secret store with multiple keys in a secret, this result returns a single key-value pair, with the secret name (`db-secret`) returned as the key in the key-value pair.

#### 响应码

| Code | 说明                            |
| ---- | ----------------------------- |
| 200  | OK                            |
| 204  | 未找到 Secret                    |
| 400  | Secret store 丢失或配置错误          |
| 403  | 拒绝访问                          |
| 500  | 未能获取 Secret 或未定义 secret store |

### Examples

```shell
curl http://localhost:3500/v1.0/secrets/vault/db-secret
```

```shell
curl http://localhost:3500/v1.0/secrets/vault/db-secret?metadata.version_id=15&metadata.version_stage=AAA
```

> 注意，如果部署到非默认命名空间中，上述查询还必须包含命名空间元数据（例如 `production` 如下）

```shell
curl http://localhost:3500/v1.0/secrets/vault/db-secret?metadata.version_id=15&?metadata.namespace=production
```

## 获取批量 Secret

This endpoint lets you get all the secrets in a secret store. It's recommended to use [token authentication]({{<ref "api-token.md">}}) for Dapr if configuring a secret store.

### HTTP 请求

```
GET http://localhost:<daprPort>/v1.0/secrets/<secret-store-name>/bulk
```

#### URL 参数

| Parameter         | 说明                            |
| ----------------- | ----------------------------- |
| daprPort          | the Dapr port                 |
| secret-store-name | 要获取 Secret 的 secret store 的名称 |

> 注意：所有的 URL 参数都是大小写敏感的。

### HTTP 响应

#### 响应正文

The returned response is a JSON containing the secrets. The JSON object will contain the secret names as fields and a map of secret keys and values as the field value.

##### 多个密钥键值对进行响应（如Kubernetes）：

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

#### 响应码

| Code | 说明                            |
| ---- | ----------------------------- |
| 200  | OK                            |
| 400  | Secret store 丢失或配置错误          |
| 403  | 拒绝访问                          |
| 500  | 未能获取 Secret 或未定义 secret store |

### Examples

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
```
