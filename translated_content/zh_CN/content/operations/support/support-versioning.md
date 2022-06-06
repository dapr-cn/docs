---
type: docs
title: "版本控制策略"
linkTitle: "版本控制"
weight: 1000
description: "Dapr 的版本控制策略"
---

## 介绍
Dapr 专为将来对运行时、API 和具有版本管理方案的组件进行更改而设计。 本主题描述了API、组件等清单和 Github 存储库的版本管理方案和策略。

## 版本控制
版本控制是为计算机软件的唯一状态分配唯一版本名称或唯一版本号的过程。
- 版本控制提供了兼容性、显式变更控制和处理变化，特别是破坏性变更。
- Dapr 努力做到向后兼容。 如果需要进行破坏性改变，将会 [提前宣布]({{< ref "support-release-policy#feature-and-deprecations" >}})。
- 已弃用的功能是在多个版本上完成的，新增功能和已弃用功能并行工作。


版本控制是指以下 Dapr 代码库：dapr、CLI、稳定语言 SDK、dashboard、components-contrib、quickstarts、helm-charts 和 documentation。

Dapr 具有以下版本控制方案：
- Dapr `HTTP API` 会具有 `MAJOR.MINOR` 版本
- Dapr `GRPC API` 会具有 `MAJOR`
- 发布 (GitHub 代码库 包括 dapr, CLI, SDKs 和 Helm Chart) 会具有 `MAJOR.MINOR.PATCH`
- Documentation 和 Quickstarts 代码库会使用 Dapr 运行时代码库版本控制进行版本控制。
- Dapr `Components` 会在 components-contrib GitHub 代码库中具有 `MAJOR` 。
- Dapr `Manifests` 具有 `MAJOR.MINOR`. 其中包括订阅和配置。

请注意，Dapr API、二进制文件版本（运行时、CLI、SDK）和组件都是相互独立的。

## Dapr HTTP API
Dapr HTTP API 根据 [REST API 指南](https://github.com/microsoft/api-guidelines/blob/vNext/Guidelines.md#71-url-structure) 进行版本控制。

基于这些准则：
- 当预期旧版本会弃用时，API 的 `MAJOR` 版本将递增。 任何此类弃用会宣布且给出可行的升级路径。
- 对于任何其他更改， `MINOR` 版本 *可能*会递增。 例如，对发送到 API 的消息的 JSON 结构的更改。 可以在[此处](https://github.com/microsoft/api-guidelines/blob/vNext/Guidelines.md#123-definition-of-a-breaking-change)查看对 API 的破坏性改变的定义 。
- 实验性 API 包含一个"alpha"后缀，用于表示其实验状态。 例如 v1.0alpha、v2.0alpha 等。

## Dapr 运行时
Dapr 发布使用 `MAJOR.MINOR.PATCH` 格式做版本控制。 例如 1.0.0. 有关版本控制的详细信息，请参阅 [支持的版本]({{< ref support-release-policy.md >}}) 。

## Helm Charts
Helm charts 在 [helm-charts 代码库](https://github.com/dapr/helm-charts) 中与 Dapr 运行时一起进行版本控制。 Helm Chart 用于 [Kubernetes 部署]({{< ref "kubernetes-deploy#install-with-helm-advanced" >}})

## 语言 SDK、CLI 和仪表板
Dapr 语言 SDK、CLI 和仪表板的版本独立于 Dapr 运行时，可以按不同的计划发布。 请参阅此 [表]({{< ref "support-release-policy#supported-versions" >}}) ，以显示 SDK、CLI、仪表板和运行时版本之间的兼容性。 运行时上的每个新发布都列出了相应的受支持的 SDK、CLI 和仪表板。

SDK、CLI 和仪表板的版本控制遵循 `MAJOR.MINOR.PATCH` 格式。 当 SDK 中存在不向后兼容的更改（例如，更改客户端方法上的参数）时，主要版本将递增。 次要版本将针对新功能和错误修复进行更新，而在出现错误或安全热修复时，patch 版本将递增。

SDK 中的样本或者样例版本会跟随该代码库。

## 组件
组件在 components-contrib 代码库中实现，并遵循 `MAJOR` 版本控制方案。 组件版本会被加入到 major 版本（vX）中 ，补丁与非破坏性更改都会被加到最新的 major 版本中。 当组件接口中存在非向后兼容的更改时，major 版本将递增，例如，更改现有状态存储接口中的方法。

[components-contrib](https://github.com/dapr/components-contrib/) 代码库版本是内部所有组件的统一版本。  也就是说，组件代码库版本由其中所有组件的发布的架构组合而成。 新版本的 Dapr 并不意味着 components-contrib 有新发布版本。

注意：组件具有能生产使用的版本周期：Alpha、Beta 和 Stable。 这些版本周期与其版本控制无关。 受支持组件的表显示其版本和版本周期。
* [状态存储组件]({{< ref supported-state-stores.md >}}) 列表
* [pub/sub组件列表]({{< ref supported-pubsub.md >}})
* [安全存储组件]({{< ref supported-secret-stores.md >}})列表
* [绑定组件列表]({{< ref supported-bindings.md >}})

有关组件版本控制的详细信息，请阅读 [版本 2 及更高版本的组件](https://github.com/dapr/components-contrib/blob/master/docs/developing-component.md#version-2-and-beyond-of-a-component)

### 组件架构

组件 YAML 的版本控制有两种形式：
- 组件清单的版本控制， 即 `apiVersion`。
- 组件实现的版本， Version for the component implementation. The `.spec.version`

组件清单在 `.spec.metadata` 字段中包含实现的架构，其中 `.type` 字段表示具体实现组件

请参阅以下示例中的注释：
```yaml
apiVersion: dapr.io/v1alpha1 # <-- This is the version of the component manifest
kind: Component
metadata:
  name: pubsub
spec:
  version: v1 # <-- This is the version of the pubsub.redis schema implementation
  type: pubsub.redis
  metadata:
  - name: redisHost
    value: redis-master:6379
  - name: redisPassword
    value: general-kenobi
```

### 组件清单版本
组件 YAML 清单的版本为 `dapr.io/v1alpha1`。

### 组件实现版本
组件具体实现的版本由 `.spec.version` 字段确定，如上面的示例所示。 `.spec.version` 字段在架构实例中是必需的，如果不存在，则无法加载组件。 对于 Dapr 1.0.0 的发布，所有组件都标记为 `v1`。组件实现版本仅针对不向后兼容的更改递增。

### 组件弃用
组件的弃用将提前两（2）个版本宣布。 弃用组件会导致组件版本的主要版本更新。 在 2 个版本之后，该组件将从 Dapr 运行时中取消注册，尝试加载它将引发致命异常。

## 快速入门和示例
快速入门在[ Quickstarts 代码库](https://github.com/dapr/quickstarts)随运行时一起进行版本控制，其中相应版本的表位于示例代码库的首页上。  用户应使用运行时版本相对应的快速入门。

[样例代码库](https://github.com/dapr/samples)中的每个样例都根据具体情况进行版本控制，具体取决于样例维护者。 如果与运行时版本落后太多，或者一年内都没被维护的样例将被删除。

## 相关链接
* 阅读[支持的版本]({{< ref support-release-policy.md >}})
