---
type: docs
title: "在本地环境中初始化 Dapr"
linkTitle: "本地初始化 Dapr"
weight: 20
aliases:
  - /zh-hans/getting-started/install-dapr/
---

Now that you have the [Dapr CLI installed]({{<ref install-dapr-cli.md>}}), it's time to initialize Dapr on your local machine using the CLI.

Dapr 与您的应用程序一起作为sidecar运行，在自托管模式下，这意味着它是您本地机器上的一个进程。 因此，初始化 Dapr 包括获取 Dapr sidecar 二进制文件并将其安装到本地.

此外，默认初始化过程还创建了一个开发环境，帮助简化 Dapr 的应用开发。 这包括下列步骤：

1. 运行一个用于状态存储和消息代理的**Redis容器实例**
1. 运行一个用于提供可观察性的**Zipkin容器实例**
1. 创建具有上述组件定义的 **默认组件文件夹**
1. 运行用于本地演员支持的**Dapr placement服务容器实例**

{{% alert title="Docker" color="primary" %}}
这种推荐的开发环境需要 [Docker](https://docs.docker.com/install/)。 It is possible to initialize Dapr without a dependency on Docker (see [this guidance]({{<ref self-hosted-no-docker.md>}})) but next steps in this guide assume the recommended development environment.
{{% /alert %}}

### 第 1 步：打开架起终端

   {{< tabs "Linux/MacOS" "Windows">}}

   {{% codetab %}}
   如果您使用 sudo 运行您的 Docker 命令，或者安装路径是 `/usr/local/bin` (默认安装路径)， 您需要在下面使用 `sudo`。
   {{% /codetab %}}

   {{% codetab %}}
   确保以管理员方式运行命令提示符终端 (右键单击，以管理员方式运行 )
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

输出应该看起来像这样：
```
CLI version: 1.3.0
Runtime version: 1.3.1
```

### 第 4 步：验证容器正在运行

如上所述， `dapr init` 命令启动了几个容器，这将有助于你开始使用Dapr。 运行以下列操作来验证：

```bash
docker ps
```

请确保镜像为`daprio/dapr`, `openzipkin/zipkin`和 `redis` 的容器都在运行：

```
CONTAINER ID   IMAGE                    COMMAND                  CREATED         STATUS         PORTS                              NAMES
0dda6684dc2e   openzipkin/zipkin        "/busybox/sh run.sh"     2 minutes ago   Up 2 minutes   9410/tcp, 0.0.0.0:9411->9411/tcp   dapr_zipkin
9bf6ef339f50   redis                    "docker-entrypoint.s…"   2 minutes ago   Up 2 minutes   0.0.0.0:6379->6379/tcp             dapr_redis
8d993e514150   daprio/dapr              "./placement"            2 minutes ago   Up 2 minutes   0.0.0.0:6050->50005/tcp            dapr_placement
```

### 第 5 步：验证组件目录已初始化

在 `dapr init`时，CLI 还创建了一个默认组件文件夹，其中包括几个 YAML 文件，其中包含state store、elevated 和 zipkin。 Dapr sidecar, 将读取这些文件。 告诉它使用Redis容器进行状态管理和消息传递，以及Zipkin容器来收集跟踪。

- 在 Linux/MacOS 中 Dapr 使用默认组件和文件的路径是 `$HOME.dapr`。
- Windows 中，Dapr 初始化路径到 `%USERPROFILE%\.dapr\`


{{< tabs "Linux/MacOS" "Windows">}}

{{% codetab %}}
运行：
```bash
ls $HOME/.dapr
```

您应该看到：
```
bin  components  config.yaml
```
{{% /codetab %}}

{{% codetab %}}
使用命令提示符CMD(不是 PowerShell)，在文件管理器中打开 `%USERPROFILE%\.dapr\` ：

```powershell
explorer "%USERPROFILE%\.dapr\"
```

您将会看到Dapr 配置、 Dapr 二进制目录和 Dapr 的默认组件目录：

<img src="/images/install-dapr-selfhost-windows.png" width=500>
{{% /codetab %}}

{{< /tabs >}}

{{< button text="下一步: 定义一个组件 >>" page="get-started-api" >}}
