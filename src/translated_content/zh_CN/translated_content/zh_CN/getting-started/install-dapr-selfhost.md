---
type: docs
title: "在本地环境中初始化 Dapr"
linkTitle: "本地初始化 Dapr"
weight: 20
description: "获取 Dapr sidecar 二进制文件并使用 `dapr init` 在本地安装它们"
aliases:
  - /zh-hans/getting-started/set-up-dapr/install-dapr/
---

Now that you've [installed the Dapr CLI]({{<ref install-dapr-cli.md>}}), use the CLI to initialize Dapr on your local machine.

Dapr 作为 sidecar 与您的应用程序一起运行。 在自托管模式下，这意味着它是本地计算机上的一个进程。 通过初始化 Dapr，您可以：

- Fetch and install the Dapr sidecar binaries locally.
- Create a development environment that streamlines application development with Dapr.

Dapr 初始化包括：

1. Running a **Redis container instance** to be used as a local state store and message broker.
1. Running a **Zipkin container instance** for observability.
1. Creating a **default components folder** with component definitions for the above.
1. Running a **Dapr placement service container instance** for local actor support.

{{% alert title="Docker" color="primary" %}}
推荐的开发环境需要 [Docker](https://docs.docker.com/install/)。 虽然你可以 [在不依赖Docker的情况下初始化Dapr]({{<ref self-hosted-no-docker.md>}})，但本指南接下来的步骤都是假设推荐的Docker开发环境。

You can also install [Podman](https://podman.io/) in place of Docker. Read more about [initializing Dapr using Podman]({{<ref dapr-init.md>}}).
{{% /alert %}}

### Step 1: Open an elevated terminal

{{< tabs "Linux/MacOS" "Windows">}}

{{% codetab %}}

You will need to use `sudo` for this quickstart if:

- You run your Docker commands with `sudo`, or
- 安装路径为 `/usr/local/bin` （默认安装路径）。

{{% /codetab %}}

{{% codetab %}}

Run Windows Terminal or command prompt as administrator.

1. Right click on the Windows Terminal or command prompt icon.
1. 选择 **以管理员身份运行**。

{{% /codetab %}}

{{< /tabs >}}

### 第 2 步：运行 init CLI 命令

Install the latest Dapr runtime binaries:

```bash
dapr init
```

### 第 3 步：验证 Dapr 版本

```bash
dapr --version
```

**Output:**

`CLI version: {{% dapr-latest-version cli="true" %}}` <br> `Runtime version: {{% dapr-latest-version long="true" %}}`

### 第 4 步：验证容器是否运行

As mentioned earlier, the `dapr init` command launches several containers that will help you get started with Dapr. Verify you have container instances with `daprio/dapr`, `openzipkin/zipkin`, and `redis` images running:

```bash
docker ps
```

**Output:**

<img src="/images/install-dapr-selfhost/docker-containers.png" width=800>

### 第 5 步：验证组件目录已初始化

On `dapr init`, the CLI also creates a default components folder that contains several YAML files with definitions for a state store, Pub/sub, and Zipkin. The Dapr sidecar will read these components and use:

- The Redis container for state management and messaging.
- 用于收集trace的 Zipkin 容器。

Verify by opening your components directory:

- On Windows, under `%UserProfile%\.dapr`
- 在Linux/MacOS上，在 `~/.dapr`

{{< tabs "Linux/MacOS" "Windows">}}

{{% codetab %}}

```bash
ls $HOME/.dapr
```

**Output:**

`bin  components  config.yaml`

<br>

{{% /codetab %}}

{{% codetab %}}

```powershell
explorer "%USERPROFILE%\.dapr\"
```

**Result:**

<img src="/images/install-dapr-selfhost/windows-view-components.png" width=600>

{{% /codetab %}}

{{< /tabs >}}

<br>

{{< button text="Next step: Use the Dapr API >>" page="getting-started/get-started-api.md" >}}

