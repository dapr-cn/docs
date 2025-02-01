---
type: docs
title: "KubeMQ"
linkTitle: "KubeMQ"
description: "KubeMQ pubsub 组件的详细说明"
aliases:
  - "/zh-hans/operations/components/setup-pubsub/supported-pubsub/setup-kubemq/"
---

## 组件格式

要配置 KubeMQ pub/sub，需创建一个类型为 `pubsub.kubemq` 的组件。请参阅 [pub/sub broker 组件文件]({{< ref setup-pubsub.md >}}) 了解 ConsumerID 是如何自动生成的。阅读 [如何发布和订阅指南]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}}) 以了解如何创建和应用 pub/sub 配置。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kubemq-pubsub
spec:
  type: pubsub.kubemq
  version: v1
  metadata:
    - name: address
      value: localhost:50000
    - name: store
      value: false
    - name: consumerID
      value: channel1
```

## 规格元数据字段

| 字段               | 必需 | 详情                                                                                                                     | 示例                                  |
|-------------------|:----:|-------------------------------------------------------------------------------------------------------------------------|---------------------------------------|
| address           |  Y   | KubeMQ 服务器的地址                                                                                                      | `"localhost:50000"`                   |
| store             |  N   | pubsub 类型，true: pubsub 持久化 (EventsStore)，false: pubsub 内存中 (Events)                                           | `true` 或 `false` (默认是 `false`)    |
| consumerID        |  N   | 消费者 ID（消费者标签）用于将一个或多个消费者组织成一个组。具有相同消费者 ID 的消费者作为一个虚拟消费者工作；例如，消息仅由组中的一个消费者处理一次。如果未提供 `consumerID`，Dapr 运行时将其设置为 Dapr 应用程序 ID (`appID`) 值。 | 可以设置为字符串值（如上例中的 `"channel1"`）或字符串格式值（如 `"{podName}"` 等）。[查看可以在组件元数据中使用的所有模板标签。]({{< ref "component-schema.md#templated-metadata-values" >}}) |
| clientID          |  N   | 客户端 ID 连接的名称                                                                                                     | `sub-client-12345`                    |
| authToken         |  N   | 连接的 Auth JWT 令牌 查看 [KubeMQ 认证](https://docs.kubemq.io/learn/access-control/authentication)                      | `ew...`                               |
| group             |  N   | 用于负载均衡的订阅者组                                                                                                   | `g1`                                  |
| disableReDelivery |  N   | 设置是否在应用程序出错时重新传递消息                                                                                     | `true` 或 `false` (默认是 `false`)    |

## 创建 KubeMQ broker

{{< tabs "自托管" "Kubernetes">}}

{{% codetab %}}
1. [获取 KubeMQ 密钥](https://docs.kubemq.io/getting-started/quick-start#obtain-kubemq-license-key)。
2. 等待电子邮件确认您的密钥

您可以使用 Docker 运行 KubeMQ broker：

```bash
docker run -d -p 8080:8080 -p 50000:50000 -p 9090:9090 -e KUBEMQ_TOKEN=<your-key> kubemq/kubemq
```
然后您可以使用客户端端口与服务器交互：`localhost:50000`

{{% /codetab %}}

{{% codetab %}}
1. [获取 KubeMQ 密钥](https://docs.kubemq.io/getting-started/quick-start#obtain-kubemq-license-key)。
2. 等待电子邮件确认您的密钥

然后运行以下 kubectl 命令：

```bash
kubectl apply -f https://deploy.kubemq.io/init
```

```bash
kubectl apply -f https://deploy.kubemq.io/key/<your-key>
```
{{% /codetab %}}

{{< /tabs >}}

## 安装 KubeMQ CLI
前往 [KubeMQ CLI](https://github.com/kubemq-io/kubemqctl/releases) 并下载最新版本的 CLI。

## 浏览 KubeMQ 仪表板

{{< tabs "自托管" "Kubernetes">}}

{{% codetab %}}
<!-- IGNORE_LINKS -->
打开浏览器并导航到 [http://localhost:8080](http://localhost:8080)
<!-- END_IGNORE -->
{{% /codetab %}}

{{% codetab %}}
安装 KubeMQCTL 后，运行以下命令：

```bash
kubemqctl get dashboard
```
或者，安装 kubectl 后，运行端口转发命令：

```bash
kubectl port-forward svc/kubemq-cluster-api -n kubemq 8080:8080
```
{{% /codetab %}}

{{< /tabs >}}

## KubeMQ 文档
访问 [KubeMQ 文档](https://docs.kubemq.io/) 了解更多信息。

## 相关链接

- [Dapr 组件的基本架构]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}}) 了解配置 pub/sub 组件的说明
- [Pub/sub 构建块]({{< ref pubsub >}})
