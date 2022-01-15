---
type: docs
title: "Secret API 参考"
linkTitle: "Secret API"
description: "有关Secret API的详细文档"
weight: 600
---

## 获取Secret

使用此终结点，可以获取指定 secret store 的 Secret 值。

### HTTP 请求

```
GET http://localhost:<daprPort>/v1.0/secrets/<secret-store-name>/<name>
```

#### URL 参数

| 参数                | 说明                            |
| ----------------- | ----------------------------- |
| daprPort          | dapr 端口。                      |
| secret-store-name | 要获取 Secret 的 secret store 的名称 |
| name              | 要获取 Secret 的名称                |

> 注意：所有的 URL 参数都是大小写敏感的。

#### 查询参数

一些 secret stores 有 **optional** 元数据属性。 元数据使用查询参数：

```
GET http://localhost:<daprPort>/v1.0/secrets/<secret-store-name>/<name>?metadata.version_id=15
```

##### GCP Secret Manager
以下可选 meta 可以提供给 GCP Secret Manager 组件

| 查询参数                | 说明           |
| ------------------- | ------------ |
| metadata.version_id | 给定 Secret 版本 |

##### AWS Secret Manager
以下可选 meta 可提供给 AWS Secret Manager组件

| 查询参数                   | 说明                  |
| ---------------------- | ------------------- |
| metadata.version_id    | 给定 Secret key 的版本   |
| metadata.version_stage | 给定 Secret key 的版本阶段 |

### HTTP 响应

#### 响应正文

如果一个 secret store 支持多个 Secret 键值对，则会返回 JSON 有效负载，其中包含键名为字段及其各自的值。

如果密钥存储仅具有键值语义，则会返回 JSON 有效负载，其中密钥的名称作为字段，密钥的值作为值。

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

##### 单密钥的响应：

```shell
curl http://localhost:3500/v1.0/secrets/vault/db-secret
```

```json
{
  "db-secret": "value1"
}
```

#### 响应码

| 代码  | 说明                            |
| --- | ----------------------------- |
| 200 | OK                            |
| 204 | 未找到 Secret                    |
| 400 | Secret store 丢失或配置错误          |
| 403 | 拒绝访问                          |
| 500 | 未能获取 Secret 或未定义 secret store |

### 示例

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

## 获取批量Secret

使用此终结点可以获取 secret store 中的所有Secret密钥存储。 建议在为 Dapr 配置密钥存储时使用 [token身份验证]({{<ref "api-token.md">}})。

### HTTP 请求

```
GET http://localhost:<daprPort>/v1.0/secrets/<secret-store-name>/bulk
```

#### URL 参数

| 参数                | 说明                            |
| ----------------- | ----------------------------- |
| daprPort          | dapr 端口。                      |
| secret-store-name | 要获取 Secret 的 secret store 的名称 |

> 注意：所有的 URL 参数都是大小写敏感的。

### HTTP 响应

#### 响应正文

返回的响应是包含多个 Secret 的 JSON。 JSON 对象将包含 Secret 名称作为字段，并将 Secret 和值的映射作为字段值。

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

| 代码  | 说明                            |
| --- | ----------------------------- |
| 200 | OK                            |
| 400 | Secret store 丢失或配置错误          |
| 403 | 拒绝访问                          |
| 500 | 未能获取 Secret 或未定义 secret store |

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
```
