---
type: docs
title: "操作指南：为 Dapr sidecar 配置 Secret 环境变量"
linkTitle: "Secret 环境变量"
weight: 7500
description: "将 Kubernetes Secret 中的环境变量注入到 Dapr sidecar"
---

在某些情况下，Dapr sidecar 需要注入环境变量。这可能是因为某个组件、第三方库或模块需要通过环境变量进行配置或自定义行为。这在生产和非生产环境中都很有用。

## 概述

在 Dapr 1.15 中，引入了新的 `dapr.io/env-from-secret` 注解，[类似于 `dapr.io/env`]({{< ref arguments-annotations-overview >}})。通过这个注解，你可以将环境变量注入到 Dapr sidecar 中，其值来自于一个 secret。

### 注解格式

注解的格式如下：

- 单个键的 secret: `<ENV_VAR_NAME>=<SECRET_NAME>`
- 多个键/值的 secret: `<ENV_VAR_NAME>=<SECRET_NAME>:<SECRET_KEY>`

`<ENV_VAR_NAME>` 必须符合 `C_IDENTIFIER` 格式，遵循 `[A-Za-z_][A-Za-z0-9_]*` 的正则表达式：
- 必须以字母或下划线开头
- 其余部分可以包含字母、数字或下划线

由于 `secretKeyRef` 的限制，`name` 字段是必需的，因此 `name` 和 `key` 必须同时设置。[从 Kubernetes 文档的 "env.valueFrom.secretKeyRef.name" 部分了解更多信息。](https://kubernetes.io/docs/reference/kubernetes-api/workload-resources/pod-v1/#environment-variables) 在这种情况下，Dapr 会将两者设置为相同的值。

## 配置单个键的 secret 环境变量

在以下示例中，`dapr.io/env-from-secret` 注解被添加到 Deployment 中。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nodeapp
spec:
  template:
    metadata:
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "nodeapp"
        dapr.io/app-port: "3000"
        dapr.io/env-from-secret: "AUTH_TOKEN=auth-headers-secret"
    spec:
      containers:
      - name: node
        image: dapriosamples/hello-k8s-node:latest
        ports:
        - containerPort: 3000
        imagePullPolicy: Always
```

`dapr.io/env-from-secret` 注解的值为 `"AUTH_TOKEN=auth-headers-secret"` 被注入为：

```yaml
env:
- name: AUTH_TOKEN
  valueFrom:
    secretKeyRef:
      name: auth-headers-secret
      key: auth-headers-secret
```

这要求 secret 的 `name` 和 `key` 字段具有相同的值，即 "auth-headers-secret"。

**示例 secret**

> **注意：** 以下示例仅用于演示目的。不建议以明文存储 secret。

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: auth-headers-secret
type: Opaque
stringData:
  auth-headers-secret: "AUTH=mykey"
```

## 配置多个键的 secret 环境变量

在以下示例中，`dapr.io/env-from-secret` 注解被添加到 Deployment 中。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nodeapp
spec:
  template:
    metadata:
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "nodeapp"
        dapr.io/app-port: "3000"
        dapr.io/env-from-secret: "AUTH_TOKEN=auth-headers-secret:auth-header-value"
    spec:
      containers:
      - name: node
        image: dapriosamples/hello-k8s-node:latest
        ports:
        - containerPort: 3000
        imagePullPolicy: Always
```

`dapr.io/env-from-secret` 注解的值为 `"AUTH_TOKEN=auth-headers-secret:auth-header-value"` 被注入为：

```yaml
env:
- name: AUTH_TOKEN
  valueFrom:
    secretKeyRef:
      name: auth-headers-secret
      key: auth-header-value
```

**示例 secret**

> **注意：** 以下示例仅用于演示目的。不建议以明文存储 secret。

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: auth-headers-secret
type: Opaque
stringData:
  auth-header-value: "AUTH=mykey"
