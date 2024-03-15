---
type: docs
title: 如何：在 .NET SDK 中创作和管理 Dapr 工作流
linkTitle: 如何：创作和管理工作流
weight: 100000
description: 了解如何使用 .NET SDK 创作和管理 Dapr 工作流
---

让我们创建一个 Dapr 工作流，并使用控制台调用它。 在[提供的订单处理工作流示例](https://github.com/dapr/dotnet-sdk/tree/master/examples/Workflow)，控制台提示提供了购买和补货物品的指导。 在本指南中，您将：

- 部署一个.NET控制台应用程序（[WorkflowConsoleApp](https://github.com/dapr/dotnet-sdk/tree/master/examples/Workflow/WorkflowConsoleApp)）。
- 利用 .NET 工作流 SDK 和 API 调用来启动和查询工作流实例。

在 .NET 示例项目中：

- 主要的[`Program.cs`](https://github.com/dapr/dotnet-sdk/blob/master/examples/Workflow/WorkflowConsoleApp/Program.cs)文件包含了应用程序的设置，包括工作流和工作流活动的注册。
- 工作流定义可以在[`Workflows`目录](https://github.com/dapr/dotnet-sdk/tree/master/examples/Workflow/WorkflowConsoleApp/Workflows)中找到。
- 工作流活动定义可以在 [`Activities` 目录](https://github.com/dapr/dotnet-sdk/tree/master/examples/Workflow/WorkflowConsoleApp/Activities) 中找到。

## 前期准备

- 已安装 [.NET 6+](https://dotnet.microsoft.com/download)
- [Dapr CLI](https://docs.dapr.io/getting-started/install-dapr-cli/)
- [初始化 Dapr 环境](https://docs.dapr.io/getting-started/install-dapr-selfhost/)
- [Dapr .NET SDK](https://github.com/dapr/dotnet-sdk/)

## 设置环境

克隆 [.NET SDK 仓库](https://github.com/dapr/dotnet-sdk)。

```sh
git clone https://github.com/dapr/dotnet-sdk.git
```

从 .NET SDK 根目录中，导航到 Dapr Workflow 示例。

```sh
cd examples/Workflow
```

## 在本地运行应用程序

要运行 Dapr 应用程序，您需要启动 .NET 程序和 Dapr sidecar。 导航到 `WorkflowConsoleApp` 目录。

```sh
cd WorkflowConsoleApp
```

启动程序。

```sh
dotnet run
```

在新的终端中，再次导航到`WorkflowConsoleApp`目录，并在程序旁边运行Dapr sidecar。

```sh
dapr run --app-id wfapp --dapr-grpc-port 4001 --dapr-http-port 3500
```

> Dapr 在 `http://localhost:3500` 处监听HTTP请求，并在 `http://localhost:4001` 处监听内部工作流gRPC请求。

## 开始新工作流程

要启动一个工作流，您有两个选项：

1. 按照控制台提示的指示操作。
2. 使用工作流 API 并直接向 Dapr 发送请求。

本指南重点介绍工作流 API 选项。

{{% alert title="Note" color="primary" %}}

- 您可以在`WorkflowConsoleApp`/`demo.http`文件中找到以下命令。
- Curl 请求的正文是用作工作流输入的采购订单信息。
- 命令中的"12345678"代表工作流的唯一标识符，可以替换为您选择的任何标识符。
  {{% /alert %}}

运行以下命令以启动工作流。

{{< tabs "Linux/MacOS" "Windows">}}

{{% codetab %}}

```bash
curl -i -X POST http://localhost:3500/v1.0-beta1/workflows/dapr/OrderProcessingWorkflow/start?instanceID=12345678 \
  -H "Content-Type: application/json" \
  -d '{"Name": "Paperclips", "TotalCost": 99.95, "Quantity": 1}'
```

{{% /codetab %}}

{{% codetab %}}

```powershell
curl -i -X POST http://localhost:3500/v1.0-beta1/workflows/dapr/OrderProcessingWorkflow/start?instanceID=12345678 `
  -H "Content-Type: application/json" `
  -d '{"Name": "Paperclips", "TotalCost": 99.95, "Quantity": 1}'
```

{{% /codetab %}}

{{< /tabs >}}

如果成功，您应看到如下所示的响应：

```json
{"instanceID":"12345678"}
```

发送 HTTP 请求以获取已启动的工作流的状态：

```bash
curl -i -X GET http://localhost:3500/v1.0-beta1/workflows/dapr/12345678
```

该工作流设计为需要几秒钟才能完成。 如果在发出HTTP请求时工作流尚未完成，您将会看到以下JSON响应（为了可读性进行格式化），其中工作流状态为`RUNNING`：

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

工作流完成运行后，您应该会看到以下输出，指示它已到达 `COMPLETED` 状态:

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

当工作流程完成时，工作流应用的标准输出应该如下所示：

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

如果您在计算机上本地为 Dapr 配置了 Zipkin，则可以在 Zipkin Web UI 中查看工作流的 trace span（通常在 http\://localhost:9411/zipkin/）。

## 例子

观看这个视频[demonstrating .NET Workflow](https://youtu.be/BxiKpEmchgQ?t=2557):

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/BxiKpEmchgQ?start=2557" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## 下一步

- [尝试 Dapr 快速入门]({{< ref workflow-quickstart.md >}})
- [了解有关Dapr Workflow的更多信息]({{< ref workflow-overview.md >}})
