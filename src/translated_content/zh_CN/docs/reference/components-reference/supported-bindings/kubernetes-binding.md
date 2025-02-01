---
type: docs
title: "Kubernetes Events 绑定指南"
linkTitle: "Kubernetes Events"
description: "详细介绍 Kubernetes Events 绑定组件的文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/kubernetes-binding/"
---

## 组件格式

为了配置 Kubernetes Events 绑定，需要创建一个类型为 `bindings.kubernetes` 的组件。请参考[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})了解如何创建和应用绑定配置。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: bindings.kubernetes
  version: v1
  metadata:
  - name: namespace
    value: "<NAMESPACE>"
  - name: resyncPeriodInSec
    value: "<seconds>"
  - name: direction
    value: "input"
```

## 元数据字段说明

| 字段              | 必需 | 绑定支持 |  详情 | 示例 |
|--------------------|:--------:|------------|-----|---------|
| `namespace` | 是 | 输入  | 要读取事件的 Kubernetes 命名空间 | `"default"` |
| `resyncPeriodInSec` | 否 | 输入 | 从 Kubernetes API 服务器刷新事件列表的时间间隔，默认为 `"10"` 秒 | `"15"`
| `direction` | 否 | 输入 | 绑定的方向 | `"input"`
| `kubeconfigPath` | 否 | 输入 | kubeconfig 文件的路径。如果未指定，将使用默认的集群内配置 | `"/path/to/kubeconfig"`

## 绑定支持

此组件支持**输入**绑定接口。

## 输出格式

从绑定接收到的输出格式为 `bindings.ReadResponse`，其中 `Data` 字段包含以下结构：

```json
 {
   "event": "",
   "oldVal": {
     "metadata": {
       "name": "hello-node.162c2661c524d095",
       "namespace": "kube-events",
       "selfLink": "/api/v1/namespaces/kube-events/events/hello-node.162c2661c524d095",
       ...
     },
     "involvedObject": {
       "kind": "Deployment",
       "namespace": "kube-events",
       ...
     },
     "reason": "ScalingReplicaSet",
     "message": "Scaled up replica set hello-node-7bf657c596 to 1",
     ...
   },
   "newVal": {
     "metadata": { "creationTimestamp": "null" },
     "involvedObject": {},
     "source": {},
     "firstTimestamp": "null",
     "lastTimestamp": "null",
     "eventTime": "null",
     ...
   }
 }
```
事件类型有三种：
- Add : 只有 `newVal` 字段有值，`oldVal` 字段为空的 `v1.Event`，`event` 为 `add`
- Delete : 只有 `oldVal` 字段有值，`newVal` 字段为空的 `v1.Event`，`event` 为 `delete`
- Update : `oldVal` 和 `newVal` 字段都有值，`event` 为 `update`

## 所需权限

要从 Kubernetes 获取 `events`，需要通过 Kubernetes 的 [RBAC 授权] 机制为用户/组/服务账户分配权限。

### 角色

需要以下形式的规则之一来授予 `get, watch` 和 `list` `events` 的权限。API 组可以根据需要进行限制。

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: <ROLENAME>
rules:
- apiGroups: [""]
  resources: ["events"]
  verbs: ["get", "watch", "list"]
```

### 角色绑定

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: <NAME>
subjects:
- kind: ServiceAccount
  name: default # 或根据需要更改
roleRef:
  kind: Role
  name: <ROLENAME> # 与上面相同
  apiGroup: ""
```

## 相关链接

- [Dapr 组件的基本架构]({{< ref component-schema >}})
- [Bindings 构建块]({{< ref bindings >}})
- [如何：使用输入绑定触发应用程序]({{< ref howto-triggers.md >}})
- [如何：使用绑定与外部资源接口]({{< ref howto-bindings.md >}})
- [Bindings API 参考]({{< ref bindings_api.md >}})
```
This translation aims to improve readability and align with Chinese expression habits while maintaining the technical accuracy of the original conte