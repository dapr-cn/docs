---
type: docs
title: "Visual Studio Code与Dapr 集成"
linkTitle: "Visual Studio Code"
weight: 1000
description: "有关如何在 VS Code中开发和运行Dapr应用程序的介绍"
---

## 扩展

Dapr提供了一个*预览版* [的Dapr Visual Studio Code扩展](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-dapr) ，用于您的Dapr应用程序的本地开发和调试。

<a href="vscode:extension/ms-azuretools.vscode-dapr" class="btn btn-primary" role="button">在 VSCode 中打开</a>

### 功能概述
- Scaffold Dapr task, launch, and component assets <br /><img src="/images/vscode-extension-scaffold.png" alt="Screenshot of the Dapr VSCode extension scaffold option" width="800" />
- 查看正在运行的 Dapr 应用程序 <br /><img src="/images/vscode-extension-view.png" alt="Screenshot of the Dapr VSCode extension view running applications option" width="800" />
- 调用 Dapr 应用的方法  <br /><img src="/images/vscode-extension-invoke.png" alt="Screenshot of the Dapr VSCode extension invoke option" width="800" />
- 发布事件到 Dapr 应用程序 <br /><img src="/images/vscode-extension-publish.png" alt="Screenshot of the Dapr VSCode extension publish option" width="800" />

#### 示例
观看有关如何使用 Dapr VS 代码扩展的 [视频](https://www.bilibili.com/video/BV1QK4y1p7fn?p=9&t=85): <iframe width="560" height="315" src="https://www.youtube.com/embed/OtbYCBt9C34?start=85" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen mark="crwd-mark"></iframe>

## 远程开发容器

Visual Studio Code Remote Containers扩展允许您使用Docker容器作为功能齐全的开发环境，使您可以[在容器中进行开发](https://code.visualstudio.com/docs/remote/containers)，而无需在本地文件系统中安装任何额外的框架或包。

Dapr 为每种语言的 SDK 预先构建了Docker 远程容器。 您可以选择您的一个选择来选择一个随时制作的环境。 注意这些预制容器自动更新到最新的 Dapr 版本。

### 设置远程开发容器

#### 前期准备
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Visual Studio Code](https://code.visualstudio.com/)
- [VSCode 远程开发扩展包](https://aka.ms/vscode-remote/download/extension)

#### 创建远程 Dapr 容器
1. 在 VS 代码中打开您的应用程序工作区（workspace）
2. 在 command palette 中 (ctrl+shift+p) 输入并选择 `Remote-Containers: Add Development Container Configuration Files...` <br /><img src="/images/vscode-remotecontainers-addcontainer.png" alt="Screenshot of adding a remote container" width="700" />
3. 输入 `dapr` 来过滤列表到可用的 Dapr 远程容器，并选择符合您应用程序的语言容器。 请注意，您可能需要选择 `Show All Definitions...` <br /><img src="/images/vscode-remotecontainers-daprcontainers.png" alt="Screenshot of adding a Dapr container" width="700" />
4. 按照提示重建您在容器中的应用程序。 <br /><img src="/images/vscode-remotecontainers-reopen.png" alt="Screenshot of reopening an application in the dev container" width="700" />

#### 例子
观看有关如何使用应用程序的 Dapr VS 代码远程容器的 [视频](https://www.bilibili.com/video/BV1QK4y1p7fn?p=8&t=120)。 <iframe width="560" height="315" src="https://www.youtube.com/embed/D2dO4aGpHcg?start=120" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen mark="crwd-mark"></iframe>

## 疑难解答

### 同时调试多个Dapr应用程序
使用 VS Code extension，您可以通过[Multi-target debugging](https://code.visualstudio.com/docs/editor/debugging#_multitarget-debugging)同时调试多个Dapr应用程序


### 手动配置 Visual Studio Code 调试 daprd
如果你想要通过 [tasks.json](https://code.visualstudio.com/Docs/editor/tasks) 和 [launch.json](https://code.visualstudio.com/Docs/editor/debugging) 文件配置一个项目使用Dapr而又不想使用 Dapr VS Code extension，这里有一些手动步骤说明。

开发 Dapr应用程序时，您通常使用 dapr cli 来启动你自定义的dapr服务，就像这样：

```bash
dapr run --app-id nodeapp --app-port 3000 --dapr-http-port 3500 app.js
```

这将生成组件的 yaml 文件(如果它们不存在)，以便您的服务能够与本地的redis 容器交互。 当你刚刚入门时这是好的开始，但是如果你想要附加一个debugger到你的服务并且通过VS Code进行单点调试呢？ 您可以在这里使用 dapr 运行时(daprd) 来帮助实现这一点。

{{% alert title="Note" color="primary" %}}
Dapr runtime (daprd) 不会自动生成用于 Redis 的组件的 yaml 文件。 这些将需要手动创建，否则您需要运行 dapr cli (dapr) 来自动创建它们。
{{% /alert %}}

将调试器附加到您的服务中的一种方法是先从命令行中运行符合正确参数的 daprd，然后启动您的代码并附加调试器。 虽然这完全是一个可以接受的解决方案，但它也需要一些额外的步骤，以及对那些可能想要克隆你的仓库并点击 "play "按钮开始调试的开发人员进行一些指导。

使用 [tasks.json](https://code.visualstudio.com/Docs/editor/tasks) 和 [launch.json](https://code.visualstudio.com/Docs/editor/debugging) 文件在 Visual Studio 代码中 您可以简化过程并要求 VS Code 在启动调试器之前启动 daprd 进程。

让我们开始吧！

#### 修改 launch.json 配置以包含一个 preLaunchTask

在您的 [launch.json](https://code.visualstudio.com/Docs/editor/debugging) 文件中，为您想要 daprd 启动的每个配置添加一个 [preLaunchTask](https://code.visualstudio.com/Docs/editor/debugging#_launchjson-attributes)。 [preLaunchTask](https://code.visualstudio.com/Docs/editor/debugging#_launchjson-attributes) 将引用您在 tasks.json 文件中定义的任务。 这里是 Node 和 .NET Core 的一个例子。 注意 [preLaunchTasks](https://code.visualstudio.com/Docs/editor/debugging#_launchjson-attributes) 参考：daprd-web 和 daprd-leadboard。

```json
{
   "version": "0.2.0",
   "configurations": [
        {
            "type": "node",
            "request": "launch",
            "name": "Node Launch w/Dapr (Web)",
            "preLaunchTask": "daprd-web",
            "program": "${workspaceFolder}/Game/Web/server.js",
            "skipFiles": [
                "<node_internals>/**"
            ]
        },
        {
            "type": "coreclr",
            "request": "launch",
            "name": ".NET Core Launch w/Dapr (LeaderboardService)",
            "preLaunchTask": "daprd-leaderboard",
            "program": "${workspaceFolder}/Game/Services/LeaderboardService/bin/Debug/netcoreapp3.0/LeaderboardService.dll",
            "args": [],
            "cwd": "${workspaceFolder}/Game/Services/LeaderboardService",
            "stopAtEntry": false,
            "serverReadyAction": {
                "action": "openExternally",
                "pattern": "^\\s*Now listening on:\\s+(https?://\\S+)"
            },
            "env": {
                "ASPNETCORE_ENVIRONMENT": "Development"
            },
            "sourceFileMap": {
                "/Views": "${workspaceFolder}/Views"
            }
        }
    ]
}
```

#### 添加 daprd 任务到 tasks.json

您需要在您的 [tasks.json](https://code.visualstudio.com/Docs/editor/tasks) 文件中定义一个 daprd 任务和问题匹配器（problem matcher）。 这里有两个示例(均通过上述 [preLaunchTask](https://code.visualstudio.com/Docs/editor/debugging#_launchjson-attributes) 成员引用。 注意，在 .NET Core daprd 任务(dpred -leaderboard)的情况下，还有一个[dependsOn](https://code.visualstudio.com/Docs/editor/tasks#_compound-tasks)成员，它引用构建任务，以确保最新的代码正在运行/调试。 The [problemMatcher](https://code.visualstudio.com/Docs/editor/tasks#_defining-a-problem-matcher) is used so that VSCode can understand when the daprd process is up and running.

Let's take a quick look at the args that are being passed to the daprd command.

* -app-id -- the id (how you will locate it via service invocation) of your microservice
* -app-port -- the port number that your application code is listening on
* -dapr-http-port -- the http port for the dapr api
* -dapr-grpc-port -- the grpc port for the dapr api
* -placement-host-address -- the location of the placement service (this should be running in docker as it was created when you installed dapr and ran `dapr init`) > Note: You will need to ensure that you specify different http/grpc (-dapr-http-port and -dapr-grpc-port) ports for each daprd task that you create, otherwise you will run into port conflicts when you attempt to launch the second configuration.
> Note: You will need to ensure that you specify different http/grpc (-dapr-http-port and -dapr-grpc-port) ports for each daprd task that you create, otherwise you will run into port conflicts when you attempt to launch the second configuration.

```json
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "build",
            "command": "dotnet",
            "type": "process",
            "args": [
                "build",
                "${workspaceFolder}/Game/Services/LeaderboardService/LeaderboardService.csproj",
                "/property:GenerateFullPaths=true",
                "/consoleloggerparameters:NoSummary"
            ],
            "problemMatcher": "$msCompile"
        },
        {
            "label": "daprd-web",
            "command": "daprd",
            "args": [
                "-app-id",
                "whac-a-mole--web",
                "-app-port",
                "3000",
                "-dapr-http-port",
                "51000",
                "-dapr-grpc-port",
                "52000",
                "-placement-host-address",
                "localhost:50005"
            ],
            "isBackground": true,
            "problemMatcher": {
                "pattern": [
                    {
                      "regexp": ".",
                      "file": 1,
                      "location": 2,
                      "message": 3
                    }
                ],
                "background": {
                    "beginsPattern": "^.*starting Dapr Runtime.*",
                    "endsPattern": "^.*waiting on port.*"
                }
            }
        },
        {
            "label": "daprd-leaderboard",
            "command": "daprd",
            "args": [
                "-app-id",
                "whac-a-mole--leaderboard",
                "-app-port",
                "5000",
                "-dapr-http-port",
                "51001",
                "-dapr-grpc-port",
                "52001",
                "-placement-host-address",
                "localhost:50005"
            ],
            "isBackground": true,
            "problemMatcher": {
                "pattern": [
                    {
                      "regexp": ".",
                      "file": 1,
                      "location": 2,
                      "message": 3
                    }
                ],
                "background": {
                    "beginsPattern": "^.*starting Dapr Runtime.*",
                    "endsPattern": "^.*waiting on port.*"
                }
            },
            "dependsOn": "build"
        }
    ]
}
```

#### Wrapping up

Once you have made the required changes, you should be able to switch to the [debug](https://code.visualstudio.com/Docs/editor/debugging) view in VSCode and launch your daprized configurations by clicking the "play" button. If everything was configured correctly, you should see daprd launch in the VSCode terminal window and the [debugger](https://code.visualstudio.com/Docs/editor/debugging) should attach to your application (you should see it's output in the debug window). If everything was configured correctly, you should see daprd launch in the VSCode terminal window and the [debugger](https://code.visualstudio.com/Docs/editor/debugging) should attach to your application (you should see it's output in the debug window).

{{% alert title="Note" color="primary" %}}
Since you didn't launch the service(s) using the **dapr** ***run*** cli command, but instead by running **daprd**, the **dapr** ***list*** command will not show a list of apps that are currently running.
{{% /alert %}}