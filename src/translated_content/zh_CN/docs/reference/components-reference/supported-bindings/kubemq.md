---
type: docs
title: "KubeMQ 绑定规范"
linkTitle: "KubeMQ"
description: "关于 KubeMQ 绑定组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/kubemq/"
---

## 组件格式

要设置 KubeMQ 绑定，需创建一个类型为 `bindings.kubemq` 的组件。请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})了解如何创建和应用绑定配置。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: binding-topic
spec:
  type: bindings.kubemq
  version: v1
  metadata:
    - name: address
      value: "localhost:50000"
    - name: channel
      value: "queue1"
    - name: direction
      value: "input, output"
```

## 规范元数据字段

| 字段                | 必需 | 详情                                                                                                                      | 示例                                |
|--------------------|:----:|---------------------------------------------------------------------------------------------------------------------------|-------------------------------------|
| `address`            |  Y   | KubeMQ 服务器的地址                                                                                                        | `"localhost:50000"`                 |
| `channel`            |  Y   | 队列通道名称                                                                                                               | `"queue1"`                          |
| `authToken`          |  N   | 连接的 Auth JWT 令牌。请参阅 [KubeMQ 认证](https://docs.kubemq.io/learn/access-control/authentication)                      | `"ew..."`                           |
| `autoAcknowledged`   |  N   | 设置是否自动确认接收到的队列消息                                                                                           | `"true"` 或 `"false"` (默认是 `"false"`) |
| `pollMaxItems`       |  N   | 设置每次连接轮询的消息数量                                                                                                 | `"1"`                               |
| `pollTimeoutSeconds` |  N   | 设置每个轮询间隔的时间（秒）                                                                                                | `"3600"`                            |
| `direction`          |  N   | 绑定的方向                                                                                                                 | `"input"`, `"output"`, `"input, output"` |

## 绑定支持

该组件支持 **输入和输出** 绑定接口。

## 创建 KubeMQ 代理

{{< tabs "Self-Hosted" "Kubernetes">}}

{{% codetab %}}
1. [获取 KubeMQ 密钥](https://docs.kubemq.io/getting-started/quick-start#obtain-kubemq-license-key)。
2. 等待电子邮件确认您的密钥

您可以使用 Docker 运行 KubeMQ 代理：

```bash
docker run -d -p 8080:8080 -p 50000:50000 -p 9090:9090 -e KUBEMQ_TOKEN=<your-key> kubemq/kubemq
```
然后，您可以通过客户端端口与服务器交互：`localhost:50000`

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
请访问 [KubeMQ CLI](https://github.com/kubemq-io/kubemqctl/releases) 并下载最新版本的 CLI。

## 浏览 KubeMQ 仪表板

{{< tabs "Self-Hosted" "Kubernetes">}}

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
- [绑定构建块]({{< ref bindings >}})
- [如何：使用输入绑定触发应用程序]({{< ref howto-triggers.md >}})
- [如何：使用绑定与外部资源接口]({{< ref howto-bindings.md >}})
- [绑定 API 参考]({{< ref bindings_api.md >}})
