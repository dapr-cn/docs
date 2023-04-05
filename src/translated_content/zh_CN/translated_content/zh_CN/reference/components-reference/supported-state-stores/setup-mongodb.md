---
type: docs
title: "MongoDB"
linkTitle: "MongoDB"
description: MongoDB 状态存储组件的详细信息
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-mongodb/"
---

## Component format

To setup MongoDB state store create a component of type `state.mongodb`. See [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) on how to create and apply a state store configuration.


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: state.mongodb
  version: v1
  metadata:
  - name: server
    value: <REPLACE-WITH-SERVER> # Required unless "host" field is set . Example: "server.example.com"
  - name: host
    value: <REPLACE-WITH-HOST> # Required unless "server" field is set . Example: "mongo-mongodb.default.svc.cluster.local:27017"
  - name: username
    value: <REPLACE-WITH-USERNAME> # Optional. Example: "admin"
  - name: password
    value: <REPLACE-WITH-PASSWORD> # Optional.
  - name: databaseName
    value: <REPLACE-WITH-DATABASE-NAME> # Optional. default: "daprStore"
  - name: collectionName
    value: <REPLACE-WITH-COLLECTION-NAME> # Optional. default: "daprCollection"
  - name: writeConcern
    value: <REPLACE-WITH-WRITE-CONCERN> # Optional.
  - name: readConcern
    value: <REPLACE-WITH-READ-CONCERN> # Optional.
  - name: operationTimeout
    value: <REPLACE-WITH-OPERATION-TIMEOUT> # Optional. default: "5s"
  - name: params
    value: <REPLACE-WITH-ADDITIONAL-PARAMETERS> # Optional. Example: "?authSource=daprStore&ssl=true"
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件，参考 [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

如果您想要使用 MongoDB 作为 Actor 存储，请在 yaml 上附上以下内容。

```yaml
  - name: actorStateStore
    value: "true"
```


## 元数据字段规范

| Field            |       必填       | 详情                                                                | 示例                                                                    |
| ---------------- |:--------------:| ----------------------------------------------------------------- | --------------------------------------------------------------------- |
| server           | 是<sup>*</sup>  | The server to connect to, when using DNS SRV record               | `"server.example.com"`                                                |
| host             | 是<sup>*</sup>  | The host to connect to                                            | `"mongo-mongodb.default.svc.cluster.local:27017"`                     |
| username         |       否        | 用于连接的用户的用户名 (适用于 `host`)                                          | `"admin"`                                                             |
| password         |       否        | 用于连接的用户的密码 (适用于 `host`)                                           | `"password"`                                                          |
| databaseName     |       否        | The name of the database to use. Defaults to `"daprStore"`        | `"daprStore"`                                                         |
| collectionName   |       否        | The name of the collection to use. Defaults to `"daprCollection"` | `"daprCollection"`                                                    |
| writeConcern     |       否        | The write concern to use                                          | `"majority"`                                                          |
| readConcern      |       否        | The read concern to use                                           | `"majority"`, `"local"`,`"available"`, `"linearizable"`, `"snapshot"` |
| operationTimeout |       否        | The timeout for the operation. 默认为 `"5s"`                         | `"5s"`                                                                |
| params           | 否<sup>**</sup> | 附加参数：                                                             | `"?authSource=daprStore&ssl=true"`                                |

> <sup>[*]</sup> The `server` and `host` fields are mutually exclusive. If neither or both are set, Dapr will return an error.

> <sup>[**]</sup> `params` 字段接受一个查询字符串，该字符串指定连接特定选项为 `<name>=<value>` 对，以 `"&"` 分隔并以 `"?" 为前缀`. 例如，要将“daprStore”数据库用作身份验证数据库并启用 SSL/TLS 连接，请将参数指定为 `"?authSource=daprStore&ssl=true"`。 有关可用选项及其用例的列表，请参阅 [mongodb 手册](https://docs.mongodb.com/manual/reference/connection-string/#std-label-connections-connection-options)。

## 配置 MongoDB

{{< tabs "Self-Hosted" "Kubernetes" >}}

{{% codetab %}}
您可以使用 Docker 在本地运行 MongoDB ：

```
docker run --name some-mongo -d mongo
```

然后您可以使用 `localhost:27017` 与服务器交互。

如果在您的组件定义中未指定 `databaseName` 值，请确保创建了一个名为 `daprStore` 的数据库。

{{% /codetab %}}

{{% codetab %}}
The easiest way to install MongoDB on Kubernetes is by using the [Helm chart](https://github.com/helm/charts/tree/master/stable/mongodb):

```
helm install mongo stable/mongodb
```

This installs MongoDB into the `default` namespace. To interact with MongoDB, find the service with: `kubectl get svc mongo-mongodb`.

For example, if installing using the example above, the MongoDB host address would be:

`mongo-mongodb.default.svc.cluster.local:27017`


Follow the on-screen instructions to get the root password for MongoDB. The username is `admin` by default.
{{% /codetab %}}

{{< /tabs >}}

### TTLs and cleanups

This state store supports [Time-To-Live (TTL)]({{< ref state-store-ttl.md >}}) for records stored with Dapr. When storing data using Dapr, you can set the `ttlInSeconds` metadata property to indicate when the data should be considered "expired".

## 相关链接
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) 以获取配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
