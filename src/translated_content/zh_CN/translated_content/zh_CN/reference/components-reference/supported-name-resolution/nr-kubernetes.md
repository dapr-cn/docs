---
type: docs
title: "Kubernetes DNS 名称解析提供方规范"
linkTitle: "Kubernetes DNS"
description: 有关 Kubernetes DNS 名称解析组件的详细信息
---

## Configuration format

Generally, Kubernetes DNS name resolution is configured automatically in [Kubernetes mode]({{< ref kubernetes >}}) by Dapr. There is no configuration needed to use Kubernetes DNS as your name resolution provider unless some overrides are necessary for the Kubernetes name resolution component.

In the scenario that an override is required, within a [Dapr Configuration]({{< ref configuration-overview.md >}}) CRD, add a `nameResolution` spec and set the `component` field to `"kubernetes"`. The other configuration fields can be set as needed in a `configuration` map, as seen below.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  nameResolution:
    component: "kubernetes"
    configuration:
      clusterDomain: "cluster.local"  # Mutually exclusive with the template field
      template: "{{.ID}}-{{.Data.region}}.internal:{{.Port}}" # Mutually exclusive with the clusterDomain field
```

## 行为

该组件通过使用 Kubernetes 集群的 DNS 提供程序解析目标应用。 您可以在 [Kubernetes 文档](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/)中了解更多信息。

## Spec 配置字段

配置规格已固定为Consul api的v1.3.0版本

| Field         | Required |     数据类型 | 详情                                                                                                                                                                                                                                                                                                                                                                                                       | 示例                                                           |
| ------------- |:--------:| --------:|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| clusterDomain |    否     | `string` | The cluster domain to be used for resolved addresses. This field is mutually exclusive with the `template` file.                                                                                                                                                                                                                                                                                         | `cluster.local`                                              |
| template      |    否     | `string` | A template string to be parsed when addresses are resolved using [text/template](https://pkg.go.dev/text/template#Template) . The template will be populated by the fields in the [ResolveRequest](https://github.com/dapr/components-contrib/blob/release-{{% dapr-latest-version short="true" %}}/nameresolution/requests.go#L20) struct. This field is mutually exclusive with `clusterDomain` field. | `{{.ID}}-{{.Data.region}}.{{.Namespace}}.internal:{{.Port}}` |


## 相关链接

- [服务调用构建块]({{< ref service-invocation >}})
- [Kubernetes DNS 文档](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/)