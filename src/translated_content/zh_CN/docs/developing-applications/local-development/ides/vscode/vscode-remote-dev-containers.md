---
type: docs
title: "使用开发容器开发Dapr应用"
linkTitle: "开发容器"
weight: 30000
description:  "如何使用Dapr设置容器化的开发环境"
---

Visual Studio Code 的 [开发容器扩展](https://code.visualstudio.com/docs/remote/containers)允许您使用一个自包含的 Docker 容器作为完整的开发环境，而无需在本地文件系统中安装任何额外的软件包、库或工具。

Dapr 提供了预构建的 C# 和 JavaScript/TypeScript 开发容器，您可以选择其中一个来快速搭建开发环境。请注意，这些预构建的容器会自动更新到 Dapr 的最新版本。

我们还发布了一个开发容器功能，可以在任何开发容器中安装 Dapr CLI。

## 设置开发环境

### 先决条件

- [Docker Desktop](https://docs.docker.com/desktop/)
- [Visual Studio Code](https://code.visualstudio.com/)
- [VS Code 远程开发扩展包](https://aka.ms/vscode-remote/download/extension)

### 使用开发容器功能添加 Dapr CLI

您可以使用 [开发容器功能](https://containers.dev/features) 在任何开发容器中安装 Dapr CLI。

为此，请编辑您的 `devcontainer.json` 文件，并在 `"features"` 部分添加以下两个对象：

```json
"features": {
    // 安装 Dapr CLI
    "ghcr.io/dapr/cli/dapr-cli:0": {},
    // 启用 Docker（通过 Docker-in-Docker）
    "ghcr.io/devcontainers/features/docker-in-docker:2": {},
    // 或者，使用 Docker-outside-of-Docker（使用主机中的 Docker）
    //"ghcr.io/devcontainers/features/docker-outside-of-docker:1": {},
}
```

保存 JSON 文件并重新构建托管您开发环境的容器后，您将拥有 Dapr CLI（和 Docker），并可以通过在容器中运行以下命令来安装 Dapr：

```sh
dapr init
```

#### 示例：为 Dapr 创建 Java 开发容器

以下是一个用于开发 Dapr Java 应用的开发容器示例，基于 [官方 Java 17 开发容器镜像](https://github.com/devcontainers/images/tree/main/src/java)。

将其放置在项目中的 `.devcontainer/devcontainer.json` 文件中：

```json
// 有关格式详细信息，请参阅 https://aka.ms/devcontainer.json。有关配置选项，请参阅
// README：https://github.com/devcontainers/templates/tree/main/src/java
{
	"name": "Java",
	// 或者使用 Dockerfile 或 Docker Compose 文件。更多信息：https://containers.dev/guide/dockerfile
	"image": "mcr.microsoft.com/devcontainers/java:0-17",

	"features": {
		"ghcr.io/devcontainers/features/java:1": {
			"version": "none",
			"installMaven": "false",
			"installGradle": "false"
		},
        // 安装 Dapr CLI
        "ghcr.io/dapr/cli/dapr-cli:0": {},
        // 启用 Docker（通过 Docker-in-Docker）
        "ghcr.io/devcontainers/features/docker-in-docker:2": {},
        // 或者，使用 Docker-outside-of-Docker（使用主机中的 Docker）
        //"ghcr.io/devcontainers/features/docker-outside-of-docker:1": {},
	}

	// 使用 'forwardPorts' 在本地提供容器内的端口列表。
	// "forwardPorts": [],

	// 使用 'postCreateCommand' 在创建容器后运行命令。
	// "postCreateCommand": "java -version",

	// 配置工具特定的属性。
	// "customizations": {},

	// 取消注释以改为以 root 身份连接。更多信息：https://aka.ms/dev-containers-non-root。
	// "remoteUser": "root"
}
```

然后，使用 VS Code 命令面板（在 Windows 上为 `CTRL + SHIFT + P` 或在 Mac 上为 `CMD + SHIFT + P`），选择 `Dev Containers: Rebuild and Reopen in Container`。

### 使用预构建的开发容器（C# 和 JavaScript/TypeScript）

1. 在 VS Code 中打开您的应用工作区
2. 在命令面板中（在 Windows 上为 `CTRL + SHIFT + P` 或在 Mac 上为 `CMD + SHIFT + P`）输入并选择 `Dev Containers: Add Development Container Configuration Files...`
    <br /><img src="/images/vscode-remotecontainers-addcontainer.png" alt="添加远程容器的截图" width="700">
3. 输入 `dapr` 以过滤可用的 Dapr 远程容器列表，并选择与您的应用匹配的语言容器。请注意，您可能需要选择 `Show All Definitions...`
    <br /><img src="/images/vscode-remotecontainers-daprcontainers.png" alt="添加 Dapr 容器的截图" width="700">
4. 按照提示在容器中重新打开您的工作区。
    <br /><img src="/images/vscode-remotecontainers-reopen.png" alt="在开发容器中重新打开应用的截图" width="700">

#### 示例

观看此 [视频](https://www.youtube.com/watch?v=D2dO4aGpHcg&t=120) 了解如何在您的应用中使用 Dapr 开发容器。

<div class="embed-responsive embed-responsive-16by9">
<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/D2dO4aGpHcg?start=120" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>