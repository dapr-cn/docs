---
type: docs
title: "更新组件"
linkTitle: "更新组件"
weight: 300
description: "更新应用程序使用的已部署组件"
---

对应用程序使用的现有已部署组件进行更新时，Dapr 不会自动更新该组件。 Dapr边车需要重新启动才能获得最新版本的组件。 如何做到这一点取决于托管环境。

## Kubernetes

在 Kubernetes 中运行时，更新组件的过程包括两个步骤：

1. 将新组件 YAML 应用到所需的命名空间
2. 在您的部署上执行 [推出重新启动操作](https://kubernetes.io/docs/reference/kubectl/cheatsheet/#updating-resources) 以获取最新组件

## 自托管

在自托管模式下运行时，更新组件的过程涉及停止 `daprd` 进程并再次启动它以获取最新组件的单个步骤。

## 深入阅读
- [组件概念]({{< ref components-concept.md >}})
- [组件定义中的引用秘密]({{< ref component-secrets.md >}})
- [支持的状态存储]({{< ref supported-state-stores >}})
- [支持的发布/订阅消息代理]({{< ref supported-pubsub >}})
- [支持的秘密存储]({{< ref supported-secret-stores >}})
- [Supported bindings]({{< ref supported-bindings >}})
- [设置组件作用域]({{< ref component-scopes.md >}})
