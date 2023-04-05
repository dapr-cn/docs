---
type: docs
title: "Build workflow applications with Logic Apps"
linkTitle: "Logic Apps workflows"
description: "Learn how to build workflows applications using Dapr Workflows and Logic Apps runtime"
weight: 3000
---

Dapr Workflows is a lightweight host that allows developers to run cloud-native workflows locally, on-premises or any cloud environment using the [Azure Logic Apps](https://docs.microsoft.com/azure/logic-apps/logic-apps-overview) workflow engine and Dapr.

## Benefits

通过使用工作流引擎，可以以声明性、无代码的方式定义业务逻辑，因此当工作流发生变化时，应用程序代码不需要更改。 Dapr 工作流允许您在分布式应用程序中使用工作流以及这些附加好处：

- **Run workflows anywhere**: on your local machine, on-premises, on Kubernetes or in the cloud
- **Built-in observability**: tracing, metrics and mTLS through Dapr
- **gRPC and HTTP endpoints** for your workflows
- Kick off workflows based on **Dapr bindings** events
- Orchestrate complex workflows by **calling back to Dapr** to save state, publish a message and more

<img src="/images/workflows-diagram.png" width=500 alt="Dapr 工作流图表">

## 工作原理

Dapr Workflows 托管一个实现 Dapr 客户端 API 的 gRPC 服务器。

这允许用户通过 Dapr 使用 gRPC 和 HTTP 终结点启动工作流，或使用 Dapr 绑定异步启动工作流。 工作流请求传入后，Dapr Workflows 将使用 Logic Apps SDK 来执行工作流。

## 支持的工作流功能

### Supported actions and triggers

- [HTTP](https://docs.microsoft.com/azure/connectors/connectors-native-http)
- [Schedule](https://docs.microsoft.com/azure/logic-apps/concepts-schedule-automated-recurring-tasks-workflows)
- [Request / Response](https://docs.microsoft.com/azure/connectors/connectors-native-reqres)

### 支持的控制工作流

- [所有控制工作流](https://docs.microsoft.com/azure/connectors/apis-list#control-workflow)

### 支持的数据操作

- [所有数据操作](https://docs.microsoft.com/azure/connectors/apis-list#manage-or-manipulate-data)

### 不支持

- [已管理连接器](https://docs.microsoft.com/azure/connectors/apis-list#managed-connectors)

## 示例

Dapr Workflows 可用作许多复杂活动的业务流程协调程序。 例如，调用外部终结点、将数据保存到状态存储、将结果发布到其他应用或调用绑定，所有这些都可以通过从工作流本身回调到 Dapr 来完成。

这是由于 Dapr 作为工作流主机旁边的 sidecar 运行，就像它是其他应用程序一样。

检查 [workflow2.json](/code/workflow.json) 作为执行以下操作的工作流的示例：

1. Calls into Azure Functions to get a JSON response
2. Saves the result to a Dapr state store
3. Sends the result to a Dapr binding
4. Returns the result to the caller

由于 Dapr 支持许多可插入的状态存储和绑定，因此工作流可以在不同环境（云、边缘或本地）之间移植，而无需用户更改代码 - *因为不涉及任何代码*。

## 开始

前期准备:

1. Install the [Dapr CLI]({{< ref install-dapr-cli.md >}})
2. [Azure blob存储账户](https://docs.microsoft.com/azure/storage/blobs/storage-blob-create-account-block-blob?tabs=azure-portal)

### Self-hosted

1. Make sure you have the Dapr runtime initialized:

    ```bash
    dapr init
    ```

1. Set up the environment variables containing the Azure Storage Account credentials:

   {{< tabs Windows "macOS/Linux" >}}

   {{% codetab %}}
   ```bash
   export STORAGE_ACCOUNT_KEY=<YOUR-STORAGE-ACCOUNT-KEY>
   export STORAGE_ACCOUNT_NAME=<YOUR-STORAGE-ACCOUNT-NAME>
   ```
   {{% /codetab %}}

   {{% codetab %}}
   ```bash
   set STORAGE_ACCOUNT_KEY=<YOUR-STORAGE-ACCOUNT-KEY>
   set STORAGE_ACCOUNT_NAME=<YOUR-STORAGE-ACCOUNT-NAME>
   ```
   {{% /codetab %}}

   {{< /tabs >}}

1. 切换到工作流目录并运行示例运行时：

   ```bash
   cd src/Dapr.Workflows

   dapr run --app-id workflows --protocol grpc --port 3500 --app-port    50003 -- dotnet run --workflows-path ../../samples
   ```

1. 调用工作流：

   ```bash
   curl http://localhost:3500/v1.0/invoke/workflows/method/workflow1

   {"value":"Hello from Logic App workflow running with    Dapr!"}
   ```

### Kubernetes

1. Make sure you have a running Kubernetes cluster and `kubectl` in your path.

1. 安装 Dapr CLI 后，运行：

   ```bash
   dapr init --kubernetes
   ```

1. 等到 Dapr 容器的状态为 `Running`。

1. 为工作流创建 Config Map：

   ```bash
   kubectl create configmap workflows --from-file ./samples/workflow1.json
   ```

1. 创建包含 Azure 存储帐户凭据的密钥。 将下面的帐户名和密钥值替换为实际凭据：

   ```bash
   kubectl create secret generic dapr-workflows    --from-literal=accountName=<YOUR-STORAGE-ACCOUNT-NAME>    --from-literal=accountKey=<YOUR-STORAGE-ACCOUNT-KEY>
   ```

1. 部署 Dapr Worfklows：

   ```bash
   kubectl apply -f deploy/deploy.yaml
   ```

1. 创建转发到 dapr 工作流容器的端口：

   ```bash
   kubectl port-forward deploy/dapr-workflows-host 3500:3500
   ```

1. 通过 Dapr 调用 Logic Apps：

   ```bash
   curl http://localhost:3500/v1.0/invoke/workflows/method/workflow1

   {"value":"Hello from Logic App workflow running with Dapr!"}
   ```

## 使用 Dapr 绑定调用工作流

1. First, create any [Dapr binding]({{< ref components-reference >}}) of your choice. See [this]({{< ref howto-triggers >}}) How-To tutorial.

   In order for Dapr Workflows to be able to start a workflow from a Dapr binding event, simply name the binding with the name of the workflow you want it to trigger.

   Here's an example of a Kafka binding that will trigger a workflow named `workflow1`:

   ```yaml
   apiVersion: dapr.io/v1alpha1
   kind: Component
   metadata:
     name: workflow1
   spec:
     type: bindings.kafka
     metadata:
     - name: topics
       value: topic1
     - name: brokers
       value: localhost:9092
     - name: consumerGroup
       value: group1
     - name: authRequired
       value: "false"
   ```

1. Next, apply the Dapr component:

   {{< tabs 自托管 Kubernetes >}}

   {{% codetab %}}
   将上面的绑定 yaml 文件放在应用程序根目录 `components` 中。
   {{% /codetab %}}

   {{% codetab %}}
   ```bash
   kubectl apply -f my_binding.yaml
   ```
   {{% /codetab %}}

   {{< /tabs >}}

1. Once an event is sent to the bindings component, check the logs Dapr Workflows to see the output.

   {{< tabs 自托管 Kubernetes >}}

   {{% codetab %}}
   在独立模式下，输出将打印到本地终端。
   {{% /codetab %}}

   {{% codetab %}}
   在 Kubernetes 上，运行以下命令：

   ```bash
   kubectl logs -l app=dapr-workflows-host -c host
   ```
   {{% /codetab %}}

   {{< /tabs >}}

## 示例

查看 Dapr 社区的示例：

<div class="embed-responsive embed-responsive-16by9">
<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/7fP-0Ixmi-w?start=116" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

## 其他资源

- [Blog announcement](https://cloudblogs.microsoft.com/opensource/2020/05/26/announcing-cloud-native-workflows-dapr-logic-apps/)
- [仓库](https://github.com/dapr/workflows)
