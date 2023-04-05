---
type: docs
title: "Pulsar"
linkTitle: "Pulsar"
description: "关于Pulsar pubsub组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-pubsub/supported-pubsub/setup-pulsar/"
---

## Component format

To setup Apache Pulsar pubsub create a component of type `pubsub.pulsar`. See [this guide]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}}) on how to create and apply a pubsub configuration. 有关 Apache Pulsar的更多信息 [请阅读文档](https://pulsar.apache.org/docs/en/concepts-overview/)

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pulsar-pubsub
spec:
  type: pubsub.pulsar
  version: v1
  metadata:
  - name: host
    value: "localhost:6650"
  - name: enableTLS
    value: "false"
  - name: tenant
    value: "public"
  - name: token
    value: "eyJrZXlJZCI6InB1bHNhci1wajU0cXd3ZHB6NGIiLCJhbGciOiJIUzI1NiJ9.eyJzd"
  - name: namespace
    value: "default"
  - name: persistent
    value: "true"
  - name: disableBatching
    value: "false"
  - name: <topic-name>.jsonschema # sets a json schema validation for the configured topic
    value: |
      {
        "type": "record",
        "name": "Example",
        "namespace": "test",
        "fields": [
          {"name": "ID","type": "int"},
          {"name": "Name","type": "string"}
        ]
      }
  - name: <topic-name>.avroschema # sets an avro schema validation for the configured topic
    value: |
      {
        "type": "record",
        "name": "Example",
        "namespace": "test",
        "fields": [
          {"name": "ID","type": "int"},
          {"name": "Name","type": "string"}
        ]
      }
```

## 元数据字段规范

<table spaces-before="0">
  <tr>
    <th>
      Field
    </th>
    
    <th align="center">
      必填
    </th>
    
    <th>
      详情
    </th>
    
    <th>
      示例
    </th>
  </tr>
  
  <tr>
    <td>
      host
    </td>
    
    <td align="center">
      是
    </td>
    
    <td>
      Address of the Pulsar broker. Default is <code>"localhost:6650"</code>
    </td>
    
    <td>
      <code>"localhost:6650"</code> OR <code>"http://pulsar-pj54qwwdpz4b-pulsar.ap-sg.public.pulsar.com:8080"</code>
    </td>
  </tr>
  
  <tr>
    <td>
      enableTLS
    </td>
    
    <td align="center">
      否
    </td>
    
    <td>
      启用TLS  默认值为 <code>"false"</code>
    </td>
    
    <td>
      <code>"true"</code>, <code>"false"</code>
    </td>
  </tr>
  
  <tr>
    <td>
      token
    </td>
    
    <td align="center">
      否
    </td>
    
    <td>
      启动身份验证
    </td>
    
    <td>
      <a href="https://pulsar.apache.org/docs/en/security-jwt/#generate-tokens">如何创建pulsar token</a>
    </td>
  </tr>
  
  <tr>
    <td>
      tenant
    </td>
    
    <td align="center">
      否
    </td>
    
    <td>
      实例中的主题租户。 租户对于 Pulsar 中的多租户至关重要，并且分布在集群中。  默认值： <code>“public”</code>
    </td>
    
    <td>
      <code>"public"</code>
    </td>
  </tr>
  
  <tr>
    <td>
      namespace
    </td>
    
    <td align="center">
      否
    </td>
    
    <td>
      将相关联的 topic 作为一个组来管理，是管理 Topic 的基本单元。  默认值为 <code>"default"</code>
    </td>
    
    <td>
      <code>"default"</code>
    </td>
  </tr>
  
  <tr>
    <td>
      persistent
    </td>
    
    <td align="center">
      否
    </td>
    
    <td>
      Pulsar supports two kinds of topics: <a href="https://pulsar.apache.org/docs/en/concepts-architecture-overview#persistent-storage">persistent</a> and <a href="https://pulsar.apache.org/docs/en/concepts-messaging/#non-persistent-topics">non-persistent</a>. 对于持久化的主题，所有的消息都会被持久化的保存到磁盘当中(如果 broker 不是单机模式，消息会被持久化到多块磁盘)，而非持久化的主题的数据不会被保存到磁盘里面。
    </td>
    
    <td>
    </td>
  </tr>
  
  <tr>
    <td>
      disableBatching
    </td>
    
    <td align="center">
      否
    </td>
    
    <td>
      disable batching.When batching enabled default batch delay is set to 10 ms and default batch size is 1000 messages,Setting <code>disableBatching: true</code> will make the producer to send messages individually. 默认值为 <code>"false"</code>
    </td>
    
    <td>
      <code>"true"</code>, <code>"false"</code>
    </td>
  </tr>
  
  <tr>
    <td>
      batchingMaxPublishDelay
    </td>
    
    <td align="center">
      否
    </td>
    
    <td>
      batchingMaxPublishDelay set the time period within which the messages sent will be batched,if batch messages are enabled. If set to a non zero value, messages will be queued until this time interval or  batchingMaxMessages (see below) or  batchingMaxSize (see below). 有两种有效的格式，一种是带有单位后缀格式的分数，另一种是以毫秒为单位处理的纯数字格式。 Valid time units are "ns", "us" (or "µs"), "ms", "s", "m", "h". Default: <code>"10ms"</code>
    </td>
    
    <td>
      <code>"10ms"</code>, <code>"10"</code>
    </td>
  </tr>
  
  <tr>
    <td>
      batchingMaxMessages
    </td>
    
    <td align="center">
      否
    </td>
    
    <td>
      batchingMaxMessages set the maximum number of messages permitted in a batch.If set to a value greater than 1, messages will be queued until this threshold is reached or  batchingMaxSize (see below) has been reached or the batch interval has elapsed. Default: <code>"1000"</code>
    </td>
    
    <td>
      <code>"1000"</code>
    </td>
  </tr>
  
  <tr>
    <td>
      batchingMaxSize
    </td>
    
    <td align="center">
      否
    </td>
    
    <td>
      batchingMaxSize sets the maximum number of bytes permitted in a batch. If set to a value greater than 1, messages will be queued until this threshold is reached or batchingMaxMessages (see above) has been reached or the batch interval has elapsed. Default: <code>"128KB"</code>
    </td>
    
    <td>
      <code>"131072"</code>
    </td>
  </tr>
  
  <tr>
    <td>
      <topic-name>.jsonschema
    </td>
    
    <td align="center">
      否
    </td>
    
    <td>
      Enforces JSON schema validation for the configured topic.
    </td>
    
    <td>
    </td>
  </tr>
  
  <tr>
    <td>
      <topic-name>.avroschema
    </td>
    
    <td align="center">
      否
    </td>
    
    <td>
      Enforces Avro schema validation for the configured topic.
    </td>
    
    <td>
    </td>
  </tr>
</table>

### Enabling message delivery retries

The Pulsar pub/sub component has no built-in support for retry strategies. This means that sidecar sends a message to the service only once and is not retried in case of failures. To make Dapr use more spohisticated retry policies, you can apply a [retry resiliency policy]({{< ref "policies.md#retries" >}}) to the MQTT pub/sub component. Note that it will be the same Dapr sidecar retrying the redelivery the message to the same app instance and not other instances.

### Delay queue

When invoking the Pulsar pub/sub, it's possible to provide an optional delay queue by using the `metadata` query parameters in the request url.

These optional parameter names are `metadata.deliverAt` or `metadata.deliverAfter`:

- `deliverAt`: Delay message to deliver at a specified time (RFC3339 format), e.g. `"2021-09-01T10:00:00Z"`
- `deliverAfter`: Delay message to deliver after a specified amount of time, e.g.`"4h5m3s"`

Examples:

```shell
curl -X POST http://localhost:3500/v1.0/publish/myPulsar/myTopic?metadata.deliverAt='2021-09-01T10:00:00Z' \
  -H "Content-Type: application/json" \
  -d '{
        "data": {
          "message": "Hi"
        }
      }'
```

Or

```shell
curl -X POST http://localhost:3500/v1.0/publish/myPulsar/myTopic?metadata.deliverAfter='4h5m3s' \
  -H "Content-Type: application/json" \
  -d '{
        "data": {
          "message": "Hi"
        }
      }'
```

## 创建 Pulsar 实例

{{< tabs "Self-Hosted" "Kubernetes">}}

{{% codetab %}}

```
docker run -it \
  -p 6650:6650 \
  -p 8080:8080 \
  --mount source=pulsardata,target=/pulsar/data \
  --mount source=pulsarconf,target=/pulsar/conf \
  apachepulsar/pulsar:2.5.1 \
  bin/pulsar standalone

```

{{% /codetab %}}

{{% codetab %}}
Refer to the following [Helm chart](https://pulsar.apache.org/docs/helm-overview) Documentation.
{{% /codetab %}}

{{< /tabs >}}

## 相关链接

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}})，了解配置 发布/订阅组件的说明
- [发布/订阅构建块]({{< ref pubsub >}})
