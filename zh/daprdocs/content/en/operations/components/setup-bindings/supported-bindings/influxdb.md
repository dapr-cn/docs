---
type: docs
title: "InfluxDB binding spec"
linkTitle: "InfluxDB"
description: "Detailed documentation on the InfluxDB binding component"
---

## Setup Dapr component

To setup InfluxDB binding create a component of type `bindings.influx`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.influx
  version: v1
  metadata:
  - name: url # Required
    value: <INFLUX-DB-URL>
  - name: token # Required
    value: <TOKEN>
  - name: org # Required
    value: <ORG>
  - name: bucket # Required
    value: <BUCKET>
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Output Binding Supported Operations

| Field  | Required | Binding support | Details                                                               | Example                   |
| ------ |:--------:| --------------- | --------------------------------------------------------------------- | ------------------------- |
| url    |    Y     | Output          | `url` is the URL for the InfluxDB instance. eg. http://localhost:8086 | `"http://localhost:8086"` |
| token  |    Y     | Output          | `token` is the authorization token for InfluxDB.                      | `"mytoken"`               |
| org    |    Y     | Output          | `org` is the InfluxDB organization.                                   | `"myorg"`                 |
| bucket |    Y     | Output          | `bucket` bucket name to write to.                                     | `"mybucket"`              |

## Binding support

This component supports **output binding** with the following operations:

- `create`

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [How-To: Trigger application with input binding]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})
