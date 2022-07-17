---
type: docs
title: "Bridge to Kubernetes支持Dapr服务"
linkTitle: "Bridge to Kubernetes"
weight: 300
description: "在本地调试与你的Kubernetes集群相连的Dapr应用程序"
---

Bridge to Kubernetes允许你在你的开发计算机上运行和调试代码，同时仍然与你的应用程序或服务的其他部分连接到你的Kubernetes集群。 这种类型的调试通常称为 *本地隧道调试*。

{{< button text="了解更多关于Bridge to Kubernetes" link="https://aka.ms/bridge-vscode-dapr" >}}

## 调试 Dapr 应用

Bridge to Kubernetes支持在你的机器上调试Dapr应用程序，同时还能让它们与Kubernetes集群上运行的服务和应用程序进行交互。 这个例子展示了Bridge to Kubernetes使开发人员能够调试[分布式计算器快速入门](https://github.com/dapr/quickstarts/tree/master/tutorials/distributed-calculator)。

<div class="embed-responsive embed-responsive-16by9">
<iframe width="560" height="315" src="https://www.youtube.com/embed/rxwg-__otso" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

{{% alert title="Isolation mode" color="warning" %}}
[隔离模式](https://aka.ms/bridge-isolation-vscode-dapr)目前不支持Dapr应用程序。 确保在无隔离状态下启动Bridge to Kubernetes模式。
{{% /alert %}}

## 深入阅读

- [桥接到Kubernetes的文档](https://code.visualstudio.com/docs/containers/bridge-to-kubernetes)
- [VSCode 集成]({{< ref vscode >}})