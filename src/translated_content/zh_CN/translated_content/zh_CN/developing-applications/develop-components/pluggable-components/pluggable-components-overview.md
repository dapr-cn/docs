---
type: docs
title: "查看可插拔组件概述"
linkTitle: "概述"
weight: 1000
description: "可插拔组件剖析和支持的组件类型概述"
---

可插拔组件是不作为运行时的一部分包含的组件，与`dapr init`中包含的内置组件相对。 您可以将 Dapr 配置为使用利用构建块 API 的可插拔组件，但注册方式与 [内置 Dapr 组件](https://github.com/dapr/components-contrib).

<img src="/images/concepts-building-blocks.png" width=400>

## 可插拔组件 vs. 内置组件

Dapr 提供了两种注册和创建组件的方法:

- 运行时包含的内置组件，并在 [components-contrib 仓库](https://github.com/dapr/components-contrib) 中找到。
- 可插拔组件是独立部署和注册的。

虽然两种注册选项都利用了 Dapr 的构建块 API，但每种实现过程都不同。

| 组件详情           | [内置组件](https://github.com/dapr/components-contrib/blob/master/docs/developing-component.md) | 可插拔组件                                                                                        |
| -------------- |:------------------------------------------------------------------------------------------- |:-------------------------------------------------------------------------------------------- |
| **语言**         | 只能用Go语言编写                                                                                   | [可以用任何支持gRPC的语言编写](https://grpc.io/docs/what-is-grpc/introduction/#protocol-buffer-versions) |
| **它在哪里运行**     | 作为 Dapr 运行时可执行文件的一部分                                                                        | 作为 pod 中的一个独特进程或容器。 独立于 Dapr 本身运行。                                                           |
| **使用 Dapr 注册** | 包含在 Dapr 代码库中                                                                               | 通过 Unix 域套接字（使用 gRPC）注册到 Dapr                                                                |
| **发行版**        | 随 Dapr 发行版分发。 组件新增功能与 Dapr 发布保持一致                                                           | 独立于 Dapr 本身进行分发。 在需要时可以添加新功能，并遵循其自己的发布周期。                                                    |
| **组件如何被激活**    | Dapr 启动运行组件 (自动)                                                                            | 用户启动组件（手动）                                                                                   |

## 为什么创建可插拔组件?

可插拔组件在以下情况下非常有用：

- 您需要一个私有组件。
- 您希望将组件与 Dapr 发布流程保持分离。
- 您对Go不太熟悉，或者在Go中实现您的组件并不理想。

## 特性

### 实现一个可插拔组件

为了实现可插拔组件，您需要在组件中实现一个 gRPC 服务。 实现 gRPC 服务需要三个步骤：

1. 查找 proto 定义文件
1. 创建服务脚手架
1. 定义服务

了解更多 [如何开发和实现可插拔组件]({{< ref develop-pluggable.md >}})

### 利用一个组件来充当多个构建块

除了从同一组件实现多个 gRPC 服务（例如 `StateStore`, `QueriableStateStore`, `TransactionalStateStore` 等），可插拔组件还可以公开其他组件接口的实现。 这意味着一个可插拔组件可以同时作为状态存储、发布/订阅和输入或输出绑定的函数。 换句话说，您可以将多个组件接口实现为可插拔组件，并将它们公开为 gRPC 服务。

将多个组件接口暴露在同一个可插拔组件上会降低部署多个组件的操作负担，但会使您的组件实现和调试变得更加困难。 如果有疑问，请坚持“关注点分离”的原则，只在必要时将多个组件接口合并到同一个可插拔组件中。

## 实现一个可插拔组件

内置组件和可插拔组件有一个共同点：两者都需要 [组件规格]({{< ref "components-concept.md#component-specification" >}}). 内置组件不需要任何额外的步骤即可使用：Dapr 已准备好自动使用它们。

相比之下，可插拔组件需要额外的步骤才能与 Dapr 通信。 您需要首先运行组件并促进 Dapr 组件之间的通信，以启动注册过程。

## 下一步

- [实现一个可插拔组件]({{< ref develop-pluggable.md >}})
- [可插拔组件注册]({{< ref "pluggable-components-registration" >}})
