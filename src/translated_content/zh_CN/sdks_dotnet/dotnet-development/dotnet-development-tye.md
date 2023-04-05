---
type: docs
title: "Dapr .NET SDK 与 Tye 项目开发"
linkTitle: "Tye项目"
weight: 40000
description: 学习使用 Tye 项目本地开发
---

## Tye项目

[.NET Project Tye](https://github.com/dotnet/tye/) 是一种微服务开发工具，旨在使多个.NET 服务更容易运行。 Tye 使您能够将多个 .NET 服务、流程和容器镜像的配置存储为可运行的应用程序。

Tye 对 .NET Dapr 开发者有利，因为：

- Tye有能力将自动化的dapr CLI内置。
- Tye了解.NET的惯例，对.NET服务几乎不需要配置。
- Tye可以管理你在容器中的依赖关系的生命周期

优点/缺点:
- **优点：** Tye 可以实现上述所有步骤的自动化。 您不再需要思考像端口或应用ID这样的概念。
- **优点：**由于Tye也可以为你管理容器，你可以将这些作为应用程序定义的一部分，并停止你机器上长期运行的容器。

### 使用 Tye

按照[Tye入门](https://github.com/dotnet/tye/blob/master/docs/getting_started.md)来安装 `tye` CLI 并为您的应用程序创建`tye.yaml`。

接下来按照 [Tye Dapr配方](https://github.com/dotnet/tye/blob/master/docs/recipes/dapr.md) 中的步骤来添加Dapr。 请确保在 `tye.yaml` 中指定组件目录中包含 `components-path` 的相对路径。

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

  # 此名称将被用作 app-id. 对于.NET 项目，Tye 只需要项目文件的路径。
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

将 `tye.yaml` 和应用代码签入源代码控制

您现在可以使用 `tye run` 从一个终端启动整个应用程序。 运行时，Tye有一个仪表板在 `http://localhost:8000` 查看应用程序状态和日志。

### 下一步

Tye 将您的服务按正常 .NET 进程在本地运行。 如果您需要调试，请使用调试器的附加功能将其附加到正在运行的进程中。 由于 Tye 具有 .NE T意识，它有能力[启动一个暂停的进程](https://github.com/dotnet/tye/blob/master/docs/reference/commandline/tye-run.md#options)以进行启动调试。

如果您想要在容器中进行本地测试，Tye 也有 [选项](https://github.com/dotnet/tye/blob/master/docs/reference/commandline/tye-run.md#options) 来运行您的服务。
