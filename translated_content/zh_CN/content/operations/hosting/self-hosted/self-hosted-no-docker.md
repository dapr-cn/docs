---
type: docs
title: "入门指南: 不使用 Docker 在自托管模式下运行 Dapr"
linkTitle: "Run without Docker"
weight: 50000
description: "如何以自托管方式部署和运行 Dapr ，而无需在本地机器上安装 Docker"
---

本文提供了在没有 Docker 的自托管模式下运行 Dapr 的指导。

## 前期准备

- [Dapr CLI]({{< ref "install-dapr-selfhost.md#installing-dapr-cli" >}})

## 无需容器初始化 Dapr

Dapr CLI 提供了使用 slim init 初始化 Dapr 的选项，而无需默认创建依赖于 Docker 的开发环境。 要使用 slim init 初始化 Dapr ，请在安装 Dapr CLI 后使用以下命令:

```bash
dapr init --slim
```

在此模式下安装了两个不同的二进制文件 `daprd` 和 `placement`。 `placement` 需要在 Dapr 自托管安装中用于启动 [actors]({{< ref "actors-overview.md" >}}) 。

在此模式下，不会为状态管理或发布/订阅安装任何默认组件（如 Redis）。 这意味着，除了 [服务调用]({{< ref "service-invocation-overview.md" >}})，在现成可用的情况下，没有其他构建块功能可用。 用户可以自由设置自己的环境和自定义组件。 此外，如果按照以下部分所述配置状态存储，基于 actor 的服务就可以调用。

## 服务调用
有关如何在此方式下执行服务调用的示例，请参阅 [此示例](https://github.com/dapr/samples/tree/master/hello-dapr-slim)。

## 启用状态管理或发布/订阅

请参阅 " 以自托管方式 [配置 Redis (不使用 docker](https://redis.io/topics/quickstart)) " 启用本地状态存储或发布/订阅代理以通信。

## 启用 actors

placement 服务必须在本地运行才能启动 actor。 还必须为 actors 启用 [事务型状态存储](#Enabling-state-management-or-pub/sub)。

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
INFO[0001] leader is established.                        instance=Nicoletaz-L10.redmond.corp.microsoft.com scope=dapr.placement type=log ver=1.0.0-rc.1                        instance=Nicoletaz-L10.redmond.corp.microsoft.com scope=dapr.placement type=log ver=1.0.0-rc.1

```

From here on you can follow the sample example created for the [java-sdk](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/actors), [python-sdk](https://github.com/dapr/python-sdk/tree/master/examples/demo_actor) or [dotnet-sdk]({{< ref "dotnet-actor-howto.md" >}}) for running an application with Actors enabled.

更新状态存储配置文件使 Redis host 地址和密码和您的设置相同。 Additionally to enable it as a actor state store have the metadata piece added similar to the [sample Java Redis component](https://github.com/dapr/java-sdk/blob/master/examples/components/state/redis.yaml) definition.

```yaml
  - name: actorStateStore
    value: "true"
```


## 清理

按照卸载 [说明]({{< ref "install-dapr-selfhost.md#uninstall-dapr-in-a-self-hosted-mode" >}}) 来移除二进制文件。
