---
type: docs
title: "会话概述"
linkTitle: "概述"
weight: 1000
description: "会话API功能概述"
---

{{% alert title="Alpha" color="primary" %}}
会话API目前处于[alpha]({{< ref "certification-lifecycle.md#certification-levels" >}})阶段。
{{% /alert %}}

Dapr的会话API简化了与大型语言模型（LLM）进行大规模、安全、可靠交互的复杂性。无论您是缺乏必要本地SDK的开发者，还是只想专注于LLM交互提示的多语言开发团队，会话API都提供了一个统一的API接口来与底层LLM提供商进行对话。

<img src="/images/conversation-overview.png" width=800 alt="显示用户应用与Dapr的LLM组件通信流程的图示。">

除了启用关键的性能和安全功能（如[提示缓存]({{< ref "#prompt-caching" >}})和[个人信息清理]({{< ref "#personally-identifiable-information-pii-obfuscation" >}})），您还可以将会话API与Dapr的其他功能结合使用，例如：
- 弹性断路器和重试机制，以应对限制和令牌错误，或
- 中间件，用于验证与LLM之间的请求

Dapr通过为您的LLM交互提供指标，增强了系统的可观测性。

## 功能

以下功能适用于[所有支持的会话组件]({{< ref supported-conversation >}})。

### 提示缓存

提示缓存通过存储和重用在多个API调用中经常重复的提示来优化性能。Dapr将这些频繁使用的提示存储在本地缓存中，从而显著减少延迟和成本，使您的集群、pod或其他组件可以重用，而无需为每个新请求重新处理信息。

### 个人信息清理

个人信息清理功能能够识别并删除会话响应中的任何形式的敏感用户信息。只需在输入和输出数据上启用此功能，即可保护您的隐私，清除可能用于识别个人的敏感细节。

## 演示

观看在[Diagrid的Dapr v1.15庆祝活动](https://www.diagrid.io/videos/dapr-1-15-deep-dive)中展示的演示，了解会话API如何使用.NET SDK工作。

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/NTnwoDhHIcQ?si=37SDcOHtEpgCIwkG&amp;start=5444" title="YouTube视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## 试用会话

### 快速入门和教程

想要测试Dapr会话API？通过以下快速入门和教程来查看其实际应用：

| 快速入门/教程 | 描述 |
| ------------------- | ----------- |
| [会话快速入门](todo) | TODO |

### 直接在您的应用中开始使用会话API

想跳过快速入门？没问题。您可以直接在您的应用中试用会话模块。在[Dapr安装完成]({{< ref "getting-started/_index.md" >}})后，您可以从[操作指南]({{< ref howto-conversation-layer.md >}})开始使用会话API。

## 下一步

- [操作指南：使用会话API与LLM对话]({{< ref howto-conversation-layer.md >}})
- [会话API组件]({{< ref supported-conversation >}})
