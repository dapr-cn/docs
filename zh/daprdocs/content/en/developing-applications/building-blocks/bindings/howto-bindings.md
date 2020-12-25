---
type: docs
title: "操作方法：使用绑定与外部资源进行交互"
linkTitle: "How-To: Bindings"
description: "使用 Dapr 输出绑定调用外部系统"
weight: 300
---

使用绑定，可以调用外部资源，而无需绑定到特定的 SDK 或库。 有关显示输出绑定的完整示例，请访问此 [链接](https://github.com/dapr/quickstarts/tree/master/bindings)。

观看如何使用双向输出绑定的 [视频](https://www.youtube.com/watch?v=ysklxm81MTs&feature=youtu.be&t=1960) 。


## 1. 创建绑定

输出绑定表示 Dapr 将使用调用和向其发送消息的资源。

就本指南的目的，您将使用 Kafka 绑定。 您可以在 [此处]({{< ref bindings >) 找到不同绑定规范的列表。

创建以下 YAML 文件，名为 binding.yaml，并将其保存到应用程序的 `components` 子文件夹中。 （使用具有 `--components-path` 标记 的 `dapr run` 命令来指向自定义组件目录）

*注: 在 Kubernetes 中运行时，使用 `kubectl apply -f binding.yaml` 将此文件应用于您的集群*

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: myevent
  namespace: default
spec:
  type: bindings.kafka
  version: v1
  metadata:
  - name: brokers
    value: localhost:9092
  - name: publishTopic
    value: topic1
```

在这里，创建一个名称为 `myevent` 的新绑定组件。

在 `metadata` 部分中，配置 Kafka 相关属性，如消息要发布到的主题和代理。

## 2. 发送事件

现在剩下的就是在正在运行的 Dapr 实例上调用绑定终结点。

您可以使用 HTTP 来这样做：

```bash
curl -X POST -H  http://localhost:3500/v1.0/bindings/myevent -d '{ "data": { "message": "Hi!" }, "operation": "create" }'
```

如上文所见，您使用了要调用的绑定的名称来调用 `/binding` 终结点。 在我们的示例中，它的名称是 `myevent` 。 有效载荷位于必需的 `data` 字段中，并且可以是任何 JSON 可序列化的值。

您还会注意到，有一个 `operation` 字段告诉绑定您需要它执行的操作。 You can check [here]({{< ref bindings >}}) which operations are supported for every output binding.


## References

- [Binding API]({{< ref bindings_api.md >}})
- [Binding components]({{< ref bindings >}})
- [Binding detailed specifications]({{< ref supported-bindings >}}) 
