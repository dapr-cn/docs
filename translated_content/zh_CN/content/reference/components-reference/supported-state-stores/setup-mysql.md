---
type: docs
title: "MySQL"
linkTitle: "MySQL"
description: MySQL 状态存储组件的详细信息
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-mysql/"
---

## 配置

要设置 MySQL 状态储存，请创建一个类型为 `state.mysql`的组件。 请参阅[本指南]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}})，了解如何创建和应用状态存储配置。


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.mysql
  version: v1
  metadata:
  - name: connectionString
    value: "<CONNECTION STRING>"
  - name: schemaName
    value: "<SCHEMA NAME>"
  - name: tableName
    value: "<TABLE NAME>"
  - name: pemPath
    value: "<PEM PATH>"
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

如果您想要使用 MySQL 作为 Actor 存储，请在 yaml 上附上以下内容。

```yaml
  - name: actorStateStore
    value: "true"
```

## 元数据字段规范

| 字段               | 必填 | 详情                                                                  | Example                                                                                                                                                                                                                                                                  |
| ---------------- |:--:| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| connectionString | Y  | 用于连接到 MySQL 的连接字符串。 请不要将schema添加到连接字符串中。                            | [非SSL连接](#non-ssl-connection): `"<user>:<password>@tcp(<server>:3306)/?allowNativePasswords=true"`, [Enforced SSL 连接](#enforced-ssl-connection):  `"<user>:<password>@tcp(<server>:3306)/?allowNativePasswords=true&tls=custom"` |
| schemaName       | N  | 要使用的schema名称。 如果指定的schema不存在，将会自动创建。 默认值为 `"dapr_state_store"`      | `"custom_schema"`, `"dapr_schema"`                                                                                                                                                                                                                                       |
| tableName        | N  | 要使用的表名。 如果对应的表不存在，将被自动创建。 默认值为 `"state"`                            | `"table_name"`, `"dapr_state"`                                                                                                                                                                                                                                           |
| pemPath          | N  | 使用 [enforced SSL 连接](#enforced-ssl-connection) 时，指定要使用的 PEM 文件完整路径。 | `"/path/to/file.pem"`, `"C:\path\to\file.pem"`                                                                                                                                                                                                                        |

## 设置 MySQL

Dapr 可以使用任意的 MySQL 实例 - 无论它是运行在本地开发机上的、容器化的还是托管在云上的。

{{< tabs "Self-Hosted" "Kubernetes" "Azure" "AWS" "GCP" >}}

{{% codetab %}}
<!-- Self-Hosted -->

运行一个MySQL实例。 你可以在 Docker CE 中使用下面的命令运行一个本地的 MySQL 实例：

这个示例不是用于描述生产环境配置的，因为它使用明文设置密码，并且用户名使用了 MySQL 默认的root。

```bash
docker run --name dapr-mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=my-secret-pw -d mysql:latest
```

{{% /codetab %}}

{{% codetab %}}
<!-- Kubernetes -->

我们可以使用 [Helm](https://helm.sh/) 在 Kubernetes 集群中快速创建一个 MySQL 实例。 这种方法需要[安装Helm](https://github.com/helm/helm#install)。

1. 安装 MySQL 到您的集群。

    ```bash
    helm repo add bitnami https://charts.bitnami.com/bitnami
    helm install dapr-mysql bitnami/mysql
    ```

1. 执行`kubectl get pods`来查看现在正在集群中运行的MySQL容器。

1. 接下来，我们会获取到我们的MySQL密码，根据我们使用的操作系统不同，密码也会略有不同：
    - **Windows**: 运行 `[System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($(kubectl get secret --namespace default dapr-mysql -o jsonpath="{.data.mysql-root-password}")))` 然后复制输出的密码。

    - **Linux/MacOS**: 运行 `kubectl get secret --namespace default dapr-mysql -o jsonpath="{.data.mysql-root-password}" | base64 --decode` 并复制输出的密码。

1. 你可以使用密码你的构建连接串。

{{% /codetab %}}

{{% codetab %}}
<!-- Azure -->

[Azure MySQL](http://bit.ly/AzureMySQL)

如果你使用 [运行在 Azure 上的 MySQL](http://bit.ly/AzureMySQLSSL) 请查阅 Azure [关于SSL数据库连接的文档](http://bit.ly/MySQLSSL)，来了解有关如何下载必要凭证的信息。

{{% /codetab %}}

{{% codetab %}}
<!-- AWS -->

[AWS MySQL](https://aws.amazon.com/rds/mysql/)

{{% /codetab %}}

{{% codetab %}}
<!-- GCP -->

[GCP MySQL](https://cloud.google.com/sql/docs/mysql/features)

{{% /codetab %}}

{{< /tabs >}}

### 非 SSL 连接

用你的连接字符串替换 `<CONNECTION STRING>` 的值。 连接字符串是一个标准 MySQL 连接字符串。 例如, `"<user>:<password>@tcp(<server>:3306)/?allowNativePasswords=true"`。

### Enforced SSL 连接

如果你的服务器需要 SSL 加密，那么连接字符串必须以 `&tls=custom` 结尾。例如, `"<user>:<password>@tcp(<server>:3306)/?allowNativePasswords=true&tls=custom"`。 您必须使用完整的PEM文件路径替换 `<PEM PATH>` 。 与 MySQL 的连接至少需要1.2版本及以上的 TLS。

## 相关链接
- [Dapr组件的基本格式]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) 以获取配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
