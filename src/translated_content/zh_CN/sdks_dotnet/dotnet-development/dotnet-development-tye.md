---
type: docs
title: "使用 Project Tye 进行 Dapr .NET SDK 开发"
linkTitle: "Project Tye"
weight: 50000
description: 了解如何使用 Project Tye 进行本地开发
---

## Project Tye

[.NET Project Tye](https://github.com/dotnet/tye/) 是一个专为简化运行多个 .NET 服务而设计的微服务开发工具。Tye 允许您将多个 .NET 服务、进程和容器镜像的配置整合为一个可运行的应用程序。

对于 .NET Dapr 开发者来说，Tye 的优势在于：

- Tye 可以自动化使用 dapr CLI
- Tye 遵循 .NET 的约定，对 .NET 服务几乎无需额外配置
- Tye 能够管理容器中依赖项的生命周期

优缺点：
- **优点：** Tye 可以自动化上述所有步骤。您无需再担心端口或应用程序 ID 等细节。
- **优点：** 由于 Tye 也可以管理容器，您可以将这些容器作为应用程序的一部分定义，并避免机器上长时间运行的容器。

### 使用 Tye

按照 [Tye 入门指南](https://github.com/dotnet/tye/blob/master/docs/getting_started.md) 安装 `tye` CLI，并为您的应用程序创建 `tye.yaml` 文件。

接下来，按照 [Tye Dapr 配方](https://github.com/dotnet/tye/blob/master/docs/recipes/dapr.md) 中的步骤添加 Dapr。确保在 `tye.yaml` 中使用 `components-path` 指定组件文件夹的相对路径。

然后，添加任何额外的容器依赖项，并将组件定义添加到您之前创建的文件夹中。

您应该得到如下内容：

```yaml
name: store-application
extensions:

  # Dapr 的配置在这里。
- name: dapr
  components-path: <components-path> 

# 要运行的服务在这里。
services:
  
  # 名称将用作应用程序 ID。对于 .NET 项目，Tye 只需要项目文件的路径。
- name: orders
  project: orders/orders.csproj
- name: products
  project: products/products.csproj
- name: store
  project: store/store.csproj

  # 您想要运行的容器需要一个镜像名称和一组要暴露的端口。
- name: redis
  image: redis
  bindings:
    - port: 6973
```

将 `tye.yaml` 和应用程序代码一起提交到源代码管理中。

您现在可以使用 `tye run` 从一个终端启动整个应用程序。运行时，Tye 在 `http://localhost:8000` 提供一个仪表板以查看应用程序状态和日志。

### 下一步

Tye 会将您的服务作为标准 .NET 进程在本地运行。如果您需要调试，可以使用调试器附加到正在运行的进程之一。由于 Tye 了解 .NET，它可以在启动时暂停进程以便进行调试。

如果您希望在容器中进行本地测试，Tye 还提供了一个选项，可以在容器中运行您的服务。