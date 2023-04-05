---
type: docs
title: "Dapr Visual Studio Code extension overview"
linkTitle: "Dapr extension"
weight: 10000
description: "How to develop and run Dapr applications with the Dapr extension"
---


Dapr offers a *preview* [Dapr Visual Studio Code extension](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-dapr) for local development which enables users a variety of features related to better managing their Dapr applications and debugging of your Dapr applications for all supported Dapr languages which are .NET, Go, PHP, Python and Java.

<a href="vscode:extension/ms-azuretools.vscode-dapr" class="btn btn-primary" role="button">在 VSCode 中打开</a>

## Features

### Scaffold Dapr debugging tasks

Dapr 扩展可以帮助您使用 Visual Studio Code 的 [内置调试功能](https://code.visualstudio.com/Docs/editor/debugging) 来调试您的应用程序。

使用 `Dapr: Scaffold Dapr Tasks` [Command Palette](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette) 操作，你可以更新你现有的 `task.json` 和 `launch.json` 文件，在你开始调试时启动并配置 Dapr sidecar。

1. Make sure you have a launch configuration set for your app. ([Learn more](https://code.visualstudio.com/Docs/editor/debugging))
2. Open the Command Palette with `Ctrl+Shift+P`
3. Select `Dapr: Scaffold Dapr Tasks`
4. Run your app and the Dapr sidecar with `F5` or via the Run view.

### Dapr 组件脚手架

当添加 Dapr 到你的应用程序时，你可能希望有一个专门的组件目录，与作为 `dapr init` 的一部分初始化的默认组件分开。

若要创建一个专用的组件文件夹，默认 `statestore`, `pubsub`, 和 `zipkin` 组件, 使用 `Dapr: Scaffold Dapr Components` [Command Palette](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette) 操作。

1. Open your application directory in Visual Studio Code
2. Open the Command Palette with `Ctrl+Shift+P`
3. 选择 `Dapr: Scaffold Dapr Components`
4. Run your application with `dapr run --resources-path ./components -- ...`

### 查看正在运行的 Dapr 应用程序

Applications 视图显示在您的机器上本地运行的 Dapr 应用程序。

<br /><img src="/images/vscode-extension-view.png" alt="Dapr VSCode 扩展视图运行应用程序选项的截图" width="800" />

### 调用 Dapr 应用的方法

在Applications 视图中，用户可以右击并通过 GET 或 POST 方法调用 Dapr 应用程序，可选择指定有效载荷。

<br /><img src="/images/vscode-extension-invoke.png" alt="Dapr VSCode 扩展调用选项的截图" width="800" />

### 发布事件到 Dapr 应用程序

在 Applications 视图中，用户可以右键单击并向正在运行的 Dapr 应用程序发布消息，指定主题和有效载荷。

用户还可以向所有正在运行的应用程序发布消息。

  <br /><img src="/images/vscode-extension-publish.png" alt="Dapr VSCode 扩展发布选项的截图" width="800" />
## 其他资源

### 同时调试多个 Dapr 应用程序

使用 VS Code 扩展，您可以通过 [Multi-target debugging](https://code.visualstudio.com/docs/editor/debugging#_multitarget-debugging) 同时调试多个 Dapr 应用程序.

### 社区示例

观看有关如何使用 Dapr VS 代码扩展的 [视频](https://www.bilibili.com/video/BV1QK4y1p7fn?p=9&t=85):

<div class="embed-responsive embed-responsive-16by9">
<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/OtbYCBt9C34?start=85" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>