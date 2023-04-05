---
type: docs
title: "init CLI 命令参考文档"
linkTitle: "init"
description: "有关 init CLI 命令的详细信息"
---

### 说明

Install Dapr on supported hosting platforms.

### Supported platforms

- [自托管]({{< ref self-hosted >}})
- [Kubernetes]({{< ref kubernetes >}})

### Usage

```bash
dapr init [flags]
```

### Flags

| 名称                    | 环境变量                          | 默认值                                 | 说明                                                                                                                                                                                                                                                          |
| --------------------- | ----------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--dashboard-version` |                               | `latest`                            | 要安装的 Dapr 仪表板的版本，例如： `1.0.0`                                                                                                                                                                                                                                |
| `--enable-ha`         |                               | `false`                             | Enable high availability (HA) mode                                                                                                                                                                                                                          |
| `--enable-mtls`       |                               | `true`                              | Enable mTLS in your cluster                                                                                                                                                                                                                                 |
| `--from-dir`          |                               |                                     | 包含下载的“Dapr Installer Bundle”发行版的本地目录的路径，该发行版用于 `init` airgap 环境                                                                                                                                                                                             |
| `--help`, `-h`        |                               |                                     | 显示此帮助消息                                                                                                                                                                                                                                                     |
| `--image-registry`    |                               |                                     | 从给定的映像注册表中拉取 Dapr 所需的容器映像                                                                                                                                                                                                                                   |
| `--kubernetes`, `-k`  |                               | `false`                             | Deploy Dapr to a Kubernetes cluster                                                                                                                                                                                                                         |
| `--namespace`, `-n`   |                               | `dapr-system`                       | The Kubernetes namespace to install Dapr in                                                                                                                                                                                                                 |
| `--network`           |                               |                                     | 要在其上安装和部署 Dapr 运行时的 Docker 网络                                                                                                                                                                                                                               |
| `--runtime-version`   |                               | `latest`                            | The version of the Dapr runtime to install, for example: `1.0.0`                                                                                                                                                                                            |
| `--image-variant`     |                               |                                     | The image variant to use for the Dapr runtime, for example: `mariner`                                                                                                                                                                                       |
| `--set`               |                               |                                     | Configure options on the command line to be passed to the Dapr Helm chart and the Kubernetes cluster upon install. Can specify multiple values in a comma-separated list, for example: `key1=val1,key2=val2`                                                |
| `--slim`, `-s`        |                               | `false`                             | Exclude placement service, Redis and Zipkin containers from self-hosted installation                                                                                                                                                                        |
| `--timeout`           |                               | `300`                               | The wait timeout for the Kubernetes installation                                                                                                                                                                                                            |
| `--wait`              |                               | `false`                             | Wait for Kubernetes initialization to complete                                                                                                                                                                                                              |
| N/A                   | DAPR_DEFAULT_IMAGE_REGISTRY |                                     | It is used to specify the default container registry to pull images from. When its value is set to `GHCR` or `ghcr` it pulls the required images from Github container registry. To default to Docker hub, unset the environment variable or leave it blank |
| N/A                   | DAPR_HELM_REPO_URL          |                                     | Specifies a private Dapr Helm chart url                                                                                                                                                                                                                     |
| N/A                   | DAPR_HELM_REPO_USERNAME     | A username for a private Helm chart | The username required to access the private Dapr Helm chart. If it can be accessed publicly, this env variable does not need to be set                                                                                                                      |
| N/A                   | DAPR_HELM_REPO_PASSWORD     | A password for a private Helm chart | The password required to access the private Dapr Helm chart. If it can be accessed publicly, this env variable does not need to be set|                                                                                                                     |
| `--container-runtime` |                               | `docker`                            | Used to pass in a different container runtime other than Docker. Supported container runtimes are: `docker`, `podman`                                                                                                                                       |
### Examples

#### 自我托管环境

通过拉取Placement、Redis 和 Zipkin 的容器映像来安装 Dapr。 默认情况下，这些映像是从 Docker Hub提取的。 若要切换到 Dapr Github 容器注册表作为默认注册表，请将 `DAPR_DEFAULT_IMAGE_REGISTRY` 环境变量值设置为 `GHCR`。 若要切换回 Docker Hub作为默认注册表，请取消设置此环境变量。

```bash
dapr init
```

You can also specify a specific runtime version. Be default, the latest version is used.

```bash
dapr init --runtime-version 1.4.0
```

You can also install Dapr with a particular image variant, for example: [mariner]({{< ref "kubernetes-deploy.md#using-mariner-based-images" >}}).

```bash
dapr init --image-variant mariner
```

Dapr can also run [Slim self-hosted mode]({{< ref self-hosted-no-docker.md >}}) without Docker.

```bash
dapr init -s
```

In an offline or airgap environment, you can [download a Dapr Installer Bundle](https://github.com/dapr/installer-bundle/releases) and use this to install Dapr instead of pulling images from the network.

```bash
dapr init --from-dir <path-to-installer-bundle-directory>
```

Dapr can also run in slim self-hosted mode without Docker in an airgap environment.

```bash
dapr init -s --from-dir <path-to-installer-bundle-directory>
```

You can also specify a private registry to pull container images from. These images need to be published to private registries as shown below to enable Dapr CLI to pull them successfully via the `dapr init` command -

1. Dapr 运行时容器镜像（dapr） （通常运行Placement） - dapr/dapr：<version>
2. Redis 容器镜像（rejson） - dapr/3rdparty/rejson
3. Zipkin 容器镜像（zipkin） - dapr/3rdparty/zipkin

> 所有Dapr 使用的镜像都需要位于 `dapr` 路径下。

> 第三方镜像必须发布到 `dapr/3rdparty` 路径下。

> image-registry uri follows this format - `docker.io/<username>`

```bash
dapr init --image-registry docker.io/username
```

This command resolves the complete image URI as shown below -
1. Placement容器镜像 （dapr） - docker.io/username/dapr/dapr：<version>
2. Redis 容器镜像（rejson） - docker.io/username/dapr/3rdparty/rejson
3. zipkin 容器镜像（zipkin） -docker.io/username/dapr/3rdparty/zipkin

You can specify a different container runtime while setting up Dapr. If you omit the `--container-runtime` flag, the default container runtime is Docker.

```bash
dapr init --container-runtime podman
```

#### Kubernetes 环境

```bash
dapr init -k
```

You can wait for the installation to complete its deployment with the `--wait` flag. The default timeout is 300s (5 min), but can be customized with the `--timeout` flag.

```bash
dapr init -k --wait --timeout 600
```

You can also specify a specific runtime version.

```bash
dapr init -k --runtime-version 1.4.0
```

Use the `--set` flag to configure a set of [Helm Chart values](https://github.com/dapr/dapr/tree/master/charts/dapr#configuration) during Dapr installation to help set up a Kubernetes cluster.

```bash
dapr init -k --set global.tag=1.0.0 --set dapr_operator.logLevel=error
```

You can also specify a private registry to pull container images from. As of now `dapr init -k` does not use specific images for sentry, operator, placement and sidecar. It relies on only Dapr runtime container image `dapr` for all these images.

Scenario 1 : dapr image hosted directly under root folder in private registry -
```bash
dapr init -k --image-registry docker.io/username
```
Scenario 2 : dapr image hosted under a new/different directory in private registry -
```bash
dapr init -k --image-registry docker.io/username/<directory-name>
```
