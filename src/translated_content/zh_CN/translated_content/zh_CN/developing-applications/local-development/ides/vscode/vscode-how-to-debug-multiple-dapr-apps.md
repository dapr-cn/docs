---
type: docs
title: "操作方法：使用 Visual Studio 代码调试 Dapr"
linkTitle: "操作方法：使用 VSCode 调试"
weight: 20000
description: "了解如何配置 VSCode 来调试 Dapr 应用程序"
aliases:
  - /zh-hans/development-applications/ides/vscode/vscode-manual-configuration/
---

## Manual debugging

When developing Dapr applications, you typically use the Dapr CLI to start your daprized service similar to this:

```bash
dapr run --app-id nodeapp --app-port 3000 --dapr-http-port 3500 app.js
```

One approach to attaching the debugger to your service is to first run daprd with the correct arguments from the command line and then launch your code and attach the debugger. While this is a perfectly acceptable solution, it does require a few extra steps and some instruction to developers who might want to clone your repo and hit the "play" button to begin debugging.

如果您的应用程序是一组微服务，每个程序都有 Dapr sidecar，那么在 Visual Studio 代码中将其一起调试将会更加有意义。  本章将使用 [Hello world quickstart](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-world) 来演示如何使用 [VSCode 调试](https://code.visualstudio.com/Docs/editor/debugging) 来配置 VSCode 调试多个Dapr 应用程序。

## Prerequisites

- Install the [Dapr extension]({{< ref vscode-dapr-extension.md >}}). You will be using the [tasks](https://code.visualstudio.com/docs/editor/tasks) it offers later on.
- Optionally clone the [hello world quickstart](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-world)

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

If you're using ports other than the default ports baked into the code, set the `DAPR_HTTP_PORT` and `DAPR_GRPC_PORT` environment variables in the `launch.json` debug configuration. Match with the `httpPort` and `grpcPort` in the daprd `tasks.json`. For example, `launch.json`:

```json
{
  // Set the non-default HTTP and gRPC ports
  "env": {
      "DAPR_HTTP_PORT": "3502",
      "DAPR_GRPC_PORT": "50002"
  },
}
```

`tasks.json`:

```json
{
  // Match with ports set in launch.json
  "httpPort": 3502,
  "grpcPort": 50002
}
```

Each configuration requires a `request`, `type` and `name`. These parameters help VSCode identify the task configurations in the `.vscode/tasks.json` files.

- `type` defines the language used.  Depending on the language, it might require an extension found in the marketplace, such as the [Python Extension](https://marketplace.visualstudio.com/items?itemName=ms-python.python).
- `name` 是配置的唯一名称。 当在你的项目中调用多个配置时，这被用于复合配置。
- `${workspaceFolder}` 是一个VS代码的变量引用。 这是在VS Code中打开的工作区的路径。
- `preLaunchTask` 和 `postDebugTask` 参数是指启动应用程序之前和之后运行的程序配置。 有关如何配置这些选项，请参阅步骤 2。

For more information on VSCode debugging parameters see [VS Code launch attributes](https://code.visualstudio.com/Docs/editor/debugging#_launchjson-attributes).

## Step 2: Configure tasks.json

For each [task](https://code.visualstudio.com/docs/editor/tasks) defined in `.vscode/launch.json` , a corresponding task definition must exist in `.vscode/tasks.json`.

For the quickstart, each service needs a task to launch a Dapr sidecar with the `daprd` type, and a task to stop the sidecar with `daprd-down`. The parameters `appId`, `httpPort`, `metricsPort`, `label` and `type` are required. Additional optional parameters are available, see the [reference table here](#daprd-parameter-table").

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

A compound launch configuration can defined in `.vscode/launch.json` and is a set of two or more launch configurations that are launched in parallel. Optionally, a `preLaunchTask` can be specified and run before the individual debug sessions are started.

For this example the compound configuration is:

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

You can now run the applications in debug mode by finding the compound command name you have defined in the previous step in the VS Code debugger:

<img src="/images/vscode-launch-configuration.png" width=400 >

You are now debugging multiple applications with Dapr!

## Daprd参数表

Below are the supported parameters for VS Code tasks. These parameters are equivalent to `daprd` arguments as detailed in [this reference]({{< ref arguments-annotations-overview.md >}}):

| Parameter              | 说明                                                                              | 必填        | 示例                                                 |
| ---------------------- | ------------------------------------------------------------------------------- | --------- | -------------------------------------------------- |
| `allowedOrigins`       | Allowed HTTP origins (default "\*")                                           | No        | `"allowedOrigins": "*"`                            |
| `appId`                | 应用程序唯一 ID。 用于服务发现、状态封装 和 发布/订阅 消费者ID                                            | Yes       | `"appId": "divideapp"`                             |
| `appMaxConcurrency`    | Limit the concurrency of your application. 有效的数值是大于 0                           | No        | `"appMaxConcurrency": -1`                          |
| `appPort`              | 这个参数告诉Dapr你的应用程序正在监听哪个端口。                                                       | Yes       | `"appPort": 4000`                                  |
| `appProtocol`          | Tells Dapr which protocol your application is using. 有效选项是http和grpc。 默认为http    | No        | `"appProtocol": "http"`                            |
| `appSsl`               | 将应用的 URI 方案设置为 https 并尝试 SSL 连接                                                 | No        | `"appSsl": true`                                   |
| `args`                 | 设置要传递给 Dapr 应用的参数列表                                                             | No        | "args": []                                         |
| `componentsPath`       | Path for components directory. If empty, components will not be loaded.         | No        | `"componentsPath": "./components"`                 |
| `config`               | Tells Dapr which Configuration CRD to use                                       | No        | `"config": "./config"`                             |
| `controlPlaneAddress`  | Address for a Dapr control plane                                                | No        | `"controlPlaneAddress": "http://localhost:1366/"`  |
| `enableProfiling`      | Enable profiling                                                                | No        | `"enableProfiling": false`                         |
| `enableMtls`           | Enables automatic mTLS for daprd to daprd communication channels                | No        | `"enableMtls": false`                              |
| `grpcPort`             | dapr API要监听的gRPC端口（默认为 "50001"）。                                                | 是，如果有多个应用 | `"grpcPort": 50004`                                |
| `httpPort`             | The HTTP port for the Dapr API                                                  | Yes       | `"httpPort": 3502`                                 |
| `internalGrpcPort`     | gRPC port for the Dapr Internal API to listen on                                | No        | `"internalGrpcPort": 50001`                        |
| `logAsJson`            | 将此参数设置为true以JSON格式输出日志。 Default is false                                        | No        | `"logAsJson": false`                               |
| `logLevel`             | Sets the log level for the Dapr sidecar. 允许的值是debug, info, warn, error。 默认为info | No        | `"logLevel": "debug"`                              |
| `metricsPort`          | Sets the port for the sidecar metrics server. 默认值为 9090。                        | 是，如果有多个应用 | `"metricsPort": 9093`                              |
| `mode`                 | Dapr 的运行时模式（默认"独立"）                                                             | No        | `"mode": "standalone"`                             |
| `placementHostAddress` | Addresses for Dapr Actor Placement servers                                      | No        | `"placementHostAddress": "http://localhost:1313/"` |
| `profilePort`          | 配置文件服务器端口(默认 "7777”)                                                            | No        | `"profilePort": 7777`                              |
| `sentryAddress`        | Address for the Sentry CA service                                               | No        | `"sentryAddress": "http://localhost:1345/"`        |
| `type`                 | 告诉VS Code它将是一个daprd任务类型                                                         | Yes       | `"type": "daprd"`                                  |


## 相关链接

- [Visual Studio Code Extension Overview]({{< ref vscode-dapr-extension.md >}})
- [Visual Studio Code 调试](https://code.visualstudio.com/docs/editor/debugging)
