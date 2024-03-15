---
type: docs
title: Bridge to Kubernetes 支持 Dapr 服务
linkTitle: Bridge to Kubernetes
weight: 300
description: 在本地调试与你的 Kubernetes 集群相连的 Dapr 应用程序
---

Bridge to Kubernetes 允许你在你的开发计算机上运行和调试代码，同时仍然与你的应用程序或服务的其他部分连接到你的 Kubernetes 集群。 这种类型的调试通常称为_本地隧道调试_。

{{< button text="了解更多关于 Bridge to Kubernetes" link="https\://aka.ms/bridge-vscode-dapr" >}}

## 调试 Dapr 应用

Bridge to Kubernetes 支持在你的机器上调试 Dapr 应用程序，同时还能让它们与 Kubernetes 集群上运行的服务和应用程序进行交互。 这个示例展示了使用Bridge to Kubernetes使开发人员能够调试[分布式计算器快速入门](https://github.com/dapr/quickstarts/tree/master/tutorials/distributed-calculator)：

<div class="embed-responsive embed-responsive-16by9">
<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/rxwg-__otso" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

{{% alert title="隔离模式" color="warning" %}}
[隔离模式](https://aka.ms/bridge-isolation-vscode-dapr) 目前不支持 Dapr 应用程序。 确保在无隔离状态下启动 Bridge to Kubernetes 模式。
{{% /alert %}}

## 深入阅读

- [Kubernetes桥接文档](https://code.visualstudio.com/docs/containers/bridge-to-kubernetes)
- [VSCode集成]({{< ref vscode >}})
