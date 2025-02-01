---
type: docs
title: "init CLI 命令参考"
linkTitle: "init"
description: "关于 init CLI 命令的详细信息"
---

### 描述

在支持的平台上安装 Dapr。

### 支持的平台

- [本地托管]({{< ref self-hosted >}})
- [Kubernetes]({{< ref kubernetes >}})

### 用法

```bash
dapr init [flags]
```

### 标志

| 名称                  | 环境变量 | 默认值       | 描述                                                                          |
| --------------------- | -------------------- | ------------- | ------------------------------------------------------------------------------------ |
| `--dashboard-version` |                      | `latest`       | 要安装的 Dapr 仪表板版本，例如：`1.0.0`                                                   |
| `--enable-ha`         |                      | `false`       | 启用高可用性 (HA) 模式                                                   |
| `--enable-mtls`       |                      | `true`        | 在集群中启用 mTLS                                                          |
| `--from-dir`          |                      |               | 本地目录的路径，包含下载的 "Dapr 安装程序包" 版本，用于在隔离环境中 `init`      |
| `--help`, `-h`        |                      |               | 打印此帮助信息                                                              |
| `--image-registry`    |                      |               | 从指定的镜像注册表中拉取 Dapr 所需的容器镜像                    |
| `--kubernetes`, `-k`  |                      | `false`       | 将 Dapr 部署到 Kubernetes 集群                                                  |
| `--namespace`, `-n`   |                      | `dapr-system` | 要在其中安装 Dapr 的 Kubernetes 命名空间                                          |
| `--network`           |                      |               | 要安装和部署 Dapr 运行时的 Docker 网络                                          |
| `--runtime-version`   |                      | `latest`      | 要安装的 Dapr 运行时版本，例如：`1.0.0`                     |
| `--image-variant`   |                      |                 | 要用于 Dapr 运行时的镜像变体，例如：`mariner`               |
| `--set`               |                      |               | 在命令行上配置选项以传递给 Dapr Helm 图表和 Kubernetes 集群进行安装。可以在逗号分隔的列表中指定多个值，例如：`key1=val1,key2=val2`                     |
| `--slim`, `-s`        |                      | `false`       | 从本地托管安装中排除放置服务、调度服务以及 Redis 和 Zipkin 容器 |
| `--timeout`           |                      | `300`         | Kubernetes 安装的等待超时时间                                     |
| `--wait`              |                      | `false`       | 等待 Kubernetes 初始化完成                                       |
|        N/A            |DAPR_DEFAULT_IMAGE_REGISTRY|          | 用于指定默认的容器注册表以从中拉取镜像。当其值设置为 `GHCR` 或 `ghcr` 时，它从 Github 容器注册表中拉取所需的镜像。要默认使用 Docker hub，请取消设置环境变量或将其留空|
|        N/A            |DAPR_HELM_REPO_URL|          | 指定私有 Dapr Helm 图表的 URL|
|        N/A            | DAPR_HELM_REPO_USERNAME | 私有 Helm 图表的用户名 | 访问私有 Dapr Helm 图表所需的用户名。如果可以公开访问，则无需设置此环境变量|
|        N/A            | DAPR_HELM_REPO_PASSWORD | 私有 Helm 图表的密码  |访问私有 Dapr Helm 图表所需的密码。如果可以公开访问，则无需设置此环境变量| |
|  `--container-runtime`  |              |    `docker`      | 用于传递除 Docker 之外的其他容器运行时。支持的容器运行时有：`docker`、`podman` |
|  `--dev`  |              |          | 在 Kubernetes 中运行时创建 Redis 和 Zipkin 部署。 |
|  `--scheduler-volume`  |              |          | 仅限本地托管。可选地，您可以为调度服务数据目录指定一个卷。默认情况下，如果没有此标志，调度数据不会持久化且不具备重启恢复能力。 |


### 示例

{{< tabs "本地托管" "Kubernetes" >}}

{{% codetab %}}

**安装**

通过拉取放置、调度、Redis 和 Zipkin 的容器镜像来安装 Dapr。默认情况下，这些镜像从 Docker Hub 拉取。

> 默认情况下，为调度服务创建一个 `dapr_scheduler` 本地卷，用作数据库目录。此卷的主机文件位置可能位于 `/var/lib/docker/volumes/dapr_scheduler/_data` 或 `~/.local/share/containers/storage/volumes/dapr_scheduler/_data`，具体取决于您的容器运行时。

```bash
dapr init
```

Dapr 也可以在没有 Docker 的情况下运行[精简本地托管模式]({{< ref self-hosted-no-docker.md >}})。

```bash
dapr init -s
```

> 要切换到 Dapr Github 容器注册表作为默认注册表，请将 `DAPR_DEFAULT_IMAGE_REGISTRY` 环境变量值设置为 `GHCR`。要切换回 Docker Hub 作为默认注册表，请取消设置此环境变量。 

**指定运行时版本**

您还可以指定特定的运行时版本。默认情况下，使用最新版本。

```bash
dapr init --runtime-version 1.13.4
```

**安装带有镜像变体**

您还可以安装带有特定镜像变体的 Dapr，例如：[mariner]({{< ref "kubernetes-deploy.md#using-mariner-based-images" >}})。

```bash
dapr init --image-variant mariner
```

**使用 Dapr 安装程序包**

在离线或隔离环境中，您可以[下载 Dapr 安装程序包](https://github.com/dapr/installer-bundle/releases)并使用它来安装 Dapr，而不是从网络拉取镜像。

```bash
dapr init --from-dir <path-to-installer-bundle-directory>
```

Dapr 也可以在没有 Docker 的隔离环境中以精简本地托管模式运行。

```bash
dapr init -s --from-dir <path-to-installer-bundle-directory>
```

**指定私有注册表**

您还可以指定一个私有注册表以从中拉取容器镜像。需要将这些镜像发布到私有注册表中，如下所示，以便 Dapr CLI 能够通过 `dapr init` 命令成功拉取它们：

1. Dapr 运行时容器镜像(dapr) (用于运行放置) - dapr/dapr:<version>
2. Redis 容器镜像(rejson)   - dapr/3rdparty/rejson
3. Zipkin 容器镜像(zipkin)  - dapr/3rdparty/zipkin

Dapr 使用的所有必需镜像都需要位于 `dapr` 路径下。第三方镜像必须发布在 `dapr/3rdparty` 路径下。

`image-registry` URI 遵循 `docker.io/<username>` 格式。

```bash
dapr init --image-registry docker.io/username
```

此命令解析完整的镜像 URI，如下所示 -
1. 放置容器镜像(dapr) - docker.io/username/dapr/dapr:<version>
2. Redis 容器镜像(rejson)   - docker.io/username/dapr/3rdparty/rejson
3. zipkin 容器镜像(zipkin)  - docker.io/username/dapr/3rdparty/zipkin

在设置 Dapr 时，您可以指定不同的容器运行时。如果省略 `--container-runtime` 标志，默认的容器运行时是 Docker。

```bash
dapr init --container-runtime podman
```

**使用 Docker 网络**

您可以将本地容器部署到 Docker 网络中，这对于部署到单独的网络或使用 Docker Compose 进行本地开发以部署应用程序非常有用。

创建 Docker 网络。

```bash
docker network create mynet
```

初始化 Dapr 并指定创建的 Docker 网络。

```bash
dapr init --network mynet
```

验证所有容器是否在指定网络中运行。

```bash
docker ps 
```

从该 Docker 网络中卸载 Dapr。

```bash
dapr uninstall --all --network mynet
```

{{% /codetab %}}

{{% codetab %}}

```bash
dapr init -k
```

使用 `--dev` 标志以开发模式初始化 Dapr，其中包括 Zipkin 和 Redis。
```bash
dapr init -k --dev
```

您可以使用 `--wait` 标志等待安装完成其部署。
默认超时时间为 300 秒（5 分钟），但可以使用 `--timeout` 标志自定义。

```bash
dapr init -k --wait --timeout 600
```

您还可以指定特定的运行时版本。

```bash
dapr init -k --runtime-version 1.4.0
```

使用 `--set` 标志在 Dapr 安装期间配置一组 [Helm 图表值](https://github.com/dapr/dapr/tree/master/charts/dapr#configuration) 以帮助设置 Kubernetes 集群。

```bash
dapr init -k --set global.tag=1.0.0 --set dapr_operator.logLevel=error
```

您还可以指定一个私有注册表以从中拉取容器镜像。目前 `dapr init -k` 不使用 sentry、operator、placement、scheduler 和 sidecar 的特定镜像。它仅依赖于 Dapr 运行时容器镜像 `dapr` 来处理所有这些镜像。

场景 1：dapr 镜像直接托管在私有注册表的根文件夹下 - 
```bash
dapr init -k --image-registry docker.io/username
```
场景 2：dapr 镜像托管在私有注册表的新/不同目录下 - 
```bash
dapr init -k --image-registry docker.io/username/<directory-name>
```

{{% /codetab %}}

{{< /tabs >}}