---
type: docs
title: "在 Dapr 上启用 token 认证"
linkTitle: "Dapr API 令牌认证"
weight: 3000
description: "Dapr 要求每个入站 API 请求都需要包含一个认证令牌，然后才能放行"
---

默认情况下，Dapr 依靠网络边界来限制对其公共 API 的访问。 如果你打算将 Dapr API 暴露在网络边界之外，或者如果您的 deployment 需要额外级别的安全性，那么请考虑开启 Dapr API 的令牌认证。 这将使得 Dapr 要求每个入站 gRPC 和 HTTP API 请求都需要包含认证令牌，然后请求才能放行。

## 创建令牌

Dapr uses shared tokens for API authentication. You are free to define the API token to use.

Although Dapr does not impose any format for the shared token, a good idea is to generate a random byte sequence and encode it to Base64. For example, this command generates a random 32-byte key and encodes that as Base64:

```sh
openssl rand 16 | base64
```

## 在 Dapr 上配置 token 认证

令牌认证配置在 Kubernetes 和 自托管 Dapr deployments 下稍有不同：

### 自托管

在自托管场景中， Dapr 查找是否存在 `DAPR_API_TOKEN` 环境变量。 If that environment variable is set when the `daprd` process launches, Dapr enforces authentication on its public APIs:

```shell
export DAPR_API_TOKEN=<token>
```

To rotate the configured token, update the `DAPR_API_TOKEN` environment variable to the new value and restart the `daprd` process.

### Kubernetes

In a Kubernetes deployment, Dapr leverages Kubernetes secrets store to hold the shared token. To configure Dapr APIs authentication, start by creating a new secret:

```shell
kubectl create secret generic dapr-api-token --from-literal=token=<token>
```

> Note, the above secret needs to be created in each namespace in which you want to enable Dapr token authentication.

指定 Dapr 使用该密钥来保护其公有 API，需要在你的 Deployment template spec 中添加 annotation：

```yaml
annotations:
  dapr.io/enabled: "true"
  dapr.io/api-token-secret: "dapr-api-token" # name of the Kubernetes secret
```

当 Deployment 部署后，Dapr sidecar 注入器会自动创建一个 secret，并将实际值注入到 `DAPR_API_TOKEN` 环境变量中。

## 更新令牌

### 自托管

To rotate the configured token in self-hosted, update the `DAPR_API_TOKEN` environment variable to the new value and restart the `daprd` process.

### Kubernetes

To rotate the configured token in Kubernates, update the previously-created secret with the new token in each namespace. You can do that using `kubectl patch` command, but a simpler way to update these in each namespace is by using a manifest:

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

> Assuming your service is configured with more than one replica, the key rotation process does not result in any downtime.

## Adding API token to client API invocations

Once token authentication is configured in Dapr, all clients invoking Dapr API will have to append the API token token to every request:

### HTTP

In case of HTTP, Dapr requires the API token in the `dapr-api-token` header. 例如:

```text
GET http://<daprAddress>/v1.0/metadata
dapr-api-token: <token>
```

Using curl, you can pass the header using the `--header` (or `-H`) option. 例如:

```sh
curl http://localhost:3500/v1.0/metadata \
  --header "dapr-api-token: my-token"
```

### gRPC

当使用 gRPC 协议时，Dapr 将检查入站 gRPC 请求的元数据（metadata）上的 API 令牌 ：

```text
dapr-api-token[0].
```

## 从应用程序访问令牌

### Kubernetes

在 Kubernetes中，推荐将您的 secret mount 到 pod 的环境变量，如以下面示例中所示，一个叫做 `dapr-api-token` 的 Kubernetes secret 用于保存令牌。

```yaml
containers:
  - name: mycontainer
    image: myregistry/myapp
    envFrom:
    - secretRef:
      name: dapr-api-token
```

### 自托管

在自托管模式下，您可以将令牌设置为应用程序的环境变量 ：

```sh
export DAPR_API_TOKEN=<my-dapr-token>
```

## 相关链接

- Learn about [Dapr security concepts]({{< ref security-concept.md >}})
- Learn [HowTo authenticate requests from Dapr using token authentication]({{< ref app-api-token.md >}})
