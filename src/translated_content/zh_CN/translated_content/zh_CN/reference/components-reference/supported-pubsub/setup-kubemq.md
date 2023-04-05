---
type: docs
title: "KubeMQ"
linkTitle: "KubeMQ"
description: "Detailed documentation on the KubeMQ pubsub component"
aliases:
  - "/zh-hans/operations/components/setup-pubsub/supported-pubsub/setup-kubemq/"
---

## Component format

To setup KubeMQ pub/sub, create a component of type `pubsub.kubemq`. See [this guide]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}}) on how to create and apply a pub/sub configuration.

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
```

## 元数据字段规范

| Field             | 必填 | 详情                                                                                                                          | 示例                                     |
| ----------------- |:--:| --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| address           | 是  | Address of the KubeMQ server                                                                                                | `"localhost:50000"`                    |
| store             | 否  | type of pubsub, true: pubsub persisted (EventsStore), false: pubsub in-memory (Events)                                      | `true` or `false` (default is `false`) |
| clientID          | 否  | Name for client id connection                                                                                               | `sub-client-12345`                     |
| authToken         | 否  | Auth JWT token for connection Check out [KubeMQ Authentication](https://docs.kubemq.io/learn/access-control/authentication) | `ew...`                                |
| group             | 否  | Subscriber group for load balancing                                                                                         | `g1`                                   |
| disableReDelivery | 否  | Set if message should be re-delivered in case of error coming from application                                              | `true` or `false` (default is `false`) |

## Create a KubeMQ broker

{{< tabs "Self-Hosted" "Kubernetes">}}

{{% codetab %}}
1. Obtain KubeMQ Key by visiting [https://account.kubemq.io/login/register](https://account.kubemq.io/login/register) and register for a key.
2. Wait for an email confirmation with your Key

You can run a KubeMQ broker with Docker:

```bash
docker run -d -p 8080:8080 -p 50000:50000 -p 9090:9090 -e KUBEMQ_TOKEN=<your-key> kubemq/kubemq
```
You can then interact with the server using the client port: `localhost:50000`

{{% /codetab %}}

{{% codetab %}}
1. Obtain KubeMQ Key by visiting [https://account.kubemq.io/login/register](https://account.kubemq.io/login/register) and register for a key.
2. Wait for an email confirmation with your Key

Then Run the following kubectl commands:

```bash
kubectl apply -f https://deploy.kubemq.io/init
```

```bash
kubectl apply -f https://deploy.kubemq.io/key/<your-key>
```
{{% /codetab %}}

{{< /tabs >}}

## Install KubeMQ CLI
Go to [KubeMQ CLI](https://github.com/kubemq-io/kubemqctl/releases) and download the latest version of the CLI.

## Browse KubeMQ Dashboard

{{< tabs "Self-Hosted" "Kubernetes">}}

{{% codetab %}}
<!-- IGNORE_LINKS -->
Open a browser and navigate to [http://localhost:8080](http://localhost:8080)
<!-- END_IGNORE -->
{{% /codetab %}}

{{% codetab %}}
With KubeMQCTL installed, run the following command:

```bash
kubemqctl get dashboard
```
Or, with kubectl installed, run port-forward command:

```bash
kubectl port-forward svc/kubemq-cluster-api -n kubemq 8080:8080
```
{{% /codetab %}}

{{< /tabs >}}


## KubeMQ Documentation
Visit [KubeMQ Documentation](https://docs.kubemq.io/) for more information.


## 相关链接

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}})，了解配置 发布/订阅组件的说明
- [Pub/sub building block]({{< ref pubsub >}})
