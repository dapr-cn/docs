---
type: docs
title: "指南：如何在应用程序之间共享状态"
linkTitle: "如何：在应用间共享状态"
weight: 400
description: "以不同的策略在不同的应用程序之间共享状态"
---

## 介绍

Dapr 为开发者提供了不同的方式来共享应用程序之间的状态。

在共享状态时，不同的体系结构可能有不同的需求。 例如，在一个场景中，您可能想要封装某个应用程序中的所有状态，并让 Dapr 管理您的访问权限。 在不同的场景中，您可能需要两个在相同状态下工作的应用程序能够获得和保存相同的键值(keys)。

要启用状态共享， Dapr 支持以下键前缀策略:

* **`Appid`** - 这是默认策略。 带有`appid`前缀的状态仅允许具有指定`appid`的应用程序管理。 所有的状态键都会以`appid`为前缀，并对应用进行限定。

* **`name`** - 此设置使用状态存储组件的名称作为前缀。 对于一个给定的状态存储，多个应用程序可以共享同一个状态。

* **`none`** - 此设置不使用前缀。 多个应用程序在不同的状态存储中共享状态。

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

下面的例子将向你展示上述支持的前缀策略下是如何进行状态检索的:

### `appid` (default)

一个id为`myApp`的Dapr应用程序正在将状态保存到一个名为`redis`的状态存储中:

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

一个id为`myApp`的Dapr应用程序正在将状态保存到一个名为`redis`的状态存储中:

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

一个id为`myApp`的Dapr应用程序正在将状态保存到一个名为`redis`的状态存储中:

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

