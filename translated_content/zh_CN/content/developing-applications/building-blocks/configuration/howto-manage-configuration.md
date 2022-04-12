---
type: docs
title: "操作方法：从存储管理配置"
linkTitle: "操作方法：从存储中管理配置"
weight: 2000
description: "了解如何获取应用程序配置并订阅更改"
---

## 介绍
本操作方法使用 Redis 配置存储组件作为示例来检索配置项目。

**此 API 目前在 `Alpha` 并且只能在 gRPC 上使用。 在将 API 认证为 `Stable` 状态之前，将提供具有此 URL 语法 `/v1.0/configuration` 的 HTTP1.1 支持版本。*

## 步骤 1：创建配置项目

首先，在支持的配置存储中创建配置项目。 这可以是一个简单的键值项，具有您选择的任何键。 对于此示例，我们将使用 Redis 配置存储组件.

### 使用 Docker 运行 Redis
```
docker run --name my-redis -p 6379:6379 -d redis
```

### 保存项目

使用 [Redis CLI](https://redis.com/blog/get-redis-cli-without-installing-redis-server/)连接到 Redis 实例：

```
redis-cli -p 6379 
```

保存配置项目：

```
set myconfig "wookie"
```

### 配置 Dapr 配置存储

例如，将以下组件文件保存到计算机上 [默认组件文件夹]({{<ref "install-dapr-selfhost.md#step-5-verify-components-directory-has-been-initialized">}})。 您可以使用 `kubectl` 或使用 Dapr CLI 运行时将其用作 Kubernetes 的 Dapr 组件 YAML。 注意：Redis 配置组件具有与 Redis 状态存储组件相同的元数据，因此，如果您已有 Redis 状态存储 YAML 文件，则只需复制和更改 Redis 状态存储组件类型即可。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: redisconfigstore
spec:
  type: configuration.redis
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: <PASSWORD>
```

### 使用 gRPC API 获取配置项目

使用您 [喜欢的语言](https://grpc.io/docs/languages/)，从 [Dapr proto](https://github.com/dapr/dapr/blob/master/dapr/proto/runtime/v1/dapr.proto)创建一个 Dapr gRPC 客户端。 以下示例显示了 Java、C#、Python 和 Javascript 客户端。

{{< tabs Java Dotnet Python Javascript >}}

{{% codetab %}}
```java

Dapr.ServiceBlockingStub stub = Dapr.newBlockingStub(channel);
stub.GetConfigurationAlpha1(new GetConfigurationRequest{ StoreName = "redisconfigstore", Keys = new String[]{"myconfig"} });
```
{{% /codetab %}}

{{% codetab %}}
```csharp

var call = client.GetConfigurationAlpha1(new GetConfigurationRequest { StoreName = "redisconfigstore", Keys = new String[]{"myconfig"} });
```
{{% /codetab %}}

{{% codetab %}}
```python
response = stub.GetConfigurationAlpha1(request={ StoreName: 'redisconfigstore', Keys = ['myconfig'] })
```
{{% /codetab %}}

{{% codetab %}}
```javascript
client.GetConfigurationAlpha1({ StoreName: 'redisconfigstore', Keys = ['myconfig'] })
```
{{% /codetab %}}

{{< /tabs >}}

### 监视配置项目

使用您的[首选语言](https://grpc.io/docs/languages/)从 [Dapr proto](https://github.com/dapr/dapr/blob/master/dapr/proto/runtime/v1/dapr.proto) 创建 Dapr gRPC 客户端。 然后使用 proto 方法 `SubscribeConfigurationAlpha1` 开始订阅事件。 该方法接受以下请求对象：

```proto
message SubscribeConfigurationRequest {
  // The name of configuration store.
  string store_name = 1;

  // Optional. The key of the configuration item to fetch.
  // If set, only query for the specified configuration items.
  // Empty list means fetch all.
  repeated string keys = 2;

  // The metadata which will be sent to configuration store components.
  map<string,string> metadata = 3;
}
```

使用此方法，您可以订阅给定配置存储的特定密钥中的更改。 gRPC 流因语言而异 - 有关用法，请参阅此处的 [gRPC 示例](https://grpc.io/docs/languages/) 。

## 下一步
* 阅读 [配置 API 概述]({{< ref configuration-api-overview.md >}})