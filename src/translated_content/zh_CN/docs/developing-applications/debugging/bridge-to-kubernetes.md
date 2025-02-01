---
type: docs
title: "Bridge to Kubernetes 对 Dapr 服务的支持"
linkTitle: "Bridge to Kubernetes"
weight: 300
description: "在本地调试 Dapr 应用程序，同时保持与 Kubernetes 集群的连接"
---

Bridge to Kubernetes 允许您在开发计算机上运行和调试代码，同时保持与 Kubernetes 集群中其他应用程序或服务的连接。这种调试方式通常被称为*本地隧道调试*。

{{< button text="了解更多 Bridge to Kubernetes 信息" link="https://aka.ms/bridge-vscode-dapr" >}}

## 调试 Dapr 应用程序

Bridge to Kubernetes 支持在您的计算机上调试 Dapr 应用程序，同时与 Kubernetes 集群中的服务和应用程序进行交互。以下示例展示了 Bridge to Kubernetes 如何帮助开发人员调试[分布式计算器快速入门](https://github.com/dapr/quickstarts/tree/master/tutorials/distributed-calculator)：

<div class="embed-responsive embed-responsive-16by9">
<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/rxwg-__otso" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

{{% alert title="隔离模式" color="warning" %}}
[隔离模式](https://aka.ms/bridge-isolation-vscode-dapr) 目前不支持 Dapr 应用程序。请确保启动 Bridge to Kubernetes 模式时不使用隔离模式。
{{% /alert %}}

## 进一步阅读

- [Bridge to Kubernetes 文档](https://code.visualstudio.com/docs/containers/bridge-to-kubernetes)
- [VSCode 集成]({{< ref vscode >}})