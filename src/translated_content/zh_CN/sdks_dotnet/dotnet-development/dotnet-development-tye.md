---
type: docs
title: Dapr .NET SDK 与 Tye 项目集成
linkTitle: Tye项目
weight: 40000
description: 学习如何使用 Tye 项目进行本地开发
---

## Tye项目

[.NET Tye 项目](https://github.com/dotnet/tye/) 是一种微服务开发工具，旨在使多个 .NET 服务的运行变得容易。 Tye 使您能够将多个 .NET 服务、流程和容器镜像的配置存储为可运行的应用程序。

Tye 对 .NET Dapr 开发者有利，因为：

- Tye 能够自动执行内置的 dapr CLI
- Tye 了解.NET的惯例，对 .NET 服务几乎不需要配置。
- Tye可以管理你在容器中的依赖关系的生命周期

优点/缺点:

- \*\*优点：\*\*Tye 可以实现上述所有步骤的自动化。 您不再需要思考像端口或应用 Id 这样的概念。
- \*\*优点：\*\*由于 Tye 也可以为您管理容器，因此您可以将其作为应用程序定义的一部分，并停止在您的机器上长时间运行的容器。

### 使用 Tye

按照[Tye入门指南](https://github.com/dotnet/tye/blob/master/docs/getting_started.md)安装`tye`命令行工具并为您的应用程序创建一个`tye.yaml`文件。

接下来按照[Tye Dapr recipe](https://github.com/dotnet/tye/blob/master/docs/recipes/dapr.md)中的步骤添加 Dapr。 请确保在 `tye.yaml` 中指定组件目录中包含 `components-path` 的相对路径。

接下来添加任何额外的容器依赖项，并将组件定义添加到你之前创建的文件夹中。

你最终应该得到这样的结果：

```yaml
name: store-application
extensions:

  # Configuration for dapr goes here.
- name: dapr
  components-path: <components-path> 

# Services to run go here.
services:
  
  # The name will be used as the app-id. For a .NET project, Tye only needs the path to the project file.
- name: orders
  project: orders/orders.csproj
- name: products
  project: products/products.csproj
- name: store
  project: store/store.csproj

  # Containers you want to run need an image name and set of ports to expose.
- name: redis
  image: redis
  bindings:
    - port: 6973
```

使用应用程序代码在源控制中签入 `tye.yaml` 。

您现在可以使用 `tye run` 从一个终端启动整个应用程序。 运行时，Tye有一个仪表板在`http://localhost:8000`查看应用程序状态和日志。

### 下一步

Tye 将您的服务按正常 .NET 进程在本地运行。 如果您需要调试，请使用调试器的附加功能将其附加到正在运行的进程中。 由于Tye具有.NET的意识，它具有[启动挂起的进程](https://github.com/dotnet/tye/blob/master/docs/reference/commandline/tye-run.md#options)以进行启动调试的能力。

如果您希望在本地进行容器测试，Tye还提供了一个[选项](https://github.com/dotnet/tye/blob/master/docs/reference/commandline/tye-run.md#options)来在容器中运行您的服务。
