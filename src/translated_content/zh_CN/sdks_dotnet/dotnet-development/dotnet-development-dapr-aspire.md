---
type: docs
title: "使用 .NET Aspire 进行 Dapr .NET SDK 开发"
linkTitle: ".NET Aspire"
weight: 40000
description: 了解如何使用 .NET Aspire 进行本地开发
---

# .NET Aspire

[.NET Aspire](https://learn.microsoft.com/en-us/dotnet/aspire/get-started/aspire-overview) 是一款开发工具，旨在通过提供一个框架，简化外部软件与 .NET 应用程序的集成过程。该框架允许第三方服务轻松地与您的软件集成、监控和配置。

Aspire 通过与流行的 IDE（包括 [Microsoft Visual Studio](https://visualstudio.microsoft.com/vs/)、[Visual Studio Code](https://code.visualstudio.com/)、[JetBrains Rider](https://blog.jetbrains.com/dotnet/2024/02/19/jetbrains-rider-and-the-net-aspire-plugin/) 等）深度集成，简化了本地开发。在启动调试器的同时，自动启动并配置对其他集成（包括 Dapr）的访问。

虽然 Aspire 也支持将应用程序部署到各种云平台（如 Microsoft Azure 和 Amazon AWS），但本指南不涉及部署相关内容。更多信息请参阅 Aspire 的文档 [这里](https://learn.microsoft.com/en-us/dotnet/aspire/deployment/overview)。

## 先决条件
- Dapr .NET SDK 兼容 [.NET 6](https://dotnet.microsoft.com/download/dotnet/6.0)、[.NET 8](https://dotnet.microsoft.com/download/dotnet/8.0) 和 [.NET 9](https://dotnet.microsoft.com/download/dotnet/9.0)，但 .NET Aspire 仅支持 [.NET 8](https://dotnet.microsoft.com/download/dotnet/8.0) 和 [.NET 9](https://dotnet.microsoft.com/download/dotnet/9.0)。
- 一个符合 OCI 标准的容器运行时，例如 [Docker Desktop](https://www.docker.com/products/docker-desktop) 或 [Podman](https://podman.io/)
- 安装并初始化 Dapr v1.13 或更高版本

## 通过 CLI 使用 .NET Aspire

我们将从创建一个全新的 .NET 应用程序开始。打开您喜欢的 CLI 并导航到您希望创建新 .NET 解决方案的目录。首先使用以下命令安装一个模板，该模板将创建一个空的 Aspire 应用程序：

```sh
dotnet new install Aspire.ProjectTemplates
```

安装完成后，继续在当前目录中创建一个空的 .NET Aspire 应用程序。`-n` 参数允许您指定输出解决方案的名称。如果省略，.NET CLI 将使用输出目录的名称，例如 `C:\source\aspiredemo` 将导致解决方案被命名为 `aspiredemo`。本教程的其余部分将假设解决方案名为 `aspiredemo`。

```sh
dotnet new aspire -n aspiredemo
```

这将在您的目录中创建两个 Aspire 特定的目录和一个文件：
- `aspiredemo.AppHost/` 包含用于配置应用程序中使用的每个集成的 Aspire 编排项目。
- `aspiredemo.ServiceDefaults/` 包含一组扩展，旨在跨您的解决方案共享，以帮助提高 Aspire 提供的弹性、服务发现和遥测能力（这些与 Dapr 本身提供的功能不同）。
- `aspiredemo.sln` 是维护当前解决方案布局的文件

接下来，我们将创建一个项目，作为我们的 Dapr 应用程序。从同一目录中，使用以下命令创建一个名为 `MyApp` 的空 ASP.NET Core 项目。它将在 `MyApp\MyApp.csproj` 中相对于您的当前目录创建。

```sh
dotnet new web MyApp
```

接下来，我们将配置 AppHost 项目以添加支持本地 Dapr 开发所需的包。使用以下命令导航到 AppHost 目录，并从 NuGet 安装 `Aspire.Hosting.Dapr` 包到项目中。我们还将添加对 `MyApp` 项目的引用，以便在注册过程中引用它。

```sh
cd aspiredemo.AppHost
dotnet add package Aspire.Hosting.Dapr
dotnet add reference ../MyApp/
```

接下来，我们需要将 Dapr 配置为与您的项目一起加载的资源。在您喜欢的 IDE 中打开该项目中的 `Program.cs` 文件。它应类似于以下内容：

```csharp
var builder = DistributedApplication.CreateBuilder(args);

builder.Build().Run();
```

如果您熟悉 ASP.NET Core 项目中使用的依赖注入方法或其他使用 `Microsoft.Extensions.DependencyInjection` 功能的项目，您会发现这将是一个熟悉的体验。

因为我们已经添加了对 `MyApp` 的项目引用，我们需要在此配置中添加一个引用。在 `builder.Build().Run()` 行之前添加以下内容：

```csharp
var myApp = builder
    .AddProject<Projects.MyApp>("myapp")
    .WithDaprSidecar();
```

因为项目引用已添加到此解决方案中，您的项目在此处显示为 `Projects.` 命名空间中的一个类型。您为项目分配的变量名称在本教程中并不重要，但如果您想在此项目和另一个项目之间创建引用以使用 Aspire 的服务发现功能，则会使用它。

添加 `.WithDaprSidecar()` 将 Dapr 配置为 .NET Aspire 资源，以便在项目运行时，sidecar 将与您的应用程序一起部署。这接受许多不同的选项，并可以选择性地配置，如以下示例所示：

```csharp
DaprSidecarOptions sidecarOptions = new()
{
    AppId = "my-other-app",
    AppPort = 8080, //注意，如果您打算配置 pubsub、actor 或 workflow，从 Aspire v9.0 开始，此参数是必需的
    DaprGrpcPort = 50001,
    DaprHttpPort = 3500,
    MetricsPort = 9090
};

builder
    .AddProject<Projects.MyOtherApp>("myotherapp")
    .WithReference(myApp)
    .WithDaprSidecar(sidecarOptions);
```

{{% alert color="primary" %}}

如上例所示，从 .NET Aspire 9.0 开始，如果您打算使用 Dapr 需要调用到您的应用程序的任何功能，例如 pubsub、actor 或 workflow，您将需要指定您的 AppPort 作为配置选项，因为 Aspire 不会在运行时自动将其传递给 Dapr。预计这种行为将在未来的版本中更改，因为修复已合并并可以在 [这里](https://github.com/dotnet/aspire/pull/6362) 跟踪。

{{% /alert %}}

当您在 IDE 中打开解决方案时，确保 `aspiredemo.AppHost` 被配置为您的启动项目，但当您在调试配置中启动它时，您会注意到您的集成控制台应反映您预期的 Dapr 日志，并且它将可用于您的应用程序。
