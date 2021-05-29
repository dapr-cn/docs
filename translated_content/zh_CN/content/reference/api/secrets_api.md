---
type: docs
title: "密钥 API 参考"
linkTitle: "Secrets API"
description: "Detailed documentation on the secrets API"
weight: 600
---

## Get Secret

This endpoint lets you get the value of a secret for a given secret store.

### HTTP 请求

```
GET http://localhost:<daprPort>/v1.0/secrets/<secret-store-name>/<name>
```

#### URL 参数

| 参数                | 说明                                                  |
| ----------------- | --------------------------------------------------- |
| daprPort          | dapr 端口。                                            |
| secret-store-name | the name of the secret store to get the secret from |
| name              | the name of the secret to get                       |

> 注意：所有的 URL 参数都是大小写敏感的。

#### Query Parameters

Some secret stores have **optional** metadata properties. metadata is populated using query parameters:

```
GET http://localhost:<daprPort>/v1.0/secrets/<secret-store-name>/<name>?metadata.version_id=15
```

##### GCP Secret Manager
The following optional meta can be provided to the GCP Secret Manager component

| Query Parameter     | 说明                               |
| ------------------- | -------------------------------- |
| metadata.version_id | version for the given secret key |

##### AWS Secret Manager
The following optional meta can be provided to the AWS Secret Manager component

| Query Parameter        | 说明                                     |
| ---------------------- | -------------------------------------- |
| metadata.version_id    | version for the given secret key       |
| metadata.version_stage | version stage for the given secret key |

### HTTP Response

#### Response Body

If a secret store has support for multiple keys in a secret, a JSON payload is returned with the key names as fields and their respective values.

In case of a secret store that only has name/value semantics, a JSON payload is returned with the name of the secret as the field and the value of the secret as the value.

##### Response with multiple keys in a secret (eg. Kubernetes):

```shell
curl http://localhost:3500/v1.0/secrets/kubernetes/db-secret
```

```json
{
  "key1": "value1",
  "key2": "value2"
}
```

##### Response with no keys in a secret:

```shell
curl http://localhost:3500/v1.0/secrets/vault/db-secret
```

```json
{
  "db-secret": "value1"
}
```

#### Response Codes

| 代码  | 说明                                               |
| --- | ------------------------------------------------ |
| 200 | OK                                               |
| 204 | Secret not found                                 |
| 400 | Secret store is missing or misconfigured         |
| 403 | Access denied                                    |
| 500 | Failed to get secret or no secret stores defined |

### 示例

```shell
curl http://localhost:3500/v1.0/secrets/vault/db-secret \
```

```shell
curl http://localhost:3500/v1.0/secrets/vault/db-secret?metadata.version_id=15&metadata.version_stage=AAA \
```

> Note, in case of deploying into namespace other than  default`, the above query will also have to include the namespace metadata (e.g.`production` below)

```shell
curl http://localhost:3500/v1.0/secrets/vault/db-secret?metadata.version_id=15&?metadata.namespace=production
```

## Get Bulk Secret

This endpoint lets you get all the secrets in a secret store. It's recommended to use [token authentication]({{<ref "api-token.md">}}) for Dapr if configuring a secret store.

### HTTP 请求

```
GET http://localhost:<daprPort>/v1.0/secrets/<secret-store-name>/bulk
```

#### URL 参数

| 参数                | 说明                                                  |
| ----------------- | --------------------------------------------------- |
| daprPort          | dapr 端口。                                            |
| secret-store-name | the name of the secret store to get the secret from |

> 注意：所有的 URL 参数都是大小写敏感的。

### HTTP Response

#### Response Body

The returned response is a JSON containing the secrets. The JSON object will contain the secret names as fields and a map of secret keys and values as the field value.

##### Response with multiple secrets and multiple key / values in a secret (eg. Kubernetes):

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

#### Response Codes

| 代码  | 说明                                               |
| --- | ------------------------------------------------ |
| 200 | OK                                               |
| 400 | Secret store is missing or misconfigured         |
| 403 | Access denied                                    |
| 500 | Failed to get secret or no secret stores defined |

### 示例

```shell
curl http://localhost:3500/v1.0/secrets/vault/bulk \
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
