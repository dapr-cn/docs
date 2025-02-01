---
type: docs
title: "阿里云日志存储服务绑定指南"
linkTitle: "阿里云日志存储"
description: "关于阿里云日志存储绑定组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/alicloudsls/"
---

## 组件配置格式

要配置一个阿里云SLS绑定，请创建一个类型为`bindings.alicloud.sls`的组件。请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})以了解如何创建和应用绑定配置。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: alicloud.sls
spec:
  type: bindings.alicloud.sls
  version: v1
  metadata:
  - name: AccessKeyID
    value: "[accessKey-id]"
  - name: AccessKeySecret
    value: "[accessKey-secret]"
  - name: Endpoint
    value: "[endpoint]"
```

## 元数据字段说明

| 字段         | 必需 | 绑定支持  | 详情 | 示例 |
|---------------|----------|---------|---------|---------|
| `AccessKeyID`    | 是 | 输出 |  访问密钥ID凭证。 | 
| `AccessKeySecret` | 是 | 输出 | 访问密钥凭证secret |
| `Endpoint`   | 是 | 输出 | 阿里云SLS端点。  | 

## 绑定支持

该组件支持**输出绑定**，具有以下操作：

- `create`: [创建对象](#create-object)

### 请求格式

要执行日志存储操作，请使用`POST`方法调用绑定，并使用以下JSON主体：

```json
{
    "metadata":{
        "project":"your-sls-project-name",
        "logstore":"your-sls-logstore-name",
        "topic":"your-sls-topic-name",
        "source":"your-sls-source"
    },
    "data":{
        "custome-log-filed":"any other log info"
    },
    "operation":"create"
}
```

{{% alert title="注意" color="primary" %}}
请确保在元数据属性中提供"project"，"logstore"，"topic"和"source"的值。
{{% /alert %}}

#### 示例

{{< tabs "Windows" "Linux/MacOS" >}}

{{% codetab %}}

```bash
curl -X POST -H "Content-Type: application/json" -d "{\"metadata\":{\"project\":\"project-name\",\"logstore\":\"logstore-name\",\"topic\":\"topic-name\",\"source\":\"source-name\"},\"data\":{\"log-filed\":\"log info\"}" http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
```

{{% /codetab %}}

{{% codetab %}}

```bash
curl -X POST -H "Content-Type: application/json" -d '{"metadata":{"project":"project-name","logstore":"logstore-name","topic":"topic-name","source":"source-name"},"data":{"log-filed":"log info"}' http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
```

{{% /codetab %}}

{{< /tabs >}}

<br />

### 响应格式
由于阿里云SLS生产者API是异步的，因此此绑定没有直接响应（没有回调接口来接收成功或失败的响应，只有在失败时会记录到控制台日志）。

## 相关链接

- [bindings构建块]({{< ref bindings >}})
- [如何：使用输入绑定触发应用程序]({{< ref howto-triggers.md >}})
- [如何：使用bindings与外部资源接口]({{< ref howto-bindings.md >}})
- [bindings API参考]({{< ref bindings_api.md >}})
