---
type: docs
title: "操作方法：使用 Visual Studio 代码调试 Dapr"
linkTitle: "操作方法：使用 VSCode 调试"
weight: 20000
description: "了解如何配置 VSCode 来调试 Dapr 应用程序"
aliases:
  - /zh-hans/development-applications/ides/vscode/vscode-manual-configuration/
---

## 手动调试

开发 Dapr 应用程序时，通常使用 Dapr CLI 来启动你的 Dapr 服务，就像这样：

```bash
dapr run --app-id nodeapp --app-port 3000 --dapr-http-port 3500 app.js
```

将调试器附加到您的服务中的一种方法是先从命令行中运行符合正确参数的 daprd，然后启动您的代码并附加调试器。 虽然这完全是一个可以接受的解决方案，但它也需要一些额外的步骤，以及对那些可能想要克隆你的仓库并点击 "play "按钮开始调试的开发人员进行一些指导。

如果您的应用程序是一组微服务，每个程序都有 Dapr sidecar，那么在 Visual Studio 代码中将其一起调试将会更加有意义。  本章将使用 [Hello world quickstart](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-world) 来演示如何使用 [VSCode 调试](https://code.visualstudio.com/Docs/editor/debugging) 来配置 VSCode 调试多个Dapr 应用程序。

## 前期准备

- 安装 [Dapr 扩展]({{< ref vscode-dapr-extension.md >}})。 您将使用它稍后提供的 [功能](https://code.visualstudio.com/docs/editor/tasks)。
- 如果还未 clone 项目，clone [hello world quickstart](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-world)

## 步骤 1：配置 launch.json

文件 `.vscode/launch.json` 包含 [启动配置](https://code.visualstudio.com/Docs/editor/debugging#_launch-configurations) 用于 VS Code 调试运行。 此文件定义在用户开始调试时将启动的内容以及如何配置它。 [Visual Studio Code 市场中的每种编程语言都提供配置](https://marketplace.visualstudio.com/VSCode)。

{{% alert title="Scaffold debugging configuration" color="primary" %}}
[Dapr VSCode扩展]({{< ref vscode-dapr-extension.md >}}) 提供内置的脚手架，为你生成 `launch.json` 和 `tasks.json` 。

{{< button text="Learn more" page="vscode-dapr-extension#scaffold-dapr-components" >}}
{{% /alert %}}

在 hello world 快速入门的例子里，将启动两个应用程序，每个应用程序都有自己的 Dapr sidecar。 一个是用Node.JS编写的，另一个是用Python编写的。 你会注意到每个配置都包含一个 `daprd run` preLaunchTask和一个 `daprd stop` postDebugTask。

```json
{
    "version": "0.2.0",
    "configurations": [
       {
         "type": "pwa-node",
         "request": "launch",
         "name": "Nodeapp with Dapr",
         "skipFiles": [
             "<node_internals>/**"
         ],
         "program": "${workspaceFolder}/node/app.js",
         "preLaunchTask": "daprd-debug-node",
         "postDebugTask": "daprd-down-node"
       },
       {
         "type": "python",
         "request": "launch",
         "name": "Pythonapp with Dapr",
         "program": "${workspaceFolder}/python/app.py",
         "console": "integratedTerminal",
         "preLaunchTask": "daprd-debug-python",
         "postDebugTask": "daprd-down-python"
       }
    ]
}
```

如果您正在使用与代码中默认端口不同的端口，请在`launch.json`调试配置中设置`DAPR_HTTP_PORT`和`DAPR_GRPC_PORT`环境变量。 与 daprd `tasks.json` 中的 `httpPort` 和 `grpcPort` 匹配。 例如，`launch.json`：

```json
{
  // Set the non-default HTTP and gRPC ports
  "env": {
      "DAPR_HTTP_PORT": "3502",
      "DAPR_GRPC_PORT": "50002"
  },
}
```

`tasks.json`：

```json
{
  // Match with ports set in launch.json
  "httpPort": 3502,
  "grpcPort": 50002
}
```

每个配置都需要一个 `request`, `type` 和`name`。 这些参数可帮助 VSCode 识别 `.vscode/tasks.json` 文件中的任务配置。

- `type` 定义所使用的语言。  根据语言的不同，它可能需要在市场上找到一个扩展，如 [Python扩展](https://marketplace.visualstudio.com/items?itemName=ms-python.python)。
- `name` 是配置的唯一名称。 当在你的项目中调用多个配置时，这被用于复合配置。
- `${workspaceFolder}` 是一个VS代码的变量引用。 这是在VS Code中打开的工作区的路径。
- `preLaunchTask` 和 `postDebugTask` 参数是指启动应用程序之前和之后运行的程序配置。 有关如何配置这些选项，请参阅步骤 2。

关于 VSCode 调试参数的更多信息，见 [VS Code 启动属性](https://code.visualstudio.com/Docs/editor/debugging#_launchjson-attributes)。

## 步骤 2：配置 tasks.json

对于每个[在 `.vscode/launch.json` 中定义的任务](https://code.visualstudio.com/docs/editor/tasks) ，必须在 `.vscode/tasks.json` 中存在一个相应的任务定义。

对于快速入门，每个服务都需要一个任务来启动具有 `daprd` 类型的 Dapr 边车，以及一个使用 `daprd-down` 停止边车的任务。 参数 `appId`, `httpPort`, `metricsPort`, `label` 和 `type` 是必须的。 还有其他的可选参数，请看这里的 [参考表](#daprd-parameter-table")。

```json
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "daprd-debug-node",
            "type": "daprd",
            "appId": "nodeapp",
            "appPort": 3000,
            "httpPort": 3500,
            "metricsPort": 9090
        },
        {
            "label": "daprd-down-node",
            "type": "daprd-down",
            "appId": "nodeapp"
        },
        {
            "label": "daprd-debug-python",
            "type": "daprd",
            "appId": "pythonapp",
            "httpPort": 53109,
            "grpcPort": 53317,
            "metricsPort": 9091
        },
        {
            "label": "daprd-down-python",
            "type": "daprd-down",
            "appId": "pythonapp"
        }
   ]
}
```

## 步骤 3：在 launch.json 中配置复合启动

复合启动配置可以在 `.vscode/launch.json` 中定义，并且是并行启动的两个或多个启动配置的集合。 （可选）可以在启动各个调试会话之前指定并运行 `预启动任务` 。

对于此示例，复合配置为：

```json
{
   "version": "2.0.0",
   "configurations": [...],
   "compounds": [
      {
        "name": "Node/Python Dapr",
        "configurations": ["Nodeapp with Dapr","Pythonapp with Dapr"]
      }
    ]
}
```

## 步骤 4：启动调试会话

现在你可以通过在 VS Code 调试器中找到你在上一步定义的复合命令名称，在调试模式下运行应用程序。

<img src="/images/vscode-launch-configuration.png" width=400 >

你现在是在用Dapr调试多个应用程序了!

## Daprd参数表

以下是VS Code任务所支持的参数。 这些参数等同于 `daprd` 参数，详见 [本参考]({{< ref arguments-annotations-overview.md >}})。

| 参数                     | 说明                                                                                    | 必填        | 示例                                                 |
| ---------------------- | ------------------------------------------------------------------------------------- | --------- | -------------------------------------------------- |
| `allowedOrigins`       | 允许的HTTP来源（默认为 "*"）。                                                                   | No        | `"allowedOrigins": "*"`                            |
| `appId`                | 应用程序唯一 ID。 用于服务发现、状态封装 和 发布/订阅 消费者ID                                                  | Yes       | `"appId": "divideapp"`                             |
| `appMaxConcurrency`    | 限制应用程序的并发量。 有效的数值是大于 0                                                                | No        | `"appMaxConcurrency": -1`                          |
| `appPort`              | 这个参数告诉Dapr你的应用程序正在监听哪个端口。                                                             | Yes       | `"appPort": 4000`                                  |
| `appProtocol`          | 告诉 Dapr 你的应用程序正在使用哪种协议。 有效的选项是`http`，`grpc`，`https`，`grpcs`，`h2c`。 Default is `http`. | No        | `"appProtocol": "http"`                            |
| `args`                 | 设置要传递给 Dapr 应用的参数列表                                                                   | No        | "args": []                                         |
| `componentsPath`       | Components 目录的路径. 如果为空，将不会加载组件。                                                       | No        | `"componentsPath": "./components"`                 |
| `config`               | 告诉 Dapr 要使用哪个配置资源                                                                     | No        | `"config": "./config"`                             |
| `controlPlaneAddress`  | Dapr 控制平面的地址                                                                          | No        | `"controlPlaneAddress": "http://localhost:1366/"`  |
| `enableProfiling`      | 启用性能分析                                                                                | No        | `"enableProfiling": false`                         |
| `enableMtls`           | 为 daprd 到 daprd 通信通道启用自动 mTLS                                                         | No        | `"enableMtls": false`                              |
| `grpcPort`             | dapr API要监听的gRPC端口（默认为 "50001"）。                                                      | 是，如果有多个应用 | `"grpcPort": 50004`                                |
| `httpPort`             | Dapr API 的 HTTP 端口                                                                    | Yes       | `"httpPort": 3502`                                 |
| `internalGrpcPort`     | 用于监听 Dapr 内部 API 的 gRPC 端口                                                            | No        | `"internalGrpcPort": 50001`                        |
| `logAsJson`            | 将此参数设置为true以JSON格式输出日志。 默认为 false                                                     | No        | `"logAsJson": false`                               |
| `logLevel`             | 为 Dapr sidecar设置日志级别。 允许的值是debug, info, warn, error。 默认为info                          | No        | `"logLevel": "debug"`                              |
| `metricsPort`          | 设置 sidecar 度量服务器的端口。 默认值为 9090。                                                       | 是，如果有多个应用 | `"metricsPort": 9093`                              |
| `mode`                 | Dapr 的运行时模式（默认"独立"）                                                                   | No        | `"mode": "standalone"`                             |
| `placementHostAddress` | Dapr Actor Placement 服务器的地址                                                           | No        | `"placementHostAddress": "http://localhost:1313/"` |
| `profilePort`          | 配置文件服务器端口(默认 "7777”)                                                                  | No        | `"profilePort": 7777`                              |
| `sentryAddress`        | Sentry CA 服务地址                                                                        | No        | `"sentryAddress": "http://localhost:1345/"`        |
| `type`                 | 告诉VS Code它将是一个daprd任务类型                                                               | Yes       | `"type": "daprd"`                                  |


## 相关链接

- [Visual Studio Code 扩展概述]({{< ref vscode-dapr-extension.md >}})
- [Visual Studio Code 调试](https://code.visualstudio.com/docs/editor/debugging)
