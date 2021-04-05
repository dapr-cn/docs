---
type: docs
title: "Kubernetes Events binding spec"
linkTitle: "Kubernetes 事件"
description: "Detailed documentation on the Kubernetes Events binding component"
---

## 配置

To setup Kubernetes Events binding create a component of type `bindings.kubernetes`. 请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})，了解如何创建和应用绑定配置。


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
    vale: "<seconds>"
```

## 元数据字段规范

| 字段                | 必填 | 绑定支持                                                                                   | 详情                                           | 示例          |
| ----------------- |:--:| -------------------------------------------------------------------------------------- | -------------------------------------------- | ----------- |
| namespace         | 是  | 输入                                                                                     | The Kubernetes namespace to read events from | `"default"` |
| resyncPeriodInSec | N  | Te period of time to refresh event list from Kubernetes API server. Defaults to `"10"` | `"15"`                                       |             |

## 绑定支持

This component supports **input** binding interface.

## Output format

Output received from the binding is of format `bindings.ReadResponse` with the `Data` field populated with the following structure:

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
Three different event types are available:
- Add : Only the `newVal` field is populated, `oldVal` field is an empty `v1.Event`, `event` is `add`
- Delete : Only the `oldVal` field is populated, `newVal` field is an empty `v1.Event`, `event` is `delete`
- Update : Both the `oldVal` and `newVal` fields are populated,  `event` is `update`

## Required permissions

For consuming `events` from Kubernetes, permissions need to be assigned to a User/Group/ServiceAccount using [RBAC Auth] mechanism of Kubernetes.

### Role

One of the rules need to be of the form as below to give permissions to `get, watch` and `list` `events`. API Groups can be as restrictive as needed.

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

### RoleBinding

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
- [绑定API 参考]({{< ref bindings_api.md >}})
