---
type: docs
title: "Azure Event Grid 绑定规范"
linkTitle: "Azure Event Grid"
description: "关于 Azure Event Grid 绑定组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/eventgrid/"
---

## 组件格式

要设置 Azure Event Grid 绑定，需创建一个类型为 `bindings.azure.eventgrid` 的组件。请参考[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})了解如何创建和应用绑定配置。

有关 Azure Event Grid 的更多信息，请访问[此处](https://docs.microsoft.com/azure/event-grid/)。

```yml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <name>
spec:
  type: bindings.azure.eventgrid
  version: v1
  metadata:
  # 必需的输出绑定元数据
  - name: accessKey
    value: "[AccessKey]"
  - name: topicEndpoint
    value: "[TopicEndpoint]"
  # 必需的输入绑定元数据
  - name: azureTenantId
    value: "[AzureTenantId]"
  - name: azureSubscriptionId
    value: "[AzureSubscriptionId]"
  - name: azureClientId
    value: "[ClientId]"
  - name: azureClientSecret
    value: "[ClientSecret]"
  - name: subscriberEndpoint
    value: "[SubscriberEndpoint]"
  - name: handshakePort
    # 确保以字符串形式传递，值需加上引号
    value: "[HandshakePort]"
  - name: scope
    value: "[Scope]"
  # 可选的输入绑定元数据
  - name: eventSubscriptionName
    value: "[EventSubscriptionName]"
  # 可选元数据
  - name: direction
    value: "input, output"
```

{{% alert title="警告" color="warning" %}}
上述示例中使用了明文字符串作为密钥。建议使用密钥存储来保护密钥，如[此处]({{< ref component-secrets.md >}})所述。
{{% /alert %}}

## 规范元数据字段

| 字段              | 必需 | 绑定支持 |  详情 | 示例 |
|--------------------|:--------:|------------|-----|---------|
| `accessKey` | Y | 输出 | 用于向自定义主题发布 Event Grid 事件的访问密钥 | `"accessKey"` |
| `topicEndpoint` | Y | 输出 | 此输出绑定应发布事件的主题端点 | `"topic-endpoint"` |
| `azureTenantId` | Y | 输入 | Event Grid 资源的 Azure 租户 ID  | `"tenentID"` |
| `azureSubscriptionId` | Y | 输入 | Event Grid 资源的 Azure 订阅 ID  | `"subscriptionId"` |
| `azureClientId` | Y | 输入 | 绑定用于创建或更新 Event Grid 事件订阅并验证传入消息的客户端 ID | `"clientId"` |
| `azureClientSecret` | Y | 输入 | 绑定用于创建或更新 Event Grid 事件订阅并验证传入消息的客户端密钥 | `"clientSecret"` |
| `subscriberEndpoint` | Y | 输入 | Webhook 的 HTTPS 端点，Event Grid 将事件（格式化为 Cloud Events）发送到此处。如果您不在入口处重写 URL，则应采用以下格式：`"https://[YOUR HOSTNAME]/<path>"`<br/>如果在本地计算机上进行测试，可以使用类似 [ngrok](https://ngrok.com) 的工具创建公共端点。 | `"https://[YOUR HOSTNAME]/<path>"` |
| `handshakePort` | Y | 输入 | 输入绑定在接收 Webhook 事件时监听的容器端口 | `"9000"` |
| `scope` | Y | 输入 | 需要创建或更新事件订阅的资源标识符。有关更多详细信息，请参阅[范围部分](#scope) | `"/subscriptions/{subscriptionId}/"` |
| `eventSubscriptionName` | N | 输入 | 事件订阅的名称。事件订阅名称必须在 3 到 64 个字符之间，并且只能使用字母数字字符 | `"name"` |
| `direction` | N | 输入/输出 | 绑定的方向 | `"input"`, `"output"`, `"input, output"` |

### 范围

范围是需要创建或更新事件订阅的资源标识符。范围可以是订阅、资源组、属于资源提供程序命名空间的顶级资源或 Event Grid 主题。例如：

- `/subscriptions/{subscriptionId}/` 表示一个订阅
- `/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}` 表示一个资源组
- `/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/{resourceProviderNamespace}/{resourceType}/{resourceName}` 表示一个资源
- `/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.EventGrid/topics/{topicName}` 表示一个 Event Grid 主题

> 大括号 {} 中的值应替换为实际值。

## 绑定支持

此组件支持 **输入和输出** 绑定接口。

此组件支持以下操作的 **输出绑定**：

- `create`: 在 Event Grid 主题上发布消息

## 接收事件

您可以使用 Event Grid 绑定从各种来源和操作接收事件。[了解有关与 Event Grid 一起使用的所有可用事件源和处理程序的更多信息。](https://learn.microsoft.com/azure/event-grid/overview)

在下表中，您可以找到可以引发事件的 Dapr 组件列表。

| 事件源 | Dapr 组件 |
| ------------- | --------------- |
| [Azure Blob 存储](https://learn.microsoft.com/azure/storage/blobs/) | [Azure Blob 存储绑定]({{< ref blobstorage.md >}}) <br/>[Azure Blob 存储状态存储]({{< ref setup-azure-blobstorage.md >}}) |
| [Azure Redis 缓存](https://learn.microsoft.com/azure/azure-cache-for-redis/cache-overview) | [Redis 绑定]({{< ref redis.md >}}) <br/>[Redis pub/sub]({{< ref setup-redis-pubsub.md >}}) |
| [Azure Event Hubs](https://learn.microsoft.com/azure/event-hubs/event-hubs-about) | [Azure Event Hubs pub/sub]({{< ref setup-azure-eventhubs.md >}}) <br/>[Azure Event Hubs 绑定]({{< ref eventhubs.md >}}) |
| [Azure IoT Hub](https://learn.microsoft.com/azure/iot-hub/iot-concepts-and-iot-hub) | [Azure Event Hubs pub/sub]({{< ref setup-azure-eventhubs.md >}}) <br/>[Azure Event Hubs 绑定]({{< ref eventhubs.md >}}) |
| [Azure Service Bus](https://learn.microsoft.com/azure/service-bus-messaging/service-bus-messaging-overview) | [Azure Service Bus 绑定]({{< ref servicebusqueues.md >}}) <br/>[Azure Service Bus pub/sub 主题]({{< ref setup-azure-servicebus-topics.md >}}) 和 [队列]({{< ref setup-azure-servicebus-queues.md >}}) |
| [Azure SignalR 服务](https://learn.microsoft.com/azure/azure-signalr/signalr-overview) | [SignalR 绑定]({{< ref signalr.md >}}) |

## Microsoft Entra ID 凭据

Azure Event Grid 绑定需要 Microsoft Entra ID 应用程序和服务主体，原因有两个：

- 在 Dapr 启动时创建一个[事件订阅](https://docs.microsoft.com/azure/event-grid/concepts#event-subscriptions)（如果 Dapr 配置更改则更新它）
- 验证 Event Hubs 传递给您应用程序的消息。

要求：

- 安装 [Azure CLI](https://docs.microsoft.com/cli/azure/install-azure-cli)。
- 安装 [PowerShell 7](https://learn.microsoft.com/powershell/scripting/install/installing-powershell)。
- 为 PowerShell 安装 [Az 模块](https://learn.microsoft.com/powershell/azure/install-az-ps)：  
  `Install-Module Az -Scope CurrentUser -Repository PSGallery -Force`
- 为 PowerShell 安装 [Microsoft.Graph 模块](https://learn.microsoft.com/powershell/microsoftgraph/installation)：  
  `Install-Module Microsoft.Graph -Scope CurrentUser -Repository PSGallery -Force`

对于第一个目的，您需要[创建一个 Azure 服务主体](https://learn.microsoft.com/azure/active-directory/develop/howto-create-service-principal-portal)。创建后，记下 Microsoft Entra ID 应用程序的 **clientID**（一个 UUID），并使用 Azure CLI 运行以下脚本：

```bash
# 设置您创建的应用的客户端 ID
CLIENT_ID="..."
# 资源的范围，通常格式为：
# `/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.EventGrid/topics/{topicName}`
SCOPE="..."

# 首先确保 Azure 资源管理器提供程序已为 Event Grid 注册
az provider register --namespace "Microsoft.EventGrid"
az provider show --namespace "Microsoft.EventGrid" --query "registrationState"
# 为 SP 授予所需权限，以便它可以为 Event Grid 创建事件订阅
az role assignment create --assignee "$CLIENT_ID" --role "EventGrid EventSubscription Contributor" --scopes "$SCOPE"
```

对于第二个目的，首先下载一个脚本：

```sh
curl -LO "https://raw.githubusercontent.com/dapr/components-contrib/master/.github/infrastructure/conformance/azure/setup-eventgrid-sp.ps1"
```

然后，**使用 PowerShell** (`pwsh`) 运行：

```powershell
# 设置您创建的应用的客户端 ID
$clientId = "..."

# 使用 Microsoft Graph 进行身份验证
# 如果需要，您可能需要在下一个命令中添加 -TenantId 标志
Connect-MgGraph -Scopes "Application.Read.All","Application.ReadWrite.All"
./setup-eventgrid-sp.ps1 $clientId
```

> 注意：如果您的目录没有应用程序 "Microsoft.EventGrid" 的服务主体，您可能需要运行命令 `Connect-MgGraph` 并以 Microsoft Entra ID 租户的管理员身份登录（这与 Microsoft Entra ID 目录的权限有关，而不是 Azure 订阅）。否则，请要求您的租户管理员登录并运行此 PowerShell 命令：`New-MgServicePrincipal -AppId "4962773b-9cdb-44cf-a8bf-237846a00ab7"`（UUID 是一个常量）

## 本地测试

- 安装 [ngrok](https://ngrok.com/download)
- 使用自定义端口在本地运行，例如 `9000`，用于握手

```bash
# 以端口 9000 为例
ngrok http --host-header=localhost 9000
```

- 将 ngrok 的 HTTPS 端点和自定义端口配置为输入绑定元数据
- 运行 Dapr

```bash
# 以 .NET core web api 和 Dapr 的默认端口为例
dapr run --app-id dotnetwebapi --app-port 5000 --dapr-http-port 3500 dotnet run
```

## 在 Kubernetes 上测试

Azure Event Grid 需要一个有效的 HTTPS 端点用于自定义 webhooks；不接受自签名证书。为了启用从公共互联网到您应用程序的 Dapr sidecar 的流量，您需要启用 Dapr 的入口控制器。关于这个主题有一篇不错的文章：[Kubernetes NGINX ingress controller with Dapr](https://carlos.mendible.com/2020/04/05/kubernetes-nginx-ingress-controller-with-dapr/)。

首先，为 Dapr 注解创建一个 `dapr-annotations.yaml` 文件：

```yaml
controller:
  podAnnotations:
    dapr.io/enabled: "true"
    dapr.io/app-id: "nginx-ingress"
    dapr.io/app-port: "80"
```

然后使用注解通过 Helm 3 将 NGINX ingress 控制器安装到您的 Kubernetes 集群中：

```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
helm install nginx-ingress ingress-nginx/ingress-nginx -f ./dapr-annotations.yaml -n default
# 获取入口控制器的公共 IP
kubectl get svc -l component=controller -o jsonpath='Public IP is: {.items[0].status.loadBalancer.ingress[0].ip}{"\n"}'
```

如果部署到 Azure Kubernetes 服务，您可以按照[官方 Microsoft 文档的其余步骤](https://docs.microsoft.com/azure/aks/ingress-tls)：

- 向您的 DNS 区域添加 A 记录
- 安装 cert-manager
- 创建 CA 集群颁发者

启用 Event Grid 和 Dapr 之间通信的最后一步是定义 `http` 和自定义端口到您应用程序的服务和 Kubernetes 中的 `ingress`。此示例使用 .NET Core web api 和 Dapr 默认端口以及用于握手的自定义端口 9000。

```yaml
# dotnetwebapi.yaml
kind: Service
apiVersion: v1
metadata:
  name: dotnetwebapi
  labels:
    app: dotnetwebapi
spec:
  selector:
    app: dotnetwebapi
  ports:
    - name: webapi
      protocol: TCP
      port: 80
      targetPort: 80
    - name: dapr-eventgrid
      protocol: TCP
      port: 9000
      targetPort: 9000
  type: ClusterIP

---
  apiVersion: extensions/v1beta1
  kind: Ingress
  metadata:
    name: eventgrid-input-rule
    annotations:
      kubernetes.io/ingress.class: nginx
      cert-manager.io/cluster-issuer: letsencrypt
  spec:
    tls:
      - hosts:
        - dapr.<your custom domain>
        secretName: dapr-tls
    rules:
      - host: dapr.<your custom domain>
        http:
          paths:
            - path: /api/events
              backend:
                serviceName: dotnetwebapi
                servicePort: 9000

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: dotnetwebapi
  labels:
    app: dotnetwebapi
spec:
  replicas: 1
  selector:
    matchLabels:
      app: dotnetwebapi
  template:
    metadata:
      labels:
        app: dotnetwebapi
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "dotnetwebapi"
        dapr.io/app-port: "5000"
    spec:
      containers:
      - name: webapi
        image: <your container image>
        ports:
        - containerPort: 5000
        imagePullPolicy: Always
```

将绑定和应用程序（包括 ingress）部署到 Kubernetes

```bash
# 部署 Dapr 组件
kubectl apply -f eventgrid.yaml
# 部署您的应用程序和 Nginx ingress
kubectl apply -f dotnetwebapi.yaml
```

> **注意：** 此清单将所有内容部署到 Kubernetes 的默认命名空间。

#### 排查 Nginx 控制器可能出现的问题

初始部署后，“Dapr 化”的 Nginx 控制器可能会出现故障。要检查日志并修复问题（如果存在），请按照以下步骤操作。

```bash
$ kubectl get pods -l app=nginx-ingress

NAME                                                   READY   STATUS    RESTARTS   AGE
nginx-nginx-ingress-controller-649df94867-fp6mg        2/2     Running   0          51m
nginx-nginx-ingress-default-backend-6d96c457f6-4nbj5   1/1     Running   0          55m

$ kubectl logs nginx-nginx-ingress-controller-649df94867-fp6mg nginx-ingress-controller

# 如果您看到对 webhook 端点 '/api/events' 的调用记录了 503，请重启 pod
# .."OPTIONS /api/events HTTP/1.1" 503..

$ kubectl delete pod nginx-nginx-ingress-controller-649df94867-fp6mg

# 再次检查日志 - 它应该开始返回 200
# .."OPTIONS /api/events HTTP/1.1" 200..
```

## 相关链接

- [Dapr 组件的基本架构]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何：使用输入绑定触发应用程序]({{< ref howto-triggers.md >}})
- [如何：使用绑定与外部资源接口]({{< ref howto-bindings.md >}})
- [绑定 API 参考]({{< ref bindings_api.md >}})
