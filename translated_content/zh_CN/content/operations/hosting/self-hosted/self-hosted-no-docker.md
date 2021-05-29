---
type: docs
title: "入门指南: 不使用 Docker 在自托管模式下运行 Dapr"
linkTitle: "不使用 Docker 运行"
weight: 50000
description: "如何以自托管方式部署和运行 Dapr ，而无需在本地机器上安装 Docker"
---

本文提供了在没有 Docker 的自托管模式下运行 Dapr 的指导。

## 先决条件

- [Dapr CLI]({{< ref "install-dapr-selfhost.md#installing-dapr-cli" >}})

## 无需容器初始化 Dapr

Dapr CLI 提供了使用 slim init 初始化 Dapr 的选项，而无需默认创建依赖于 Docker 的开发环境。 要使用 slim init 初始化 Dapr ，请在安装 Dapr CLI 后使用以下命令:

```bash
dapr init --slim
```

在此模式下安装了两个不同的二进制文件 `daprd` 和 `placement`。 The `placement` binary is needed to enable [actors]({{< ref "actors-overview.md" >}}) in a Dapr self-hosted installation.

在此模式下，不会为状态管理或发布/订阅安装任何默认组件（如 Redis）。 This means, that aside from [Service Invocation]({{< ref "service-invocation-overview.md" >}}), no other building block functionality is available on install out of the box. 用户可以自由设置自己的环境和自定义组件。 此外，如果按照以下部分所述配置状态存储，基于 actor 的服务就可以调用。

## 调用逻辑
有关如何在此方式下执行服务调用的示例，请参阅 [此示例](https://github.com/dapr/samples/tree/master/hello-dapr-slim)。

## 启用状态管理或发布/订阅

See configuring Redis in self-hosted mode [without docker](https://redis.io/topics/quickstart) to enable a local state store or pub/sub broker for messaging.

## 启用 actors

placement 服务必须在本地运行才能启动 actor。 Also, a [transactional state store that supports ETags]({{< ref "supported-state-stores.md" >}}) must be enabled to use actors, for example, [Redis configured in self-hosted mode](https://redis.io/topics/quickstart).

Linux/MacOS 默认情况下， `placement` 二进制文件安装在 `/$HOME/. dapr/bin` 目录下， Windows 在 `%USERPROFILE%\.dapr\bin` 目录下。

```bash
$ $HOME/.dapr/bin/placement

INFO[0000] starting Dapr Placement Service -- version 1.0.0-rc.1 -- commit 13ae49d  instance=Nicoletaz-L10.redmond.corp.microsoft.com scope=dapr.placement type=log ver=1.0.0-rc.1
INFO[0000] log level set to: info                        instance=Nicoletaz-L10.redmond.corp.microsoft.com scope=dapr.placement type=log ver=1.0.0-rc.1
INFO[0000] metrics server started on :9090/              instance=Nicoletaz-L10.redmond.corp.microsoft.com scope=dapr.metrics type=log ver=1.0.0-rc.1
INFO[0000] Raft server is starting on 127.0.0.1:8201...  instance=Nicoletaz-L10.redmond.corp.microsoft.com scope=dapr.placement.raft type=log ver=1.0.0-rc.1
INFO[0000] placement service started on port 50005       instance=Nicoletaz-L10.redmond.corp.microsoft.com scope=dapr.placement type=log ver=1.0.0-rc.1
INFO[0000] Healthz server is listening on :8080          instance=Nicoletaz-L10.redmond.corp.microsoft.com scope=dapr.placement type=log ver=1.0.0-rc.1
INFO[0001] cluster leadership acquired                   instance=Nicoletaz-L10.redmond.corp.microsoft.com scope=dapr.placement type=log ver=1.0.0-rc.1
INFO[0001] leader is established.                        instance=Nicoletaz-L10.redmond.corp.microsoft.com scope=dapr.placement type=log ver=1.0.0-rc.1

```

From here on you can follow the sample example created for the [java-sdk](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/actors), [python-sdk](https://github.com/dapr/python-sdk/tree/master/examples/demo_actor) or [dotnet-sdk]({{< ref "dotnet-actors-howto.md" >}}) for running an application with Actors enabled.

更新状态存储配置文件使 Redis host 地址和密码和您的设置相同。 此外，为了使它能够作为一个actor状态存储，还添加了类似于[示例Java Redis组件](https://github.com/dapr/java-sdk/blob/master/examples/components/state/redis.yaml)定义的元数据部分。

```yaml
  - name: actorStateStore
    value: "true"
```


## 清理

Follow the uninstall [instructions]({{< ref "install-dapr-selfhost.md#uninstall-dapr-in-a-self-hosted-mode" >}}) to remove the binaries.
