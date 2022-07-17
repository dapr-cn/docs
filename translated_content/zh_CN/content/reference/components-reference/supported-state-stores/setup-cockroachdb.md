---
type: docs
title: "CockroachDB"
linkTitle: "CockroachDB"
description: Detailed information on the CockroachDB state store component
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-cockroachdb/"
---

## 创建 Dapr 组件

Create a file called `cockroachdb.yaml`, paste the following and replace the `<CONNECTION STRING>` value with your connection string. The connection string for CockroachDB follow the same standard for PostgreSQL connection string. For example, `"host=localhost user=root port=26257 connect_timeout=10 database=dapr_test"`. See the CockroachDB [documentation on database connections](https://www.cockroachlabs.com/docs/stable/connect-to-the-database.html) for information on how to define a connection string.


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.cockroachdb
  version: v1
  metadata:
  - name: connectionString
    value: "<CONNECTION STRING>"
```

## 元数据字段规范

| 字段               | 必填 | 详情                                    | 示例                                                                            |
| ---------------- |:--:| ------------------------------------- | ----------------------------------------------------------------------------- |
| connectionString | Y  | The connection string for CockroachDB | `"host=localhost user=root port=26257 connect_timeout=10 database=dapr_test"` |
| actorStateStore  | N  | 是否将此状态存储给 Actor 使用。 默认值为 `"false"`    | `"true"`, `"false"`                                                           |


## Setup CockroachDB

{{< tabs "Self-Hosted" "Kubernetes" >}}

{{% codetab %}}

1. Run an instance of CockroachDB. You can run a local instance of CockroachDB in Docker CE with the following command:

     This example does not describe a production configuration because it sets a single-node cluster, it's only recommend for local environment.

     ```bash
     docker run --name roach1 -p 26257:26257 cockroachdb/cockroach:v21.2.3 start-single-node --insecure
     ```

2. 为状态数据创建数据库。

    To create a new database in CockroachDB, run the following SQL command inside container:

    ```bash
    docker exec -it roach1 ./cockroach sql --insecure -e 'create database dapr_test'
    ```
{{% /codetab %}}

{{% codetab %}}
The easiest way to install CockroachDB on Kubernetes is by using the [CockroachDB Operator](https://github.com/cockroachdb/cockroach-operator):
{{% /codetab %}}

{{% /tabs %}}

## 相关链接
- [Dapr组件的基本格式]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) 以获取配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
