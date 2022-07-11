---
type: docs
title: "Azure Event Grid 绑定规范"
linkTitle: "Azure Event Grid"
description: "Azure Event Grid 绑定组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/eventgrid/"
---

## 配置

要设置 Azure 事件网格（Event Grid）绑定，请创建一个类型为 `bindings.azure.eventgrid` 的组件。 请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})，了解如何创建和应用绑定配置。

请参阅[这里](https://docs.microsoft.com/azure/event-grid/)了解 Azure Event Grid 文档。

```yml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <name>
spec:
  type: bindings.azure.eventgrid
  version: v1
  metadata:
  # Required Input Binding Metadata
  - name: tenantId
    value: "[AzureTenantId]"
  - name: subscriptionId
    value: "[AzureSubscriptionId]"
  - name: clientId
    value: "[ClientId]"
  - name: clientSecret
    value: "[ClientSecret]"
  - name: subscriberEndpoint
    value: "[SubscriberEndpoint]"
  - name: handshakePort
    value: [HandshakePort]
  - name: scope
    value: "[Scope]"
  # Optional Input Binding Metadata
  - name: eventSubscriptionName
    value: "[EventSubscriptionName]"
  # Required Output Binding Metadata
  - name: accessKey
    value: "[AccessKey]"
  - name: topicEndpoint
    value: "[TopicEndpoint]
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| 字段                    | 必填 | 绑定支持 | 详情                                                                                                                                                      | 示例                                     |
| --------------------- |:--:| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| tenantId              | 是  | 输入   | 创建这个事件网格事件订阅的 Azure 租户 id                                                                                                                               | `"tenentID"`                           |
| subscriptionId        | 是  | 输入   | 创建这个事件网格事件订阅的 Azure 订阅 id                                                                                                                               | `"subscriptionId"`                     |
| clientId              | 是  | 输入   | 由绑定来创建或更新事件网格事件订阅的客户端 id                                                                                                                                | `"clientId"`                           |
| clientSecret          | 是  | 输入   | 由绑定来创建或更新事件网格事件订阅的客户端 id                                                                                                                                | `"clientSecret"`                       |
| subscriberEndpoint    | 是  | 输入   | 事件网格将进行握手并发送云端事件的 https 端点。 如果您没有在 ingress 上重写URL， 其形式应该是： `https://[YOUR HOSTNAME]/api/events`。如果测试您的本地机器， 您可以使用 [ngrok](https://ngrok.com) 来创建一个公共端点。 | `"https://[YOUR HOSTNAME]/api/events"` |
| handshakePort         | 是  | 输入   | 输入绑定将侦听握手和事件的容器端口                                                                                                                                       | `"9000"`                               |
| scope                 | 是  | 输入   | 事件订阅需要创建或更新的资源标识符。 请参阅[这里](#scope)了解更多详情。                                                                                                               | `"/subscriptions/{subscriptionId}/"`   |
| eventSubscriptionName | 否  | 输入   | 事件订阅的名称。 事件订阅名称长度必须在3到64个字符之间，并且只能使用字母数字                                                                                                                | `"name"`                               |
| accessKey             | 是  | 输出   | 将事件网格事件发布到自定义 topic 的访问密钥                                                                                                                               | `"accessKey"`                          |
| topicEndpoint         | 是  | 输出   | 输出绑定应该在其中发布事件的 topic 端点                                                                                                                                 | `"topic-endpoint"`                     |

### Scope

Scope 是事件订阅需要创建或更新的资源的标识符。 Scope 可以是订阅组，也可以是资源组。 或属于资源提供者命名空间或事件网格主题的顶级资源。 例如:
- `'/subscriptions/{subscriptionId}/'` 单个订阅
- `'/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}'` 资源组
- `'/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/{resourceProviderNamespace}/{resourceType}/{resourceName}'` 资源
- `'/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.EventGrid/topics/{topicName}'` 事件网格主题 > 在大括号 {} 中的内容应该替换为实际值.
## 绑定支持

此组件支持 **输入和输出** 绑定接口。

该组件支持如下操作的 **输出绑定** ：

- `create`
## 补充资料

在Dapr初始化时，Event Grid 绑定创建了一个[event subscription](https://docs.microsoft.com/azure/event-grid/concepts#event-subscriptions)。 您的服务主要需要获得权限才能启用此功能。

```bash
# 首先确保 Azure Resource Manager 提供商已注册事件网格
az provider register --namespace Microsoft.EventGrid
az provider show --namespace Microsoft.EventGrid --query "registrationState"
# 给予SP 所需的权限，以便它可以创建事件订阅到事件网格
az role assignment create --assignee <clientId> --role "EventGrid EventSubscription Contributor" --scopes <scope>
```

_请务必在事件网格绑定组件中同时添加引号 `[HandshakePort]` ，因为 Kubernetes 需要配置的字符串值。_

### 本地测试

- 安装 [ngrok](https://ngrok.com/download)
- 在本地使用自定义端口 `9000` 进行握手

```bash
# 使用随机端口 9000 作为示例
ngrok http -host-header=localhost 9000
```

- 配置 ngrok 的 HTTPS 端点和自定义端口来输入绑定元数据
- 运行 Dapr

```bash
# 使用 .NET core web api 和 Dapr 的默认端口作为示例
dapr run --app-id dotnetwebapi --app-port 5000 --dapr-http-port 3500 dotnet run
```

### 在 Kubernetes 上测试

Azure 事件网格需要一个有效的 HTTPS 端点用于自定义 webhooks. 自签名证书是不行的。 自签名证书是不行的。 为了使流量从公共互联网到你的应用程序的 Dapr sidecar，你需要一个启用了 Dapr 的 ingress 控制器。 有一篇关于这个主题的好文章:[Kubernetes NGINX ingress controller with Dapr](https://carlos.mendible.com/2020/04/05/kubernetes-nginx-ingress-controller-with-dapr/)。

若要开始，请首先为 Dapr 创建批注 `dapr-annotations.yaml`

```yaml
controller:
    podAnnotations:
      dapr.io/enabled: "true"
      dapr.io/app-id: "nginx-ingress"
      dapr.io/app-port: "80"
```

然后使用 Helm 3 安装 NGINX ingress controller 到您的 Kubernetes 集群使用

```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
helm install nginx-ingress ingress-nginx/ingress-nginx -f ./dapr-annotations.yaml -n default
# Get the public IP for the ingress controller
kubectl get svc -l component=controller -o jsonpath='Public IP is: {.items[0].status.loadBalancer.ingress[0].ip}{"\n"}'
```

如果部署到 Azure Kubernetes 服务, 你可以参照 [MS官方文档进行余下步骤](https://docs.microsoft.com/azure/aks/ingress-tls)
- 添加一条记录到你的 DNS 区域
- 安装证书管理器
- 创建 CA 集群发行者（issuer）

开启事件网格与 Dapr 之间通信的最后一步是定义 `http` 和自定义端口到您应用的服务和一个 Kubernetes 中的 `ingress`。 这个示例使用 .NET Core Web api 和 Dapr 默认端口和用于握手的自定义端口 9000 。

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

部署绑定和应用 (包括ingress) 到 Kubernetes

```bash
# 部署 Dapr 组件
kubectl apply -f eventgrid.yaml
# 部署你的应用程序和 Nginx ingress
kubectl apply -f dotnetwebapi.yaml
```

> **注意：** 此清单将所有内容都部署到 Kubernetes 默认命名空间中。

#### 解决与 Nginx 控制器相关的可能的问题

在 Dapr 中初始部署后，Nginx cointroller 可能发生故障。 检查日志并修复问题 (如果存在的话) 可以遵循这些步骤。

```bash
$ kubectl get pods -l app=nginx-ingress

NAME                                                   READY   STATUS    RESTARTS   AGE
nginx-nginx-ingress-controller-649df94867-fp6mg        2/2     Running   0          51m
nginx-nginx-ingress-default-backend-6d96c457f6-4nbj5   1/1     Running   0          55m

$ kubectl logs nginx-nginx-ingress-controller-649df94867-fp6mg nginx-ingress-controller

# If you see 503s logged from calls to webhook endpoint '/api/events' restart the pod
# .."OPTIONS /api/events HTTP/1.1" 503..

$ kubectl delete pod nginx-nginx-ingress-controller-649df94867-fp6mg

# Check the logs again - it should start returning 200
# .."OPTIONS /api/events HTTP/1.1" 200..
```

## 相关链接

- [Dapr组件的基本格式]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过输入绑定触发应用]({{< ref howto-triggers.md >}})
- [如何处理: 使用绑定对接外部资源]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
