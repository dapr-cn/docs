---
type: docs
title: "使用令牌认证来自 Dapr 的请求"
linkTitle: "App API 令牌认证"
weight: 4000
description: "要求来自 Dapr 的每个传入 API 请求都包含身份验证令牌"
---

对于某些构建基块，例如发布/订阅、服务调用和输入绑定，Dapr 通过 HTTP 或 gRPC 与应用进行通信。 要使应用程序能够对从 Dapr sidecar 发出的请求进行身份验证，您可以将 Dapr 配置为将 API 令牌作为标头（在 HTTP 请求中）或元数据（在 gRPC 请求中）发送。

## 创建令牌

Dapr 使用 [JWT](https://jwt.io/) 令牌进行 API 身份验证。

> 请注意，虽然 Dapr 本身并不是这个实现中的 JWT 令牌签发者，但明确使用 JWT 标准对未来联邦特性的实现 提供了支持(例如 OAuth2)。

为了配置 API 身份验证，需要先使用任意 JWT 令牌兼容工具(如https://jwt.io/) 和 secret 来生成您的令牌。

> 注意，这个 secret 仅仅用来生成令牌，Dapr 不需要知道或存储它

## 在 Dapr 中配置应用 API 令牌身份验证

令牌认证配置在 Kubernetes 和 自托管 Dapr deployments 下稍有不同：

### 自托管

In self-hosting scenario, Dapr looks for the presence of `APP_API_TOKEN` environment variable. If that environment variable is set while `daprd` process launches, Dapr includes the token when calling an app:

```shell
export APP_API_TOKEN=<token>
```

To rotate the configured token, simply set the `APP_API_TOKEN` environment variable to the new value and restart the `daprd` process.

### Kubernetes

在 Kubernetes deployment 里，Dapr 借助 Kubernetes secrets store 保存 JWT 令牌。 Start by creating a new secret:

```shell
kubectl create secret generic app-api-token --from-literal=token=<token>
```

> Note, the above secret needs to be created in each namespace in which you want to enable app token authentication

To indicate to Dapr to use the token in the secret when sending requests to the app, add an annotation to your Deployment template spec:

```yaml
annotations:
  dapr.io/enabled: "true"
  dapr.io/app-token-secret: "app-api-token" # name of the Kubernetes secret
```

When deployed, the Dapr Sidecar Injector automatically creates a secret reference and injects the actual value into `APP_API_TOKEN` environment variable.

## 更新令牌

### 自托管

如果需要更新已配置的令牌，只需将环境变量 `APR_API_TOKEN`设置为新值，然后重新启动 `daprd`进程。

### Kubernetes

如果需要更新在 Kubernates 中已配置的令牌，则需要更新先前在每个命名空间中创建的 secret 的令牌。 您可以使用 `kubectl patch` 命令执行此操作，但更简单的方法是，使用 manifest 更新每个命名空间中的这些对象:

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


## Authenticating requests from Dapr

Once app token authentication is configured in Dapr, all requests *coming from Dapr* include the token:

### HTTP

In case of HTTP, inspect the incoming request for presence of `dapr-api-token` parameter in HTTP header:

```shell
dapr-api-token: <token>
```

### gRPC

When using gRPC protocol, inspect the incoming calls for the API token on the gRPC metadata:

```shell
dapr-api-token[0].
```

## 从应用程序访问令牌

### Kubernetes

In Kubernetes, it's recommended to mount the secret to your pod as an environment variable. Assuming we created a secret with the name `app-api-token` to hold the token:

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

- Learn about [Dapr security concepts]({{< ref security-concept.md >}})
- Learn [HowTo Enable API token authentication in Dapr]({{< ref api-token.md >}})
