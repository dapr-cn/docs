---
type: docs
title: "MongoDB"
linkTitle: "MongoDB"
description: MongoDB 状态存储组件的详细信息
---

## 配置

要设置 MongoDB 状态存储，请创建一个类型为 `state.mongodb` 的组件。 请参阅[本指南]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}})，了解如何创建和应用状态存储配置。


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.mongodb
  version: v1
  metadata:
  - name: host
    value: <REPLACE-WITH-HOST> # Required. Example: "mongo-mongodb.default.svc.cluster.local:27017"
  - name: username
    value: <REPLACE-WITH-USERNAME> # Optional. Example: "admin"
  - name: password
    value: <REPLACE-WITH-PASSWORD> # Optional.
  - name: databaseName
    value: <REPLACE-WITH-DATABASE-NAME> # Optional. default: "daprStore"
  - name: collectionName
    value: <REPLACE-WITH-COLLECTION-NAME> # Optional. default: "daprCollection"
  - name: writeconcern
    value: <REPLACE-WITH-WRITE-CONCERN> # Optional.
  - name: readconcern
    value: <REPLACE-WITH-READ-CONCERN> # Optional.
  - name: operationTimeout
    value: <REPLACE-WITH-OPERATION-TIMEOUT> # Optional. default: "5s"
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

如果您想要使用 MongoDB 作为 Actor 存储，请在 yaml 上附上以下内容。

```yaml
  - name: actorStateStore
    value: "true"
```


## 元数据字段规范

| 字段               | 必填 | 详情                               | 示例                                                                    |
| ---------------- |:--:| -------------------------------- | --------------------------------------------------------------------- |
| host             | Y  | 要连接的主机                           | `"mongo-mongodb.default.svc.cluster.local:27017"`                     |
| username         | N  | 要连接的用户名                          | `"admin"`                                                             |
| password         | N  | 用户密码                             | `"password"`                                                          |
| databaseName     | N  | 要使用的数据库名称。 默认值为 `"daprStore"`    | `"daprStore"`                                                         |
| collectionName   | N  | 要使用的收藏名称 默认值为 `"daprCollection"` | `"daprCollection"`                                                    |
| writeconcern     | N  | 要使用的写入保证                         | `"majority"`                                                          |
| readconcern      | N  | 要使用的读取保证                         | `"majority"`, `"local"`,`"available"`, `"linearizable"`, `"snapshot"` |
| operationTimeout | N  | 操作超时。 默认为 `"5s"`                 | `"5s"`                                                                |

## 配置 MongoDB

{{< tabs "Self-Hosted" "Kubernetes" >}}

{{% codetab %}}
您可以使用 Docker 在本地运行 MongoDB ：

```
docker run --name some-mongo -d mongo
```

然后您可以使用 `localhost:27017` 与服务器交互。
{{% /codetab %}}

{{% codetab %}}
在 Kubernetes 上安装MongoDB 最简单的方法是使用 [Helm chart](https://github.com/helm/charts/tree/master/stable/mongodb)：

```
helm install mongo stable/mongodb
```

这将MongoDB安装到 `default` 命名空间。 要与 MongoDB 交互，请通过 `kubectl get svc mongo-mongodb` 找到 service。

例如，如果使用上面的例子安装，MongoDB 主机地址将是：

`mongo-mongodb.default.svc.cluster.local:27017`


按照屏幕指示获取 MongoDB 的 root 密码。 用户名默认是 `admin`。
{{% /codetab %}}

{{< /tabs >}}

## 相关链接
- [Dapr组件的基本格式]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) 以获取配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
