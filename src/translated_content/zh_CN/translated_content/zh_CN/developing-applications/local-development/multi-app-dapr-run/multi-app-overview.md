---
type: docs
title: 多应用运行概述
linkTitle: 多应用运行概述
weight: 1000
description: 用一个命令行工具命令运行多个应用程序
---

{{% alert title="注意" color="primary" %}}
**Kubernetes** 的多应用运行目前是预览功能。
{{% /alert %}}

假设您想要在本地运行多个应用程序以便一起测试它们，类似于生产环境的情况。 多应用运行允许您同时启动和停止一组应用程序，方式有两种：

- 使用进程本地/自托管，或
- 通过构建容器镜像并部署到 Kubernetes 集群
  - 可以使用本地 Kubernetes 群集 （KiND） 或部署到云（AKS、EKS 和 GKE）。

多应用运行模板文件描述了如何启动多个应用程序，就像您运行了许多单独的命令行工具 `run` 命令一样。 默认情况下，此模板文件被称为 `dapr.yaml`。



{{% codetab %}}

<!--selfhosted-->

## 多应用运行模板文件

当你执行 `dapr run -f .` 时，它会启动当前目录中的多应用模板文件（名为 `dapr.yaml`）来运行所有应用程序。

您可以使用首选名称而非默认名称来命名模板文件。 例如 `dapr run -f ./<your-preferred-file-name>.yaml`。

以下示例包括您可以为应用程序自定义的一些模板属性。 在示例中，您可以同时启动具有应用程序 ID 为 `processor` 和 `emit-metrics` 的 2 个应用程序。

```yaml
version: 1
apps:
  - appID: processor
    appDirPath: ../apps/processor/
    appPort: 9081
    daprHTTPPort: 3510
    command: ["go","run", "app.go"]
  - appID: emit-metrics
    appDirPath: ../apps/emit-metrics/
    daprHTTPPort: 3511
    env:
      DAPR_HOST_ADD: localhost
    command: ["go","run", "app.go"]
```

有关模板属性的更详细示例和解释，请参阅[多应用程序模板]({{< ref multi-app-template.md >}})。

## 资源和配置文件的位置

使用Multi-App Run时，您可以选择将应用程序的资源和配置文件放在何处。

### 指向一个文件位置（按照约定）

您可以在`~/.dapr`根目录中设置所有应用程序的资源和配置。 当所有应用程序共享相同的资源路径时，这很有帮助，比如在本地机器上进行测试时。

### 每个应用程序都有单独的文件位置（按约定）

当使用Multi-App Run时，每个应用程序目录可以有一个`.dapr`文件夹，其中包含一个`config.yaml`文件和一个`resources`目录。 否则，如果应用目录中不存在`.dapr`目录，则使用默认的`~/.dapr/resources/`和`~/.dapr/config.yaml`位置。

如果您决定在每个应用程序目录中添加一个 `.dapr` 目录，其中包含一个 `/resources` 目录和 `config.yaml` 文件，您可以为每个应用程序指定不同的资源路径。 通过使用默认的`~/.dapr`，这种方法仍然符合惯例。

### 指向不同位置（自定义）

您还可以将每个应用程序目录的 `.dapr` 目录命名为除 `.dapr` 之外的其他名称，例如 `webapp` 或 `backend`。 这有助于明确资源或应用程序目录路径。

## 日志

运行模板为每个应用程序及其关联的daprd进程提供两个日志目标字段：

1. `appLogDestination` : 此字段配置应用程序的日志目标。 可能的值为 `console`，`file` 和 `fileAndConsole`。 默认值是 `fileAndConsole`，默认情况下应用程序日志同时写入控制台和文件。

2. `daprdLogDestination` : 此字段配置 `daprd` 进程的日志目标。 可能的值为 `console`，`file` 和 `fileAndConsole`。 默认值是 `file`，默认情况下 `daprd` 的日志会被写入文件中。

### 日志文件格式

应用程序和 `daprd` 的日志被记录在不同的文件中。 这些日志文件是在每个应用程序目录下的`.dapr/logs`目录下自动生成的（模板中的`appDirPath`）。 这些日志文件的名称遵循以下模式:

- `<appID>_app_<timestamp>.log`（`app`日志文件名格式）
- `<appID>_daprd_<timestamp>.log`（`daprd`日志文件名格式）

即使您已决定将资源文件夹重命名为除`.dapr`之外的其他名称，日志文件仍只会写入`.dapr/logs`文件夹（在应用程序目录中创建）。

## 观看演示

观看[此视频以了解多应用运行的概述](https://youtu.be/s1p9MNl4VGo?t=2456):

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/s1p9MNl4VGo?start=2456" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>



{{% codetab %}}

<!--kubernetes-->

## 多应用运行模板文件

当你执行 `dapr run -k -f .` 或 `dapr run -k -f dapr.yaml`，在 Kubernetes 默认命名空间中启动了在 `dapr.yaml` 多应用运行模板文件中定义的应用程序。

> **注意：** 目前，多应用运行模板只能在默认的Kubernetes命名空间中启动应用程序。

在`.dapr/deploy`文件夹中为每个应用程序生成Kubernetes所需的默认服务和部署定义，在`dapr.yaml`模板中。

如果在应用的 `dapr.yaml` 模板中将 `createService` 字段设置为 `true`，则会在应用的 `.dapr/deploy` 文件夹中生成 `service.yaml` 文件。

否则，只为每个具有`containerImage`字段设置的应用程序生成`deployment.yaml`文件。

文件 `service.yaml` 和 `deployment.yaml` 用于在 Kubernetes 的 `default` 命名空间中部署应用程序。 该功能专门针对在Kubernetes的开发/测试环境中运行多个应用程序。

您可以使用任何首选名称来命名模板文件，而不仅限于默认名称。 例如：

```bash
dapr run -k -f ./<your-preferred-file-name>.yaml
```

以下示例包括您可以为应用程序自定义的一些模板属性。 在示例中，您可以同时启动具有应用程序 ID 为 `nodeapp` 和 `pythonapp` 的 2 个应用程序。

```yaml
version: 1
common:
apps:
  - appID: nodeapp
    appDirPath: ./nodeapp/
    appPort: 3000
    containerImage: ghcr.io/dapr/samples/hello-k8s-node:latest
    createService: true
    env:
      APP_PORT: 3000
  - appID: pythonapp
    appDirPath: ./pythonapp/
    containerImage: ghcr.io/dapr/samples/hello-k8s-python:latest
```

> **注意：**
>
> - 如果未指定`containerImage`字段，`dapr run -k -f`会产生错误。
> - `createService`字段在Kubernetes中定义了一个基本的服务（ClusterIP或LoadBalancer），该服务的目标是模板中指定的`--app-port`。 如果未指定`createService`，应用程序将无法从集群外部访问。

有关模板属性的更详细示例和解释，请参阅[多应用程序模板]({{< ref multi-app-template.md >}})。

## 日志

运行模板为每个应用程序及其关联的daprd进程提供两个日志目标字段：

1. `appLogDestination` : 此字段配置应用程序的日志目标。 可能的值为 `console`，`file` 和 `fileAndConsole`。 默认值是 `fileAndConsole`，默认情况下应用程序日志同时写入控制台和文件。

2. `daprdLogDestination` : 此字段配置 `daprd` 进程的日志目标。 可能的值为 `console`，`file` 和 `fileAndConsole`。 默认值是 `file`，默认情况下 `daprd` 的日志会被写入文件中。

### 日志文件格式

应用程序和 `daprd` 的日志被记录在不同的文件中。 这些日志文件是在每个应用程序目录下的`.dapr/logs`目录下自动生成的（模板中的`appDirPath`）。 这些日志文件的名称遵循以下模式:

- `<appID>_app_<timestamp>.log`（`app`日志文件名格式）
- `<appID>_daprd_<timestamp>.log`（`daprd`日志文件名格式）

即使您已决定将资源文件夹重命名为除`.dapr`之外的其他名称，日志文件仍只会写入`.dapr/logs`文件夹（在应用程序目录中创建）。

## 观看演示

观看[此视频以了解 Kubernetes 中的多应用程序运行概述](https://youtu.be/nWatANwaAik?si=O8XR-TUaiY0gclgO\&t=1024):

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/nWatANwaAik?si=O8XR-TUaiY0gclgO&amp;start=1024" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>



{{< /tabs >}}

## 下一步

- [学习多应用运行模板文件结构及其属性]({{< ref multi-app-template.md >}})
- [尝试使用自托管的多应用运行模板与服务调用快速入门]({{< ref serviceinvocation-quickstart.md >}})
- [尝试使用`hello-kubernetes`教程的Kubernetes多应用运行模板](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-kubernetes)
