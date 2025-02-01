---
type: docs
title: 多应用运行概述
linkTitle: 多应用运行概述
weight: 1000
description: 使用一个CLI命令运行多个应用程序
---

{{% alert title="注意" color="primary" %}}
**Kubernetes** 的多应用运行目前是一个预览功能。
{{% /alert %}}

如果您想在本地运行多个应用程序进行联合测试，类似于生产环境，多应用运行功能可以帮助您同时启动和停止一组应用程序。这些应用程序可以是：
- 本地/自托管的进程，或
- 通过构建容器镜像并部署到Kubernetes集群
   - 您可以使用本地Kubernetes集群（如KiND）或将其部署到云（如AKS、EKS和GKE）。

多应用运行模板文件描述了如何启动多个应用程序，类似于您运行多个单独的CLI `run`命令。默认情况下，此模板文件名为`dapr.yaml`。

{{< tabs 自托管 Kubernetes>}}

{{% codetab %}}
<!--selfhosted-->

## 多应用运行模板文件

执行`dapr run -f .`时，它会启动当前目录中的多应用模板文件（名为`dapr.yaml`）以运行所有应用程序。

您可以使用自己喜欢的名称命名模板文件，而不是默认名称。例如`dapr run -f ./<your-preferred-file-name>.yaml`。

以下示例展示了一些您可以为应用程序自定义的模板属性。在示例中，您可以同时启动2个应用程序，应用程序ID分别为`processor`和`emit-metrics`。

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

有关模板属性的更深入示例和解释，请参见[多应用模板]({{< ref multi-app-template.md >}})。

## 资源和配置文件的位置

使用多应用运行时，您可以选择将应用程序的资源和配置文件放置在哪里。

### 单一文件位置（遵循约定）

您可以将所有应用程序的资源和配置放在`~/.dapr`根目录下。当所有应用程序共享相同的资源路径时，这种方式很有帮助，比如在本地机器上测试时。

### 独立文件位置（遵循约定）

使用多应用运行时，每个应用程序目录可以有一个`.dapr`文件夹，其中包含一个`config.yaml`文件和一个`resources`目录。如果应用程序目录中不存在`.dapr`目录，则使用默认的`~/.dapr/resources/`和`~/.dapr/config.yaml`位置。

如果您决定在每个应用程序目录中添加一个`.dapr`目录，其中包含一个`/resources`目录和`config.yaml`文件，您可以为每个应用程序指定不同的资源路径。这种方法仍然遵循默认的`~/.dapr`约定。

### 自定义位置

您还可以将每个应用程序目录的`.dapr`目录命名为其他名称，例如`webapp`或`backend`。如果您希望明确资源或应用程序目录路径，这将有所帮助。

## 日志

运行模板为每个应用程序及其关联的daprd进程提供了两个日志目标字段：

1. `appLogDestination`：此字段配置应用程序的日志目标。可能的值是`console`、`file`和`fileAndConsole`。默认值是`fileAndConsole`，应用程序日志默认写入控制台和文件。

2. `daprdLogDestination`：此字段配置`daprd`进程的日志目标。可能的值是`console`、`file`和`fileAndConsole`。默认值是`file`，`daprd`日志默认写入文件。

### 日志文件格式

应用程序和`daprd`的日志分别捕获在不同的文件中。这些日志文件会自动创建在每个应用程序目录（模板中的`appDirPath`）下的`.dapr/logs`目录中。这些日志文件名遵循以下模式：

- `<appID>_app_<timestamp>.log`（`app`日志的文件名格式）
- `<appID>_daprd_<timestamp>.log`（`daprd`日志的文件名格式）

即使您决定将资源文件夹重命名为其他名称，日志文件也只会写入应用程序目录中创建的`.dapr/logs`文件夹。

## 观看演示

观看[此视频以了解多应用运行的概述](https://youtu.be/s1p9MNl4VGo?t=2456)：

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/s1p9MNl4VGo?start=2456" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

{{% /codetab %}}

{{% codetab %}}
<!--kubernetes-->

## 多应用运行模板文件

执行`dapr run -k -f .`或`dapr run -k -f dapr.yaml`时，`dapr.yaml`多应用运行模板文件中定义的应用程序将在Kubernetes默认命名空间中启动。

> **注意：** 目前，多应用运行模板只能在默认的Kubernetes命名空间中启动应用程序。

Kubernetes所需的默认服务和部署定义会在`dapr.yaml`模板中为每个应用程序生成在`.dapr/deploy`文件夹中。

如果`dapr.yaml`模板中应用程序的`createService`字段设置为`true`，则会在应用程序的`.dapr/deploy`文件夹中生成`service.yaml`文件。

否则，只会为每个设置了`containerImage`字段的应用程序生成`deployment.yaml`文件。

文件`service.yaml`和`deployment.yaml`用于在Kubernetes的`default`命名空间中部署应用程序。此功能专门针对在Kubernetes中运行多个应用程序的开发/测试环境。

您可以使用任何首选名称命名模板文件，而不是默认名称。例如：

```bash
dapr run -k -f ./<your-preferred-file-name>.yaml
```

以下示例展示了一些您可以为应用程序自定义的模板属性。在示例中，您可以同时启动2个应用程序，应用程序ID分别为`nodeapp`和`pythonapp`。

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
> - 如果未指定`containerImage`字段，`dapr run -k -f`会产生错误。
> - `createService`字段定义了一个基本的Kubernetes服务（ClusterIP或LoadBalancer），目标是模板中指定的`--app-port`。如果未指定`createService`，则应用程序无法从集群外部访问。

有关模板属性的更深入示例和解释，请参见[多应用模板]({{< ref multi-app-template.md >}})。

## 日志

运行模板为每个应用程序及其关联的daprd进程提供了两个日志目标字段：

1. `appLogDestination`：此字段配置应用程序的日志目标。可能的值是`console`、`file`和`fileAndConsole`。默认值是`fileAndConsole`，应用程序日志默认写入控制台和文件。

2. `daprdLogDestination`：此字段配置`daprd`进程的日志目标。可能的值是`console`、`file`和`fileAndConsole`。默认值是`file`，`daprd`日志默认写入文件。

### 日志文件格式

应用程序和`daprd`的日志分别捕获在不同的文件中。这些日志文件会自动创建在每个应用程序目录（模板中的`appDirPath`）下的`.dapr/logs`目录中。这些日志文件名遵循以下模式：

- `<appID>_app_<timestamp>.log`（`app`日志的文件名格式）
- `<appID>_daprd_<timestamp>.log`（`daprd`日志的文件名格式）

即使您决定将资源文件夹重命名为其他名称，日志文件也只会写入应用程序目录中创建的`.dapr/logs`文件夹。

## 观看演示

观看[此视频以了解Kubernetes中的多应用运行概述](https://youtu.be/nWatANwaAik?si=O8XR-TUaiY0gclgO&t=1024)：

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/nWatANwaAik?si=O8XR-TUaiY0gclgO&amp;start=1024" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

{{% /codetab %}}

{{< /tabs >}}

## 下一步

- [了解多应用运行模板文件结构及其属性]({{< ref multi-app-template.md >}})
- [尝试使用服务调用快速入门的自托管多应用运行模板]({{< ref serviceinvocation-quickstart.md >}})
- [尝试使用`hello-kubernetes`教程的Kubernetes多应用运行模板](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-kubernetes)