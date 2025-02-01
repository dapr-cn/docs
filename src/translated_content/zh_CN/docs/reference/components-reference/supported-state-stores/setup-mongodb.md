---
type: docs
title: "MongoDB"
linkTitle: "MongoDB"
description: 详细介绍MongoDB状态存储组件的信息
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-mongodb/"
---

## 组件格式

为了设置MongoDB状态存储，您需要创建一个类型为`state.mongodb`的组件。请参考[本指南]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}})了解如何创建和应用状态存储配置。

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
    value: <REPLACE-WITH-SERVER> # 必填，除非设置了"host"字段。例如："server.example.com"
  - name: host
    value: <REPLACE-WITH-HOST> # 必填，除非设置了"server"字段。例如："mongo-mongodb.default.svc.cluster.local:27017"
  - name: username
    value: <REPLACE-WITH-USERNAME> # 可选。例如："admin"
  - name: password
    value: <REPLACE-WITH-PASSWORD> # 可选。
  - name: databaseName
    value: <REPLACE-WITH-DATABASE-NAME> # 可选。默认值："daprStore"
  - name: collectionName
    value: <REPLACE-WITH-COLLECTION-NAME> # 可选。默认值："daprCollection"
  - name: writeConcern
    value: <REPLACE-WITH-WRITE-CONCERN> # 可选。
  - name: readConcern
    value: <REPLACE-WITH-READ-CONCERN> # 可选。
  - name: operationTimeout
    value: <REPLACE-WITH-OPERATION-TIMEOUT> # 可选。默认值："5s"
  - name: params
    value: <REPLACE-WITH-ADDITIONAL-PARAMETERS> # 可选。例如："?authSource=daprStore&ssl=true"
  # 如果希望将MongoDB用作actor的状态存储，请取消注释此行（可选）
  #- name: actorStateStore
  #  value: "true"

```

{{% alert title="警告" color="warning" %}}
上述示例中，secret以明文字符串形式使用。建议按照[此处]({{< ref component-secrets.md >}})所述使用secret存储。
{{% /alert %}}

### actor状态存储和事务支持

当MongoDB用作actor状态存储或需要事务支持时，必须在[副本集](https://www.mongodb.com/docs/manual/replication/)中运行。

如果希望将MongoDB用作actor存储，请在组件YAML中添加以下元数据选项：

```yaml
  - name: actorStateStore
    value: "true"
```

## 规格元数据字段

| 字段              | 必填 | 详情 | 示例 |
|--------------------|:--------:|---------|---------|
| server             | Y<sup>1</sup> | 使用DNS SRV记录时要连接的服务器 | `"server.example.com"`
| host               | Y<sup>1</sup> | 要连接的主机 | `"mongo-mongodb.default.svc.cluster.local:27017"`
| username           | N        | 要连接的用户的用户名（适用于与`host`结合使用） | `"admin"`
| password           | N        | 用户的密码（适用于与`host`结合使用） | `"password"`
| databaseName       | N        | 要使用的数据库名称。默认为`"daprStore"` | `"daprStore"`
| collectionName     | N        | 要使用的集合名称。默认为`"daprCollection"` | `"daprCollection"`
| writeConcern       | N        | 要使用的写关注 | `"majority"`
| readConcern        | N        | 要使用的读关注  | `"majority"`, `"local"`,`"available"`, `"linearizable"`, `"snapshot"`
| operationTimeout   | N        | 操作的超时时间。默认为`"5s"` | `"5s"`
| params             | N<sup>2</sup> | 要使用的附加参数 | `"?authSource=daprStore&ssl=true"`
| actorStateStore    | N        | 将此状态存储考虑为actor。默认为`"false"` | `"true"`, `"false"`

> <sup>[1]</sup> `server`和`host`字段是互斥的。如果两者都未设置或都设置，Dapr将返回错误。

> <sup>[2]</sup> `params`字段接受一个查询字符串，该字符串指定连接特定选项为`<name>=<value>`对，以`&`分隔并以`?`为前缀。例如，要使用"daprStore"数据库作为身份验证数据库并在连接中启用SSL/TLS，请将参数指定为`?authSource=daprStore&ssl=true`。有关可用选项及其用例的列表，请参阅[MongoDB手册](https://docs.mongodb.com/manual/reference/connection-string/#std-label-connections-connection-options)。

## 设置MongoDB

{{< tabs "Self-Hosted" "Kubernetes" >}}

{{% codetab %}}
您可以使用Docker在本地运行单个MongoDB实例：

```sh
docker run --name some-mongo -d -p 27017:27017 mongo
```

然后，您可以在`localhost:27017`与服务器交互。如果在组件定义中未指定`databaseName`值，请确保创建一个名为`daprStore`的数据库。

为了将MongoDB状态存储用于事务和作为actor状态存储，您需要将MongoDB作为副本集运行。有关如何使用Docker创建3节点副本集，请参阅[官方文档](https://www.mongodb.com/compatibility/deploying-a-mongodb-cluster-with-docker)。
{{% /codetab %}}

{{% codetab %}}
您可以使用[Bitnami打包的Helm chart](https://github.com/bitnami/charts/tree/main/bitnami/mongodb/)方便地在Kubernetes上安装MongoDB。请参阅Helm chart文档以了解如何部署MongoDB，无论是作为独立服务器还是与副本集（使用事务和actor所需）一起。
这会将MongoDB安装到`default`命名空间中。
要与MongoDB交互，请使用：`kubectl get svc mongo-mongodb`查找服务。
例如，如果使用上述Helm默认值安装，MongoDB主机地址将是：
`mongo-mongodb.default.svc.cluster.local:27017`
按照屏幕上的说明获取MongoDB的root密码。
用户名通常默认为`admin`。
{{% /codetab %}}

{{< /tabs >}}

### TTL和清理

此状态存储支持Dapr存储记录的[生存时间（TTL）]({{< ref state-store-ttl.md >}})。使用Dapr存储数据时，您可以设置`ttlInSeconds`元数据属性以指示数据何时应被视为“过期”。

## 相关链接

- [Dapr组件的基本架构]({{< ref component-schema >}})
- 阅读[本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}})以获取配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
