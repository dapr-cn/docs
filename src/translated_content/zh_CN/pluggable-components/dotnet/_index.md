---
type: docs
title: "开始使用 Dapr 可插拔组件 .NET SDK"
linkTitle: ".NET"
weight: 1000
description: 如何使用 Dapr 可插拔组件 .NET SDK 快速上手
no_list: true
is_preview: true
---

Dapr 提供了用于开发 .NET 可插拔组件的 NuGet 包。

## 前提条件

- [.NET 6 SDK](https://dotnet.microsoft.com/en-us/download/dotnet) 或更高版本
- [Dapr 1.9 CLI]({{< ref install-dapr-cli.md >}}) 或更高版本
- 已初始化的 [Dapr 环境]({{< ref install-dapr-selfhost.md >}})
- Linux、Mac 或 Windows（使用 WSL）

{{% alert title="注意" color="primary" %}}
在 Windows 上开发 Dapr 可插拔组件需要使用 WSL，因为某些开发平台不完全支持 "原生" Windows 上的 Unix 域套接字。
{{% /alert %}}

## 创建项目

要创建一个可插拔组件，首先从一个空的 ASP.NET 项目开始。

```bash
dotnet new web --name <project name>
```

## 添加 NuGet 包

添加 Dapr .NET 可插拔组件的 NuGet 包。

```bash
dotnet add package Dapr.PluggableComponents.AspNetCore
```

## 创建应用程序和服务

创建 Dapr 可插拔组件应用程序类似于创建 ASP.NET 应用程序。在 `Program.cs` 中，将 `WebApplication` 相关代码替换为 Dapr `DaprPluggableComponentsApplication` 的等效代码。

```csharp
using Dapr.PluggableComponents;

var app = DaprPluggableComponentsApplication.Create();

app.RegisterService(
    "<socket name>",
    serviceBuilder =>
    {
        // 使用此服务注册一个或多个组件。
    });

app.Run();
```

这将创建一个包含单个服务的应用程序。每个服务：

- 对应一个 Unix 域套接字
- 可以托管一个或多个组件类型

{{% alert title="注意" color="primary" %}}
每种类型的组件只能在单个服务中注册。然而，[同一类型的多个组件可以分布在多个服务中]({{< ref dotnet-multiple-services >}})。
{{% /alert %}}

## 实现和注册组件

- [实现一个输入/输出绑定组件]({{< ref dotnet-bindings >}})
- [实现一个 pub-sub 组件]({{< ref dotnet-pub-sub >}})
- [实现一个 state 存储组件]({{< ref dotnet-state-store >}})

## 本地测试组件

可插拔组件可以通过在命令行启动应用程序并配置一个 Dapr sidecar 来进行测试。

要启动组件，在应用程序目录中：

```bash
dotnet run
```

要配置 Dapr 使用该组件，在资源路径目录中：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <component name>
spec:
  type: state.<socket name>
  version: v1
  metadata:
  - name: key1
    value: value1
  - name: key2
    value: value2
```

任何 `metadata` 属性将在组件实例化时通过其 `IPluggableComponent.InitAsync()` 方法传递给组件。

要启动 Dapr（以及可选地使用该服务的服务）：

```bash
dapr run --app-id <app id> --resources-path <resources path> ...
```

此时，Dapr sidecar 将已启动并通过 Unix 域套接字连接到组件。然后您可以通过以下方式与组件交互：
- 通过使用该组件的服务（如果已启动），或
- 直接使用 Dapr HTTP 或 gRPC API

## 创建容器

有几种方法可以为您的组件创建容器以便最终部署。

### 使用 .NET SDK

[.NET 7 及更高版本的 SDK](https://dotnet.microsoft.com/en-us/download/dotnet) 允许您为应用程序创建基于 .NET 的容器 *无需* `Dockerfile`，即使是针对早期版本的 .NET SDK。这可能是目前为您的组件生成容器的最简单方法。

{{% alert title="注意" color="primary" %}}
目前，.NET 7 SDK 需要本地机器上的 Docker Desktop、一个特殊的 NuGet 包，以及本地机器上的 Docker Desktop 来构建容器。未来版本的 .NET SDK 计划消除这些要求。

可以在本地机器上同时安装多个版本的 .NET SDK。
{{% /alert %}}

将 `Microsoft.NET.Build.Containers` NuGet 包添加到组件项目中。

```bash
dotnet add package Microsoft.NET.Build.Containers
```

将应用程序发布为容器：

```bash
dotnet publish --os linux --arch x64 /t:PublishContainer -c Release
```

{{% alert title="注意" color="primary" %}}
确保架构参数 `--arch x64` 与组件的最终部署目标匹配。默认情况下，生成的容器的架构与本地机器的架构匹配。例如，如果本地机器是基于 ARM64 的（例如，M1 或 M2 Mac）并且省略了参数，则将生成一个 ARM64 容器，这可能与期望 AMD64 容器的部署目标不兼容。
{{% /alert %}}

有关更多配置选项，例如控制容器名称、标签和基础镜像，请参阅 [.NET 作为容器发布指南](https://learn.microsoft.com/en-us/dotnet/core/docker/publish-as-container)。

### 使用 Dockerfile

虽然有工具可以为 .NET 应用程序生成 `Dockerfile`，但 .NET SDK 本身并不提供。一个典型的 `Dockerfile` 可能如下所示：

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:<runtime> AS base
WORKDIR /app

# 创建一个具有显式 UID 的非 root 用户，并添加访问 /app 文件夹的权限
# 更多信息，请参阅 https://aka.ms/vscode-docker-dotnet-configure-containers
RUN adduser -u 5678 --disabled-password --gecos "" appuser && chown -R appuser /app
USER appuser

FROM mcr.microsoft.com/dotnet/sdk:<runtime> AS build
WORKDIR /src
COPY ["<application>.csproj", "<application folder>/"]
RUN dotnet restore "<application folder>/<application>.csproj"
COPY . .
WORKDIR "/src/<application folder>"
RUN dotnet build "<application>.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "<application>.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "<application>.dll"]
```

构建镜像：

```bash
docker build -f Dockerfile -t <image name>:<tag> .
```

{{% alert title="注意" color="primary" %}}
`Dockerfile` 中 `COPY` 操作的路径是相对于构建镜像时传递的 Docker 上下文的，而 Docker 上下文本身会根据所构建项目的需求而有所不同（例如，如果它有引用的项目）。在上面的示例中，假设 Docker 上下文是组件项目目录。
{{% /alert %}}
