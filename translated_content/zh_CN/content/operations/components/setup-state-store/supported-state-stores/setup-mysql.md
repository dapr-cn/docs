---
type: docs
title: "MySQL"
linkTitle: "MySQL"
description: MySQL 状态存储组件的详细信息
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
以上示例将 Secret 明文存储。 更推荐的方式是使用 Secret 组件，参考 [此处]({{< ref component-secrets.md >}}})的说明。
{{% /alert %}}

如果您想要使用 MySQL 作为 Actor 存储，请在 yaml 上附上以下内容。

```yaml
  - name: actorStateStore
    value: "true"
```

## 元数据字段规范

| 字段               | 必填 | 详情                                                                                                                                                                   | 示例                                                                                                                                                                                                                                                                       |
| ---------------- |:--:| -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| connectionString | 是  | 用于连接到 MySQL 的连接串。 请不要将schema添加到连接串中。                                                                                                                                 | [非SSL连接](#non-ssl-connection): `"<user>:<password>@tcp(<server>:3306)/?allowNativePasswords=true"`, [Enforced SSL 连接](#enforced-ssl-connection):  `"<user>:<password>@tcp(<server>:3306)/?allowNativePasswords=true&tls=custom"` |
| schemaName       | N  | The schema name to use. Will be created if schema does not exist. The schema name to use. Will be created if schema does not exist. Defaults to `"dapr_state_store"` | `"custom_schema"`, `"dapr_schema"`                                                                                                                                                                                                                                       |
| tableName        | N  | The table name to use. The table name to use. Will be created if table does not exist. Defaults to `"state"` Defaults to `"state"`                                   | `"table_name"`, `"dapr_state"`                                                                                                                                                                                                                                           |
| pemPath          | N  | Full path to the PEM file to use for [enforced SSL Connection](#enforced-ssl-connection)                                                                             | `"/path/to/file.pem"`, `"C:\path\to\file.pem"`                                                                                                                                                                                                                        |

## Setup MySQL

Dapr can use any MySQL instance - containerized, running on your local dev machine, or a managed cloud service.

{{< tabs "Self-Hosted" "Kubernetes" "Azure" "AWS" "GCP" >}}

{{% codetab %}}
<!-- Self-Hosted -->

Run an instance of MySQL. Run an instance of MySQL. You can run a local instance of MySQL in Docker CE with the following command:

This example does not describe a production configuration because it sets the password in plain text and the user name is left as the MySQL default of "root".

```bash
docker run --name dapr-mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=my-secret-pw -d mysql:latest
```

{{% /codetab %}}

{{% codetab %}}
<!-- Kubernetes -->

We can use [Helm](https://helm.sh/) to quickly create a MySQL instance in our Kubernetes cluster. This approach requires [Installing Helm](https://github.com/helm/helm#install). This approach requires [Installing Helm](https://github.com/helm/helm#install).

1. Install MySQL into your cluster.

    ```bash
    helm repo add bitnami https://charts.bitnami.com/bitnami
    helm install dapr-mysql bitnami/mysql
    ```

1. Run `kubectl get pods` to see the MySQL containers now running in your cluster.

1. Next, we'll get our password, which is slightly different depending on the OS we're using:
    - **Windows**: Run `[System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($(kubectl get secret --namespace default dapr-mysql -o jsonpath="{.data.mysql-root-password}")))` and copy the outputted password.

    - **Linux/MacOS**: Run `kubectl get secret --namespace default dapr-mysql -o jsonpath="{.data.mysql-root-password}" | base64 --decode` and copy the outputted password.

1. With the password you can construct your connection string.

{{% /codetab %}}

{{% codetab %}}
<!-- Azure -->

[Azure MySQL](http://bit.ly/AzureMySQL)

If you are using [MySQL on Azure](http://bit.ly/AzureMySQLSSL) see the Azure [documentation on SSL database connections](http://bit.ly/MySQLSSL), for information on how to download the required certificate.

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

### Non SSL connection

Replace the `<CONNECTION STRING>` value with your connection string. The connection string is a standard MySQL connection string. For example, `"<user>:<password>@tcp(<server>:3306)/?allowNativePasswords=true"`. The connection string is a standard MySQL connection string. For example, `"<user>:<password>@tcp(<server>:3306)/?allowNativePasswords=true"`.

### Enforced SSL connection

If your server requires SSL your connection string must end with `&tls=custom` for example, `"<user>:<password>@tcp(<server>:3306)/?allowNativePasswords=true&tls=custom"`. You must replace the `<PEM PATH>` with a full path to the PEM file. The connection to MySQL will require a minimum TLS version of 1.2. You must replace the `<PEM PATH>` with a full path to the PEM file. The connection to MySQL will require a minimum TLS version of 1.2.

## 相关链接
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) for instructions on configuring state store components
- [State management building block]({{< ref state-management >}})
