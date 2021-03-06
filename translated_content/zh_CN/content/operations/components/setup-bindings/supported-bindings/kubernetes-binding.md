---
type: docs
title: "Kubernetes Events binding spec"
linkTitle: "Kubernetes Events"
description: "Detailed documentation on the Kubernetes Events binding component"
---

## Component format

To setup Kubernetes Events binding create a component of type `bindings.kubernetes`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration. To setup Redis binding create a component of type `bindings.redis`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.


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

## Spec metadata fields

| 字段                | Required | Binding support                                                                                           | Details                                      | Example     |
| ----------------- |:--------:| --------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ----------- |
| namespace         |    Y     | Input                                                                                                     | The Kubernetes namespace to read events from | `"default"` |
| resyncPeriodInSec |    N     | Te period of time to refresh event list from Kubernetes API server. Defaults to `"10"` Defaults to `"10"` | `"15"`                                       |             |

## 相关链接

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

One of the rules need to be of the form as below to give permissions to `get, watch` and `list` `events`. API Groups can be as restrictive as needed. API Groups can be as restrictive as needed.

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

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [如何通过 input binding 触发应用]({{< ref howto-triggers.md >}})
- [How-To：使用绑定与外部资源进行交互]({{< ref howto-bindings.md >}})
- [绑定API 参考]({{< ref bindings_api.md >}})
