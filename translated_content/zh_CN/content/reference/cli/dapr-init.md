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

| Name                 | 环境变量 | 默认值           | 说明                                                 |
| -------------------- | ---- | ------------- | -------------------------------------------------- |
| `--enable-ha`        |      | `false`       | 启用高可用性 (HA) 方式                                     |
| `--enable-mtls`      |      | `true`        | 在群集中启用 mTLS                                        |
| `--help`, `-h`       |      |               | 显示此帮助消息                                            |
| `--kubernetes`, `-k` |      | `false`       | 将 dapr 部署到 Kubernetes 集群                           |
| `--wait`             |      | `false`       | 等待Kubernetes初始化完成                                  |
| `--timeout`          |      | `300`         | Kubernetes安装等待超时                                   |
| `--namespace`, `-n`  |      | `dapr-system` | 用于安装 Dapr 的 Kubernetes 名称空间                        |
| `--runtime-version`  |      | `latest`      | 要安装的 Dapr 运行时的版本，例如: `1.0.0`                       |
| `--slim`, `-s`       |      | `false`       | 从 Self-Hosted 安装中排除 Placement 服务、Redis 和 Zipkin 容器 |

### 示例

#### 自我托管环境

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

#### Kubernetes 环境

```bash
dapr init -k
```

您可以使用 `--wait` 标志来等待安装完成。 默认超时是 300s (5分钟)，但可以使用 `--timeout` 标志自定义超时。

```bash
dapr init -k --wait --timeout 600
```

同样，您也可以指定一个特定的runtime版本。

```bash
dapr init -k --runtime-version 1.4.0
```
