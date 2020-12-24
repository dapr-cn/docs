---
type: docs
title: "入门指南: 不使用 Docker 在自托管模式下运行 Dapr"
linkTitle: "Run without Docker"
weight: 30000
description: "如何以自托管方式部署和运行 Dapr ，而无需在本地机器上安装 Docker"
---

This article provides guidance on running Dapr in self-hosted mode without Docker.

## 先决条件

- [Dapr CLI]({{< ref "install-dapr-selfhost.md#installing-dapr-cli" >}})

## 无需容器初始化 Dapr

Dapr CLI 提供了使用 slim init 初始化 Dapr 的选项，而无需默认创建依赖于 Docker 的开发环境。 要使用 slim init 初始化 Dapr ，请在安装 Dapr CLI 后使用以下命令:

```bash
dapr init --slim
```

在此模式下安装了两个不同的二进制文件 `daprd` 和 `placement`。 `placement` 需要在 Dapr 自托管安装中用于启动 [actors]({{< ref "actors-overview.md" >}}) 。

在此模式下，不会为状态管理或发布/订阅安装任何默认组件（如 Redis）。 This means, that aside from [Service Invocation]({{< ref "service-invocation-overview.md" >}}), no other building block functionality is available on install out of the box. Users are free to setup their own environment and custom components. Furthermore, actor based service invocation is possible if a state store is configured as explained in the following sections.

## Service invocation
See [this sample](https://github.com/dapr/samples/tree/master/hello-dapr-slim) for an example on how to perform service invocation in this mode.

## Enabling state management or pub/sub

See configuring Redis in self hosted mode [without docker](https://redis.io/topics/quickstart) to enable a local state store or pub/sub broker for messaging.

## Enabling actors

The placement service must be run locally to enable actor placement. Also a [transactional state store](#Enabling-state-management-or-pub/sub) must be enabled for actors.

By default for Linux/MacOS the `placement` binary is installed in `/$HOME/.dapr/bin` or for Windows at `%USERPROFILE%\.dapr\bin`.

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

From here on you can follow the sample example created for the [java-sdk](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/actors/http), [python-sdk](https://github.com/dapr/python-sdk/tree/master/examples/demo_actor) or [dotnet-sdk](https://github.com/dapr/dotnet-sdk/tree/master/samples/Actor) for running an application with Actors enabled.

Update the state store configuration files to have the Redis host and password match the setup that you have. Additionally to enable it as a actor state store have the metadata piece added similar to the [sample Java Redis component](https://github.com/dapr/java-sdk/blob/master/examples/components/redis.yaml) definition.

```yaml
  - name: actorStateStore
    value: "true"
```


## Cleanup

Follow the uninstall [instructions]({{< ref "install-dapr-selfhost.md#uninstall-dapr-in-a-self-hosted-mode" >}}) to remove the binaries.
