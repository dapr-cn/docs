---
type: docs
title: "在本地环境中初始化 Dapr"
linkTitle: "本地初始化 Dapr"
weight: 20
description: "Fetch the Dapr sidecar binaries and install them locally using `dapr init`"
aliases:
  - /zh-hans/getting-started/set-up-dapr/install-dapr/
---

Now that you've [installed the Dapr CLI]({{<ref install-dapr-cli.md>}}), use the CLI to initialize Dapr on your local machine.

Dapr runs as a sidecar alongside your application. In self-hosted mode, this means it is a process on your local machine. By initializing Dapr, you:

- Fetch and install the Dapr sidecar binaries locally.
- Create a development environment that streamlines application development with Dapr.

Dapr initialization includes:

1. 运行一个用于状态存储和消息代理的** Redis 容器实例**.
1. 运行一个用于提供可观察性的** Zipkin 容器实例**.
1. 创建具有上述组件定义的**默认组件文件夹**.
1. 运行用于本地 actor 支持的** Dapr placement 服务容器实例**.

{{% alert title="Docker" color="primary" %}}
The recommended development environment requires [Docker](https://docs.docker.com/install/). While you can [initialize Dapr without a dependency on Docker]({{<ref self-hosted-no-docker.md>}})), the next steps in this guide assume the recommended Docker development environment.
{{% /alert %}}

### 第 1 步：打开架起终端

{{< tabs "Linux/MacOS" "Windows">}}

{{% codetab %}}

You will need to use `sudo` for this quickstart if:

- You run your Docker commands with `sudo`, or
- The install path is `/usr/local/bin` (default install path).

{{% /codetab %}}

{{% codetab %}}

Run Windows Terminal or command prompt as administrator.

1. Right click on the Windows Terminal or command prompt icon.
1. Select **Run as administrator**.

{{% /codetab %}}

{{< /tabs >}}

### 第 2 步：运行init CLI 命令

安装最新的 Dapr 运行时二进制程序:

```bash
dapr init
```

### 第 3 步：验证Dapr 版本

```bash
dapr --version
```

**输出:**

`CLI version: {{% dapr-latest-version cli="true" %}}` <br> `Runtime version: {{% dapr-latest-version long="true" %}}`

### 第 4 步：验证容器正在运行

As mentioned earlier, the `dapr init` command launches several containers that will help you get started with Dapr. Verify you have container instances with `daprio/dapr`, `openzipkin/zipkin`, and `redis` images running:

```bash
docker ps
```

**输出:**

<img src="/images/install-dapr-selfhost/docker-containers.png" width=800>

### 第 5 步：验证组件目录已初始化

On `dapr init`, the CLI also creates a default components folder that contains several YAML files with definitions for a state store, Pub/sub, and Zipkin. The Dapr sidecar will read these components and use:

- The Redis container for state management and messaging.
- The Zipkin container for collecting traces.

Verify by opening your components directory:

- On Windows, under `%UserProfile%\.dapr`
- On Linux/MacOS, under `~/.dapr`

{{< tabs "Linux/MacOS" "Windows">}}

{{% codetab %}}

```bash
ls $HOME/.dapr
```

**输出:**

`bin  components  config.yaml`

<br>

{{% /codetab %}}

{{% codetab %}}

```powershell
explorer "%USERPROFILE%\.dapr\"
```

**结果:**

<img src="/images/install-dapr-selfhost/windows-view-components.png" width=600>

{{% /codetab %}}

{{< /tabs >}}

<br>

{{< button text="Next step: Use the Dapr API >>" page="getting-started/get-started-api.md" >}}

