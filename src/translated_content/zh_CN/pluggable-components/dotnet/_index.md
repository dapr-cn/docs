---
type: docs
title: "Dapr 可插拔组件 .NET SDK 入门"
linkTitle: ".NET"
weight: 1000
description: 如何启动并运行 Dapr 可插拔组件 .NET SDK
no_list: true
is_preview: true
---

Dapr 提供 NuGet 包来帮助开发 .NET 可插拔组件。

## 前期准备

- [.NET 6 SDK](https://dotnet.microsoft.com/zh-cn/download/dotnet)或更高版本
- [Dapr 1.9 CLI]({{< ref install-dapr-cli.md >}}) 或更高版本
- 初始化[Dapr环境]({{< ref install-dapr-selfhost.md >}})
- Linux、Mac 或 Windows（使用 WSL）

{{% alert title="Note" color="primary" %}}
在 Windows 上开发 Dapr 可插拔组件需要 WSL，因为某些开发平台在“本机”Windows 上并不完全支持 Unix 域套接字。
{{% /alert %}}

## 项目创建

创建一个可插拔组件始于一个空的ASP.NET项目。

```bash
dotnet new web --name <project name>
```

## 添加 NuGet 包

添加 Dapr .NET 可插拔组件 NuGet 包。

```bash
dotnet add package Dapr.PluggableComponents.AspNetCore
```

## 创建应用程序和服务

创建一个 Dapr 可插拔组件应用程序与创建一个 ASP.NET 应用程序类似。  在`Program.cs`中，用Dapr的`DaprPluggableComponentsApplication`等效代码替换`WebApplication`相关代码。

```csharp
using Dapr.PluggableComponents;

var app = DaprPluggableComponentsApplication.Create();

app.RegisterService(
    "<socket name>",
    serviceBuilder =>
    {
        // Register one or more components with this service.
    });

app.Run();
```

这将创建一个具有单个服务的应用程序。 每个服务：

- 对应于单个 Unix 域套接字
- 可以托管一个或多个组件类型

{{% alert title="Note" color="primary" %}}
每种类型的单个组件只能注册到单个服务。 然而 [同一类型的多个组件可以分布在多个服务中]({{< ref dotnet-multiple-services >}}).
{{% /alert %}}

## 实现和注册组件

 - [实现一个输入/输出绑定组件]({{< ref dotnet-bindings >}})
 - [实现一个发布-订阅组件]({{< ref dotnet-pub-sub >}})
 - [实现一个状态存储组件]({{< ref dotnet-state-store >}})

## 在本地测试组件

可插拔组件可以通过在命令行上启动应用程序并配置一个 Dapr sidecar 来进行测试。

要启动组件，在应用程序目录中执行以下操作：

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

任何`metadata`属性将在组件实例化时通过其`IPluggableComponent.InitAsync()`方法传递给组件。

要启动 Dapr（以及可选地使用该服务的服务）：

```bash
dapr run --app-id <app id> --resources-path <resources path> ...
```

此时，Dapr sidecar 将已经启动并通过 Unix Domain Socket 连接到组件。 然后你可以通过组件进行交互：
- 通过使用组件的服务（如果已启动），或者
- 通过直接使用 Dapr 的 HTTP 或 gRPC API

## 创建容器

有几种方法可以为您的组件创建一个容器，以备部署。

### 使用 .NET SDK

[.NET 7及更高版本的SDK](https://dotnet.microsoft.com/zh-cn/download/dotnet)使您能够为您的应用程序创建一个基于.NET的容器，即使是针对较早版本的.NET SDK，也无需`Dockerfile`。 这可能是今天为您的组件生成容器最简单的方法。

{{% alert title="Note" color="primary" %}}
目前，.NET 7 SDK 需要在本地机器上安装 Docker Desktop、一个特殊的 NuGet 包，并且需要在本地机器上安装 Docker Desktop 来构建容器。 未来版本的.NET SDK计划消除这些要求。

可以在本地机器上同时安装多个版本的.NET SDK。
{{% /alert %}}

将`Microsoft.NET.Build.Containers` NuGet包添加到组件项目中。

```bash
dotnet add package Microsoft.NET.Build.Containers
```

将应用程序发布为容器：

```bash
dotnet publish --os linux --arch x64 /t:PublishContainer -c Release
```

{{% alert title="Note" color="primary" %}}
确保架构参数 `--arch x64` 与组件的最终部署目标相匹配。 默认情况下，生成的容器的架构与本地机器相匹配。 例如，如果本地机器是基于ARM64架构的（例如，M1或M2 Mac），并且省略了参数，将生成一个ARM64容器，该容器可能与期望AMD64容器的部署目标不兼容。
{{% /alert %}}

要获取更多配置选项，例如控制容器名称、标签和基础镜像，请参阅[.NET 作为容器发布指南](https://learn.microsoft.com/zh-cn/dotnet/core/docker/publish-as-container)。

### 使用 Dockerfile

虽然有一些工具可以为.NET应用程序生成一个`Dockerfile`，但.NET SDK本身并不提供该功能。 一个典型的`Dockerfile`可能如下所示：

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:<runtime> AS base
WORKDIR /app

# Creates a non-root user with an explicit UID and adds permission to access the /app folder
# For more info, please refer to https://aka.ms/vscode-docker-dotnet-configure-containers
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

{{% alert title="Note" color="primary" %}}
`Dockerfile` 中的 `COPY` 操作的路径是相对于构建镜像时传递的 Docker 上下文的，而 Docker 上下文本身会根据正在构建的项目的需求而变化（例如，如果它引用了其他项目）。 在上面的示例中，假设 Docker 上下文是组件项目目录。
{{% /alert %}}
