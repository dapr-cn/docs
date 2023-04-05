---
type: docs
title: "定义组件"
linkTitle: "定义组件"
weight: 70
description: "创建组件定义文件以与 Secrets 构建块进行交互"
---

When building an app, you'd most likely create your own component file definitions, depending on the building block and specific component that you'd like to use.

在本快速入门中，您将创建一个组件定义文件以与 [Secrets 构建块]({{< ref secrets >}})进行交互：

- 创建本地 JSON 机密存储。
- 使用组件定义文件向 Dapr 注册机密存储。
- Obtain the secret using the Dapr HTTP API.

## Step 1: Create a JSON secret store

Dapr 支持 [多种类型的机密存储]({{< ref supported-secret-stores >}})，但在本教程中，请使用以下机密创建一个名为 `mysecrets.json` 的本地 JSON 文件：

```json
{
   "my-secret" : "I'm Batman"
}
```

## 第 2 步：创建秘密存储 Dapr 组件

1. Create a new directory named `my-components` to hold the new component file:

   ```bash
   mkdir my-components
   ```

1. 进入目录

   ```bash
   cd my-components
   ```

1. 创建一个新文件 `localSecretStore.yaml` ，内容如下：

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

在上面的定义文件中：
- `type: secretstores.local.file` tells Dapr to use the local file component as a secret store.
- 元数据字段提供使用此组件所需的组件特定信息。 在这种情况下，密钥存储 JSON 路径相对于您调用 `dapr run` 的位置。

## 第 3 步：运行 Dapr sidecar

启动一个 Dapr sidecar，它将在端口 3500 上侦听名为 `myapp`的空白应用程序：

```bash
dapr run --app-id myapp --dapr-http-port 3500 --resources-path ./my-components
```

{{% alert title="Tip" color="primary" %}}
如果出现错误消息，说明 `app-id` 已在使用中，您可能需要停止任何当前正在运行的 Dapr sidecar。 在运行下一个 `dapr run` 命令之前停止sidecar：

- Pressing Ctrl+C or Command+C.
- 在终端中运行 `dapr stop` 命令。

{{% /alert %}}

## 第 4 步：获取秘密

在独立的终端中运行：

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

**Output:**

```json
{"my-secret":"I'm Batman"}
```

{{< button text="下一步：设置 Pub/sub（发布/订阅） 代理 >>" page="pubsub-quickstart" >}}