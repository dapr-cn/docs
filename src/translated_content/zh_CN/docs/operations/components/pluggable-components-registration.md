---
type: docs
title: "如何：注册一个可插拔组件"
linkTitle: "注册一个可插拔组件"
weight: 1000
description: "学习如何注册一个可插拔组件"
---

[uds]: https://en.wikipedia.org/wiki/Unix_domain_socket

## 组件注册过程

[使用 gRPC 的可插拔组件]({{< ref pluggable-components-overview >}})通常作为容器或进程运行，需要通过[Unix 域套接字][uds]（简称 UDS）与 Dapr 运行时通信。它们会通过以下步骤自动被发现并注册到运行时中：

1. 组件监听放置在共享卷上的[Unix 域套接字][uds]。
2. Dapr 运行时列出共享卷中的所有[Unix 域套接字][uds]。
3. Dapr 运行时连接每个套接字，并使用 gRPC 反射从组件实现的给定构建块 API 中发现所有 proto 服务。

一个组件可以同时实现多个组件接口。

<img src="/images/components-pluggable-register-grpc.png" width=50%>

虽然 Dapr 的内置组件已经集成在运行时中，但可插拔组件在与 Dapr 一起使用之前需要进行一些设置步骤。

1. 可插拔组件需要在 Dapr 本身启动之前启动并准备好接收请求。
2. 用于可插拔组件通信的[Unix 域套接字][uds]文件需要对 Dapr 和可插拔组件都可访问。

在独立模式下，可插拔组件可以作为进程或容器运行。在 Kubernetes 上，可插拔组件作为容器运行，并由 Dapr 的 sidecar 注入器自动注入到应用程序的 pod 中，允许通过标准的[Kubernetes 容器规范](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.25/#container-v1-core)进行自定义。

这也改变了在 Dapr 和可插拔组件之间共享[Unix 域套接字][uds]文件的方法。

{{% alert title="注意" color="primary" %}}
作为前提条件，操作系统必须支持 Unix 域套接字，任何 UNIX 或类 UNIX 系统（Mac、Linux 或用于本地开发的 [WSL](https://learn.microsoft.com/windows/wsl/install) 对于 Windows 用户）都应该足够。
{{% /alert %}}

选择您的环境以开始使您的组件可被发现。

{{< tabs "Standalone" "Kubernetes" >}}

{{% codetab %}}
[uds]: https://en.wikipedia.org/wiki/Unix_domain_socket

## 运行组件

在 Dapr 启动之前，您的组件和 Unix 套接字必须正在运行。

默认情况下，Dapr sidecar 在 `/tmp/dapr-components-sockets` 中查找作为[Unix 域套接字][uds]文件的组件。

此文件夹中的文件名对于组件注册很重要。它们必须通过附加组件的**名称**和您选择的文件扩展名（通常为 `.sock`）来形成。例如，文件名 `my-component.sock` 是一个有效的 Unix 域套接字文件名，适用于名为 `my-component` 的组件。

由于您在与组件相同的主机上运行 Dapr，请验证此文件夹及其中的文件是否可被您的组件和 Dapr 访问和写入。如果您使用 Dapr 的 sidecar 注入器功能，则此卷会自动创建和挂载。

### 组件发现和多路复用

通过[Unix 域套接字][UDS]（UDS）可访问的可插拔组件可以托管多个不同的组件 API。在组件的初始发现过程中，Dapr 使用反射枚举 UDS 后面的所有组件 API。上例中的 `my-component` 可插拔组件可以包含状态存储（`state`）和 pub/sub（`pubsub`）组件 API。

通常，可插拔组件实现单个组件 API 以进行打包和部署。然而，以增加其依赖性和扩大其安全攻击面为代价，可插拔组件可以实现多个组件 API。这可以减轻部署和监控负担。隔离、容错和安全的最佳实践是为每个可插拔组件实现单个组件 API。

## 定义组件

使用[组件规范]({{< ref component-schema.md >}})定义您的组件。组件的 `spec.type` 值是通过以下两个部分与 `.` 连接而成的：
1. 组件的 API（`state`、`pubsub`、`bindings` 等）
2. 组件的**名称**，它是从[Unix 域套接字][uds]文件名中派生的，不包括文件扩展名。

您需要为可插拔组件的[Unix 域套接字][uds]公开的每个 API 定义一个[组件规范]({{< ref component-schema.md >}})。前面示例中的 Unix 域套接字 `my-component.sock` 公开了一个名为 `my-component` 的可插拔组件，具有 `state` 和 `pubsub` API。需要两个组件规范，每个规范在其自己的 YAML 文件中，放置在 `resources-path` 中：一个用于 `state.my-component`，另一个用于 `pubsub.my-component`。

例如，`state.my-component` 的组件规范可以是：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: my-production-state-store
spec:
  type: state.my-component
  version: v1
  metadata:
```

在上面的示例中，请注意以下几点：
* 字段 `spec.type` 的内容是 `state.my-component`，指的是作为名为 `my-component` 的可插拔组件公开的状态存储。
* 字段 `metadata.name`，即此处定义的状态存储的名称，与可插拔组件名称无关。

将此文件保存为 Dapr 的组件配置文件夹中的 `component.yaml`。就像 `metadata.name` 字段的内容一样，此 YAML 文件的文件名没有影响，也不依赖于可插拔组件名称。

## 运行 Dapr

[初始化 Dapr]({{< ref get-started-api.md >}})，并确保您的组件文件放置在正确的文件夹中。

{{% alert title="注意" color="primary" %}}
Dapr 1.9.0 是支持可插拔组件的最低版本。从 1.11.0 版本开始，支持可插拔组件的容器自动注入。
{{% /alert %}}

<!-- 我们应该在这里列出用户将要输入的实际命令行 -->

就是这样！现在您可以通过 Dapr API 调用状态存储 API。通过运行以下命令查看其运行情况。用 Dapr HTTP 端口替换 `$PORT`：

```shell
curl -X POST -H "Content-Type: application/json" -d '[{ "key": "name", "value": "Bruce Wayne", "metadata": {}}]' http://localhost:$PORT/v1.0/state/prod-mystore
```

检索值，用 Dapr HTTP 端口替换 `$PORT`：

```shell
curl http://localhost:$PORT/v1.0/state/prod-mystore/name
```

{{% /codetab %}}

{{% codetab %}}

[uds]: https://en.wikipedia.org/wiki/Unix_domain_socket

## 为您的可插拔组件构建和发布容器

确保您的组件作为容器运行，首先发布并可被您的 Kubernetes 集群访问。

## 在 Kubernetes 集群上部署 Dapr

按照[在 Kubernetes 集群上部署 Dapr]({{< ref kubernetes-deploy.md >}})文档中提供的步骤进行操作。

## 在您的部署中添加可插拔组件容器

可插拔组件作为容器**在与您的应用程序相同的 pod 中**部署。

由于可插拔组件由[Unix 域套接字][uds]支持，请使您的可插拔组件创建的套接字可被 Dapr 运行时访问。配置部署规范以：

1. 挂载卷
2. 提示 Dapr 挂载的 Unix 套接字卷位置
3. 将卷附加到您的可插拔组件容器

在以下示例中，您配置的可插拔组件作为容器部署在与您的应用程序容器相同的 pod 中。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app
  labels:
    app: app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: app
  template:
    metadata:
      labels:
        app: app
      annotations:
        # 推荐自动注入可插拔组件。
        dapr.io/inject-pluggable-components: "true" 
        dapr.io/app-id: "my-app"
        dapr.io/enabled: "true"
    spec:
      containers:
      # 您的应用程序的容器规范，照常。
        - name: app
           image: YOUR_APP_IMAGE:YOUR_APP_IMAGE_VERSION
```

建议将 `dapr.io/inject-pluggable-components` 注释设置为 "true"，指示 Dapr 的 sidecar 注入器该应用程序的 pod 将有额外的容器用于可插拔组件。

或者，您可以跳过 Dapr 的 sidecar 注入功能，手动添加可插拔组件的容器并注释您的 pod，告诉 Dapr 该 pod 中哪些容器是可插拔组件，如下例所示：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app
  labels:
    app: app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: app
  template:
    metadata:
      labels:
        app: app
      annotations:
        dapr.io/pluggable-components: "component" ## 可插拔组件容器的名称，用 `,` 分隔，例如 "componentA,componentB"。
        dapr.io/app-id: "my-app"
        dapr.io/enabled: "true"
    spec:
      containers:
      ### --------------------- 您的应用程序容器在此处 -----------
        - name: app
           image: YOUR_APP_IMAGE:YOUR_APP_IMAGE_VERSION
      ### --------------------- 您的可插拔组件容器在此处 -----------
        - name: component
          image: YOUR_IMAGE_GOES_HERE:YOUR_IMAGE_VERSION
```

在应用部署之前，让我们再添加一个配置：组件规范。

## 定义组件

可插拔组件使用[组件规范]({{< ref component-schema.md >}})定义。组件 `type` 是从套接字名称（不带文件扩展名）派生的。在以下示例 YAML 中，替换：

- `your_socket_goes_here` 为您的组件套接字名称（无扩展名）
- `your_component_type` 为您的组件类型

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: prod-mystore
  # 在 Kubernetes 上运行并自动容器注入时，添加以下注释：
  annotations:
    dapr.io/component-container: >
      {
        "name": "my-component",
        "image": "<registry>/<image_name>:<image_tag>"
      }
spec:
  type: your_component_type.your_socket_goes_here
  version: v1
  metadata:
scopes:
  - backend
```
当您希望 Dapr 的 sidecar 注入器处理可插拔组件的容器和卷注入时，`dapr.io/component-container` 注释在 Kubernetes 上是必需的。至少，您需要 `name` 和 `image` 属性，以便 Dapr 的 sidecar 注入器成功将容器添加到应用程序的 pod 中。Unix 域套接字的卷由 Dapr 的 sidecar 注入器自动创建和挂载。

[范围]({{< ref component-scopes >}})您的组件，以确保只有目标应用程序可以连接到可插拔组件，因为它只会在其部署中运行。否则，运行时在初始化组件时会失败。

就是这样！**[将创建的清单应用到您的 Kubernetes 集群](https://kubernetes.io/docs/reference/kubectl/cheatsheet/#kubectl-apply)**，并通过 Dapr API 调用状态存储 API。

使用[Kubernetes pod 转发器](https://kubernetes.io/docs/tasks/access-application-cluster/port-forward-access-application-cluster/)访问 `daprd` 运行时。

通过运行以下命令查看其运行情况。用 Dapr HTTP 端口替换 `$PORT`：

```shell
curl -X POST -H "Content-Type: application/json" -d '[{ "key": "name", "value": "Bruce Wayne", "metadata": {}}]' http://localhost:$PORT/v1.0/state/prod-mystore
```

检索值，用 Dapr HTTP 端口替换 `$PORT`：

```shell
curl http://localhost:$PORT/v1.0/state/prod-mystore/name
```

{{% /codetab %}}
{{< /tabs >}}

## 下一步

使用此[示例代码](https://github.com/dapr/samples/tree/master/pluggable-components-dotnet-template)开始开发 .NET 可插拔组件
