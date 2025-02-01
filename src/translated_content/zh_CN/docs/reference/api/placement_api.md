---
type: docs
title: "Placement API 参考"
linkTitle: "Placement API"
description: "Placement API 的详细文档"
weight: 1200
---

Dapr 提供了一个 HTTP API `/placement/state`，用于 Placement 服务，公开 placement 表信息。该 API 在 sidecar 上与 healthz 使用相同的端口。这是一个未经身份验证的端点，默认情况下是禁用的。

要在自托管模式下启用 placement 元数据，可以设置 `DAPR_PLACEMENT_METADATA_ENABLED` 环境变量为 `true`，或者在 Placement 服务上使用 `metadata-enabled` 命令行参数。请参阅[如何在自托管模式下运行 Placement 服务]({{< ref "self-hosted-no-docker.md#enable-actors" >}})。

{{% alert title="重要" color="warning" %}}
在 [多租户模式]({{< ref namespaced-actors.md >}})下运行 placement 时，请禁用 `metadata-enabled` 命令行参数，以防止不同命名空间之间的数据泄露。
{{% /alert %}}

如果您在 Kubernetes 上使用 Helm 部署 Placement 服务，要启用 placement 元数据，请将 `dapr_placement.metadataEnabled` 设置为 `true`。

## 使用场景

placement 表 API 可用于检索当前的 placement 表，其中包含所有注册的 actor。这对于调试非常有帮助，并允许工具提取和展示关于 actor 的信息。

## HTTP 请求

```
GET http://localhost:<healthzPort>/placement/state
```

## HTTP 响应代码

代码 | 描述
---- | -----------
200  | 成功返回 placement 表信息
500  | 无法返回 placement 表信息

## HTTP 响应体

**Placement 表 API 响应对象**

名称                   | 类型                                                                  | 描述
----                   | ----                                                                  | -----------
tableVersion           | int                                                                   | placement 表版本
hostList               | [Actor 主机信息](#actorhostinfo)[]                                   | 注册的 actor 主机信息的 JSON 数组。

<a id="actorhostinfo"></a>**Actor 主机信息**

名称  | 类型    | 描述
----  | ----    | -----------
name  | string  | actor 的主机:端口地址。
appId | string  | 应用 ID。
actorTypes | json string array | 它所托管的 actor 类型列表。
updatedAt | timestamp | actor 注册/更新的时间戳。

## 示例

```shell
 curl localhost:8080/placement/state
```

```json
{
    "hostList": [{
            "name": "198.18.0.1:49347",
            "namespace": "ns1",
            "appId": "actor1",
            "actorTypes": ["testActorType1", "testActorType3"],
            "updatedAt": 1690274322325260000
        },
        {
            "name": "198.18.0.2:49347",
            "namespace": "ns2",
            "appId": "actor2",
            "actorTypes": ["testActorType2"],
            "updatedAt": 1690274322325260000
        },
        {
            "name": "198.18.0.3:49347",
            "namespace": "ns2",
            "appId": "actor2",
            "actorTypes": ["testActorType2"],
            "updatedAt": 1690274322325260000
        }
    ],
    "tableVersion": 1
}
```