---
type: docs
title: "Cloudstate"
linkTitle: "Cloudstate"
description: 关于Cloudstate状态存储组件的详细信息
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-cloudstate/"
---

## 配置

要设置Cloudstate状态存储，请创建一个类型为`state.cloudstate`的组件。 请参阅[本指南]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}})，了解如何创建和应用状态存储配置。


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.cloudstate
  version: v1
  metadata:
  - name: host
    value: <REPLACE-WITH-HOST>
  - name: serverPort
    value: <REPLACE-WITH-PORT>
```

## 元数据字段规范

| 字段         | 必填 | 详情                                                       | Example            |
| ---------- |:--:| -------------------------------------------------------- | ------------------ |
| hosts      | Y  | 指定Cloudstate API 地址                                      | `"localhost:8013"` |
| serverPort | Y  | 指定要在 Dapr 中打开的 Cloudstate 回调端口。 这需要是你的应用程序或 Dapr 没有占用的端口 | `"8080"`           |

> 由于 Cloudstate 在 pod 中作为额外的sidecar运行，你可以通过 `localhost` 以默认端口 `8013` 访问它。

## 介绍

Cloudstate-Dapr 的独特之处在于，它使开发人员能够通过让 Cloudstate 作为 *紧邻* Dapr 的sidecar运行来实现高吞吐量、低延迟的场景，以此将状态保持在计算单元附近以获得最佳性能，同时提供可安全扩缩容的多个实例之间的复制能力。 这是由于Cloudstate在其边车之间形成了一个 Akka 集群，并在内存中复制实体。

Dapr 利用 Cloudstate 的 CRDT (无冲突可复制数据类型) 功能与last-write-wins的语义。

## 安装 Cloudstate

要在 Kubernetes 集群上安装 Cloudstate，请执行以下命令:

```
kubectl create namespace cloudstate
kubectl apply -n cloudstate -f https://github.com/cloudstateio/cloudstate/releases/download/v0.5.0/cloudstate-0.5.0.yaml
```

这会把 Cloudstate 安装到版本为 `0.5.0` 的 `cloudstate` 命名空间中。

## 应用配置

### 在Kubernetes中

要将Cloudstate状态存储应用到Kubernetes，请使用`kubectl` CLI。

```
kubectl apply -f cloudstate.yaml
```

## 注入 Cloudstate sidecar到 Dapr

下面的例子展示了如何将 Cloudstate 边车手动注入到启用了Dapr的deployment中。

*请注意，`cloudstate-sidecar`容器的`HTTP_PORT`是`host`中Cloudstate组件yaml中要使用的端口。*

```yaml
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  annotations:
  name: test-dapr-app
  namespace: default
  labels:
    app: test-dapr-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: test-dapr-app
  template:
    metadata:
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "testapp"
      labels:
        app: test-dapr-app
    spec:
      containers:
      - name: user-container
        image: nginx
      - name: cloudstate-sidecar
        env:
        - name: HTTP_PORT
          value: "8013"
        - name: USER_FUNCTION_PORT
          value: "8080"
        - name: REMOTING_PORT
          value: "2552"
        - name: MANAGEMENT_PORT
          value: "8558"
        - name: SELECTOR_LABEL_VALUE
          value: test-dapr-app
        - name: SELECTOR_LABEL
          value: app
        - name: REQUIRED_CONTACT_POINT_NR
          value: "1"
        - name: JAVA_OPTS
          value: -Xms256m -Xmx256m
        image: cloudstateio/cloudstate-proxy-no-store:0.5.0
        livenessProbe:
          httpGet:
            path: /alive
            port: 8558
            scheme: HTTP
          initialDelaySeconds: 2
          failureThreshold: 20
          periodSeconds: 2
        readinessProbe:
          httpGet:
            path: /ready
            port: 8558
            scheme: HTTP
          initialDelaySeconds: 2
          failureThreshold: 20
          periodSeconds: 10
        resources:
          limits:
            memory: 512Mi
          requests:
            cpu: 400m
            memory: 512Mi
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: cloudstate-pod-reader
  namespace: default
rules:
- apiGroups:
  - ""
  resources:
  - pods
  verbs:
  - get
  - watch
  - list

---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: cloudstate-read-pods-default
  namespace: default
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: cloudstate-pod-reader
subjects:
- kind: ServiceAccount
  name: default
```

## 相关链接
- [Dapr组件的基本格式]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) 以获取配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
