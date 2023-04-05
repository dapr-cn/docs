---
type: docs
title: "Kubernetes Events绑定规范"
linkTitle: "Kubernetes Events"
description: "Kubernetes 事件绑定组件详细说明"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/kubernetes-binding/"
---

## Component format

To setup Kubernetes Events binding create a component of type `bindings.kubernetes`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.


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
    value: <NAMESPACE>
  - name: resyncPeriodInSec
    value: "<seconds>"
```

## 元数据字段规范

| Field             | 必填 | 绑定支持  | 详情                                                  | 示例          |
| ----------------- |:--:| ----- | --------------------------------------------------- | ----------- |
| namespace         | 是  | Input | The Kubernetes namespace to read events from        | `"default"` |
| resyncPeriodInSec | 否  | Input | 从 Kubernetes API 服务器刷新事件列表的时间周期。 Defaults to `"10"` | `"15"`      |

## 绑定支持

此组件支持 **输入** 绑定接口。

## 输出格式

从绑定中收到的输出是格式 `bindings.ReadResponse`, 包含 `Data` 字段包含以下结构：

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
有三种不同的事件类型可供选择：
- Add : Only the `newVal` field is populated, `oldVal` field is an empty `v1.Event`, `event` is `add`
- Delete : Only the `oldVal` field is populated, `newVal` field is an empty `v1.Event`, `event` is `delete`
- Update : Both the `oldVal` and `newVal` fields are populated,  `event` is `update`

## 所需权限

为了消费来自 `Kubernetes` 的事件，需要使用 Kubernetes 的 [RBAC Auth] 机制将权限分配给用户/组/服务帐户。

### Role

其中一个规则需要采用以下格式，以授予 `get, watch` 和 `list` `events`权限。 API 组可以根据需要进行限制。

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
  name: default # or as need be, can be changed
roleRef:
  kind: Role
  name: <ROLENAME> # same as the one above
  apiGroup: ""
```

## 相关链接

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过 input binding 触发应用]({{< ref howto-triggers.md >}})
- [How-To：使用绑定与外部资源进行交互]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
