---
type: docs
title: 指南：如何在应用程序之间共享状态
linkTitle: 指南：如何在应用程序之间共享状态
weight: 400
description: 学习在不同应用程序之间共享状态的策略
---

Dapr 为开发者提供了不同的方式来共享应用程序之间的状态。

在共享状态时，不同的体系结构可能有不同的需求。 在一个场景中，您可能想要：

- 在给定应用程序中封装所有状态
- 让 Dapr 为您管理访问权限

在不同的场景中，您可能需要两个在相同状态下工作的应用程序能够获得和保存相同的键值(keys)。

要启用状态共享， Dapr 支持以下键前缀策略:

| 键前缀         | 说明                                                                                                                                                                                                                                                                                          |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `appid`     | 默认策略允许您只能通过指定的 `appid` 来管理状态。 所有状态键都将以`appid`作为前缀，并且仅适用于应用程序。                                                                                                                                                                                                                               |
| `name`      | 使用状态存储组件的名称作为前缀。 对于一个给定的状态存储，多个应用程序可以共享同一个状态。                                                                                                                                                                                                                                               |
| `namespace` | 如果设置了此设置，将使用配置的命名空间前缀`appid`键，从而产生一个针对特定命名空间范围的键。 这允许具有相同`appid`的不同命名空间中的应用程序重用相同的状态存储。 如果命名空间未配置，则设置将回退到`appid`策略。 有关 Dapr 中命名空间的更多信息，请参阅 [操作方法：将组件范围限定为一个或多个应用程序]({{< ref component-scopes.md >}}) |
| `无验证`       | 不使用前缀。 多个应用程序在不同的状态存储中共享状态。                                                                                                                                                                                                                                                                 |

## 指定状态前缀策略

要指定前缀策略，请在状态组件上添加一个名为 `keyPrefix` 的元数据键:

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

下面的例子将向你展示上述支持的前缀策略下是如何进行状态检索的.

### `appid`（默认值）

在下面的示例中，一个ID为`myApp`的Dapr应用程序正在将状态保存到名为`redis`的状态存储中：

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

该键将被保存为 `myApp||darth`。

### `namespace`

一个在命名空间 `production` 中运行的 Dapr 应用程序，使用应用程序 ID `myApp` 将状态保存到名为 `redis` 的状态存储中：

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

该键将被保存为 `production.myApp||darth`。

### `name`

在下面的示例中，一个ID为`myApp`的Dapr应用程序正在将状态保存到名为`redis`的状态存储中：

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

该键将被保存为 `redis||darth`。

### `无验证`

在下面的示例中，一个ID为`myApp`的Dapr应用程序正在将状态保存到名为`redis`的状态存储中：

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

该键将被保存为 `darth`。
