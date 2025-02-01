---
type: docs
title: "如何：在 .NET SDK 中编写和管理 Dapr 工作流"
linkTitle: "如何：编写和管理工作流"
weight: 100000
description: 学习如何使用 .NET SDK 编写和管理 Dapr 工作流
---

我们来创建一个 Dapr 工作流并通过控制台调用它。在[提供的订单处理工作流示例](https://github.com/dapr/dotnet-sdk/tree/master/examples/Workflow)中，控制台会提示如何进行购买和补货。在本指南中，您将：

- 部署一个 .NET 控制台应用程序 ([WorkflowConsoleApp](https://github.com/dapr/dotnet-sdk/tree/master/examples/Workflow/WorkflowConsoleApp))。
- 使用 .NET 工作流 SDK 和 API 调用来启动和查询工作流实例。

在 .NET 示例项目里：
- 主要的 [`Program.cs`](https://github.com/dapr/dotnet-sdk/blob/master/examples/Workflow/WorkflowConsoleApp/Program.cs) 文件包含应用程序的设置，包括工作流和工作流活动的注册。
- 工作流定义位于 [`Workflows` 目录](https://github.com/dapr/dotnet-sdk/tree/master/examples/Workflow/WorkflowConsoleApp/Workflows)中。
- 工作流活动定义位于 [`Activities` 目录](https://github.com/dapr/dotnet-sdk/tree/master/examples/Workflow/WorkflowConsoleApp/Activities)中。

## 先决条件

- [Dapr CLI](https://docs.dapr.io/getting-started/install-dapr-cli/)
- [已初始化的 Dapr 环境](https://docs.dapr.io/getting-started/install-dapr-selfhost/)
- 安装 [.NET 7](https://dotnet.microsoft.com/download/dotnet/7.0)、[.NET 8](https://dotnet.microsoft.com/download/dotnet/8.0) 或 [.NET 9](https://dotnet.microsoft.com/download/dotnet/9.0)

{{% alert title="注意" color="primary" %}}

Dapr.Workflows 在 v1.15 中支持 .NET 7 或更高版本。然而，从 Dapr v1.16 开始，仅支持 .NET 8 和 .NET 9。

{{% /alert %}}

## 设置环境

克隆 [.NET SDK 仓库](https://github.com/dapr/dotnet-sdk)。

```sh
git clone https://github.com/dapr/dotnet-sdk.git
```

从 .NET SDK 根目录，导航到 Dapr 工作流示例。

```sh
cd examples/Workflow
```

## 本地运行应用程序

要运行 Dapr 应用程序，您需要启动 .NET 程序和一个 Dapr sidecar。导航到 `WorkflowConsoleApp` 目录。

```sh
cd WorkflowConsoleApp
```

启动程序。

```sh
dotnet run
```

在一个新的终端中，再次导航到 `WorkflowConsoleApp` 目录，并在程序旁边运行 Dapr sidecar。

```sh
dapr run --app-id wfapp --dapr-grpc-port 4001 --dapr-http-port 3500
```

> Dapr 会监听 HTTP 请求在 `http://localhost:3500` 和内部工作流 gRPC 请求在 `http://localhost:4001`。

## 启动工作流

要启动工作流，您有两种选择：

1. 按照控制台提示的指示。
2. 使用工作流 API 并直接向 Dapr 发送请求。

本指南重点介绍工作流 API 选项。

{{% alert title="注意" color="primary" %}}
  - 您可以在 `WorkflowConsoleApp`/`demo.http` 文件中找到以下命令。
  - curl 请求的主体是作为工作流输入的采购订单信息。
  - 命令中的 "12345678" 表示工作流的唯一标识符，可以替换为您选择的任何标识符。
{{% /alert %}}

运行以下命令以启动工作流。

{{< tabs "Linux/MacOS" "Windows">}}

{{% codetab %}}

```bash
curl -i -X POST http://localhost:3500/v1.0/workflows/dapr/OrderProcessingWorkflow/start?instanceID=12345678 \
  -H "Content-Type: application/json" \
  -d '{"Name": "Paperclips", "TotalCost": 99.95, "Quantity": 1}'
```

{{% /codetab %}}

{{% codetab %}}

```powershell
curl -i -X POST http://localhost:3500/v1.0/workflows/dapr/OrderProcessingWorkflow/start?instanceID=12345678 `
  -H "Content-Type: application/json" `
  -d '{"Name": "Paperclips", "TotalCost": 99.95, "Quantity": 1}'
```

{{% /codetab %}}

{{< /tabs >}}

如果成功，您应该会看到如下响应：

```json
{"instanceID":"12345678"}
```

发送 HTTP 请求以获取已启动工作流的状态：

```bash
curl -i -X GET http://localhost:3500/v1.0/workflows/dapr/12345678
```

工作流设计为需要几秒钟才能完成。如果在您发出 HTTP 请求时工作流尚未完成，您将看到以下 JSON 响应（为便于阅读而格式化），工作流状态为 `RUNNING`：

```json
{
  "instanceID": "12345678",
  "workflowName": "OrderProcessingWorkflow",
  "createdAt": "2023-05-10T00:42:03.911444105Z",
  "lastUpdatedAt": "2023-05-10T00:42:06.142214153Z",
  "runtimeStatus": "RUNNING",
  "properties": {
    "dapr.workflow.custom_status": "",
    "dapr.workflow.input": "{\"Name\": \"Paperclips\", \"TotalCost\": 99.95, \"Quantity\": 1}"
  }
}
```

一旦工作流完成运行，您应该会看到以下输出，表明它已达到 `COMPLETED` 状态：

```json
{
  "instanceID": "12345678",
  "workflowName": "OrderProcessingWorkflow",
  "createdAt": "2023-05-10T00:42:03.911444105Z",
  "lastUpdatedAt": "2023-05-10T00:42:18.527704176Z",
  "runtimeStatus": "COMPLETED",
  "properties": {
    "dapr.workflow.custom_status": "",
    "dapr.workflow.input": "{\"Name\": \"Paperclips\", \"TotalCost\": 99.95, \"Quantity\": 1}",
    "dapr.workflow.output": "{\"Processed\":true}"
  }
}
```

当工作流完成时，工作流应用程序的标准输出应如下所示：

```log
info: WorkflowConsoleApp.Activities.NotifyActivity[0]
      Received order 12345678 for Paperclips at $99.95
info: WorkflowConsoleApp.Activities.ReserveInventoryActivity[0]
      Reserving inventory: 12345678, Paperclips, 1
info: WorkflowConsoleApp.Activities.ProcessPaymentActivity[0]
      Processing payment: 12345678, 99.95, USD
info: WorkflowConsoleApp.Activities.NotifyActivity[0]
      Order 12345678 processed successfully!
```

如果您在本地机器上为 Dapr 配置了 Zipkin，那么您可以在 Zipkin Web UI（通常在 http://localhost:9411/zipkin/）中查看工作流跟踪跨度。

## 演示

观看此视频[演示 .NET 工作流](https://youtu.be/BxiKpEmchgQ?t=2557)：

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/BxiKpEmchgQ?start=2557" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## 下一步

- [尝试 Dapr 工作流快速入门]({{< ref workflow-quickstart.md >}})
- [了解更多关于 Dapr 工作流的信息]({{< ref workflow-overview.md >}})
