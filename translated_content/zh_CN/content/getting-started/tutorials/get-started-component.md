---
type: docs
title: "定义一个组件"
linkTitle: "定义一个组件"
weight: 70
description: "Create a component definition file to interact with the secrets building block"
---

当构建一个应用程序时，你很可能会根据你想使用的构建块和特定的组件来定义自己的组建文件。

In this tutorial, you will create a component definition file to interact with the [secrets building block API]({{< ref secrets >}}):

- 创建本地 JSON 秘密存储.
- 使用组件定义文件在 Dapr 注册密钥存储.
- 使用 Dapr HTTP API 获取秘密.

## 第 1 步：创建一个 JSON 密钥存储

Dapr supports [many types of secret stores]({{< ref supported-secret-stores >}}), but for this tutorial, create a local JSON file named `mysecrets.json` with the following secret:

```json
{
   "my-secret" : "I'm Batman"
}
```

## 第 2 步：创建一个密钥存储Dapr 组件

1. 创建一个名为 `my-components` 的目录来存放新的组件文件：

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
- `type: secretstores.local.file` 告诉Dapr使用本地文件组件作为密钥存储。
- 元数据字段提供使用此组件所需的组件特定信息。 在这种情况下，密钥存储 JSON 路径相对于您调用 `dapr run` 的位置。

## 第 3 步：运行Dapr sidecar

启动一个 Dapr sidecar，它将在端口 3500 上侦听名为 `myapp`的空白应用程序：

```bash
dapr run --app-id myapp --dapr-http-port 3500 --components-path ./my-components
```

{{% alert title="Tip" color="primary" %}}
如果出现错误消息，说明 `app-id` 已在使用中，您可能需要停止任何当前正在运行的 Dapr sidecar。 在运行下一个 `dapr run` 命令之前停止sidecar：

- 按 Ctrl+C 或 Command+C。
- 在终端中运行 `dapr stop` 命令。

{{% /alert %}}

## 第 4 步：获取一个密钥

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

**输出:**

```json
{"my-secret":"I'm Batman"}
```

{{< button text="下一步：设置 Pub/sub（发布/订阅） 代理 >>" page="pubsub-quickstart" >}}