---
type: docs
title: "如何在没有 Docker 的环境中以自托管模式运行 Dapr"
linkTitle: "无需 Docker 运行"
weight: 30000
description: "在本地机器上未安装 Docker 的情况下部署和运行 Dapr 自托管模式"
---

## 前提条件

- [安装 Dapr CLI]({{< ref "install-dapr-selfhost.md#installing-dapr-cli" >}})

## 初始化无容器的 Dapr

Dapr CLI 提供了一个选项，可以使用 slim init 初始化 Dapr，而无需依赖 Docker 来创建默认的开发环境。安装 Dapr CLI 后，使用以下命令进行 slim init 初始化：

```bash
dapr init --slim
```

这将安装两个不同的二进制文件：
- `daprd`
- `placement`

`placement` 二进制文件用于在 Dapr 自托管安装中启用 [actor]({{< ref "actors-overview.md" >}})。

在 slim init 模式下，不会安装用于状态管理或消息发布/订阅的默认组件（如 Redis）。这意味着，除了 [服务调用]({{< ref "service-invocation-overview.md" >}}) 外，安装时没有其他内置功能可用。您可以根据需要设置自己的环境和自定义组件。

如果配置了状态存储，则可以进行基于 actor 的服务调用，具体说明请参见以下章节。

## 执行服务调用
请参阅 [Hello Dapr slim 示例](https://github.com/dapr/samples/tree/master/hello-dapr-slim)，了解如何在 slim init 模式下执行服务调用。

## 启用状态管理或消息发布/订阅

请参阅 [在无 Docker 的自托管模式下配置 Redis](https://redis.io/topics/quickstart) 的文档，以启用本地状态存储或用于消息传递的发布/订阅代理。

## 启用 actor

要启用 actor placement：
- 在本地运行 placement 服务。
- 启用支持 ETags 的 [事务性状态存储]({{< ref "supported-state-stores.md" >}}) 以使用 actor。例如，[在自托管模式下配置的 Redis](https://redis.io/topics/quickstart)。

默认情况下，`placement` 二进制文件安装在：

- 对于 Linux/MacOS: `/$HOME/.dapr/bin`
- 对于 Windows: `%USERPROFILE%\.dapr\bin`

{{< tabs "Linux/MacOS" "Windows">}}

{{% codetab %}}

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

{{% /codetab %}}

{{% codetab %}}

在 Windows 上运行独立的 placement 时，指定端口 6050：

```bash
%USERPROFILE%/.dapr/bin/placement.exe -port 6050

time="2022-10-17T14:56:55.4055836-05:00" level=info msg="starting Dapr Placement Service -- version 1.9.0 -- commit fdce5f1f1b76012291c888113169aee845f25ef8" instance=LAPTOP-OMK50S19 scope=dapr.placement type=log ver=1.9.0
time="2022-10-17T14:56:55.4066226-05:00" level=info msg="log level set to: info" instance=LAPTOP-OMK50S19 scope=dapr.placement type=log ver=1.9.0
time="2022-10-17T14:56:55.4067306-05:00" level=info msg="metrics server started on :9090/" instance=LAPTOP-OMK50S19 scope=dapr.metrics type=log ver=1.9.0
time="2022-10-17T14:56:55.4077529-05:00" level=info msg="Raft server is starting on 127.0.0.1:8201..." instance=LAPTOP-OMK50S19 scope=dapr.placement.raft type=log ver=1.9.0
time="2022-10-17T14:56:55.4077529-05:00" level=info msg="placement service started on port 6050" instance=LAPTOP-OMK50S19 scope=dapr.placement type=log ver=1.9.0
time="2022-10-17T14:56:55.4082772-05:00" level=info msg="Healthz server is listening on :8080" instance=LAPTOP-OMK50S19 scope=dapr.placement type=log ver=1.9.0
time="2022-10-17T14:56:56.8232286-05:00" level=info msg="cluster leadership acquired" instance=LAPTOP-OMK50S19 scope=dapr.placement type=log ver=1.9.0
time="2022-10-17T14:56:56.8232286-05:00" level=info msg="leader is established." instance=LAPTOP-OMK50S19 scope=dapr.placement type=log ver=1.9.0

```

{{% /codetab %}}

{{< /tabs >}}

现在，要运行启用了 actor 的应用程序，您可以参考以下示例：
- [java-sdk](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/actors)
- [python-sdk](https://github.com/dapr/python-sdk/tree/master/examples/demo_actor)
- [dotnet-sdk]({{< ref "dotnet-actors-howto.md" >}})

更新状态存储配置文件以匹配您的 Redis 主机和密码设置。

通过将元数据部分设置为类似于 [示例 Java Redis 组件](https://github.com/dapr/java-sdk/blob/master/examples/components/state/redis.yaml) 的定义，将其启用为 actor 状态存储。

```yaml
  - name: actorStateStore
    value: "true"
```

## 清理

完成后，请按照 [在自托管环境中卸载 Dapr]({{< ref self-hosted-uninstall >}}) 的步骤移除二进制文件。

## 下一步
- 使用默认的 [Docker]({{< ref install-dapr-selfhost.md >}}) 或在 [airgap 环境]({{< ref self-hosted-airgap.md >}}) 中运行 Dapr
- [在自托管模式下升级 Dapr]({{< ref self-hosted-upgrade >}})