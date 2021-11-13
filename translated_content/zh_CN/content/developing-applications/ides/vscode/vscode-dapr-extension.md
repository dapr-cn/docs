---
type: docs
title: "Dapr Visual Studio Core扩展概述"
linkTitle: "Dapr扩展"
weight: 10000
description: "如何使用 Dapr 扩展来开发和运行 Dapr 应用程序"
---


Dapr 为本地开发提供了*预览版* [Dapr Visual Studio Code扩展](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-dapr)，使用户能够获得与更好地管理其Dapr应用程序和调试您的Dapr应用程序有关的各种功能，这些Dapr语言包括.NET、Go、PHP、Python和Java。

<a href="vscode:extension/ms-azuretools.vscode-dapr" class="btn btn-primary" role="button">在 VSCode 中打开</a>

## 特性

### Dapr 调试任务脚手架

Dapr扩展可以帮助您使用Visual Studio Code的[内置调试功能](https://code.visualstudio.com/Docs/editor/debugging)来调试您的应用程序。

使用`Dapr: Scaffold Dapr Tasks` [Command Palette](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette)操作，你可以更新你现有的`task.json`和`launch.json`文件，在你开始调试时启动并配置Dapr sidecar。

1. 请确保您的应用程序有一个启动配置。 ([了解更多](https://code.visualstudio.com/Docs/editor/debugging))
2. 使用 `Ctrl+Shift+P 打开Command Palette`
3. 选择 `Dapr: Scaffold Dapr Tasks`
4. 用`F5`或通过运行视图运行你的应用程序和Dapr sidecar。

### Dapr 组件脚手架

当添加Dapr到你的应用程序时，你可能希望有一个专门的组件目录，与作为`dapr init`的一部分初始化的默认组件分开。

若要创建一个专用的组件文件夹，默认 `statestore`, `pubsub`, 和 `zipkin` 组件, 使用 `Dapr: Scaffold Dapr Components` [Command Palette](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette) 操作。

1. 在 Visual Studio Code中打开您的应用程序目录
2. 使用 `Ctrl+Shift+P 打开Command Palette`
3. 选择 `Dapr: Scaffold Dapr Components`
4. 使用 `dapr run --components-path ./components -- ...`运行你的应用程序

### 查看正在运行的 Dapr 应用程序

Applications视图显示在您的机器上本地运行的Dapr应用程序。

<br /><img src="/images/vscode-extension-view.png" alt="Dapr VSCode 扩展视图运行应用程序选项的截图" width="800" />

### 调用 Dapr 应用的方法

在Applications视图中，用户可以右击并通过GET或POST方法调用Dapr应用程序，可选择指定有效载荷。

<br /><img src="/images/vscode-extension-invoke.png" alt="Dapr VSCode 扩展调用选项的截图" width="800" />

### 发布事件到 Dapr 应用程序

在Applications视图中，用户可以右键单击并向正在运行的Dapr应用程序发布消息，指定主题和有效载荷。

用户也可以向所有正在运行的应用程序发布消息。

  <br /><img src="/images/vscode-extension-publish.png" alt="Dapr VSCode 扩展发布选项的截图" width="800" />
## 其他资源

### 同时调试多个Dapr应用程序

使用 VS Code 扩展，您可以通过[Multi-target debugging](https://code.visualstudio.com/docs/editor/debugging#_multitarget-debugging)同时调试多个Dapr应用程序.

### 社区示例

观看有关如何使用 Dapr VS 代码扩展的 [视频](https://www.bilibili.com/video/BV1QK4y1p7fn?p=9&t=85): <iframe width="560" height="315" src="//player.bilibili.com/player.html?aid=886064109&bvid=BV1QK4y1p7fn&cid=277945842&page=9&t=85" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen mark="crwd-mark"></iframe>
