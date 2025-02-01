---
type: docs
title: "操作指南：在应用程序之间共享状态"
linkTitle: "操作指南：在应用程序之间共享状态"
weight: 400
description: "了解在不同应用程序之间共享状态的策略"
---

Dapr 提供了多种在应用程序之间共享状态的方法。

不同的架构在共享状态时可能有不同的需求。在某些情况下，您可能会希望：

- 在特定应用程序中封装所有状态
- 让 Dapr 为您管理状态访问

在其他情况下，您可能需要两个应用程序在同一状态上进行操作，以便获取和保存相同的键。

为了实现状态共享，Dapr 支持以下键前缀策略：

| 键前缀 | 描述 |
| ------------ | ----------- |
| `appid` | 默认策略，允许您仅通过指定 `appid` 的应用程序管理状态。所有状态键将以 `appid` 为前缀，并限定于该应用程序。 |
| `name` | 使用状态存储组件的名称作为前缀。多个应用程序可以共享同一状态存储中的相同状态。 |
| `namespace` | 如果设置了命名空间，此策略会将 `appid` 键前缀替换为配置的命名空间，生成一个限定于该命名空间的键。这允许在不同命名空间中具有相同 `appid` 的应用程序重用相同的状态存储。如果未配置命名空间，则会回退到 `appid` 策略。有关 Dapr 中命名空间的更多信息，请参见 [操作指南：将组件限定到一个或多个应用程序]({{< ref component-scopes.md >}}) |
| `none` | 不使用任何前缀。多个应用程序可以在不同的状态存储中共享状态，而不受特定前缀的限制。 |

## 指定状态前缀策略

要指定前缀策略，请在状态组件上添加名为 `keyPrefix` 的元数据键：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
  namespace: production
spec:
  type: state.redis
  version: v1
  metadata:
  - name: keyPrefix
    value: <key-prefix-strategy>
```

## 示例

以下示例演示了使用每种支持的前缀策略进行状态检索的情况。

### `appid`（默认）

在下面的示例中，具有应用程序 ID `myApp` 的 Dapr 应用程序正在将状态保存到名为 `redis` 的状态存储中：

```shell
curl -X POST http://localhost:3500/v1.0/state/redis \
  -H "Content-Type: application/json"
  -d '[
        {
          "key": "darth",
          "value": "nihilus"
        }
      ]'
```

键将被保存为 `myApp||darth`。

### `namespace`

在命名空间 `production` 中运行的具有应用程序 ID `myApp` 的 Dapr 应用程序正在将状态保存到名为 `redis` 的状态存储中：

```shell
curl -X POST http://localhost:3500/v1.0/state/redis \
  -H "Content-Type: application/json"
  -d '[
        {
          "key": "darth",
          "value": "nihilus"
        }
      ]'
```

键将被保存为 `production.myApp||darth`。

### `name`

在下面的示例中，具有应用程序 ID `myApp` 的 Dapr 应用程序正在将状态保存到名为 `redis` 的状态存储中：

```shell
curl -X POST http://localhost:3500/v1.0/state/redis \
  -H "Content-Type: application/json"
  -d '[
        {
          "key": "darth",
          "value": "nihilus"
        }
      ]'
```

键将被保存为 `redis||darth`。

### `none`

在下面的示例中，具有应用程序 ID `myApp` 的 Dapr 应用程序正在将状态保存到名为 `redis` 的状态存储中：

```shell
curl -X POST http://localhost:3500/v1.0/state/redis \
  -H "Content-Type: application/json"
  -d '[
        {
          "key": "darth",
          "value": "nihilus"
        }
      ]'
```

键将被保存为 `darth`。