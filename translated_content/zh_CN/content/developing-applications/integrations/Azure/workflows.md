---
type: docs
title: "使用 Logic Apps 构建工作流应用"
linkTitle: "Logic Apps 工作流"
description: "学习如何使用 Dapr Workflow 和 Logic Apps 运行时构建工作流应用"
weight: 3000
---

Dapr Workflow 是一个轻量级主机，允许开发人员在本地运行云端本地工作流。 使用 [Azure Logic Apps](https://docs.microsoft.com/azure/logic-apps/logic-apps-overview) Workflow 引擎和 Dapr来运行或任何云端环境。

## 优势

通过使用工作流引擎，可以以声明性、无代码的方式定义业务逻辑，因此当工作流发生变化时，应用程序代码不需要更改。 Dapr 工作流允许您在分布式应用程序中使用工作流以及这些附加好处：

- **在任意位置运行工作流**：在本地计算机、企业内部、Kubernetes 或云中
- **内置可观察性**：通过 Dapr 的跟踪、metrics 和 mTLS
- 用于工作流中的 **gRPC 和 HTTP 终结点**
- 启动基于 **Dapr 绑定** 事件的工作流
- 通过**回调 Dapr** 来保存状态、发布消息等来协调复杂的工作流程。

<img src="/images/workflows-diagram.png" width=500 alt="Dapr 工作流图表">

## 工作原理

Dapr Workflows 托管一个实现 Dapr 客户端 API 的 gRPC 服务器。

这允许用户通过 Dapr 使用 gRPC 和 HTTP 终结点启动工作流，或使用 Dapr 绑定异步启动工作流。 工作流请求传入后，Dapr Workflows 将使用 Logic Apps SDK 来执行工作流。

## 支持的工作流功能

### 支持的操作和触发器

- [HTTP](https://docs.microsoft.com/azure/connectors/connectors-native-http)
- [Schedule](https://docs.microsoft.com/azure/logic-apps/concepts-schedule-automated-recurring-tasks-workflows)
- [Request / Response](https://docs.microsoft.com/azure/connectors/connectors-native-reqres)

### 支持的控制工作流

- [所有控制工作流](https://docs.microsoft.com/azure/connectors/apis-list#control-workflow)

### 支持的数据操作

- [所有数据操作](https://docs.microsoft.com/azure/connectors/apis-list#manage-or-manipulate-data)

### 不支持

- [已管理连接器](https://docs.microsoft.com/azure/connectors/apis-list#managed-connectors)

## 例子

Dapr Workflows 可用作许多复杂活动的业务流程协调程序。 例如，调用外部终结点、将数据保存到状态存储、将结果发布到其他应用或调用绑定，所有这些都可以通过从工作流本身回调到 Dapr 来完成。

这是由于 Dapr 作为工作流主机旁边的 sidecar 运行，就像它是其他应用程序一样。

检查 [workflow2.json](/code/workflow.json) 作为执行以下操作的工作流的示例：

1. 调用 Azure 函数以获取 JSON 响应
2. 将结果保存到 Dapr 状态存储
3. 将结果发送到 Dapr 绑定
4. 将结果返回给调用方

由于 Dapr 支持许多可插入的状态存储和绑定，因此工作流可以在不同环境（云、边缘或本地）之间移植，而无需用户更改代码 - *因为不涉及任何代码*。

## Get started

前期准备:

1. 安装 [Dapr CLI]({{< ref install-dapr-cli.md >}})
2. [Azure blob存储账户](https://docs.microsoft.com/azure/storage/blobs/storage-blob-create-account-block-blob?tabs=azure-portal)

### 自托管

1. 确保已初始化 Dapr 运行时：

    ```bash
    dapr init
    ```

1. 设置包含 Azure 存储帐户凭据的环境变量：

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

1. 确保你有一个正在运行的 Kubernetes 集群，并且 `kubectl` 在你的路径中 。

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

1. 首先，创建您选择的任何 [Dapr 绑定]({{< ref components-reference >}}) 。 查看 [这个]({{< ref howto-triggers >}}) 教程。

   为了使 Dapr 工作流能够从 Dapr 绑定事件启动工作流，只需使用您希望它触发的工作流的名称来命名绑定即可。

   下面是一个 Kafka 绑定示例，该绑定将触发名为 `workflow1` 的工作流：

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

1. 接下来，应用 Dapr 组件：

   {{< tabs Self-hosted Kubernetes >}}

   {{% codetab %}}
   将上面的绑定 yaml 文件放在应用程序根目录 `components` 中。
   {{% /codetab %}}

   {{% codetab %}}
   ```bash
   kubectl apply -f my_binding.yaml
   ```
   {{% /codetab %}}

   {{< /tabs >}}

1. 将事件发送到绑定组件后，请检查日志 Dapr 工作流以查看输出。

   {{< tabs Self-hosted Kubernetes >}}

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
<iframe width="560" height="315" src="https://www.youtube.com/embed/7fP-0Ixmi-w?start=116" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

## 其他资源

- [博客公告](https://cloudblogs.microsoft.com/opensource/2020/05/26/announcing-cloud-native-workflows-dapr-logic-apps/)
- [仓库](https://github.com/dapr/workflows)
