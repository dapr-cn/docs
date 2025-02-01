---
type: docs
title: "使用令牌认证对Dapr请求进行身份验证"
linkTitle: "应用API令牌认证"
weight: 4000
description: "要求每个来自Dapr的API请求都包含一个认证令牌"
---

对于一些构建块，例如pubsub、service-invocation和输入bindings，Dapr与应用程序通过HTTP或gRPC进行通信。
为了让应用程序能够验证来自Dapr sidecar的请求，您可以配置Dapr在HTTP请求的头部或gRPC请求的元数据中发送一个API令牌。

## 创建令牌

Dapr使用共享令牌进行API认证。您可以自由定义API令牌。

虽然Dapr对共享令牌没有强制格式，但一个好的做法是生成一个随机字节序列并将其编码为Base64。例如，这个命令生成一个随机的32字节密钥并将其编码为Base64：

```sh
openssl rand 16 | base64
```

## 在Dapr中配置应用API令牌认证

令牌认证配置在Kubernetes或selfhosted Dapr部署中略有不同：

### Selfhosted

在selfhosted场景中，Dapr会检查`APP_API_TOKEN`环境变量是否存在。如果在`daprd`进程启动时设置了该环境变量，Dapr在调用应用程序时会包含该令牌：

```shell
export APP_API_TOKEN=<token>
```

要更新配置的令牌，修改`APP_API_TOKEN`环境变量为新值并重启`daprd`进程。

### Kubernetes

在Kubernetes部署中，Dapr使用Kubernetes secrets存储来保存共享令牌。首先，创建一个新的secret：

```shell
kubectl create secret generic app-api-token --from-literal=token=<token>
```

> 注意，您需要在每个希望启用应用令牌认证的命名空间中创建上述secret

要指示Dapr在向应用程序发送请求时使用secret中的令牌，请在您的Deployment模板规范中添加一个注解：

```yaml
annotations:
  dapr.io/enabled: "true"
  dapr.io/app-token-secret: "app-api-token" # Kubernetes secret的名称
```

部署时，Dapr Sidecar Injector会自动创建一个secret引用并将实际值注入到`APP_API_TOKEN`环境变量中。

## 轮换令牌

### Selfhosted

要在selfhosted中更新配置的令牌，修改`APP_API_TOKEN`环境变量为新值并重启`daprd`进程。

### Kubernetes

要在Kubernetes中更新配置的令牌，修改之前创建的secret中的新令牌在每个命名空间中。您可以使用`kubectl patch`命令来完成此操作，但更简单的方法是使用清单更新这些：

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-api-token
type: Opaque
data:
  token: <your-new-token>
```

然后将其应用到每个命名空间：

```shell
kubectl apply --file token-secret.yaml --namespace <namespace-name>
```

要让Dapr开始使用新令牌，请触发对每个部署的滚动升级：

```shell
kubectl rollout restart deployment/<deployment-name> --namespace <namespace-name>
```

> 假设您的服务配置了多个副本，密钥轮换过程不会导致任何停机。

## 验证来自Dapr的请求

一旦使用环境变量或Kubernetes secret `app-api-token`配置了应用令牌认证，Dapr sidecar在调用应用程序时总是会在HTTP头部或gRPC元数据中包含`dapr-api-token: <token>`。从应用程序端，确保您使用`dapr-api-token`值进行认证，该值使用您设置的`app-api-token`来验证来自Dapr的请求。

<img src="/images/tokens-auth.png" width=800 style="padding-bottom:15px;">

### HTTP

在您的代码中，查找传入请求中的HTTP头部`dapr-api-token`：

```text
dapr-api-token: <token>
```

### gRPC

使用gRPC协议时，检查传入调用中的gRPC元数据中的API令牌：

```text
dapr-api-token[0].
```

## 从应用程序访问令牌

### Kubernetes

在Kubernetes中，建议将secret挂载到您的pod作为环境变量。
假设我们创建了一个名为`app-api-token`的secret来保存令牌：

```yaml
containers:
  - name: mycontainer
    image: myregistry/myapp
    envFrom:
    - secretRef:
      name: app-api-token
```

### Selfhosted

在selfhosted模式中，您可以将令牌设置为应用程序的环境变量：

```sh
export APP_API_TOKEN=<my-app-token>
```

## 相关链接

- 了解[Dapr安全概念]({{< ref security-concept.md >}})
- 了解[如何在Dapr中启用API令牌认证]({{< ref api-token.md >}})