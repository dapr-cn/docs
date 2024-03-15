---
type: docs
title: Dapr Visual Studio Code 扩展概述
linkTitle: Dapr 扩展
weight: 10000
description: 如何使用Dapr扩展来开发和运行Dapr应用程序
---

Dapr为本地开发提供了_预览版_[Dapr Visual Studio Code扩展](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-dapr)，使用户能够获得与更好地管理其Dapr应用程序和调试您的Dapr应用程序有关的各种功能，这些Dapr语言包括.NET、Go、PHP、Python和Java。

<a href="vscode:extension/ms-azuretools.vscode-dapr" class="btn btn-primary" role="button">在VSCode中打开</a>

## 特性

### Dapr 调试任务脚手架

Dapr 扩展可以帮助您使用 Visual Studio Code 的 [内置调试功能](https://code.visualstudio.com/Docs/editor/debugging) 来调试您的应用程序。

使用`Dapr: Scaffold Dapr Tasks` [Command Palette](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette)操作，当你开始调试时，你可以更新现有的`task.json`和`launch.json`文件以启动和配置Dapr sidecar。

1. 请确保您的应用程序有一个启动配置。 ([了解更多](https://code.visualstudio.com/Docs/editor/debugging))
2. 使用`Ctrl+Shift+P`打开Command Palette
3. 选择 `Dapr: Scaffold Dapr Tasks`
4. 用 `F5` 或通过运行视图运行你的应用程序和 Dapr sidecar。

### Dapr 组件脚手架

当将Dapr添加到您的应用程序时，您可能希望有一个专门的组件目录，与作为`dapr init`的一部分初始化的默认组件分开。

要创建一个专用的组件文件夹，其中包含默认的`statestore`、`pubsub`和`zipkin`组件，请使用`Dapr: Scaffold Dapr Components` [Command Palette](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette)操作。

1. 在 Visual Studio Code 中打开您的应用程序目录
2. 使用`Ctrl+Shift+P`打开Command Palette
3. 选择 `Dapr: Scaffold Dapr Components`
4. 使用 `dapr run --resources-path ./components -- ...` 运行你的应用程序

### 查看正在运行的 Dapr 应用程序

Applications 视图显示在您的机器上本地运行的 Dapr 应用程序。

<br /><img src="/images/vscode-extension-view.png" alt="Dapr VSCode 扩展视图中运行应用程序选项的截图" width="800">

### 调用 Dapr 应用的方法

在Applications 视图中，用户可以右击并通过 GET 或 POST 方法调用 Dapr 应用程序，可选择指定有效载荷。

<br /><img src="/images/vscode-extension-invoke.png" alt="Dapr VSCode扩展调用选项的截图" width="800">

### 发布事件到 Dapr 应用程序

在 Applications 视图中，用户可以右键单击并向正在运行的 Dapr 应用程序发布消息，指定主题和有效载荷。

用户还可以向所有正在运行的应用程序发布消息。

<br /><img src="/images/vscode-extension-publish.png" alt="Dapr VSCode扩展发布选项的截图" width="800">

## 其他资源

### 同时调试多个Dapr应用程序

使用 VS Code 扩展，您可以使用[多目标调试](https://code.visualstudio.com/docs/editor/debugging#_multitarget-debugging)同时调试多个 Dapr 应用程序。

### 社区示例

查看这个[视频](https://www.youtube.com/watch?v=OtbYCBt9C34\&t=85)以了解如何使用 Dapr VS Code 扩展:

<div class="embed-responsive embed-responsive-16by9">
<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/OtbYCBt9C34?start=85" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>
