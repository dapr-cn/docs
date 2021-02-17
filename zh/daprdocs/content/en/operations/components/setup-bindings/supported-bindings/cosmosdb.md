---
type: docs
title: "Azure CosmosDB binding spec"
linkTitle: "Azure CosmosDB"
description: "Detailed documentation on the Azure CosmosDB binding component"
---

## Setup Dapr component

To setup Azure CosmosDB binding create a component of type `bindings.azure.cosmosdb`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.azure.cosmosdb
  version: v1
  metadata:
  - name: url
    value: https://******.documents.azure.com:443/
  - name: masterKey
    value: *****
  - name: database
    value: db
  - name: collection
    value: collection
  - name: partitionKey
    value: message
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Output Binding Supported Operations

| Field        | Required | Binding support | Details                                                                     | Example                                     |
| ------------ |:--------:| --------------- | --------------------------------------------------------------------------- | ------------------------------------------- |
| url          |    Y     | Output          | `url` is the CosmosDB url.                                                  | `"https://******.documents.azure.com:443/"` |
| masterKey    |    Y     | Output          | `masterKey` is the CosmosDB account master key.                             | `"master-key"`                              |
| database     |    Y     | Output          | `database` is the name of the CosmosDB database.                            | `"OrderDb"`                                 |
| collection   |    Y     | Output          | `collection` is name of the collection inside the database.                 | `"Orders"`                                  |
| partitionKey |    Y     | Output          | `partitionKey` is the name of the partitionKey to extract from the payload. | `"OrderId"`, `"message"`                    |

For more information see [Azure Cosmos DB resource model](https://docs.microsoft.com/en-us/azure/cosmos-db/account-databases-containers-items).

## Binding support

This component supports **output binding** with the following operations:

- `create`

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [How-To: Trigger application with input binding]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})
