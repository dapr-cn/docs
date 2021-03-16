---
type: docs
title: "Azure Event Grid 绑定规范"
linkTitle: "Azure Event Grid"
description: "Azure Event Grid 绑定组件的详细文档"
---

## 组件格式

要设置 Azure 事件网格（Event Grid）绑定，请创建一个类型为 `bindings.azure.eventgrid` 的组件。 请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})，了解如何创建和应用绑定配置。

请参阅[这里](https://docs.microsoft.com/en-us/azure/event-grid/)了解 Azure Event Grid 文档。

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
以上示例将密钥明文存储。 更推荐的方式是使用 Secret 组件， [点击这里查看操作方法]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| 字段                    | 必填 | 绑定支持   | 详情                                                                                                                                                      | 示例                                     |
| --------------------- |:--:| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| tenantId              | Y  | Input  | 创建这个事件网格事件订阅的 Azure 租户 id                                                                                                                               | `"tenentID"`                           |
| subscriptionId        | Y  | Input  | 创建这个事件网格事件订阅的 Azure 订阅 id                                                                                                                               | `"subscriptionId"`                     |
| clientId              | Y  | Input  | 由绑定来创建或更新事件网格事件订阅的客户端 id                                                                                                                                | `"clientId"`                           |
| clientSecret          | Y  | Input  | 由绑定来创建或更新事件网格事件订阅的客户端 id                                                                                                                                | `"clientSecret"`                       |
| subscriberEndpoint    | Y  | Input  | 事件网格将进行握手并发送云端事件的 https 端点。 如果您没有在 ingress 上重写URL， 其形式应该是： `https://[YOUR HOSTNAME]/api/events`。如果测试您的本地机器， 您可以使用 [ngrok](https://ngrok.com) 来创建一个公共端点。 | `"https://[YOUR HOSTNAME]/api/events"` |
| handshakePort         | Y  | Input  | 输入绑定将侦听握手和事件的容器端口                                                                                                                                       | `"9000"`                               |
| scope                 | Y  | Input  | 事件订阅需要创建或更新的资源标识符。 请参阅[这里](#scope)了解更多详情。                                                                                                               | `"/subscriptions/{subscriptionId}/"`   |
| eventSubscriptionName | N  | Input  | 事件订阅的名称。 事件订阅名称长度必须在3到64个字符之间，并且只能使用字母数字                                                                                                                | `"name"`                               |
| accessKey             | Y  | Output | 将事件网格事件发布到自定义 topic 的访问密钥                                                                                                                               | `"accessKey"`                          |
| topicEndpoint         | Y  | Output | 输出绑定应该在其中发布事件的 topic 端点                                                                                                                                 | `"topic-endpoint"`                     |

### Scope

Scope 是事件订阅需要创建或更新的资源的标识符。 Scope 可以是订阅组，也可以是资源组。 或属于资源提供者命名空间或事件网格主题的顶级资源。 例如:
- `'/subscriptions/{subscriptionId}/'` 单个订阅
- `'/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}'` 资源组
- `'/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/{resourceProviderNamespace}/{resourceType}/{resourceName}'` 资源
- `'/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.EventGrid/topics/{topicName}'` for an Event Grid topic > Values in braces {} should be replaced with actual values.
## 相关链接

This component supports both **input and output** binding interfaces.

This component supports **output binding** with the following operations:

- `create`
## Additional information

Event Grid Binding creates an [event subscription](https://docs.microsoft.com/en-us/azure/event-grid/concepts#event-subscriptions) when Dapr initializes. Your Service Principal needs to have the RBAC permissions to enable this. Your Service Principal needs to have the RBAC permissions to enable this.

```bash
# First ensure that Azure Resource Manager provider is registered for Event Grid
az provider register --namespace Microsoft.EventGrid
az provider show --namespace Microsoft.EventGrid --query "registrationState"
# Give the SP needed permissions so that it can create event subscriptions to Event Grid
az role assignment create --assignee <clientId> --role "EventGrid EventSubscription Contributor" --scopes <scope>
```

_Make sure to also to add quotes around the `[HandshakePort]` in your Event Grid binding component because Kubernetes expects string values from the config._

### Testing locally

- Install [ngrok](https://ngrok.com/download)
- Run locally using custom port `9000` for handshakes

```bash
# Using random port 9000 as an example
ngrok http -host-header=localhost 9000
```

- Configure the ngrok's HTTPS endpoint and custom port to input binding metadata
- Run Dapr

```bash
# Using default ports for .NET core web api and Dapr as an example
dapr run --app-id dotnetwebapi --app-port 5000 --dapr-http-port 3500 dotnet run
```

### Testing on Kubernetes

Azure Event Grid requires a valid HTTPS endpoint for custom webhooks. Self signed certificates won't do. In order to enable traffic from public internet to your app's Dapr sidecar you need an ingress controller enabled with Dapr. There's a good article on this topic: [Kubernetes NGINX ingress controller with Dapr](https://carlos.mendible.com/2020/04/05/kubernetes-nginx-ingress-controller-with-dapr/). Self signed certificates won't do. In order to enable traffic from public internet to your app's Dapr sidecar you need an ingress controller enabled with Dapr. There's a good article on this topic: [Kubernetes NGINX ingress controller with Dapr](https://carlos.mendible.com/2020/04/05/kubernetes-nginx-ingress-controller-with-dapr/).

To get started, first create `dapr-annotations.yaml` for Dapr annotations

```yaml
controller:
    podAnnotations:
      dapr.io/enabled: "true"
      dapr.io/app-id: "nginx-ingress"
      dapr.io/app-port: "80"
```

Then install NGINX ingress controller to your Kubernetes cluster with Helm 3 using the annotations

```bash
helm repo add stable https://kubernetes-charts.storage.googleapis.com/
helm install nginx stable/nginx-ingress -f ./dapr-annotations.yaml -n default
# Get the public IP for the ingress controller
kubectl get svc -l component=controller -o jsonpath='Public IP is: {.items[0].status.loadBalancer.ingress[0].ip}{"\n"}'
```

If deploying to Azure Kubernetes Service, you can follow [the official MS documentation for rest of the steps](https://docs.microsoft.com/en-us/azure/aks/ingress-tls)
- Add an A record to your DNS zone
- Install cert-manager
- Create a CA cluster issuer

Final step for enabling communication between Event Grid and Dapr is to define `http` and custom port to your app's service and an `ingress` in Kubernetes. This example uses .NET Core web api and Dapr default ports and custom port 9000 for handshakes. This example uses .NET Core web api and Dapr default ports and custom port 9000 for handshakes.

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

Deploy binding and app (including ingress) to Kubernetes

```bash
# Deploy Dapr components
kubectl apply -f eventgrid.yaml
# Deploy your app and Nginx ingress
kubectl apply -f dotnetwebapi.yaml
```

> **Note:** This manifest deploys everything to Kubernetes default namespace.

#### Troubleshooting possible issues with Nginx controller

After initial deployment the "Daprized" Nginx controller can malfunction. To check logs and fix issue (if it exists) follow these steps. To check logs and fix issue (if it exists) follow these steps.

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

$ kubectl delete pod nginx-nginx-ingress-controller-649df94867-fp6mg

# Check the logs again - it should start returning 200
# .."OPTIONS /api/events HTTP/1.1" 200.. 
```

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [How-To: Trigger application with input binding]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})
