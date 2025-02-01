---
type: docs
title: "在 Dapr 中启用 API 令牌认证"
linkTitle: "Dapr API 令牌认证"
weight: 3000
description: "要求每个传入的 Dapr API 请求在通过之前包含一个认证令牌"
---

默认情况下，Dapr 通过网络边界限制对其公共 API 的访问。如果您计划在该边界之外公开 Dapr API，或者您的部署需要额外的安全级别，请考虑为 Dapr API 启用令牌认证。这意味着 Dapr 将要求每个传入的 gRPC 和 HTTP 请求在通过之前包含认证令牌。

## 创建令牌

Dapr 通过共享令牌进行 API 认证。您可以自由定义要使用的 API 令牌。

虽然 Dapr 对共享令牌的格式没有具体要求，但一个好的做法是生成一个随机字节序列并将其编码为 Base64。例如，以下命令生成一个随机的 32 字节密钥并将其编码为 Base64：

```sh
openssl rand 16 | base64
```

## 在 Dapr 中配置 API 令牌认证

对于 Kubernetes 或自托管 Dapr 部署，令牌认证配置略有不同：

### 自托管

在自托管场景中，Dapr 会检查 `DAPR_API_TOKEN` 环境变量是否存在。如果在 `daprd` 进程启动时设置了该环境变量，Dapr 将对其公共 API 强制执行认证：

```shell
export DAPR_API_TOKEN=<token>
```

要更新配置的令牌，请将 `DAPR_API_TOKEN` 环境变量更新为新值并重新启动 `daprd` 进程。

### Kubernetes

在 Kubernetes 部署中，Dapr 使用 Kubernetes secret 存储来保存共享令牌。要配置 Dapr API 认证，首先创建一个新的 secret：

```shell
kubectl create secret generic dapr-api-token --from-literal=token=<token>
```

> 注意，您需要在每个希望启用 Dapr 令牌认证的命名空间中创建上述 secret。

要指示 Dapr 使用该 secret 来保护其公共 API，请在您的 Deployment 模板规范中添加一个注释：

```yaml
annotations:
  dapr.io/enabled: "true"
  dapr.io/api-token-secret: "dapr-api-token" # Kubernetes secret 的名称
```

部署时，Dapr sidecar 注入器将自动创建一个 secret 引用并将实际值注入 `DAPR_API_TOKEN` 环境变量。

## 更新令牌

### 自托管

要在自托管中更新配置的令牌，请将 `DAPR_API_TOKEN` 环境变量更新为新值并重新启动 `daprd` 进程。

### Kubernetes

要在 Kubernetes 中更新配置的令牌，请在每个命名空间中使用新令牌更新先前创建的 secret。您可以使用 `kubectl patch` 命令执行此操作，但在每个命名空间中更新这些的更简单方法是使用清单：

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: dapr-api-token
type: Opaque
data:
  token: <your-new-token>
```

然后将其应用到每个命名空间：

```shell
kubectl apply --file token-secret.yaml --namespace <namespace-name>
```

要让 Dapr 开始使用新令牌，请触发对每个部署的滚动升级：

```shell
kubectl rollout restart deployment/<deployment-name> --namespace <namespace-name>
```

> 假设您的服务配置了多个副本，密钥更新过程不会导致任何停机时间。

## 向客户端 API 调用添加 API 令牌

一旦在 Dapr 中配置了令牌认证，所有调用 Dapr API 的客户端都需要在每个请求中附加 `dapr-api-token` 令牌。

> **注意：** Dapr SDK 会读取 [DAPR_API_TOKEN]({{< ref environment >}}) 环境变量并默认为您设置。

<img src="/images/tokens-auth.png" width=800 style="padding-bottom:15px;">

### HTTP

在 HTTP 的情况下，Dapr 要求在 `dapr-api-token` 头中提供 API 令牌。例如：

```text
GET http://<daprAddress>/v1.0/metadata
dapr-api-token: <token>
```

使用 curl，您可以使用 `--header`（或 `-H`）选项传递头。例如：

```sh
curl http://localhost:3500/v1.0/metadata \
  --header "dapr-api-token: my-token"
```

### gRPC

使用 gRPC 协议时，Dapr 将在 gRPC 元数据中检查传入调用的 API 令牌：

```text
dapr-api-token[0].
```

## 从应用访问令牌

### Kubernetes

在 Kubernetes 中，建议将 secret 挂载到您的 pod 作为环境变量，如下例所示，其中名为 `dapr-api-token` 的 Kubernetes secret 用于保存令牌。

```yaml
containers:
  - name: mycontainer
    image: myregistry/myapp
    envFrom:
    - secretRef:
      name: dapr-api-token
```

### 自托管

在自托管模式下，您可以将令牌设置为应用的环境变量：

```sh
export DAPR_API_TOKEN=<my-dapr-token>
```

## 相关链接

- 了解 [Dapr 安全概念]({{< ref security-concept.md >}})
- 了解 [如何使用令牌认证从 Dapr 认证请求]({{< ref app-api-token.md >}})