---
type: docs
title: "使用 token 认证来自 Dapr 的请求"
linkTitle: "应用 API 令牌身份验证"
weight: 4000
description: "要求来自 Dapr 的每个传入 API 请求都包含身份验证令牌"
---

对于某些构建基，例如发布/订阅、服务调用和输入绑定，Dapr 通过 HTTP 或 gRPC 与应用进行通信。 要使应用程序能够对从 Dapr sidecar 发出的请求进行身份验证，您可以将 Dapr 配置为将 API token作为标头（在 HTTP 请求中）或元数据（在 gRPC 请求中）发送。

## 创建令牌

Dapr 使用 [JWT](https://jwt.io/) 令牌进行 API 身份验证。

> 请注意，虽然 Dapr 本身并不是这个实现中的 JWT token 签发者，但明确使用 JWT 标准对未来联邦特性的实现 提供了支持(例如 OAuth2)。

为了配置 API 身份验证，需要先使用任意 JWT 令牌兼容工具(如https://jwt.io/) 和 secret 来生成您的令牌。

> 注意，这个 secret 仅仅用来生成令牌，Dapr 不需要知道或存储它

## 在 Dapr 中配置应用 API 令牌身份验证

令牌认证配置在 Kubernetes 和 自托管 Dapr deployments 下稍有不同：

### 自托管

在自托管场景中， Dapr 查找是否存在 `APP_API_TOKEN` 环境变量。 如果设置了环境变量，当 `daprd` 进程启动时，Dapr 会在调用应用时包含此令牌：

```shell
export APP_API_TOKEN=<token>
```

如果需要更新已配置的令牌，只需将 `APP_API_TOKEN` 环境变量设置为新值，然后重新启动 `daprd` 进程。

### Kubernetes

在 Kubernetes deployment 里，Dapr 借助 Kubernetes secrets store 保存 JWT 令牌。 从创建新秘密开始：

```shell
kubectl create secret generic app-api-token --from-literal=token=<token>
```

> 注意，上述秘密需要在你希望开启 Dapr token 认证的命名空间中创建

若要指示 Dapr 在向应用发送请求时使用秘密中的令牌，请向 deployment 模板规范添加注解：

```yaml
annotations:
  dapr.io/enabled: "true"
  dapr.io/app-token-secret: "app-api-token" # name of the Kubernetes secret
```

当 Deployment 部署后，Dapr sidecar 注入器会自动创建一个秘密，并将实际值注入到 `APP_API_TOKEN` 环境变量中。

## 更新令牌

### 自托管

如果需要更新已配置的令牌，只需将环境变量 `DAPR_API_TOKEN` 设置为新值，然后重新启动 `daprd` 进程。

### Kubernetes

如果需要更新在 Kubernates 中已配置的令牌，更新先前在每个命名空间中创建的 secret 的令牌。 您可以使用 `kubectl patch` 命令执行此操作，但更简单的方法是，使用 manifest 更新每个命名空间中的这些对象:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-api-token
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


## 验证来自 Dapr 的请求

在 Dapr 中配置应用令牌身份验证后，*来自 Dapr* 的所有请求都包含令牌：

### HTTP

如果是 HTTP ，请检查在 HTTP 请求头中否存在 `dapr-api-token` 参数 ：

```shell
dapr-api-token: <token>
```

### gRPC

当使用 gRPC 协议时，请检查入站 gRPC 请求的元数据（metadata）上的 API 令牌 ：

```shell
dapr-api-token[0].
```

## 从应用程序访问令牌

### Kubernetes

在 Kubernetes 中，建议将秘密作为环境变量挂载到 pod 中。 假定我们创建了一个名为 `app-api-token` 的秘密来保存令牌：

```
containers:
  - name: mycontainer
    image: myregistry/myapp
    envFrom:
    - secretRef:
      name: app-api-token
```

### 自托管

在自托管模式下，您可以将令牌设置为应用程序的环境变量 ：

```
export APP_API_TOKEN=<my-app-token>
```

## 相关链接

- 了解 [Dapr 安全概念]({{< ref security-concept.md >}})
- 了解[如何在 Dapr 中启用 API 令牌身份验证]({{< ref api-token.md >}})
