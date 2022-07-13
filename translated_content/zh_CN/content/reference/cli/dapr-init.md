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

| Name                  | 环境变量                          | 默认值           | 说明                                                                                                                                                                                                                                                                       |
| --------------------- | ----------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `--dashboard-version` |                               | `latest`      | The version of the Dapr dashboard to install, for example: `1.0.0`                                                                                                                                                                                                       |
| `--enable-ha`         |                               | `false`       | 启用高可用性 (HA) 方式                                                                                                                                                                                                                                                           |
| `--enable-mtls`       |                               | `true`        | 在群集中启用 mTLS                                                                                                                                                                                                                                                              |
| `--from-dir`          |                               |               | Path to a local directory containing a downloaded "Dapr Installer Bundle" release which is used to `init` the airgap environment                                                                                                                                         |
| `--help`, `-h`        |                               |               | 显示此帮助消息                                                                                                                                                                                                                                                                  |
| `--image-registry`    |                               |               | Pulls container images required by Dapr from the given image registry                                                                                                                                                                                                    |
| `--kubernetes`, `-k`  |                               | `false`       | 将 dapr 部署到 Kubernetes 集群                                                                                                                                                                                                                                                 |
| `--namespace`, `-n`   |                               | `dapr-system` | 用于安装 Dapr 的 Kubernetes 名称空间                                                                                                                                                                                                                                              |
| `--network`           |                               |               | The Docker network on which to install and deploy the Dapr runtime                                                                                                                                                                                                       |
| `--runtime-version`   |                               | `latest`      | 要安装的 Dapr 运行时的版本，例如: `1.0.0`                                                                                                                                                                                                                                             |
| `--set`               |                               |               | Configure options on the command line to be passed to the Dapr Helm chart and the Kubernetes cluster upon install. Can specify multiple values in a comma-separated list, for example: `key1=val1,key2=val2`                                                             |
| `--slim`, `-s`        |                               | `false`       | 从 Self-Hosted 安装中排除 Placement 服务、Redis 和 Zipkin 容器                                                                                                                                                                                                                       |
| `--timeout`           |                               | `300`         | Kubernetes安装等待超时                                                                                                                                                                                                                                                         |
| `--wait`              |                               | `false`       | 等待Kubernetes初始化完成                                                                                                                                                                                                                                                        |
| N/A                   | DAPR_DEFAULT_IMAGE_REGISTRY |               | In self hosted mode, it is used to specify the default container registry to pull images from. When its value is set to `GHCR` or `ghcr` it pulls the required images from Github container registry. To default to Docker hub as default, just unset this env variable. |

### 示例

#### Self hosted environment

Install Dapr by pulling container images for Placement, Redis and Zipkin. By default these images are pulled from Docker Hub. To switch to Dapr Github container registry as the default registry, set the `DAPR_DEFAULT_IMAGE_REGISTRY` environment variable value to be `GHCR`. To switch back to Docker Hub as default registry, unset this environment variable.

```bash
dapr init
```

You can also specify a specific runtime version. Be default, the latest version is used.

```bash
dapr init --runtime-version 1.4.0
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

1. Dapr runtime container image(dapr) (Used to run Placement) - dapr/dapr:<version>
2. Redis container image(rejson)   - dapr/3rdparty/rejson
3. Zipkin container image(zipkin)  - dapr/3rdparty/zipkin

> All the required images used by Dapr needs to be under the`dapr` path.

> The 3rd party images have to be published under `dapr/3rdparty` path.

> image-registy uri follows this format - `docker.io/<username>`

```bash
dapr init --image-registry docker.io/username
```

This command resolves the complete image URI as shown below -
1. Placement container image(dapr) - docker.io/username/dapr/dapr:<version>
2. Redis container image(rejson)   - docker.io/username/dapr/3rdparty/rejson
3. zipkin container image(zipkin)  - docker.io/username/dapr/3rdparty/zipkin


#### Kubernetes environment

```bash
dapr init -k
```

您可以使用 `--wait` 标志来等待安装完成。 默认超时是 300s (5分钟)，但可以使用 `--timeout` 标志自定义超时。

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