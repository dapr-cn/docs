---
type: docs
title: "CockroachDB"
linkTitle: "CockroachDB"
description: CockroachDB 状态存储组件的详细信息
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-cockroachdb/"
---

## 创建 Dapr 组件

创建一个名为 `cockroachdb.yaml`的文件，粘贴以下文件并用您的连接字符串替换 `<CONNECTION STRING>` 值。 CockroachDB 的连接字符串遵循与 PostgreSQL 连接字符串相同的标准。 例如， `"host=localhost user=root port=26257 connect_timeout=10 database=dapr_test"`。 有关如何定义连接字符串的信息，请参阅有关数据库连接</a> 的 CockroachDB
文档。</p> 




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

| 字段               | 必填 | 详情                                 | 示例                                                                            |
| ---------------- |:--:| ---------------------------------- | ----------------------------------------------------------------------------- |
| connectionString | 是  | CockroachDB 的连接字符串                 | `"host=localhost user=root port=26257 connect_timeout=10 database=dapr_test"` |
| actorStateStore  | 否  | 是否将此状态存储给 Actor 使用。 默认值为 `"false"` | `"true"`, `"false"`                                                           |





## 设置 CockroachDB

{{< tabs "Self-Hosted" "Kubernetes" >}}

{{% codetab %}}

1. 运行 CockroachDB 的实例。 您可以在Docker CE 中运行一个本地的 CockroachDB 实例，并使用以下命令：
   
   此示例不描述生产配置，因为它设置了单节点集群，仅推荐用于本地环境。 
   
   

     ```bash
     docker run --name roach1 -p 26257:26257 cockroachdb/cockroach:v21.2.3 start-single-node --insecure
     ```


2. 为状态数据创建数据库。
   
   要在 CockroachDB 中创建新数据库，请在容器中运行以下 SQL 命令： 
   
   

    ```bash
    docker exec -it roach1 ./cockroach sql --insecure -e 'create database dapr_test'
    ```


{{% /codetab %}}

{{% codetab %}}

在 Kubernetes 上安装 CockroachDB 最简单的方法是使用 [CockroachDB Operator](https://github.com/cockroachdb/cockroach-operator)： 

{{% /codetab %}}

{{% /tabs %}}



## 相关链接

- [Dapr组件的基本格式]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) 以获取配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
