---
type: docs
title: "Overview"
linkTitle: "Overview"
description: "General overview on set up of message brokers for Dapr Pub/Sub"
weight: 10000
---

Dapr integrates with pub/sub message buses to provide apps with the ability to create event-driven, loosely coupled architectures where producers send events to consumers via topics. It supports the configuration of multiple, named, pub/sub components *per application*. Each pub/sub component has a name and this name is used when publishing a message topic

Dapr supports the configuration of multiple, named, pub/sub components *per application*. Each pub/sub component has a name and this name is used when publishing a message topic. Read the [API reference]({{< ref pubsub_api.md >}}) for details on how to publish and subscribe to topics.

Supported pub/sub components Pub/Sub message buses are extensible and can be found in the [components-contrib repo](https://github.com/dapr/components-contrib).

## Component files

The type of pub/sub is determined by the `type` field, and things like connection strings and other metadata are put in the `.metadata` section. Even though you can put plain text secrets in there, it is recommended you use a [secret store]({{< ref component-secrets.md >}}) using a `secretKeyRef`

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub
  namespace: default
spec:
  type: pubsub.<NAME>
  version: v1
  metadata:
  - name: <KEY>
    value: <VALUE>
  - name: <KEY>
    value: <VALUE>
...
```

The type of pub/sub is determined by the `type` field, and properties such as connection strings and other metadata are put in the `.metadata` section. Even though metadata values can contain secrets in plain text, it is recommended you use a [secret store]({{< ref component-secrets.md >}}) using a `secretKeyRef`.

{{% alert title="Topic creation" color="primary" %}}
Depending on the pub/sub message bus you are using and how it is configured, topics may be created automatically. Even if the message bus supports automatic topic creation, it is a common governance practice to disable it in production environments. You may still need to use a CLI, admin console, or request form to manually create the topics required by your application.
{{% /alert %}}

Visit [this guide]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}}) for instructions on configuring pub/sub components.

## Related links

- A pub/sub in Dapr is described using a `Component` file:
- Try the [Pub/Sub quickstart sample](https://github.com/dapr/quickstarts/tree/master/pub-sub)
- Read the [guide on publishing and subscribing]({{< ref howto-publish-subscribe.md >}})
- Learn about [topic scoping]({{< ref pubsub-scopes.md >}})
- Learn about [message time-to-live]({{< ref pubsub-message-ttl.md >}})
- Learn [how to configure Pub/Sub components with multiple namespaces]({{< ref pubsub-namespaces.md >}})
- {{< ref supported-pubsub >}}
- Read the [API reference]({{< ref pubsub_api.md >}})
