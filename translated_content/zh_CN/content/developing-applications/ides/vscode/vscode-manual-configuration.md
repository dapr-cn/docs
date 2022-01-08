---
type: docs
title: "Visual Studio Code手动调试配置"
linkTitle: "手动调试"
weight: 50000
description: "如何手动设置Visual Studio Code调试"
---

[Dapr VSCode扩展]({{< ref vscode-dapr-extension.md >}})可以自动设置[VSCode调试](https://code.visualstudio.com/Docs/editor/debugging)。

如果你希望手动配置`[tasks.json](https://code.visualstudio.com/Docs/editor/tasks)`和`[launch.json](https://code.visualstudio.com/Docs/editor/debugging)`文件以使用Dapr，这些是步骤。

开发 Dapr应用程序时，您通常使用 Dapr cli 来启动你自定义的dapr服务，就像这样：

```bash
dapr run --app-id nodeapp --app-port 3000 --dapr-http-port 3500 app.js
```

将调试器附加到您的服务中的一种方法是先从命令行中运行符合正确参数的 daprd，然后启动您的代码并附加调试器。 虽然这完全是一个可以接受的解决方案，但它也需要一些额外的步骤，以及对那些可能想要克隆你的仓库并点击 "play "按钮开始调试的开发人员进行一些指导。

使用 [tasks.json](https://code.visualstudio.com/Docs/editor/tasks) 和 [launch.json](https://code.visualstudio.com/Docs/editor/debugging) 文件在 Visual Studio 代码中 您可以简化过程并要求 VS Code 在启动调试器之前启动 daprd 进程。

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

你需要在你的[tasks.json](https://code.visualstudio.com/Docs/editor/tasks)文件中为daprd定义一个任务和问题匹配器。 这里有两个示例(均通过上述 [preLaunchTask](https://code.visualstudio.com/Docs/editor/debugging#_launchjson-attributes) 成员引用。 注意，在 .NET Core daprd 任务(dpred -leaderboard)的情况下，还有一个[dependsOn](https://code.visualstudio.com/Docs/editor/tasks#_compound-tasks)成员，它引用构建任务，以确保最新的代码正在运行/调试。 用了 [problemMatcher](https://code.visualstudio.com/Docs/editor/tasks#_defining-a-problem-matcher)，这样当 daprd 进程启动和运行时，VSCode 就能够知道。

让我们大概看看正在传递到 daprd 命令的参数吧。

* -app-id -- 您微服务的 id (您将如何通过服务调用来定位它)
* -app-port -- 您的应用程序代码正在监听的端口号
* -dapr-http-port -- Dapr api的 http 端口
* -dapr-grpc-port -- Dapr api的 grpc 端口
* -placement-host-address -- 放置服务的位置(这应该在docker中运行，因为它是当你安装了dapr 并运行`dapr init`的时候创建) > 注意: 您将需要确保您为您创建的每个dapr-grpc (-dapr-http-port 和 -dapr-grpc-port) 指定不同的 http/grpc 端口， 否则，当您尝试启动第二个配置时将端口冲突。
> 注意：你需要确保为你创建的每个daprd任务指定不同的http/grpc（-dapr-http-port和-dapr-grpc-port）端口，否则当你试图启动第二个配置时就会遇到端口冲突。

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

#### 收尾

一旦您进行了所需的更改， 您应该能够在 VSCode 中切换到 [debug](https://code.visualstudio.com/Docs/editor/debugging) 视图，然后点击“play”按钮来启动您的调试配置。 如果所有配置正确， 您应该在 VSCode 终端窗口中看到数据启动， [debugger](https://code.visualstudio.com/Docs/editor/debugging) 应该附加到您的应用程序(您应该在调试窗口中看到它的输出)。

{{% alert title="Note" color="primary" %}}
因为您没有使用 ***dapr* run*** cli 命令， 但通过运行 **daprd ***list****** 命令将不会显示当前正在运行的应用列表。
{{% /alert %}}
