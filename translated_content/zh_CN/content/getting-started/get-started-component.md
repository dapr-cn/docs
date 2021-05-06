---
type: docs
title: "定义一个组件"
linkTitle: "定义一个组件"
weight: 40
---

在 [之前的步骤]({{X13X}}) 中，你调用 Dapr HTTP API 从Redis支持的状态存储中存储和检索状态 Dapr通过Dapr初始化时创建的默认组件定义文件，知道使用本地配置在机器上的Redis实例。 Dapr通过Dapr初始化时创建的默认组件定义文件，知道使用本地配置在机器上的Redis实例。

当构建一个应用程序时，你很可能会根据你想使用的构建块和特定的组件来创建自己的组件文件定义。

作为如何为您的应用程序定义自定义组件的一个例子，您现在将创建一个组件定义文件来与[密钥构建块]({{< ref secrets >}})进行交互。

在本指南中，您将：
- 创建本地JSON密钥存储
- 使用组件定义文件在 Dapr 注册密钥存储
- 使用 Dapr HTTP API 获取密钥

## 第 1 步：创建一个 JSON 密钥存储

Dapr 支持 [许多类型的密钥存储]({{< ref supported-secret-stores >}})， 但最简单的方法是在本地的JSON文件中加入您的密钥(注意这个秘密存储是为了开发的目的，不推荐生产使用，因为它不安全)。

首先保存下面的 JSON 内容到一个名为 `mysecrets.json` 的文件：

```json
{
   "my-secret" : "I'm Batman"
}
```

## 第 2 步：创建一个密钥存储Dapr 组件

创建一个名为 `my-components` 的新目录来保存新组件文件：

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

您可以看到上面的文件定义有一个 `type: secretstores.local.file` 告诉Dapr使用本地文件组件作为密钥存储。 元数据字段提供了使用该组件所需的组件特定信息（在本例中，是密钥存储JSON的路径）。

## 第 3 步：运行Dapr sidecar

运行以下命令以启动 Dapr sidecar，它将在端口 3500 上监听名为 myapp 的空白应用程序：

```bash
dapr run --app-id myapp --dapr-http-port 3500 --components-path ./my-components
```

## 第 4 步：获取一个密钥

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

你应该看到你存储在JSON文件中的密钥的输出。

```json
{"my-secret":"I'm Batman"}
```

{{< button text="Next step: Explore Dapr quickstarts >>" page="quickstarts" >}}
