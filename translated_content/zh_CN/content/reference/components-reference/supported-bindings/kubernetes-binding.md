---
type: docs
title: "Kubernetes Events绑定规范"
linkTitle: "Kubernetes 事件"
description: "Kubernetes 事件绑定组件详细说明"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/kubernetes-binding/"
---

## 配置

要设置 Kubernetes 事件绑定，请创建一个类型为 `bindings.kubernetes`的组件。 请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})，了解如何创建和应用绑定配置。


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
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

| 字段                | 必填 | 绑定支持 | 详情                                           | 示例      |
| ----------------- |:--:| ---- | -------------------------------------------- | ------- |
| namespace         | 是  | 输入   | 要从中读取事件的 Kubernetes 命名空间                     | `"默认值"` |
| resyncPeriodInSec | 否  | 输入   | 从 Kubernetes API 服务器刷新事件列表的时间周期。 默认值为 `"10"` | `"15"`  |

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
- 添加 ：仅填充 `newVal` 字段， `oldVal` 字段为空 `v1.Event`， `event` 被 `add`
- 删除 ：仅填充 `oldVal` 字段， `newVal` 字段为空 `v1.Event`， `event` 被 `delete`
- 更新 ： `oldVal` 和 `newVal` 字段都已填充，  `event` 被 `update`

## 所需权限

为了消费来自 `Kubernetes` 的事件，需要使用 Kubernetes 的 [RBAC Auth] 机制将权限分配给用户/组/服务帐户。

### 角色

其中一个规则需要采用以下格式，以授予 `get, watch` 和 `list` `events`权限。 API 组可以根据需要进行限制。

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: <NAMESPACE>
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
  namespace: <NAMESPACE> # same as above
subjects:
- kind: ServiceAccount
  name: default # or as need be, can be changed
  namespace: <NAMESPACE> # same as above
roleRef:
  kind: Role
  name: <ROLENAME> # same as the one above
  apiGroup: ""
```

## 相关链接

- [Dapr组件的基本格式]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过输入绑定触发应用]({{< ref howto-triggers.md >}})
- [如何处理: 使用绑定对接外部资源]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
