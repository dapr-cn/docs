---
type: docs
title: "在 Dapr 上启用 token 认证"
linkTitle: "Dapr API 令牌认证"
weight: 3000
description: "Dapr 要求每个入站 API 请求都需要包含一个认证令牌，然后才能放行"
---

默认情况下，Dapr 依靠网络边界来限制对其公共 API 的访问。 如果你打算将 Dapr API 暴露在网络边界之外，或者如果您的 deployment 需要额外级别的安全性，那么请考虑开启 Dapr API 的令牌认证。 这将使得 Dapr 要求每个入站 gRPC 和 HTTP API 请求都需要包含认证令牌，然后请求才能放行。

## 创建令牌

Dapr 使用 [JWT](https://jwt.io/) 令牌进行 API 身份验证。

> 请注意，虽然 Dapr 本身并不是这个实现中的 JWT token 签发者，但明确使用 JWT 标准对未来联邦特性的实现 提供了支持(例如 OAuth2)。

为了配置 API 身份验证，需要先使用任意 JWT 令牌兼容工具(如https://jwt.io/) 和 secret 来生成您的令牌。

> 注意，这个 secret 仅仅用来生成令牌，Dapr 不需要知道或存储它

## 在 Dapr 上配置 token 认证

令牌认证配置在 Kubernetes 和 自托管 Dapr deployments 下稍有不同：

### 自托管

在自托管场景中， Dapr 查找是否存在 `DAPR_API_TOKEN` 环境变量。 如果设置了该环境变量，当 `daprd`进程启动时，Dapr 将对其公开的 APIs 强制执行身份验证：

```shell
export DAPR_API_TOKEN=<token>
```

如果需要更新已配置的令牌，只需将 `DAPR_API_TOKEN` 环境变量设置为新值，然后重新启动 `daprd`进程。

### Kubernetes

在 Kubernetes deployment 里，Dapr 借助 Kubernetes secrets store 保存 JWT 令牌。 配置 Dapr API 认证，需要创建新的 secret：

```shell
kubectl create secret generic dapr-api-token --from-literal=token=<token>
```

> 注意，上述 secret 需要你希望开启 Dapr 令牌认证的命名空间中创建

指定 Dapr 使用该密钥来保护其公有 API，需要在你的 Deployment template spec 中添加 annotation：

```yaml
annotations:
  dapr.io/enabled: "true"
  dapr.io/api-token-secret: "dapr-api-token" # name of the Kubernetes secret
```

当 Deployment 部署后，Dapr sidecar 注入器会自动创建一个 secret，并将实际值注入到 `DAPR_API_TOKEN` 环境变量中。

## 更新令牌

### 自托管

如果需要更新已配置的令牌，只需将环境变量 `DAPR_API_TOKEN`设置为新值，然后重新启动 `daprd`进程。

### Kubernetes

如果需要更新在 Kubernates 中已配置的令牌，更新先前在每个命名空间中创建的 secret 的令牌。 您可以使用 `kubectl patch` 命令执行此操作，但更简单的方法是，使用 manifest 更新每个命名空间中的这些对象:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: dapr-api-token
type: Opaque
data:
  token: <your-new-token>
```

然后将其 apply 到每个命名空间：

```shell
kubectl apply --file token-secret.yaml --namespace <namespace-name>
```

为了让 Dapr 开始使用新令牌，需要对你的每个 deployment 进行滚动升级：

```shell
kubectl rollout restart deployment/<deployment-name> --namespace <namespace-name>
```

> 请注意，假设您的服务配置为多个副本，则 key 滚动过程不会导致任何停机。


## 将 JWT 令牌添加到客户端 API 调用

在 Dapr 中配置令牌认证后，所有客户端调用 Dapr API 的都必须要把 JWT 令牌附加到每个请求：

### HTTP

如果是 HTTP ，那么 Dapr 将检查在 HTTP 请求头中否存在 `dapr-api-token` 参数 ：

```shell
dapr-api-token: <token>
```

### gRPC

当使用 gRPC 协议时，Dapr 将检查入站 gRPC 请求的元数据（metadata）上的 API 令牌 ：

```shell
dapr-api-token[0].
```

## 从应用程序访问令牌

### Kubernetes

在 Kubernetes中，推荐将您的 secret mount 到 pod 的环境变量，如以下面示例中所示，一个叫做 `dapr-api-token` 的 Kubernetes secret 用于保存令牌。

```
containers:
  - name: mycontainer
    image: myregistry/myapp
    envFrom:
    - secretRef:
      name: dapr-api-token
```

### 自托管

在自托管模式下，您可以将令牌设置为应用程序的环境变量 ：

```
export DAPR_API_TOKEN=<my-dapr-token>
```

## 相关链接

- 了解 [Dapr 安全概念]({{< ref security-concept.md >}})
- 了解 [如何通过令牌认证来自 Dapr 的请求]({{< ref app-api-token.md >}})
