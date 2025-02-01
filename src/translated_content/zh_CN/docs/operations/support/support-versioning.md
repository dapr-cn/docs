<Meaning-Based Translation>
---
type: docs
title: "版本控制政策"
linkTitle: "版本控制"
weight: 1000
description: "Dapr 的版本控制政策"
---

## 介绍
Dapr 通过版本控制方案为未来的运行时、API 和组件的变化做好了设计。本主题描述了 API、组件和 Github 仓库的版本控制方案和策略。

## 版本控制
版本控制是为计算机软件的每个独特状态分配唯一版本名称或版本号的过程。
- 版本控制提供兼容性、明确的变更控制，并处理变更，尤其是重大变更。
- Dapr 力求保持向后兼容性。如果需要重大变更，将会[提前宣布]({{< ref "support-release-policy#feature-and-deprecations" >}})。
- 废弃的功能将在多个版本中逐步淘汰，新旧功能将并行工作。

版本控制涉及以下 Dapr 仓库：dapr、CLI、稳定语言 SDK、dashboard、components-contrib、quickstarts、helm-charts 和文档。

Dapr 具有以下版本控制方案：
- Dapr `HTTP API` 采用 `MAJOR.MINOR` 版本控制
- Dapr `GRPC API` 采用 `MAJOR` 版本控制
- 发布版本（包括 GitHub 仓库中的 dapr、CLI、SDK 和 Helm Chart）采用 `MAJOR.MINOR.PATCH` 版本控制
- 文档和 Quickstarts 仓库与 Dapr 运行时仓库版本控制一致。
- Dapr `组件` 在 components-contrib GitHub 仓库中采用 `MAJOR` 版本控制。
- Dapr `清单` 采用 `MAJOR.MINOR` 版本控制。这些包括订阅和配置。

请注意，Dapr 的 API、二进制发布（运行时、CLI、SDK）和组件都是相互独立的。

## Dapr HTTP API
Dapr HTTP API 根据这些[REST API 指南](https://github.com/microsoft/api-guidelines/blob/vNext/Guidelines.md#71-url-structure)进行版本控制。

根据这些指南；
- 当预期旧版本的弃用时，API 的 `MAJOR` 版本会递增。任何此类弃用将被通知，并提供升级路径。
- `MINOR` 版本*可能*因其他更改而递增。例如，发送到 API 的消息的 JSON 模式的更改。
API 的重大变更定义可以在[这里](https://github.com/microsoft/api-guidelines/blob/vNext/Guidelines.md#123-definition-of-a-breaking-change)查看。
- 实验性 API 包含一个“alpha”后缀以表示其 alpha 状态。例如 v1.0alpha、v2.0alpha 等。

## Dapr 运行时
Dapr 发布使用 `MAJOR.MINOR.PATCH` 版本控制。例如 1.0.0。阅读[支持的发布]({{< ref support-release-policy.md >}})以了解更多关于发布版本控制的信息。

## Helm Charts
[helm-charts 仓库](https://github.com/dapr/helm-charts)中的 Helm charts 与 Dapr 运行时版本一致。Helm charts 用于[Kubernetes 部署]({{< ref "kubernetes-deploy#install-with-helm-advanced" >}})

## 语言 SDK、CLI 和 dashboard
Dapr 语言 SDK、CLI 和 dashboard 独立于 Dapr 运行时进行版本控制，并可以在不同的时间表上发布。请参阅此[表格]({{< ref "support-release-policy#supported-versions" >}})以显示 SDK、CLI、dashboard 和运行时版本之间的兼容性。每个新的运行时发布都会列出相应支持的 SDK、CLI 和 Dashboard。

SDK、CLI 和 Dashboard 的版本控制遵循 `MAJOR.MINOR.PATCH` 格式。当 SDK 中存在非向后兼容的更改时（例如，更改客户端方法的参数），主版本会递增。次版本用于新功能和错误修复，补丁版本在出现错误或安全热修复时递增。

SDK 中的示例和例子与该仓库的版本一致。

## 组件
组件在 components-contrib 仓库中实现，并遵循 `MAJOR` 版本控制方案。组件的版本遵循主版本（vX），因为补丁和非破坏性更改会添加到最新的主版本中。当组件接口中存在非向后兼容的更改时，例如更改 State Store 接口中的现有方法，版本会递增。

[components-contrib](https://github.com/dapr/components-contrib/) 仓库发布是所有内部组件的统一版本。也就是说，components-contrib 仓库发布的版本由其内部所有组件的模式组成。如果没有组件更改，Dapr 的新版本并不意味着 components-contrib 有新的发布。

注意：组件具有生产使用生命周期状态：Alpha、Beta 和 Stable。这些状态与其版本控制无关。支持的组件表显示了它们的版本和状态。
* [state store 组件列表]({{< ref supported-state-stores.md >}})
* [pub/sub 组件列表]({{< ref supported-pubsub.md >}})
* [binding 组件列表]({{< ref supported-bindings.md >}})
* [secret store 组件列表]({{< ref supported-secret-stores.md >}})
* [configuration store 组件列表]({{< ref supported-configuration-stores.md >}})
* [lock 组件列表]({{< ref supported-locks.md >}})
* [cryptography 组件列表]({{< ref supported-cryptography.md >}})
* [middleware 组件列表]({{< ref supported-middleware.md >}})

有关组件版本控制的更多信息，请阅读[组件的版本 2 及以后](https://github.com/dapr/components-contrib/blob/master/docs/developing-component.md#version-2-and-beyond-of-a-component)

### 组件模式

组件 YAML 的版本控制有两种形式：
- 组件清单的版本控制。`apiVersion`
- 组件实现的版本。`.spec.version`

组件清单在 `.spec.metadata` 字段中包含实现的模式，`.type` 字段表示实现

请参阅下面示例中的注释：
```yaml
apiVersion: dapr.io/v1alpha1 # <-- 这是组件清单的版本
kind: Component
metadata:
  name: pubsub
spec:
  version: v1 # <-- 这是 pubsub.redis 模式实现的版本
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
组件实现的版本由示例中的 `.spec.version` 字段确定。`.spec.version` 字段在模式实例中是必需的，如果不存在，该组件将无法加载。在 Dapr 1.0.0 发布时，所有组件都标记为 `v1`。组件实现版本仅在非向后兼容更改时递增。

### 组件弃用
组件的弃用将在两个（2）版本之前宣布。组件的弃用会导致组件版本的主版本更新。经过 2 个版本后，该组件将从 Dapr 运行时中注销，尝试加载它将抛出致命异常。

组件的弃用和移除将在发布说明中宣布。

## Quickstarts 和示例
[Quickstarts 仓库](https://github.com/dapr/quickstarts)中的 Quickstarts 与运行时版本一致，其中相应版本的表格位于示例仓库的首页。用户应仅使用与正在运行的运行时版本相对应的 Quickstarts。

[Samples 仓库](https://github.com/dapr/samples)中的示例根据示例维护者的情况逐个版本控制。与运行时发布（多个版本之前）非常不一致或超过 1 年未维护的示例将被移除。

## 相关链接
* 阅读[支持的发布]({{< ref support-release-policy.md >}})
* 阅读[重大变更和弃用政策]({{< ref breaking-changes-and-deprecations.md >}})