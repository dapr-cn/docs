---
type: docs
title: "定义组件"
linkTitle: "定义组件"
weight: 40
---

在 [上一步]({{<ref get-started-api.md>}}) 中，您调用了 Dapr HTTP API，从 Redis 支持的状态存储中存储和检索状态。 Dapr 通过初始化时创建的默认组件定义文件得知，要使用您机器上本地配置好的 Redis 实例。

当构建一个应用程序时，你很可能会根据你想使用的构建块和特定的组件来定义自己的组建文件。

作为如何为应用程序定义自定义组件的示例，您现在将创建一个组件定义文件，以便与[秘密构建块]({{< ref secrets >}})进行交互。

在本指南中，您将：
- 创建本地 JSON 秘密存储
- 使用组件定义文件在 Dapr 中注册秘密存储。
- 使用 Dapr HTTP API 获取秘密

## 第 1 步：创建 JSON 秘密存储

Dapr 支持[许多类型的秘密存储]({{< ref supported-secret-stores >}})， 但最简单的方法是在本地的 JSON 文件中加入您的秘密(注意这个秘密存储是用于开发目的，不推荐生产使用，因为它不安全)。

首先保存下面的 JSON 内容到名为 `mysecrets.json` 的文件：

```json
{
   "my-secret" : "I'm Batman"
}
```

## 第 2 步：创建秘密存储 Dapr 组件

创建一个名为 `my-components` 的目录来存放新的组件文件：

```bash
mkdir my-components
```

在此目录内创建一个新文件 `localSecretStore.yaml` ，内容如下：


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: my-secret-store
  namespace: default
spec:
  type: secretstores.local.file
  version: v1
  metadata:
  - name: secretsFile
    value: <PATH TO SECRETS FILE>/mysecrets.json
  - name: nestedSeparator
    value: ":"
```

您可以看到上述的文件定义有一个 `type: secretstores.local.file` 字段值，其告诉 Dapr 使用本地文件组件作为秘密存储。 Metadata 字段提供了使用该组件所需的组件特定信息（在本例中，是到秘密存储 JSON 的路径，它是相对于调用 `dapr run` 的地方）。

## 第 3 步：运行 Dapr sidecar

运行以下命令以启动 Dapr sidecar，它将在端口 3500 上监听名为 myapp 的空白应用程序：

```bash
dapr run --app-id myapp --dapr-http-port 3500 --components-path ./my-components
```

> 如果您遇到错误，指出应用程序 ID 已在使用中，则可能是您在上一步中运行的 sidecar 仍在运行。 请确保您在运行上面的命令前，停止之前运行的 sidecar (例如使用 "Control-C")。

## 第 4 步：获取秘密

在单独的终端运行中：

{{< tabs "HTTP API (Bash)" "HTTP API (PowerShell)">}}
{{% codetab %}}

```bash
curl http://localhost:3500/v1.0/secrets/my-secret-store/my-secret
```
{{% /codetab %}}

{{% codetab %}}
```powershell
Invoke-RestMethod -Uri 'http://localhost:3500/v1.0/secrets/my-secret-store/my-secret'
```
{{% /codetab %}}
{{< /tabs >}}

你看到的输出应该是你存储在 JSON 文件中的秘密。

```json
{"my-secret":"I'm Batman"}
```

{{< button text="下一步: 探索 Dapr 快速入门 >>" page="quickstarts" >}}
