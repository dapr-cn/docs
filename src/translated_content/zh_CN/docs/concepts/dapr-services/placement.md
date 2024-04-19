---
type: docs
title: Dapr Placement 控制平面服务概述
linkTitle: Placement
description: Dapr Placement 服务概述
---

Dapr Placement服务用于计算和分发在[自托管模式]({{< ref self-hosted >}})下或在[Kubernetes]({{< ref kubernetes >}})上运行的[Dapr Actor]({{< ref actors >}})的位置的分布式哈希表。 这个哈希表将 actor ID 映射到 pod 或进程，这样 Dapr 应用程序就可以与 actor 进行通信。每当 Dapr 应用程序激活一个 Dapr actor 时，placement 服务就会用最新的 actor 位置更新哈希表。

## 自托管模式

Placement服务的Docker容器会作为[`dapr init`]({{< ref self-hosted-with-docker.md >}})的一部分自动启动。 如果你以 [slim-init mode]({{< ref self-hosted-no-docker.md >}}) 模式运行，它也可以作为进程手动运行。

## Kubernetes 模式

Placement 服务作为 `dapr init -k` 的一部分部署，或通过 Dapr Helm chart 部署。 有关在 Kubernetes 上运行 Dapr 的更多信息，请访问 [Kubernetes 托管页面]({{< ref kubernetes >}})。

## Placement 表

有一个[HTTP API `/placement/state`用于公布 Placement 表信息]({{< ref placement_api.md >}})的 Placement 服务。 API 在与 healthz 相同的端口上通过 sidecar 暴露。 这是一个未经身份验证的端点，默认情况下被禁用。 您需要将 `DAPR_PLACEMENT_METADATA_ENABLED` 环境或 `metadata-enabled` 命令行参数设置为true以启用它。 如果您正在使用helm，则只需将 `dapr_placement.metadataEnabled` 设置为true。

### 使用案例：

可以使用放置表API来检索当前的 Placement 表，其中包含所有已注册的 Actors。 这对于调试非常有帮助，并且允许工具提取和展示有关演员的信息。

### HTTP 请求

```
GET http://localhost:<healthzPort>/placement/state
```

### HTTP 响应码

| 响应码 | 说明                 |
| --- | ------------------ |
| 200 | 返回的 Placement 表信息  |
| 500 | 无法返回 Placement 表信息 |

### HTTP 响应正文

**Placement 表 API 响应对象**

| 名称           | 类型                                                                                      | 说明                        |
| ------------ | --------------------------------------------------------------------------------------- | ------------------------- |
| tableVersion | int                                                                                     | Placement 表版本             |
| hostList     | [Actor Host Info](#actorhostinfo)[] | 已注册 Actors 主机信息的 Json 数组。 |

<a id="actorhostinfo"></a>**Actor 主机信息**

| 名称         | 类型        | 说明                      |
| ---------- | --------- | ----------------------- |
| name       | string    | 执行组件的 host：port 地址。     |
| appId      | string    | app id. |
| actorTypes | json字符串数组 | 托管的 actor 类型列表。         |
| updatedAt  | timestamp | Actor 注册/更新的时间戳。        |

### 示例

```shell
 curl localhost:8080/placement/state
```

```json
{
	"hostList": [{
			"name": "198.18.0.1:49347",
			"appId": "actor1",
			"actorTypes": ["testActorType1", "testActorType3"],
			"updatedAt": 1690274322325260000
		},
		{
			"name": "198.18.0.2:49347",
			"appId": "actor2",
			"actorTypes": ["testActorType2"],
			"updatedAt": 1690274322325260000
		},
		{
			"name": "198.18.0.3:49347",
			"appId": "actor2",
			"actorTypes": ["testActorType2"],
			"updatedAt": 1690274322325260000
		}
	],
	"tableVersion": 1
}
```

## 相关链接

[了解有关 Placement API 的更多信息。]({{< ref placement_api.md >}})
