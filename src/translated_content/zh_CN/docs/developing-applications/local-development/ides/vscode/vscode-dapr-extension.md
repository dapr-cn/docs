---
type: docs
title: "Dapr Visual Studio Code 扩展概述"
linkTitle: "Dapr 扩展"
weight: 10000
description:  "如何使用 Dapr 扩展开发和运行 Dapr 应用程序"
---

Dapr 提供了一个*预览版*的 [Dapr Visual Studio Code 扩展](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-dapr)，专为本地开发设计。该扩展为用户提供多种功能，以便更好地管理 Dapr 应用程序，并调试支持的 Dapr 语言的应用程序，包括 .NET、Go、PHP、Python 和 Java。

<a href="vscode:extension/ms-azuretools.vscode-dapr" class="btn btn-primary" role="button">在 VSCode 中打开</a>

## 功能

### 脚手架 Dapr 调试任务

Dapr 扩展利用 Visual Studio Code 的[内置调试功能](https://code.visualstudio.com/Docs/editor/debugging)帮助您调试应用程序。

通过 `Dapr: Scaffold Dapr Tasks` [命令面板](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette)操作，您可以更新现有的 `task.json` 和 `launch.json` 文件，以便在开始调试时启动和配置 Dapr sidecar。

1. 确保为您的应用程序设置了启动配置。([了解更多](https://code.visualstudio.com/Docs/editor/debugging))
2. 使用 `Ctrl+Shift+P` 打开命令面板
3. 选择 `Dapr: Scaffold Dapr Tasks`
4. 使用 `F5` 或通过运行视图运行您的应用程序和 Dapr sidecar。

### 脚手架 Dapr 组件

在将 Dapr 添加到应用程序时，您可能希望创建一个独立的组件目录，以区别于 `dapr init` 初始化的默认组件。

要使用默认的 `statestore`、`pubsub` 和 `zipkin` 组件创建一个专用的组件文件夹，请使用 `Dapr: Scaffold Dapr Components` [命令面板](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette)操作。

1. 在 Visual Studio Code 中打开您的应用程序目录
2. 使用 `Ctrl+Shift+P` 打开命令面板
3. 选择 `Dapr: Scaffold Dapr Components`
4. 使用 `dapr run --resources-path ./components -- ...` 运行您的应用程序

### 查看正在运行的 Dapr 应用程序

应用程序视图显示在您的机器上本地运行的 Dapr 应用程序。

<br /><img src="/images/vscode-extension-view.png" alt="Dapr VSCode 扩展视图运行应用程序选项的截图" width="800">

### 调用 Dapr 应用程序

在应用程序视图中，用户可以右键单击并通过 GET 或 POST 方法调用 Dapr 应用程序，并可选择指定一个负载。

<br /><img src="/images/vscode-extension-invoke.png" alt="Dapr VSCode 扩展调用选项的截图" width="800">

### 向 Dapr 应用程序发布事件

在应用程序视图中，用户可以右键单击并向正在运行的 Dapr 应用程序发布消息，指定主题和负载。

用户还可以向所有正在运行的 Dapr 应用程序发布消息。

<br /><img src="/images/vscode-extension-publish.png" alt="Dapr VSCode 扩展发布选项的截图" width="800">

## 其他资源

### 同时调试多个 Dapr 应用程序

使用 VS Code 扩展，您可以使用[多目标调试](https://code.visualstudio.com/docs/editor/debugging#_multitarget-debugging)同时调试多个 Dapr 应用程序。

### 社区电话演示

观看此[视频](https://www.youtube.com/watch?v=OtbYCBt9C34&t=85)，了解如何使用 Dapr VS Code 扩展：

<div class="embed-responsive embed-responsive-16by9">
<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/OtbYCBt9C34?start=85" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>