---
type: docs
title: "指南：查询状态"
linkTitle: "指南：查询状态"
weight: 250
description: "Use the Query API for querying state stores"
---

{{% alert title="alpha" color="warning" %}}
状态查询 API 处于 **alpha** 阶段。
{{% /alert %}}

With the state query API, you can retrieve, filter, and sort the key/value data stored in state store components. The query API is not a replacement for a complete query language.

即使状态存储是键/值存储， `value` 也可能是具有自己的层次结构、键和值的 JSON 文档。 The query API allows you to use those keys/values to retrieve corresponding documents.

## 查询状态

Submit query requests via HTTP POST/PUT or gRPC. The body of the request is the JSON map with 3 _optional_ entries:

- `filter`
- `sort`
- `page`

### `filter`

The `filter` specifies the query conditions in the form of a tree, where each node represents either unary or multi-operand operation.

支持以下操作：

| Operator | Operands    | 说明                                                           |
| -------- | ----------- | ------------------------------------------------------------ |
| `EQ`     | key:value   | key == value                                                 |
| `IN`     | key:[]value | key == value[0] OR key == value[1] OR ... OR key == value[n] |
| `AND`    | []operation | operation[0] AND operation[1] AND ... AND operation[n]       |
| `OR`     | []operation | operation[0] OR operation[1] OR ... OR operation[n]          |

The `key` in the operand is similar to the JSONPath notation. Each dot in the key indicates a nested JSON structure. For example, consider this structure:

```json
{
  "shape": {
    "name": "rectangle",
    "dimensions": {
      "height": 24,
      "width": 10
    },
    "color": {
      "name": "red",
      "code": "#FF0000"
    }
  }
}
```

To compare the value of the color code, the key will be `shape.color.code`.

If the `filter` section is omitted, the query returns all entries.

### `sort`

The `sort` is an ordered array of `key:order` pairs, where:

- `key` is a key in the state store
- `order` is an optional string indicating sorting order:
  - `"ASC"` for ascending
  - `"DESC"` for descending  
    If omitted, ascending order is the default.

### `page`

The `page` contains `limit` and `token` parameters.

- `limit` 设置页面大小。
- `token` is an iteration token returned by the component, used in subsequent queries.

Behind the scenes, this query request is translated into the native query language and executed by the state store component.

## 示例数据和查询

Let's look at some real examples, ranging from simple to complex.

As a dataset, consider a [collection of employee records](../query-api-examples/dataset.json) containing employee ID, organization, state, and city. Notice that this dataset is an array of key/value pairs, where:

- `key` is the unique ID
- `value` is the JSON object with employee record.

To better illustrate functionality, organization name (org) and employee ID (id) are a nested JSON person object.

Get started by creating an instance of MongoDB, which is your state store.

```bash
docker run -d --rm -p 27017:27017 --name mongodb mongo:5
```

Next, start a Dapr application. Refer to the [component configuration file](../query-api-examples/components/mongodb/mongodb.yml), which instructs Dapr to use MongoDB as its state store.

```bash
dapr run --app-id demo --dapr-http-port 3500 --components-path query-api-examples/components/mongodb
```

Populate the state store with the employee dataset, so you can query it later.

```bash
curl -X POST -H "Content-Type: application/json" -d @query-api-examples/dataset.json http://localhost:3500/v1.0/state/statestore
```

填充后，可以检查状态存储中的数据。 In the image below, a section of the MongoDB UI displays employee records.

<img src="/images/state-management-query-mongodb-dataset.png" width=500 alt="示例数据集" class="center">

每个条目都有 `_id` 成员作为串联的对象键， `value` 包含 JSON 记录的成员。

查询 API 允许您从此 JSON 结构中选择记录。

Now you can run the example queries.

### Example 1

First, find all employees in the state of California and sort them by their employee ID in descending order.

This is the [query](../query-api-examples/query1.json):
```json
{
    "filter": {
        "EQ": { "state": "CA" }
    },
    "sort": [
        {
            "key": "person.id",
            "order": "DESC"
        }
    ]
}
```

在 SQL 中，此查询的等效项是：

```sql
SELECT * FROM c WHERE
  state = "CA"
ORDER BY
  person.id DESC
```

使用以下命令执行查询：

{{< tabs "HTTP API (Bash)" "HTTP API (PowerShell)" >}}

{{% codetab %}}

```bash
curl -s -X POST -H "Content-Type: application/json" -d @query-api-examples/query1.json http://localhost:3500/v1.0-alpha1/state/statestore/query | jq .
```

{{% /codetab %}}

{{% codetab %}}

```powershell
Invoke-RestMethod -Method Post -ContentType 'application/json' -InFile query-api-examples/query1.json -Uri 'http://localhost:3500/v1.0-alpha1/state/statestore/query'
```

{{% /codetab %}}

{{< /tabs >}}

查询结果是按请求的顺序排列的匹配键/值对的数组：

```json
{
  "results": [
    {
      "key": "3",
      "data": {
        "person": {
          "org": "Finance",
          "id": 1071
        },
        "city": "Sacramento",
        "state": "CA"
      },
      "etag": "44723d41-deb1-4c23-940e-3e6896c3b6f7"
    },
    {
      "key": "7",
      "data": {
        "city": "San Francisco",
        "state": "CA",
        "person": {
          "id": 1015,
          "org": "Dev Ops"
        }
      },
      "etag": "0e69e69f-3dbc-423a-9db8-26767fcd2220"
    },
    {
      "key": "5",
      "data": {
        "state": "CA",
        "person": {
          "org": "Hardware",
          "id": 1007
        },
        "city": "Los Angeles"
      },
      "etag": "f87478fa-e5c5-4be0-afa5-f9f9d75713d8"
    },
    {
      "key": "9",
      "data": {
        "person": {
          "org": "Finance",
          "id": 1002
        },
        "city": "San Diego",
        "state": "CA"
      },
      "etag": "f5cf05cd-fb43-4154-a2ec-445c66d5f2f8"
    }
  ]
}
```

### Example 2

Now, find all employees from the "Dev Ops" and "Hardware" organizations.

This is the [query](../query-api-examples/query2.json):

```json
{
    "filter": {
        "IN": { "person.org": [ "Dev Ops", "Hardware" ] }
    }
}
```

在 SQL 中，此查询的等效项是：

```sql
SELECT * FROM c WHERE
  person.org IN ("Dev Ops", "Hardware")
```

使用以下命令执行查询：

{{< tabs "HTTP API (Bash)" "HTTP API (PowerShell)" >}}

{{% codetab %}}

```bash
curl -s -X POST -H "Content-Type: application/json" -d @query-api-examples/query2.json http://localhost:3500/v1.0-alpha1/state/statestore/query | jq .
```

{{% /codetab %}}

{{% codetab %}}

```powershell
Invoke-RestMethod -Method Post -ContentType 'application/json' -InFile query-api-examples/query2.json -Uri 'http://localhost:3500/v1.0-alpha1/state/statestore/query'
```

{{% /codetab %}}

{{< /tabs >}}

与前面的示例类似，结果是一个匹配键/值对的数组。

### Example 3

In this example, find:

- All employees from the "Dev Ops" department.
- Employees from the "Finance" departing residing in the states of Washington and California.

In addition, sort the results first by state in descending alphabetical order, then by employee ID in ascending order. Let's process up to 3 records at a time.

This is the [query](../query-api-examples/query3.json):

```json
{
    "filter": {
        "OR": [
            {
                "EQ": { "person.org": "Dev Ops" }
            },
            {
                "AND": [
                    {
                        "EQ": { "person.org": "Finance" }
                    },
                    {
                        "IN": { "state": [ "CA", "WA" ] }
                    }
                ]
            }
        ]
    },
    "sort": [
        {
            "key": "state",
            "order": "DESC"
        },
        {
            "key": "person.id"
        }
    ],
    "page": {
        "limit": 3
    }
}
```

在 SQL 中，此查询的等效项是：

```sql
SELECT * FROM c WHERE
  person.org = "Dev Ops" OR
  (person.org = "Finance" AND state IN ("CA", "WA"))
ORDER BY
  state DESC,
  person.id ASC
LIMIT 3
```

使用以下命令执行查询：

{{< tabs "HTTP API (Bash)" "HTTP API (PowerShell)" >}}

{{% codetab %}}

```bash
curl -s -X POST -H "Content-Type: application/json" -d @query-api-examples/query3.json http://localhost:3500/v1.0-alpha1/state/statestore/query | jq .
```

{{% /codetab %}}

{{% codetab %}}

```powershell
Invoke-RestMethod -Method Post -ContentType 'application/json' -InFile query-api-examples/query3.json -Uri 'http://localhost:3500/v1.0-alpha1/state/statestore/query'
```

{{% /codetab %}}

{{< /tabs >}}

成功执行后，状态存储将返回一个 JSON 对象，其中包含匹配记录列表和分页标记：

```json
{
  "results": [
    {
      "key": "1",
      "data": {
        "person": {
          "org": "Dev Ops",
          "id": 1036
        },
        "city": "Seattle",
        "state": "WA"
      },
      "etag": "6f54ad94-dfb9-46f0-a371-e42d550adb7d"
    },
    {
      "key": "4",
      "data": {
        "person": {
          "org": "Dev Ops",
          "id": 1042
        },
        "city": "Spokane",
        "state": "WA"
      },
      "etag": "7415707b-82ce-44d0-bf15-6dc6305af3b1"
    },
    {
      "key": "10",
      "data": {
        "person": {
          "org": "Dev Ops",
          "id": 1054
        },
        "city": "New York",
        "state": "NY"
      },
      "etag": "26bbba88-9461-48d1-8a35-db07c374e5aa"
    }
  ],
  "token": "3"
}
```

分页标记在 [后续查询](../query-api-examples/query3-token.json) 中"按原样"使用，以获取下一批记录：

```json
{
    "filter": {
        "OR": [
            {
                "EQ": { "person.org": "Dev Ops" }
            },
            {
                "AND": [
                    {
                        "EQ": { "person.org": "Finance" }
                    },
                    {
                        "IN": { "state": [ "CA", "WA" ] }
                    }
                ]
            }
        ]
    },
    "sort": [
        {
            "key": "state",
            "order": "DESC"
        },
        {
            "key": "person.id"
        }
    ],
    "page": {
        "limit": 3,
        "token": "3"
    }
}
```

{{< tabs "HTTP API (Bash)" "HTTP API (PowerShell)" >}}

{{% codetab %}}

```bash
curl -s -X POST -H "Content-Type: application/json" -d @query-api-examples/query3-token.json http://localhost:3500/v1.0-alpha1/state/statestore/query | jq .
```

{{% /codetab %}}

{{% codetab %}}

```powershell
Invoke-RestMethod -Method Post -ContentType 'application/json' -InFile query-api-examples/query3-token.json -Uri 'http://localhost:3500/v1.0-alpha1/state/statestore/query'
```

{{% /codetab %}}

{{< /tabs >}}

此查询的结果是：

```json
{
  "results": [
    {
      "key": "9",
      "data": {
        "person": {
          "org": "Finance",
          "id": 1002
        },
        "city": "San Diego",
        "state": "CA"
      },
      "etag": "f5cf05cd-fb43-4154-a2ec-445c66d5f2f8"
    },
    {
      "key": "7",
      "data": {
        "city": "San Francisco",
        "state": "CA",
        "person": {
          "id": 1015,
          "org": "Dev Ops"
        }
      },
      "etag": "0e69e69f-3dbc-423a-9db8-26767fcd2220"
    },
    {
      "key": "3",
      "data": {
        "person": {
          "org": "Finance",
          "id": 1071
        },
        "city": "Sacramento",
        "state": "CA"
      },
      "etag": "44723d41-deb1-4c23-940e-3e6896c3b6f7"
    }
  ],
  "token": "6"
}
```

这样，您可以更新查询中的分页令牌并循环访问结果，直到不再返回任何记录。

## 限制

状态查询 API 具有以下限制：

- To query actor states stored in a state store, you need to use the query API for the specific database. 查看 [查询 actor 状态]({{< ref "state-management-overview.md#querying-actor-state" >}}).
- The API does not work with Dapr [encrypted state stores]({{< ref howto-encrypt-state >}}) capability. 由于加密是由 Dapr 运行时完成并存储为加密数据，因此这有效地阻止了服务器端查询。

您可以在 [相关链接]({{< ref "#related-links" >}}) 部分中找到更多信息。

## 相关链接

- Refer to the [query API reference]({{< ref "state_api.md#state-query" >}}).
- See the [state store components that implement query support]({{< ref supported-state-stores.md >}}).
- View the [state store query API implementation guide](https://github.com/dapr/components-contrib/blob/master/state/Readme.md#implementing-state-query-api).
- See how to [query Redis state store]({{< ref "setup-redis.md#querying-json-objects" >}}).
