---
type: docs
title: "指南：如何在应用程序之间共享状态"
linkTitle: "指南：如何在应用程序之间共享状态"
weight: 400
description: "Learn the strategies for sharing state between different applications"
---

Dapr provides different ways to share state between applications.

在共享状态时，不同的体系结构可能有不同的需求。 In one scenario, you may want to:

- Encapsulate all state within a given application
- Have Dapr manage the access for you

In a different scenario, you may need two applications working on the same state to get and save the same keys.

要启用状态共享， Dapr 支持以下键前缀策略:

| Key prefixes | 说明                                                                                                                          |
| ------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `appid`      | The default strategy allowing you to manage state only by the app with the specified `appid`. 所有的状态键都会以`appid`为前缀，并对应用进行限定。 |
| `name`       | Uses the name of the state store component as the prefix. 对于一个给定的状态存储，多个应用程序可以共享同一个状态。                                      |
| `none`       | Uses no prefixing. 多个应用程序在不同的状态存储中共享状态。                                                                                     |

## 指定状态前缀策略

要指定前缀策略，请在状态组件上添加一个名为`keyPrefix`的元数据键:

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

The following examples demonstrate what state retrieval looks like with each of the supported prefix strategies.

### `appid` (default)

In the example below, a Dapr application with app id `myApp` is saving state into a state store named `redis`:

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

该键将被保存为`myApp||darth`。

### `name`

In the example below, a Dapr application with app id `myApp` is saving state into a state store named `redis`:

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

该键将被保存为`redis||darth`。

### `none`

In the example below, a Dapr application with app id `myApp` is saving state into a state store named `redis`:

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

该键将被保存为`darth`。