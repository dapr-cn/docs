---
type: docs
title: "Dapr Placement 控制平面服务概述"
linkTitle: "Placement"
description: "Dapr Placement 服务概述"
---

Dapr Placement 服务用于计算和分发用于定位的分布式哈希表，以便在[自托管模式]({{< ref self-hosted >}})或[Kubernetes]({{< ref kubernetes >}})上运行的[Dapr actor]({{< ref actors >}})能够被正确定位。哈希表按命名空间分组，将actor类型映射到相应的pod或进程，以便Dapr应用程序可以与actor进行通信。每当Dapr应用程序激活一个Dapr actor时，Placement服务会更新哈希表以反映最新的actor位置。

## 自托管模式

在自托管模式下，Placement服务的Docker容器会在执行[`dapr init`]({{< ref self-hosted-with-docker.md >}})时自动启动。如果您使用[slim-init模式]({{< ref self-hosted-no-docker.md >}})，也可以手动将其作为进程运行。

## Kubernetes模式

在Kubernetes模式下，Placement服务可以通过执行`dapr init -k`或使用Dapr Helm图表进行部署。您可以选择在高可用性（HA）模式下运行Placement服务。[了解更多关于在Kubernetes中设置HA模式的信息。]({{< ref "kubernetes-production.md#individual-service-ha-helm-configuration" >}})

有关在Kubernetes上运行Dapr的更多信息，请访问[Kubernetes托管页面]({{< ref kubernetes >}})。

## Placement表

Placement服务提供了一个HTTP API `/placement/state`，用于公开placement表的信息。该API与sidecar的healthz端口相同。这个端点默认是禁用的且不需要身份验证。要启用它，您需要将`DAPR_PLACEMENT_METADATA_ENABLED`环境变量或`metadata-enabled`命令行参数设置为true。如果您使用helm，只需将`dapr_placement.metadataEnabled`设置为true。

{{% alert title="重要" color="warning" %}}
当actor被部署到不同的命名空间时，如果您希望防止从所有命名空间检索actor信息，建议禁用`metadata-enabled`。元数据端点的范围覆盖所有命名空间。
{{% /alert %}}

### 用例：
placement表API可用于检索当前的placement表，其中包含所有命名空间中注册的actor信息。这对于调试和工具提取、呈现actor信息非常有帮助。

### HTTP请求

```
GET http://localhost:<healthzPort>/placement/state
```

### HTTP响应代码

代码 | 描述
---- | -----------
200  | 返回placement表信息
500  | Placement无法返回placement表信息

### HTTP响应体

**Placement表API响应对象**

名称                   | 类型                                                                  | 描述
----                   | ----                                                                  | -----------
tableVersion           | int                                                                   | placement表版本
hostList               | [Actor Host Info](#actorhostinfo)[]                                   | 注册的actor主机信息的json数组。

<a id="actorhostinfo"></a>**Actor主机信息**

名称  | 类型    | 描述
----  | ----    | -----------
name  | string  | actor的主机:端口地址。
appId | string  | 应用程序ID。
actorTypes | json string array | 它托管的actor类型列表。
updatedAt | timestamp | actor注册/更新的时间戳。

### 示例

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

## 相关链接

[了解更多关于Placement API的信息。]({{< ref placement_api.md >}})