---
type: docs
title: "用远程开发容器开发 Dapr 应用程序"
linkTitle: "远程开发容器"
weight: 50000
description: "如何设置带有Dapr的远程开发容器环境"
---

Visual Studio Code [远程容器扩展](https://code.visualstudio.com/docs/remote/containers)可让您将Docker容器用作全功能的开发环境，而无需在本地文件系统中安装任何其他框架或软件包。

Dapr为NodeJS和C#预先构建了Docker远程容器。 您可以选择您的一个选择来选择一个随时制作的环境。 注意这些预制容器自动更新到最新的 Dapr 版本。

### 设置远程开发容器

#### 先决条件
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Visual Studio Code](https://code.visualstudio.com/)
- [VSCode 远程开发扩展包](https://aka.ms/vscode-remote/download/extension)

#### 创建远程 Dapr 容器
1. 在 VS 代码中打开您的应用程序工作区（workspace）
2. 在 command palette 中 (CTRL+SHIFT+P) 输入并选择 `Remote-Containers: Add Development Container Configuration Files...` <br /><img src="/images/vscode-remotecontainers-addcontainer.png" alt="添加远程容器的截图" width="700" />
3. 输入 `dapr` 来过滤列表到可用的 Dapr 远程容器，并选择符合您应用程序的语言容器。 请注意，您可能需要选择 `Show All Definitions...` <br /><img src="/images/vscode-remotecontainers-daprcontainers.png" alt="添加 dapr 容器的截图" width="700" />
4. 按照提示在容器中重新编译您的应用程序。 <br /><img src="/images/vscode-remotecontainers-reopen.png" alt="在开发容器中重新打开应用程序的截图" width="700" />

#### 示例
观看有关如何使用应用程序的 Dapr VS 代码远程容器的 [视频](https://www.bilibili.com/video/BV1QK4y1p7fn?p=8&t=120)。

<div class="embed-responsive embed-responsive-16by9">
<iframe width="560" height="315" src="https://www.youtube.com/embed/D2dO4aGpHcg?start=120" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>