---
type: docs
title: 定义组件
linkTitle: 定义组件
weight: 70
description: 创建一个组件定义文件，与密钥构建块进行交互
---

当构建一个应用程序时，你很可能会根据你想使用的构建块和特定的组件来定义自己的组建文件。

在本教程中，您将创建一个组件定义文件，以与[secrets构建块API]({{< ref secrets >}}) 进行交互:

- 创建本地 JSON 秘密存储.
- 使用组件定义文件在 Dapr 注册密钥存储.
- 使用 Dapr HTTP API 获取密钥。

## 第 1 步：创建 JSON 秘密存储

1. 创建一个名为 `my-components` 的目录来存放新的秘密和组件文件：

   ```bash
   mkdir my-components
   ```

2. 进入目录

   ```bash
   cd my-components
   ```

3. Dapr支持[多种类型的密钥存储]({{< ref supported-secret-stores >}})，但对于本教程，请创建一个名为`mysecrets.json`的本地JSON文件，并添加以下密钥：

```json
{
   "my-secret" : "I'm Batman"
}
```

## 第 2 步：创建秘密存储 Dapr 组件

1. 在此目录内创建一个新文件 `localSecretStore.yaml`，内容如下：

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
       value: ./mysecrets.json
     - name: nestedSeparator
       value: ":"
   ```

在上面的定义文件中：

- `type: secretstores.local.file` 告诉Dapr使用本地文件组件作为密钥存储。
- 元数据字段提供使用此组件所需的组件特定信息。 在这种情况下，密钥存储 JSON 的路径是相对于您调用 `dapr run` 的位置。

## 第 3 步：运行 Dapr sidecar

运行以下命令以启动 Dapr sidecar，它将在端口 3500 上监听名为 `myapp` 的空白应用程序：

PowerShell 环境：

```bash
dapr run --app-id myapp --dapr-http-port 3500 --resources-path ../
```

非 PowerShell 环境：

```bash
dapr run --app-id myapp --dapr-http-port 3500 --resources-path .
```

{{% alert title="提示" color="primary" %}}
如果出现错误消息，说明 `app-id` 已在使用中，您可能需要停止任何当前正在运行的 Dapr sidecar。 在运行下一个 `dapr run` 命令之前停止sidecar：

- 按 Ctrl+C 或 Command+C。
- 在终端中运行`dapr stop`命令。



## 第 4 步：获取秘密

在另一个终端中运行:



```bash
curl http://localhost:3500/v1.0/secrets/my-secret-store/my-secret
```



{{% codetab %}}

```powershell
Invoke-RestMethod -Uri 'http://localhost:3500/v1.0/secrets/my-secret-store/my-secret'
```





```json
{"my-secret":"I'm Batman"}
```

{{< button text="下一步：设置 Pub/sub（发布/订阅）代理 >>" page="pubsub-quickstart" >}}
