---
type: docs
title: "Hazelcast"
linkTitle: "Hazelcast"
description: "关于Hazelcast pubsub组件的详细文档。"
aliases:
  - "/operations/components/setup-pubsub/supported-pubsub/setup-hazelcast/"
---

## 配置
要安装 hazelcast pubsub ，请创建一个类型为 `pubsub.hazelcast` 的组件。 请参阅[本指南]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}})，了解如何创建和应用 pubsub 配置。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: hazelcast-pubsub
  namespace: default
spec:
  type: pubsub.hazelcast
  version: v1
  metadata:
  - name: hazelcastServers
    value: "hazelcast:3000,hazelcast2:3000"
```

{{% alert title="Warning" color="warning" %}}
以上示例将 Secret 明文存储。 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| 字段                | 必填 | 详情                                                                                                                                                                                                                                                                                                                                                                             | 示例                                 |
| ----------------- |:--:| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------- |
| connectionString  | Y  | 逗号分隔的服务器地址 逗号分隔的服务器地址 示例：“hazelcast:3000,hazelcast2:3000”                                                                                                                                                                                                                                                                                                                      | `"hazelcast:3000,hazelcast2:3000"` |
| backOffMaxRetries | N  | The maximum number of retries to process the message before returning an error. Defaults to `"0"` which means the component will not retry processing the message. `"-1"` will retry indefinitely until the message is processed or the application is shutdown. And positive number is treated as the maximum retry count. The component will wait 5 seconds between retries. | `"3"`                              |


## 创建Hazelcast 实例

{{< tabs "Self-Hosted" "Kubernetes">}}

{{% codetab %}}
你可以使用Docker在本地运行Hazelcast：

```
docker run -e JAVA_OPTS="-Dhazelcast.local.publicAddress=127.0.0.1:5701" -p 5701:5701 hazelcast/hazelcast
```

然后你可以通过`127.0.0.1:5701`与服务器交互。
{{% /codetab %}}

{{% codetab %}}
在Kubernetes上安装Hazelcast的最简单方法是使用[Helm chart](https://github.com/helm/charts/tree/master/stable/hazelcast)。
{{% /codetab %}}

{{< /tabs >}}

## 相关链接
- [Dapr组件的基本格式]({{< ref component-schema >}})
- 请访问 [本指南]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}}) ，了解如何配置 pub/sub 组件
- [发布/订阅构建块]({{< ref pubsub >}})