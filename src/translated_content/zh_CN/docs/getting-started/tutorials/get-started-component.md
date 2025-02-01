
---
type: docs
title: "定义一个组件"
linkTitle: "定义一个组件"
weight: 70
description: "创建一个组件定义文件以与secrets构建块交互"
---

在构建应用程序时，通常需要根据所需的构建块和特定组件创建组件文件定义。

在本教程中，您将创建一个组件定义文件以与[secrets构建块API]({{< ref secrets >}})交互：

- 创建一个本地JSON密钥存储。
- 使用组件定义文件向Dapr注册密钥存储。
- 使用Dapr HTTP API获取密钥。

## 步骤1：创建一个JSON密钥存储

1. 创建一个名为`my-components`的新目录以保存新的密钥和组件文件：

   ```bash
   mkdir my-components
   ```

1. 进入此目录。

   ```bash
   cd my-components
   ```

1. Dapr支持多种类型的密钥存储，但在本教程中，创建一个名为`mysecrets.json`的本地JSON文件，其中包含以下密钥：

```json
{
   "my-secret" : "I'm Batman"
}
```

## 步骤2：创建一个密钥存储Dapr组件

1. 创建一个新文件`localSecretStore.yaml`，内容如下：

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

在上述文件定义中：
- `type: secretstores.local.file` 指定Dapr使用本地文件组件作为密钥存储。
- 元数据字段提供了与此组件一起使用所需的特定信息。在这种情况下，密钥存储JSON路径是相对于您执行`dapr run`命令的位置。

## 步骤3：运行Dapr sidecar

启动一个Dapr sidecar，它将在端口3500上监听一个名为`myapp`的空应用程序：

对于PowerShell环境：
```bash
dapr run --app-id myapp --dapr-http-port 3500 --resources-path ../
```
对于非PowerShell环境：
```bash
dapr run --app-id myapp --dapr-http-port 3500 --resources-path .
```

{{% alert title="提示" color="primary" %}}
如果出现错误消息提示`app-id`已被使用，您可能需要停止任何当前正在运行的Dapr sidecar。在运行下一个`dapr run`命令之前，可以通过以下方式停止sidecar：

- 按Ctrl+C或Command+C。
- 在终端中运行`dapr stop`命令。

{{% /alert %}}

## 步骤4：获取一个密钥

在一个单独的终端中，运行：

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

**输出：**

```json
{"my-secret":"I'm Batman"}
```

{{< button text="下一步：设置一个Pub/sub代理 >>" page="pubsub-quickstart" >}}
