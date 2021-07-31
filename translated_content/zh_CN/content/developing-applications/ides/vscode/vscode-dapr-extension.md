---
type: docs
title: "Dapr Visual Studio Code extension overview"
linkTitle: "Dapr extension"
weight: 10000
description: "How to develop and run Dapr applications with the Dapr extension"
---


Dapr offers a *preview* [Dapr Visual Studio Code extension](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-dapr) for local development which enables users a variety of features related to better managing their Dapr applications and debugging of your Dapr applications for all supported Dapr languages which are .NET, Go, PHP, Python and Java.

<a href="vscode:extension/ms-azuretools.vscode-dapr" class="btn btn-primary" role="button">在 VSCode 中打开</a>

## 特性

### Scaffold Dapr debugging tasks

The Dapr extension helps you debug your applications with Dapr using Visual Studio Code's [built-in debugging capability](https://code.visualstudio.com/Docs/editor/debugging).

Using the `Dapr: Scaffold Dapr Tasks` [Command Palette](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette) operation, you can update your existing `task.json` and `launch.json` files to launch and configure the Dapr sidecar when you begin debugging.

1. Make sure you have a launch configuration set for your app. ([Learn more](https://code.visualstudio.com/Docs/editor/debugging))
2. Open the Command Palette with `Ctrl+Shift+P`
3. Select `Dapr: Scaffold Dapr Tasks`
4. Run your app and the Dapr sidecar with `F5` or via the Run view.

### Scaffold Dapr components

When adding Dapr to your application, you may want to have a dedicated components directory, separate from the default components initialized as part of `dapr init`.

To create a dedicated components folder with the default `statestore`, `pubsub`, and `zipkin` components, use the `Dapr: Scaffold Dapr Components` [Command Palette](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette) operation.

1. Open your application directory in Visual Studio Code
2. Open the Command Palette with `Ctrl+Shift+P`
3. Select `Dapr: Scaffold Dapr Components`
4. Run your application with `dapr run --components-path ./components -- ...`

### View running Dapr applications

The Applications view shows Dapr applications running locally on your machine.

<br /><img src="/images/vscode-extension-view.png" alt="Dapr VSCode 扩展视图运行应用程序选项的截图" width="800" />

### Invoke Dapr applications

Within the Applications view, users can right-click and invoke Dapr apps via GET or POST methods, optionally specifying a payload.

<br /><img src="/images/vscode-extension-invoke.png" alt="Dapr VSCode 扩展调用选项的截图" width="800" />

### Publish events to Dapr applications

Within the Applications view, users can right-click and publish messages to a running Dapr application, specifying the topic and payload.

Users can also publish messages to all running applications.

  <br /><img src="/images/vscode-extension-publish.png" alt="Dapr VSCode 扩展发布选项的截图" width="800" />
## 其他资源

### 同时调试多个Dapr应用程序

Using the VS Code extension, you can debug multiple Dapr applications at the same time with [Multi-target debugging](https://code.visualstudio.com/docs/editor/debugging#_multitarget-debugging).

### Community call demo

观看有关如何使用 Dapr VS 代码扩展的 [视频](https://www.bilibili.com/video/BV1QK4y1p7fn?p=9&t=85): <iframe width="560" height="315" src="//player.bilibili.com/player.html?aid=886064109&bvid=BV1QK4y1p7fn&cid=277945842&page=9&t=85" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen mark="crwd-mark"></iframe>
