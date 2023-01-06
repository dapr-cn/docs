---
type: docs
title: "init CLI 命令参考"
linkTitle: "init"
description: "有关 init CLI 命令的详细信息"
---

### 说明

在受支持的托管平台上安装 Dapr 。

### 支持的平台

- [自托管]({{< ref self-hosted >}})
- [Kubernetes]({{< ref kubernetes >}})

### 用法

```bash
dapr init [flags]
```

### 参数

| Name                  | 环境变量                          | 默认值           | 说明                                                                                                                      |
| --------------------- | ----------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `--dashboard-version` |                               | `latest`      | 要安装的 Dapr 仪表板的版本，例如： `1.0.0`                                                                                            |
| `--enable-ha`         |                               | `false`       | 启用高可用性 (HA) 方式                                                                                                          |
| `--enable-mtls`       |                               | `true`        | 在群集中启用 mTLS                                                                                                             |
| `--from-dir`          |                               |               | 包含下载的“Dapr Installer Bundle”发行版的本地目录的路径，该发行版用于 `init` airgap 环境                                                         |
| `--help`, `-h`        |                               |               | 显示此帮助消息                                                                                                                 |
| `--image-registry`    |                               |               | 从给定的映像注册表中拉取 Dapr 所需的容器映像                                                                                               |
| `--kubernetes`, `-k`  |                               | `false`       | 将 dapr 部署到 Kubernetes 集群                                                                                                |
| `--namespace`, `-n`   |                               | `dapr-system` | 用于安装 Dapr 的 Kubernetes 名称空间                                                                                             |
| `--network`           |                               |               | 要在其上安装和部署 Dapr 运行时的 Docker 网络                                                                                           |
| `--runtime-version`   |                               | `latest`      | 要安装的 Dapr 运行时的版本，例如: `1.0.0`                                                                                            |
| `--set`               |                               |               | 在命令行上配置选项，在安装时传递到 Dapr Helm 图表和 Kubernetes 集群。 可以在逗号分隔的列表中指定多个值，例如： `key1=val1，key2=val2`                               |
| `--slim`, `-s`        |                               | `false`       | 从 Self-Hosted 安装中排除 Placement 服务、Redis 和 Zipkin 容器                                                                      |
| `--timeout`           |                               | `300`         | Kubernetes安装等待超时                                                                                                        |
| `--wait`              |                               | `false`       | 等待Kubernetes初始化完成                                                                                                       |
| N/A                   | DAPR_DEFAULT_IMAGE_REGISTRY |               | 在自托管模式下，它用于指定要从中提取映像的默认容器注册表。 当它的值设置为 `GHCR` 或 `ghcr`时，它会从 Github 容器注册表中提取所需的映像。 若要默认为 Docker 中心作为默认值，只需取消设置此 env 变量即可。 |

### 示例

#### 自我托管环境

通过拉取Placement、Redis 和 Zipkin 的容器映像来安装 Dapr。 默认情况下，这些映像是从 Docker Hub提取的。 若要切换到 Dapr Github 容器注册表作为默认注册表，请将 `DAPR_DEFAULT_IMAGE_REGISTRY` 环境变量值设置为 `GHCR`。 若要切换回 Docker Hub作为默认注册表，请取消设置此环境变量。

```bash
dapr init
```

您也可以指定一个特定runtime版本。 默认使用最新版本。

```bash
dapr init --runtime-version 1.4.0
```

Dapr也可以在没有Docker环境的情况下运行 [Slim 自托管模式]({{< ref self-hosted-no-docker.md >}}) 。

```bash
dapr init -s
```

在离线或空隙环境中，您可以 [下载 dapr 安装程序包](https://github.com/dapr/installer-bundle/releases) ，并使用它来安装 Dapr，而不是从网络中提取映像。

```bash
dapr init --from-dir <path-to-installer-bundle-directory>
```

Dapr还可以在空隙环境中以超薄的自托管模式运行，而无需Docker。

```bash
dapr init -s --from-dir <path-to-installer-bundle-directory>
```

还可以从指定私有注册表去拉取容器映像。 这些映像需要发布到私有注册表，如下所示，以使 Dapr CLI 能够通过 `dapr init` 命令成功拉取它们 -

1. Dapr 运行时容器镜像（dapr） （通常运行Placement） - dapr/dapr：<version>
2. Redis 容器镜像（rejson） - dapr/3rdparty/rejson
3. Zipkin 容器镜像（zipkin） - dapr/3rdparty/zipkin

> 所有Dapr 使用的镜像都需要位于 `dapr` 路径下。

> 第三方镜像必须发布到 `dapr/3rdparty` 路径下。

> image-registy uri 遵循此格式 - `docker.io/<username>`

```bash
dapr init --image-registry docker.io/username
```

此命令解析完整的镜像 URI，如下所示 -
1. Placement容器镜像 （dapr） - docker.io/username/dapr/dapr：<version>
2. Redis 容器镜像（rejson） - docker.io/username/dapr/3rdparty/rejson
3. zipkin 容器镜像（zipkin） -docker.io/username/dapr/3rdparty/zipkin


#### Kubernetes 环境

```bash
dapr init -k
```

您可以使用 `--wait` 标志来等待安装完成。 默认超时是 300s (5分钟)，但可以使用 `--timeout` 标志自定义超时。

```bash
dapr init -k --wait --timeout 600
```

您也可以指定一个特定runtime版本。

```bash
dapr init -k --runtime-version 1.4.0
```

使用 `--set` 标志配置一组 [Helm Chart ](https://github.com/dapr/dapr/tree/master/charts/dapr#configuration)值，以帮助在dapr 安装期间设置 Kubernetes 集群。

```bash
dapr init -k --set global.tag=1.0.0 --set dapr_operator.logLevel=error
```