---
type: docs
title: "KubeMQ binding spec"
linkTitle: "KubeMQ"
description: "Detailed documentation on the KubeMQ binding component"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/kubemq/"
---

## Component format

To setup KubeMQ binding create a component of type `bindings.kubemq`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.


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
      value: localhost:50000
    - name: channel
      value: queue1
```

## 元数据字段规范

| Field              | 必填 | 详情                                                                                                                           | 示例                                     |
| ------------------ |:--:| ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| address            | 是  | Address of the KubeMQ server                                                                                                 | `"localhost:50000"`                    |
| channel            | 是  | The Queue channel name                                                                                                       | `queue1`                               |
| authToken          | 否  | Auth JWT token for connection. Check out [KubeMQ Authentication](https://docs.kubemq.io/learn/access-control/authentication) | `ew...`                                |
| autoAcknowledged   | 否  | Sets if received queue message is automatically acknowledged                                                                 | `true` or `false` (default is `false`) |
| pollMaxItems       | 否  | Sets the number of messages to poll on every connection                                                                      | `1`                                    |
| pollTimeoutSeconds | 否  | Sets the time in seconds for each poll interval                                                                              | `3600`                                 |

## 绑定支持

This component supports both **input and output** binding interfaces.


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
- [绑定构建块]({{< ref bindings >}})
- [如何通过 input binding 触发应用]({{< ref howto-triggers.md >}})
- [How-To：使用绑定与外部资源进行交互]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
