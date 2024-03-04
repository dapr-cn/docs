---
type: docs
title: "在 Dapr 上启用 token 认证"
linkTitle: "Dapr API token 认证"
weight: 3000
description: "要求 Dapr 的每个传入 API 请求都包含身份验证令牌，然后才能放行"
---

By default, Dapr relies on the network boundary to limit access to its public API. If you plan on exposing the Dapr API outside of that boundary, or if your deployment demands an additional level of security, consider enabling the token authentication for Dapr APIs. This will cause Dapr to require every incoming gRPC and HTTP request for its APIs for to include authentication token, before allowing that request to pass through.

## Create a token

Dapr 使用共享令牌进行 API 身份验证。 您可以自由定义要使用的 API 令牌。

Although Dapr does not impose any format for the shared token, a good idea is to generate a random byte sequence and encode it to Base64. For example, this command generates a random 32-byte key and encodes that as Base64:

```sh
openssl rand 16 | base64
```

## 在 Dapr 中配置 API 令牌身份验证

令牌认证配置在 Kubernetes 和 自托管 Dapr deployments 下稍有不同：

### Self-hosted (自托管)

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

指定 Dapr 使用该秘密来保护其公有 API，需要在你的 Deployment template spec 中添加注解：

```yaml
annotations:
  dapr.io/enabled: "true"
  dapr.io/api-token-secret: "dapr-api-token" # name of the Kubernetes secret
```

当 Deployment 部署后，Dapr sidecar 注入器会自动创建秘密，并将实际值注入到 `DAPR_API_TOKEN` 环境变量中。

## 轮换令牌

### Self-hosted (自托管)

To rotate the configured token in self-hosted, update the `DAPR_API_TOKEN` environment variable to the new value and restart the `daprd` process.

### Kubernetes

To rotate the configured token in Kubernetes, update the previously-created secret with the new token in each namespace. You can do that using `kubectl patch` command, but a simpler way to update these in each namespace is by using a manifest:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: dapr-api-token
type: Opaque
data:
  token: <your-new-token>
```

然后将其应用于每个命名空间：

```shell
kubectl apply --file token-secret.yaml --namespace <namespace-name>
```

为了让 Dapr 开始使用新token，需要对你的每个 deployment 进行滚动升级：

```shell
kubectl rollout restart deployment/<deployment-name> --namespace <namespace-name>
```

> Assuming your service is configured with more than one replica, the key rotation process does not result in any downtime.

## Adding API token to client API invocations

Once token authentication is configured in Dapr, all clients invoking Dapr API will have to append the API token token to every request:

### HTTP

In case of HTTP, Dapr requires the API token in the `dapr-api-token` header. For example:

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

When using gRPC protocol, Dapr will inspect the incoming calls for the API token on the gRPC metadata:

```text
dapr-api-token[0].
```

## 从应用访问令牌

### Kubernetes

In Kubernetes, it's recommended to mount the secret to your pod as an environment variable, as shown in the example below, where a Kubernetes secret with the name `dapr-api-token` is used to hold the token.

```yaml
containers:
  - name: mycontainer
    image: myregistry/myapp
    envFrom:
    - secretRef:
      name: dapr-api-token
```

### Self-hosted (自托管)

在自托管模式下，您可以将 token 设置为应用程序的环境变量 ：

```sh
export DAPR_API_TOKEN=<my-dapr-token>
```

## 相关链接

- Learn about [Dapr security concepts]({{< ref security-concept.md >}})
- 了解 [如何通过令牌认证来自 Dapr 的请求]({{< ref app-api-token.md >}})
