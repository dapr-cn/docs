---
type: docs
title: "Alibaba Cloud Log Storage Service binding spec"
linkTitle: "Alibaba Cloud Log Storage"
description: "Detailed documentation on the Alibaba Cloud Log Storage binding component"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/alicloudsls/"
---

## Component format

To setup an Alibaba Cloud SLS binding create a component of type `bindings.alicloud.sls`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.

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

## 元数据字段规范

| Field             | 必填 | 绑定支持   | 详情                           | 示例 |
| ----------------- | -- | ------ | ---------------------------- | -- |
| `AccessKeyID`     | 是  | Output | 访问密钥 ID 凭据。                  |    |
| `AccessKeySecret` | 是  | 输出     | Access key credential secret |    |
| `Endpoint`        | 是  | 输出     | Alicloud SLS endpoint.       |    |

## 绑定支持

该组件支持如下操作的 **输出绑定** ：
- `create`: [Create object](#create-object)


### Request format

To perform a log store operation, invoke the binding with a `POST` method and the following JSON body:

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

{{% alert title="Note" color="primary" %}}
Note, the value of "project"，"logstore"，"topic" and "source" property should provide in the metadata properties.
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

### Response format
As Alibaba Cloud SLS producer API is asynchronous, there is no response for this binding (there is no callback interface to accept the response of success or failure, only a record for failure any reason to the console log).

## 相关链接

- [绑定构建块]({{< ref bindings >}})
- [如何通过 input binding 触发应用]({{< ref howto-triggers.md >}})
- [How-To：使用绑定与外部资源进行交互]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
