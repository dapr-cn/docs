---
type: docs
title: "How-To: Manage configuration from a store"
linkTitle: "How-To: Manage configuration from a store"
weight: 2000
description: "Learn how to get application configuration and subscribe for changes"
---

## 介绍
This HowTo uses the Redis configuration store component as an example on how to retrieve a configuration item.

*This API is currently in `Alpha` state and only available on gRPC. An HTTP1.1 supported version with this URL syntax `/v1.0/configuration` will be available before the API is certified into `Stable` state.*

## Step 1: Create a configuration item in store

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

Save the following component file, for example to the [default components folder]({{<ref "install-dapr-selfhost.md#step-5-verify-components-directory-has-been-initialized">}}) on your machine. You can use this as the Dapr component YAML for Kubernetes using `kubectl` or when running with the Dapr CLI. Note: The Redis configuration component has identical metadata to the Redis state store component, so you can simply copy and change the Redis state store component type if you already have a Redis state store YAML file.

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

Create a Dapr gRPC client from the [Dapr proto](https://github.com/dapr/dapr/blob/master/dapr/proto/runtime/v1/dapr.proto) using your [preferred language](https://grpc.io/docs/languages/). Then use the proto method `SubscribeConfigurationAlpha1` on your client stub to start subscribing to events. 该方法接受以下请求对象：

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
* Read [configuration API overview]({{< ref configuration-api-overview.md >}})