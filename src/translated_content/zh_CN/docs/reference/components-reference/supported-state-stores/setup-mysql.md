---
type: docs
title: "MySQL & MariaDB"
linkTitle: "MySQL & MariaDB"
description: MySQL 状态存储组件的详细信息
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-mysql/"
---

## 组件格式

MySQL 状态存储组件允许连接到 MySQL 和 MariaDB 数据库。在本文档中，"MySQL" 代表这两个数据库。

要设置 MySQL 状态存储，请创建一个类型为 `state.mysql` 的组件。请参考[本指南]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}})了解如何创建和应用状态存储配置。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
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
  - name: timeoutInSeconds
    value: "30"
  - name: pemPath # 如果未提供 pemContents，则为必需。pem 文件的路径。
    value: "<PEM PATH>"
  - name: pemContents # 如果未提供 pemPath，则为必需。pem 值。
    value: "<PEM CONTENTS>"    
# 如果希望将 MySQL & MariaDB 用作 actor 的状态存储，请取消注释此行（可选）
  #- name: actorStateStore
  #  value: "true"
```

{{% alert title="警告" color="warning" %}}
上述示例中，secret 使用了明文字符串。建议使用 secret 存储来存储 secret，如[此处]({{< ref component-secrets.md >}})所述。
{{% /alert %}}

如果希望将 MySQL 用作 actor 存储，请在 yaml 中添加以下配置。

```yaml
  - name: actorStateStore
    value: "true"
```

## 规格元数据字段

| 字段                | 必需 | 详情 | 示例 |
|--------------------|:----:|------|------|
| `connectionString`   | Y    | 连接到 MySQL 的连接字符串。不要在连接字符串中添加 schema | [非 SSL 连接](#non-ssl-connection): `"<user>:<password>@tcp(<server>:3306)/?allowNativePasswords=true"`，[强制 SSL 连接](#enforced-ssl-connection):  `"<user>:<password>@tcp(<server>:3306)/?allowNativePasswords=true&tls=custom"`|
| `schemaName`         | N    | 要使用的 schema 名称。如果 schema 不存在，将会创建。默认为 `"dapr_state_store"`  | `"custom_schema"`，`"dapr_schema"` |
| `tableName`          | N    | 要使用的表名。如果表不存在，将会创建。默认为 `"state"` | `"table_name"`，`"dapr_state"` |
| `timeoutInSeconds`   | N    | 所有数据库操作的超时时间。默认为 `20` | `30` |
| `pemPath`            | N    | 用于[强制 SSL 连接](#enforced-ssl-connection)的 PEM 文件的完整路径，如果未提供 pemContents，则为必需。在 K8s 环境中不能使用 | `"/path/to/file.pem"`，`"C:\path\to\file.pem"` |
| `pemContents`        | N    | 用于[强制 SSL 连接](#enforced-ssl-connection)的 PEM 文件内容，如果未提供 pemPath，则为必需。可以在 K8s 环境中使用 | `"pem value"` |
| `cleanupIntervalInSeconds` | N | 清理具有过期 TTL 的行的间隔时间（以秒为单位）。默认值：`3600`（即 1 小时）。将此值设置为 <=0 可禁用定期清理。 | `1800`，`-1`
| `actorStateStore`    | N    | 将此状态存储视为 actor。默认为 `"false"` | `"true"`，`"false"`

## 设置 MySQL

Dapr 可以使用任何 MySQL 实例 - 无论是容器化的 MySQL 实例、在本地开发机器上运行的，还是云服务提供的 MySQL 实例。

{{< tabs "Self-Hosted" "Kubernetes" "Azure" "AWS" "GCP" >}}

{{% codetab %}}
<!-- Self-Hosted -->

运行一个 MySQL 实例。您可以使用以下命令在 Docker CE 中运行本地 MySQL 实例：

此示例不适用于生产环境，因为它以明文设置密码，并且用户名保留为 MySQL 默认的 "root"。

```bash
docker run --name dapr-mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=my-secret-pw -d mysql:latest
```

{{% /codetab %}}

{{% codetab %}}
<!-- Kubernetes -->

我们可以使用 [Helm](https://helm.sh/) 在我们的 Kubernetes 集群中快速创建一个 MySQL 实例。此方法需要[安装 Helm](https://github.com/helm/helm#install)。

1. 将 MySQL 安装到您的集群中。

    ```bash
    helm repo add bitnami https://charts.bitnami.com/bitnami
    helm install dapr-mysql bitnami/mysql
    ```

1. 运行 `kubectl get pods` 以查看现在在集群中运行的 MySQL 容器。

1. 接下来，我们将获取密码，这取决于我们使用的操作系统：
    - **Windows**: 运行 `[System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($(kubectl get secret --namespace default dapr-mysql -o jsonpath="{.data.mysql-root-password}")))` 并复制输出的密码。

    - **Linux/MacOS**: 运行 `kubectl get secret --namespace default dapr-mysql -o jsonpath="{.data.mysql-root-password}" | base64 --decode` 并复制输出的密码。

1. 使用密码构建您的连接字符串。

{{% /codetab %}}

{{% codetab %}}
<!-- Azure -->

[Azure MySQL](http://bit.ly/AzureMySQL)

如果您使用 [Azure 上的 MySQL](http://bit.ly/AzureMySQLSSL)，请参阅 Azure [关于 SSL 数据库连接的文档](http://bit.ly/MySQLSSL)，了解如何下载所需的证书。

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

将 `<CONNECTION STRING>` 值替换为您的连接字符串。连接字符串是标准的 MySQL 连接字符串。例如，`"<user>:<password>@tcp(<server>:3306)/?allowNativePasswords=true"`。

### 强制 SSL 连接

如果您的服务器需要 SSL，您的连接字符串必须以 `&tls=custom` 结尾，例如，`"<user>:<password>@tcp(<server>:3306)/?allowNativePasswords=true&tls=custom"`。您必须将 `<PEM PATH>` 替换为 PEM 文件的完整路径。连接到 MySQL 将需要最低 TLS 版本为 1.2。

### TTL 和清理

此状态存储支持 Dapr 存储的记录的[生存时间 (TTL)]({{< ref state-store-ttl.md >}})。使用 Dapr 存储数据时，您可以设置 `ttlInSeconds` 元数据属性以指示数据何时应被视为 "过期"。

由于 MySQL 没有内置的 TTL 支持，这在 Dapr 中通过在状态表中添加一列来实现，指示数据何时应被视为 "过期"。即使数据仍然物理存储在数据库中，"过期" 的记录也不会返回给调用者。后台 "垃圾收集器" 定期扫描状态表以删除过期的行。

删除过期记录的间隔时间由 `cleanupIntervalInSeconds` 元数据属性设置，默认为 3600 秒（即 1 小时）。

- 较长的间隔需要较少频繁地扫描过期行，但可能需要更长时间存储过期记录，可能需要更多的存储空间。如果您计划在状态表中存储许多记录，并且 TTL 较短，请考虑将 `cleanupIntervalInSeconds` 设置为较小的值，例如 `300`（300 秒或 5 分钟）。
- 如果您不打算在 Dapr 和 MySQL 状态存储中使用 TTL，您应考虑将 `cleanupIntervalInSeconds` 设置为 <= 0（例如 `0` 或 `-1`）以禁用定期清理并减少数据库的负载。

## 相关链接
- [Dapr 组件的基本 schema]({{< ref component-schema >}})
- 阅读[本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}})以获取配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
