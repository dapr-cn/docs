---
type: docs
title: "操作方法：查询状态"
linkTitle: "操作方法：查询状态"
weight: 250
description: "使用查询API查询状态存储"
---

{{% alert title="alpha" color="warning" %}}
状态查询 API 处于 **alpha** 阶段。
{{% /alert %}}

使用状态查询 API，您可以检索、过滤和排序存储在状态存储组件中的键/值数据。 查询 API 不能替代完整的查询语言。

即使状态存储是键/值存储， `value` 也可能是具有自己的层次结构、键和值的 JSON 文档。 查询 API 允许您使用这些键和值来检索相应的文档。

## Querying the state

您可以通过 HTTP POST/PUT 或 gRPC 提交查询请求。 请求的正文是包含 3 个条目的 JSON 映射:

- `filter`
- `sort`
- `page`

### `filter`

`filter` 指定查询条件的形式，其中每个节点代表一元或多元操作。

支持以下操作：

| 运算符   | 操作数         | 说明                                                           |
| ----- | ----------- | ------------------------------------------------------------ |
| `EQ`  | key:value   | key == value                                                 |
| `NEQ` | key:value   | key != value                                                 |
| `GT`  | key:value   | key > value                                                  |
| `GTE` | key:value   | key >= value                                                 |
| `LT`  | key:value   | key < value                                                  |
| `LTE` | key:value   | key <= value                                                 |
| `IN`  | key:[]value | key == value[0] OR key == value[1] OR ... OR key == value[n] |
| `AND` | []operation | operation[0] AND operation[1] AND ... AND operation[n]       |
| `OR`  | []operation | operation[0] OR operation[1] OR ... OR operation[n]          |

操作数中的`key`与JSONPath表示法类似。 键中的每个点表示一个嵌套的JSON结构。 例如，考虑这个结构：

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

要比较颜色代码的值，键将是`shape.color.code`。

如果省略 `filter` 部分，则查询将返回所有条目。

### `sort`

`sort` 是一个有序数组，其中包含 `key:order` 对，其中：

- `key` 是状态存储中的键
- `order` 是一个可选字符串，表示排序顺序：
  - `"ASC"` 表示升序
  - `"DESC"`用于降序  
    如果省略，升序是默认值。

### `page`

`page` 包含 `limit` 和 `token` 参数。

- `limit` 设置页面大小。
- `token` 是组件返回的迭代令牌，用于后续查询。

在后台，此查询请求被转换为本机查询语言，并由状态存储组件执行。

## 示例数据和查询

让我们看一些真实例子，从简单到复杂。

作为数据集，考虑包含员工记录的[集合](../query-api-examples/dataset.json)，其中包含员工 ID、组织、州和城市。 请注意，此数据集是一个键/值对数组，其中：

- `key` 是唯一的 ID
- `value` 是具有员工记录的 JSON 对象。

为了更好地说明功能，组织名称（org）和员工ID（id）作为嵌套的JSON人员对象。

首先，您需要创建 MongoDB 的实例，这是您的状态存储。

```bash
docker run -d --rm -p 27017:27017 --name mongodb mongo:5
```

接下来，启动一个 Dapr 应用程序。 请参阅 [组件配置文件](../query-api-examples/components/mongodb/mongodb.yml)，其中指示 Dapr 使用 MongoDB 作为其状态存储。

```bash
dapr run --app-id demo --dapr-http-port 3500 --resources-path query-api-examples/components/mongodb
```

使用员工数据集填充状态存储，以便以后可以查询它。

```bash
curl -X POST -H "Content-Type: application/json" -d @query-api-examples/dataset.json http://localhost:3500/v1.0/state/statestore
```

填充后，可以检查状态存储中的数据。 在下面的图像中，MongoDB UI的一部分显示员工记录。

<img src="/images/state-management-query-mongodb-dataset.png" width=500 alt="示例数据集" class="center">

每个条目都有 `_id` 成员作为串联的对象键， `value` 包含 JSON 记录的成员。

查询 API 允许您从此 JSON 结构中选择记录。

现在，您可以运行示例查询。

### 示例 1

首先，找到加利福尼亚州的所有员工，并按其员工 ID 降序排序。

这是 [查询](../query-api-examples/query1.json)：
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

### 示例 2

现在，让我们查找"Dev Ops"和"Hardware"组织中的所有员工。

这是 [查询](../query-api-examples/query2.json):

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

### 示例 3

在这个示例中，查找：

- "Dev Ops" 部门的所有员工。
- 来自“Finance”部门的员工居住在华盛顿州和加利福尼亚州。

此外，让我们先按州（按字母降序）对结果进行排序，然后按员工 ID（升序）对结果进行排序。 另外，让我们一次最多处理 3 条记录。

这是 [查询](../query-api-examples/query3.json):

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

## 局限性

状态查询 API 具有以下限制：

- 要查询存储在状态存储中的 actor 状态，您需要对特定数据库使用查询 API。 查看 [查询 actor 状态]({{< ref "state-management-overview.md#querying-actor-state" >}}).
- 该 API 不适用于 Dapr [加密状态存储]({{< ref howto-encrypt-state >}})功能。 由于加密是由 Dapr 运行时完成并存储为加密数据，因此这有效地阻止了服务器端查询。

您可以在 [相关链接]({{< ref "#related-links" >}}) 部分中找到更多信息。

## 相关链接

- 请参阅 [查询 API 参考]({{< ref "state_api.md#state-query" >}}).
- 请参阅 [实现查询支持的状态存储组件]({{< ref supported-state-stores.md >}}).
- 查看 [状态存储查询 API 实现指南](https://github.com/dapr/components-contrib/blob/master/state/README.md#implementing-state-query-api).
- 了解如何 [查询 Redis 状态存储]({{< ref "setup-redis.md#querying-json-objects" >}}).
