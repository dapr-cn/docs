---
type: docs
title: "How-To: Share state between applications"
linkTitle: "How-To: Share state between applications"
weight: 400
description: "Choose different strategies for sharing state between different applications"
---

## 介绍

Dapr 为开发者提供了不同的方式来共享应用程序之间的状态。

在共享状态时，不同的体系结构可能有不同的需求。 例如，在一个场景中，您可能想要封装某个应用程序中的所有状态，并让 Dapr 管理您的访问权限。 在不同的场景中，您可能需要两个在相同状态下工作的应用程序能够获得和保存相同的键值(keys)。

要启用状态共享， Dapr 支持以下键前缀策略:

* **`Appid`** - 这是默认策略。 带有`appid`前缀的状态仅允许具有指定`appid`的应用程序管理。 所有的状态键都会以`appid`为前缀，并对应用进行限定。

* **`name`** - 此设置使用状态存储组件的名称作为前缀。 对于一个给定的状态存储，多个应用程序可以共享同一个状态。

* **`none`** - This setting uses no prefixing. Multiple applications share state across different state stores. Multiple applications share state across different state stores.

## Specifying a state prefix strategy

To specify a prefix strategy, add a metadata key named `keyPrefix` on a state component:

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

## Examples

The following examples will show you how state retrieval looks like with each of the supported prefix strategies:

### `appid` (default)

A Dapr application with app id `myApp` is saving state into a state store named `redis`:

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

The key will be saved as `myApp||darth`.

### `name`

A Dapr application with app id `myApp` is saving state into a state store named `redis`:

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

The key will be saved as `redis||darth`.

### `none`

A Dapr application with app id `myApp` is saving state into a state store named `redis`:

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

The key will be saved as `darth`.

