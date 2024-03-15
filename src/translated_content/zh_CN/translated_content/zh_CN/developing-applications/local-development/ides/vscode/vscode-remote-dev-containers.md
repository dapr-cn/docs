---
type: docs
title: 使用 Dev Containers 开发 Dapr 应用程序
linkTitle: Dev Containers
weight: 30000
description: 如何使用 Dapr 设置一个带有容器化开发环境
---

Visual Studio Code [Dev Containers extension](https://code.visualstudio.com/docs/remote/containers) 可让您使用一个自包含的 Docker 容器作为完整的开发环境，而无需在本地文件系统中安装任何其他软件包、库或工具。

Dapr 已经为 C# 和 JavaScript/TypeScript 构建了预置的容器；您可以选择其中一个，以获得一个现成的环境。 注意这些预制容器自动更新到最新的 Dapr 版本。

我们还发布了一个开发容器功能，可以在任何开发容器中安装 Dapr CLI。

## 设置开发环境

### 前期准备

- [Docker Desktop](https://docs.docker.com/desktop/)
- [Visual Studio Code](https://code.visualstudio.com/)
- [VS Code远程开发扩展包](https://aka.ms/vscode-remote/download/extension)

### 使用 Dev Container 功能添加 Dapr CLI

您可以使用[Dev Container功能](https://containers.dev/features)在任何Dev容器中安装Dapr CLI。

要做到这一点，编辑您的devcontainer.json文件，并在"features"部分中添加两个对象：

```json
"features": {
    // Install the Dapr CLI
    "ghcr.io/dapr/cli/dapr-cli:0": {},
    // Enable Docker (via Docker-in-Docker)
    "ghcr.io/devcontainers/features/docker-in-docker:2": {},
    // Alternatively, use Docker-outside-of-Docker (uses Docker in the host)
    //"ghcr.io/devcontainers/features/docker-outside-of-docker:1": {},
}
```

保存 JSON 文件并（重新）构建托管开发环境的容器后，您将拥有可用的 Dapr CLI（和 Docker），并且可以通过在容器中运行以下命令来安装 Dapr：

```sh
dapr init
```

#### 示例：为 Dapr 创建 Java 开发容器

这是一个示例，用于创建一个基于[官方 Java 17 Dev Container 镜像](https://github.com/devcontainers/images/tree/main/src/java)的使用Dapr的Java应用程序的开发容器。

将此内容放入您的项目中的文件.devcontainer/devcontainer.json中：

```json
// For format details, see https://aka.ms/devcontainer.json. For config options, see the
// README at: https://github.com/devcontainers/templates/tree/main/src/java
{
	"name": "Java",
	// Or use a Dockerfile or Docker Compose file. More info: https://containers.dev/guide/dockerfile
	"image": "mcr.microsoft.com/devcontainers/java:0-17",

	"features": {
		"ghcr.io/devcontainers/features/java:1": {
			"version": "none",
			"installMaven": "false",
			"installGradle": "false"
		},
        // Install the Dapr CLI
        "ghcr.io/dapr/cli/dapr-cli:0": {},
        // Enable Docker (via Docker-in-Docker)
        "ghcr.io/devcontainers/features/docker-in-docker:2": {},
        // Alternatively, use Docker-outside-of-Docker (uses Docker in the host)
        //"ghcr.io/devcontainers/features/docker-outside-of-docker:1": {},
	}

	// Use 'forwardPorts' to make a list of ports inside the container available locally.
	// "forwardPorts": [],

	// Use 'postCreateCommand' to run commands after the container is created.
	// "postCreateCommand": "java -version",

	// Configure tool-specific properties.
	// "customizations": {},

	// Uncomment to connect as root instead. More info: https://aka.ms/dev-containers-non-root.
	// "remoteUser": "root"
}
```

然后，使用VS Code命令面板（`CTRL + SHIFT + P`或Mac上的`CMD + SHIFT + P`），选择`Dev Containers: Rebuild and Reopen in Container`。

### 使用预构建的开发容器（C# 和 JavaScript/TypeScript）

1. 在 VS 代码中打开您的应用程序工作区（workspace）
2. 在命令命令面板 (`CTRL + SHIFT + P` 或者在 Mac 上是 `CMD + SHIFT + P`) 中输入并选择 `Dev Containers: Add Development Container Configuration Files...` <br /><img src="/images/vscode-remotecontainers-addcontainer.png" alt="添加远程容器的截图" width="700">
3. 输入 `dapr` 来过滤列表到可用的 Dapr 远程容器，并选择符合您应用程序的语言容器。 请注意，您可能需要选择“显示所有定义...” <br /><img src="/images/vscode-remotecontainers-daprcontainers.png" alt="添加 Dapr 容器的屏幕截图" width="700">
4. 按照提示在容器中重新打开您的工作区。 <br /><img src="/images/vscode-remotecontainers-reopen.png" alt="重新打开开发容器中的应用程序的截图" width="700">

#### 如何使用Dapr扩展来开发和运行Dapr应用程序

观看这个[视频](https://www.youtube.com/watch?v=D2dO4aGpHcg\&t=120)，了解如何在您的应用程序中使用Dapr Dev Containers。

<div class="embed-responsive embed-responsive-16by9">
<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/D2dO4aGpHcg?start=120" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>
