---
type: docs
title: "Visual Studio Code与Dapr 集成"
linkTitle: "Visual Studio Code"
weight: 1000
description: "有关如何在 VS Code中开发和运行Dapr应用程序的介绍"
---

## Extension

Dapr提供了一个*预览版* [的Dapr Visual Studio Code扩展](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-dapr) ，用于您的Dapr应用程序的本地开发和调试。

<a href="vscode:extension/ms-azuretools.vscode-dapr" class="btn btn-primary" role="button">在 VSCode 中打开</a>

### 功能概述
- Scaffold Dapr task, launch, and component assets <br /><img src="/images/vscode-extension-scaffold.png" alt="Screenshot of the Dapr VSCode extension scaffold option" width="800" />
- 查看正在运行的 Dapr 应用程序 <br /><img src="/images/vscode-extension-view.png" alt="Screenshot of the Dapr VSCode extension view running applications option" width="800" />
- 调用 Dapr 应用的方法  <br /><img src="/images/vscode-extension-invoke.png" alt="Screenshot of the Dapr VSCode extension invoke option" width="800" />
- 发布事件到 Dapr 应用程序 <br /><img src="/images/vscode-extension-publish.png" alt="Screenshot of the Dapr VSCode extension publish option" width="800" />

#### 示例
观看有关如何使用 Dapr VS 代码扩展的 [视频](https://www.bilibili.com/video/BV1QK4y1p7fn?p=9&t=85): <iframe width="560" height="315" src="https://www.youtube.com/embed/OtbYCBt9C34?start=85" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen mark="crwd-mark"></iframe>

## Remote Dev Containers

The Visual Studio Code Remote Containers extension lets you use a Docker container as a full-featured development environment enabling you to [develop inside a container](https://code.visualstudio.com/docs/remote/containers) without installing any additional frameworks or packages to your local filesystem.

Dapr has pre-built Docker remote containers for each of the language SDKs. You can pick the one of your choice for a ready made environment. Note these pre-built containers automatically update to the latest Dapr release. You can pick the one of your choice for a ready made environment. Note these pre-built containers automatically update to the latest Dapr release.

### Setup a remote dev container

#### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Visual Studio Code](https://code.visualstudio.com/)
- [VSCode Remote Development extension pack](https://aka.ms/vscode-remote/download/extension)

#### Create remote Dapr container
1. Open your application workspace in VS Code
2. In the command command palette (ctrl+shift+p) type and select `Remote-Containers: Add Development Container Configuration Files...` <br /><img src="/images/vscode-remotecontainers-addcontainer.png" alt="Screenshot of adding a remote container" width="700" />
3. Type `dapr` to filter the list to available Dapr remote containers and choose the language container that matches your application. Note you may need to select `Show All Definitions...` Note you may need to select `Show All Definitions...` <br /><img src="/images/vscode-remotecontainers-daprcontainers.png" alt="Screenshot of adding a Dapr container" width="700" />
4. Follow the prompts to rebuild your application in container. <br /><img src="/images/vscode-remotecontainers-reopen.png" alt="Screenshot of reopening an application in the dev container" width="700" />

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
The dapr runtime (daprd) will not automatically generate the components yaml files for Redis. These will need to be created manually or you will need to run the dapr cli (dapr) once in order to have them created automatically. These will need to be created manually or you will need to run the dapr cli (dapr) once in order to have them created automatically.
{{% /alert %}}

One approach to attaching the debugger to your service is to first run daprd with the correct arguments from the command line and then launch your code and attach the debugger. While this is a perfectly acceptable solution, it does require a few extra steps and some instruction to developers who might want to clone your repo and hit the "play" button to begin debugging. While this is a perfectly acceptable solution, it does require a few extra steps and some instruction to developers who might want to clone your repo and hit the "play" button to begin debugging.

Using the [tasks.json](https://code.visualstudio.com/Docs/editor/tasks) and [launch.json](https://code.visualstudio.com/Docs/editor/debugging) files in Visual Studio Code, you can simplify the process and request that VS Code kick off the daprd process prior to launching the debugger.

Let's get started!

#### Modifying launch.json configurations to include a preLaunchTask

In your [launch.json](https://code.visualstudio.com/Docs/editor/debugging) file add a [preLaunchTask](https://code.visualstudio.com/Docs/editor/debugging#_launchjson-attributes) for each configuration that you want daprd launched. The [preLaunchTask](https://code.visualstudio.com/Docs/editor/debugging#_launchjson-attributes) will reference tasks that you define in your tasks.json file. Here is an example for both Node and .NET Core. Notice the [preLaunchTasks](https://code.visualstudio.com/Docs/editor/debugging#_launchjson-attributes) referenced: daprd-web and daprd-leaderboard. The [preLaunchTask](https://code.visualstudio.com/Docs/editor/debugging#_launchjson-attributes) will reference tasks that you define in your tasks.json file. Here is an example for both Node and .NET Core. Notice the [preLaunchTasks](https://code.visualstudio.com/Docs/editor/debugging#_launchjson-attributes) referenced: daprd-web and daprd-leaderboard.

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

#### Adding daprd tasks to tasks.json

You will need to define a task and problem matcher for daprd in your [tasks.json](https://code.visualstudio.com/Docs/editor/tasks) file. Here are two examples (both referenced via the [preLaunchTask](https://code.visualstudio.com/Docs/editor/debugging#_launchjson-attributes) members above). Notice that in the case of the .NET Core daprd task (daprd-leaderboard) there is also a [dependsOn](https://code.visualstudio.com/Docs/editor/tasks#_compound-tasks) member that references the build task to ensure the latest code is being run/debugged. The [problemMatcher](https://code.visualstudio.com/Docs/editor/tasks#_defining-a-problem-matcher) is used so that VSCode can understand when the daprd process is up and running. Here are two examples (both referenced via the [preLaunchTask](https://code.visualstudio.com/Docs/editor/debugging#_launchjson-attributes) members above). Notice that in the case of the .NET Core daprd task (daprd-leaderboard) there is also a [dependsOn](https://code.visualstudio.com/Docs/editor/tasks#_compound-tasks) member that references the build task to ensure the latest code is being run/debugged. The [problemMatcher](https://code.visualstudio.com/Docs/editor/tasks#_defining-a-problem-matcher) is used so that VSCode can understand when the daprd process is up and running.

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