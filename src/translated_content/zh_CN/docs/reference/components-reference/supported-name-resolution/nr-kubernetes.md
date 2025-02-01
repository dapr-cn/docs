---
type: docs
title: "Kubernetes DNS"
linkTitle: "Kubernetes DNS"
description: 详细介绍 Kubernetes DNS 名称解析组件
---

## 配置格式

一般情况下，[Kubernetes 模式]({{< ref kubernetes >}})下的 Kubernetes DNS 名称解析由 Dapr 自动配置。除非需要对 Kubernetes 名称解析组件进行特定的覆盖，否则无需额外配置即可使用 Kubernetes DNS 作为名称解析提供者。

如果需要进行覆盖，可以在 [Dapr 配置]({{< ref configuration-overview.md >}}) CRD 中，添加一个 `nameResolution` 规范，并将 `component` 字段设置为 `"kubernetes"`。其他配置字段可以根据需要在 `configuration` 映射中设置，如下所示。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  nameResolution:
    component: "kubernetes"
    configuration:
      clusterDomain: "cluster.local"  # 与 template 字段互斥
      template: "{{.ID}}-{{.Data.region}}.internal:{{.Port}}" # 与 clusterDomain 字段互斥
```

## 行为

该组件通过 Kubernetes 集群的 DNS 提供者来解析目标应用。您可以在 [Kubernetes 文档](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/)中了解更多信息。

## 规范配置字段

配置规范固定为 Consul API 的 v1.3.0 版本

| 字段        | 必需 | 类型 | 详情  | 示例 |
|--------------|:--------:|-----:|:---------|----------|
| clusterDomain       | N        | `string` | 用于解析地址的集群域。此字段与 `template` 字段互斥。| `cluster.local`
| template | N        | `string` | 使用 [text/template](https://pkg.go.dev/text/template#Template) 解析地址时的模板字符串。模板将由 [ResolveRequest](https://github.com/dapr/components-contrib/blob/release-{{% dapr-latest-version short="true" %}}/nameresolution/requests.go#L20) 结构中的字段填充。此字段与 `clusterDomain` 字段互斥。 | `{{.ID}}-{{.Data.region}}.{{.Namespace}}.internal:{{.Port}}`

## 相关链接

- [服务调用构建块]({{< ref service-invocation >}})
- [Kubernetes DNS 文档](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/)
