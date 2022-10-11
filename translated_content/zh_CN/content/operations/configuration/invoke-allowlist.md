---
type: docs
title: "指南：将访问控制列表配置应用于服务调用"
linkTitle: "服务调用访问控制"
weight: 4000
description: "限制应用程序可以通过“服务调用”在“被调用的应用程序”上执行什么操作"
---

访问控制可以通过配置策略来限制*调用*应用程序通过服务调用，可以对*被调用*的应用程序执行哪些操作。 如需限制来自调用应用程序的特定操作和 HTTP 请求方法访问被调用的应用程序，你可以在配置中定义访问控制策略规范。

访问控制策略在配置中指定，并被应用于*被调用* 应用程序的 Dapr sidecar。 示例访问策略如下所示，基于匹配的策略访问被调用的应用。 您可以为所有调用应用程序提供默认的全局操作，如果没有指定访问控制策略，则默认行为是允许所有调用应用程序访问被调用的应用程序。

观看这个[视频](https://youtu. be/j99RN_nxExA? t=1108) ，了解如何为服务调用设置访问控制列表。
<iframe width="688" height="430" src="https://www.youtube.com/embed/j99RN_nxExA?start=1108" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## 基础概念

**信任域** - “信任域”是用于管理信任关系的逻辑组。 每个应用程序都分配有一个信任域，可以在访问控制列表策略规范中指定。 如果未定义策略规范或指定了空信任域，则使用默认值 "public"。 此信任域用于在 TLS 证书中生成应用程序的标识。

**应用标识** - Dapr 需要通过 Sentry 服务来生成 [SPIFFE](https://spiffe.io/) id 给所有应用，并且这个 id 会附加在 TLS 证书中。 SPIFFE ID 的格式为： `**spiffe://\<trustdomain>/ns/\<namespace\>/\<appid\>**`。 对于匹配的策略，将从调用应用的 TLS 证书中的 SPIFFE ID 中提取调用应用的信任域、命名空间和应用 ID 值。 这些值与策略规范中指定的信任域、命名空间和应用程序 ID 值进行匹配。 如果这三者都匹配，则进一步匹配更具体的策略。

## 配置属性

下表列出了访问控制、策略和操作的不同属性：

### 访问控制

| 属性            | 数据类型   | 说明                             |
| ------------- | ------ | ------------------------------ |
| defaultAction | string | 没有其他策略匹配时的全局默认操作               |
| trustDomain   | string | 分配给应用程序的信任域。 默认值为 "public"。    |
| policies      | string | 用于确定调用应用程序可以对被调用的应用程序执行哪些操作的策略 |

### 策略

| 属性            | 数据类型   | 说明                               |
| ------------- | ------ | -------------------------------- |
| app           | string | 允许/拒绝服务调用的调用应用的 AppId            |
| namespace     | string | 需要与调用应用的命名空间匹配的命名空间值             |
| trustDomain   | string | 需要与调用应用的信任域匹配的信任域。 默认值为 "public" |
| defaultAction | string | 应用级别的默认操作，以防找到应用但未匹配特定操作         |
| operations    | string | 允许的从调用应用发起的操作                    |

### 操作

| 属性       | 数据类型   | 说明                                                                 |
| -------- | ------ | ------------------------------------------------------------------ |
| name     | string | 被调用应用上允许的操作的路径名。 通配符“\*”可用于在路径下匹配                                |
| httpVerb | list   | 列出调用应用程序可以使用的特定 http 请求方法。 通配符“\*”可用于匹配任何 http 请求方法。 不适用 grpc 调用 |
| action   | string | 访问修饰符。 接受的值为 "allow"（默认值）或 "deny"                                  |

## 策略规则

1. 如果未指定访问策略，则默认行为是允许所有应用访问被调用应用上的所有方法
2. 如果未指定全局默认操作，也没有定义特定于应用的策略，则空访问策略将被视为未指定访问策略，默认行为是允许所有应用访问被调用应用上的所有方法。
3. 如果未指定全局默认操作，但已定义了某些特定于应用的策略，则我们采用更安全的选项，即假定全局默认操作以拒绝访问被调用应用上的所有方法。
4. 如果定义了访问策略，并且无法验证传入的应用程序凭据，则全局默认操作将生效。
5. 如果传入应用的信任域或命名空间与应用策略中指定的值不匹配，则会忽略应用策略，并且全局默认操作将生效。

## 策略优先级

根据具体策略的匹配程度，对应的操作将按以下顺序生效：
1. HTTP 请求中特定 HTTP 请求方法或 GRPC 请求中操作级别操作。
2. 应用级别的默认操作
3. 全局级别的默认操作

## 示例

以下是使用访问控制列表进行服务调用的一些示例。 请参阅 [配置指南]({{< ref "configuration-concept.md" >}}) 以了解应用程序 sidecar 的可用配置设置。

<font size=5>方案1：拒绝访问所有应用，除非 trustDomain = public, namespace = default, appId = app1</font>

使用此配置时，将允许所有 appId = app1 的调用方法，并拒绝来自其他应用程序的所有其他调用请求

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  accessControl:
    defaultAction: deny
    trustDomain: "public"
    policies:
    - appId: app1
      defaultAction: allow
      trustDomain: 'public'
      namespace: "default"
```

<font size=5>方案2：拒绝访问所有应用，除非 trustDomain = public, namespace = default, appId = app1, operation = op1</font>

在这种配置下，只有来自 appId = app1 的 op1 方法被允许，所有来自其他应用程序的其他方法请求，包括 app1 上的其他方法，都将被拒绝。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  accessControl:
    defaultAction: deny
    trustDomain: "public"
    policies:
    - appId: app1
      defaultAction: deny
      trustDomain: 'public'
      namespace: "default"
      operations:
      - name: /op1
        httpVerb: ['*']
        action: allow
```

<font size=5>方案 3：拒绝访问所有应用，除非匹配 HTTP 的特定方法和 GRPC 的操作</font>

使用此配置时，只有以下的方案是允许访问的，并且来自所有其他应用（包括 app1 或 app2 上的其他方法）的所有不在方案内的方法请求都将被拒绝
* trustDomain = public, namespace = default, appID = app1, operation = op1, http verb = POST/PUT
* trustDomain = “myDomain”， namespace = “ns1”， appID = app2， operation = op2 并且应用程序协议是 GRPC ， 只允许来自 appId = app1 的的 HTTP POST/PUT 方法，并且拒绝来自所有其他应用（包括 app1 上的其他方法）以外的所有其他方法请求

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  accessControl:
    defaultAction: deny
    trustDomain: "public"
    policies:
    - appId: app1
      defaultAction: deny
      trustDomain: 'public'
      namespace: "default"
      operations:
      - name: /op1
        httpVerb: ['POST', 'PUT']
        action: allow
    - appId: app2
      defaultAction: deny
      trustDomain: 'myDomain'
      namespace: "ns1"
      operations:
      - name: /op2
        action: allow
```

<font size=5>方案 4：允许适用所有所有 HTTP method访问所有方法，除非 trustDomain = public、namespace = default、appId = app1、operation = /op1/*</font>

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  accessControl:
    defaultAction: allow
    trustDomain: "public"
    policies:
    - appId: app1
      defaultAction: allow
      trustDomain: 'public'
      namespace: "default"
      operations:
      - name: /op1/*
        httpVerb: ['*']
        action: deny
```

<font size=5>Scenario 5: Allow access to all methods for trustDomain = public, namespace = ns1, appId = app1 and deny access to all methods for trustDomain = public, namespace = ns2, appId = app1</font>

This scenario shows how applications with the same app ID but belonging to different namespaces can be specified

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  accessControl:
    defaultAction: allow
    trustDomain: "public"
    policies:
    - appId: app1
      defaultAction: allow
      trustDomain: 'public'
      namespace: "ns1"
    - appId: app1
      defaultAction: deny
      trustDomain: 'public'
      namespace: "ns2"
```

## Hello world examples
These examples show how to apply access control to the [hello world](https://github.com/dapr/quickstarts#quickstarts) quickstart samples where a python app invokes a node.js app. Access control lists rely on the Dapr [Sentry service]({{< ref "security-concept.md" >}}) to generate the TLS certificates with a SPIFFE id for authentication, which means the Sentry service either has to be running locally or deployed to your hosting enviroment such as a Kubernetes cluster.

The nodeappconfig example below shows how to **deny** access to the `neworder` method from the `pythonapp`, where the python app is in the `myDomain` trust domain and `default` namespace. The nodeapp is in the `public` trust domain.

**nodeappconfig.yaml**

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: nodeappconfig
spec:
  tracing:
    samplingRate: "1"
  accessControl:
    defaultAction: allow
    trustDomain: "public"
    policies:
    - appId: pythonapp
      defaultAction: allow
      trustDomain: 'myDomain'
      namespace: "default"
      operations:
      - name: /neworder
        httpVerb: ['POST']
        action: deny
```

**pythonappconfig.yaml**

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: pythonappconfig
spec:
  tracing:
    samplingRate: "1"
  accessControl:
    defaultAction: allow
    trustDomain: "myDomain"
```

### 自托管模式
This example uses the [hello world](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-world) quickstart.

The following steps run the Sentry service locally with mTLS enabled, set up necessary environment variables to access certificates, and then launch both the node app and python app each referencing the Sentry service to apply the ACLs.

 1. Follow these steps to run the [Sentry service in self-hosted mode]({{< ref "mtls.md" >}}) with mTLS enabled

 2. In a command prompt, set these environment variables:

    {{< tabs "Linux/MacOS" Windows >}}

    {{% codetab %}}
  ```bash
  export DAPR_TRUST_ANCHORS=`cat $HOME/.dapr/certs/ca.crt`
  export DAPR_CERT_CHAIN=`cat $HOME/.dapr/certs/issuer.crt`
  export DAPR_CERT_KEY=`cat $HOME/.dapr/certs/issuer.key`
  export NAMESPACE=default
  ```

    {{% /codetab %}}

   {{% codetab %}}
   ```powershell
   $env:DAPR_TRUST_ANCHORS=$(Get-Content $env:USERPROFILE\.dapr\certs\ca.crt)
   $env:DAPR_CERT_CHAIN=$(Get-Content $env:USERPROFILE\.dapr\certs\issuer.crt)
   $env:DAPR_CERT_KEY=$(Get-Content $env:USERPROFILE\.dapr\certs\issuer.key)
   $env:NAMESPACE="default"
   ```

    {{% /codetab %}}

    {{< /tabs >}}

3. Run daprd to launch a Dapr sidecar for the node.js app with mTLS enabled, referencing the local Sentry service:

   ```bash
   daprd --app-id nodeapp --dapr-grpc-port 50002 -dapr-http-port 3501 --log-level debug --app-port 3000 --enable-mtls --sentry-address localhost:50001 --config nodeappconfig.yaml
   ```

4. Run the node app in a separate command prompt:

   ```bash
   node app.js
   ```

5. In another command prompt, set these environment variables:

   {{< tabs "Linux/MacOS" Windows >}}

   {{% codetab %}}
   ```bash
   export DAPR_TRUST_ANCHORS=`cat $HOME/.dapr/certs/ca.crt`
   export DAPR_CERT_CHAIN=`cat $HOME/.dapr/certs/issuer.crt`
   export DAPR_CERT_KEY=`cat $HOME/.dapr/certs/issuer.key`
   export NAMESPACE=default
  ```
   {{% /codetab %}}

   {{% codetab %}}
   ```powershell
   $env:DAPR_TRUST_ANCHORS=$(Get-Content $env:USERPROFILE\.dapr\certs\ca.crt)
   $env:DAPR_CERT_CHAIN=$(Get-Content $env:USERPROFILE\.dapr\certs\issuer.crt)
   $env:DAPR_CERT_KEY=$(Get-Content $env:USERPROFILE\.dapr\certs\issuer.key)
   $env:NAMESPACE="default"
   ```
   {{% /codetab %}}

   {{< /tabs >}}

6. Run daprd to launch a Dapr sidecar for the python app with mTLS enabled, referencing the local Sentry service:

   ```bash
   daprd --app-id pythonapp   --dapr-grpc-port 50003 --metrics-port 9092 --log-level debug --enable-mtls --sentry-address localhost:50001 --config pythonappconfig.yaml
   ```

7. Run the python app in a separate command prompt:

   ```bash
   python app.py
   ```

8. You should see the calls to the node app fail in the python app command prompt based due to the **deny** operation action in the nodeappconfig file. Change this action to **allow** and re-run the apps and you should then see this call succeed.

### Kubernetes mode
This example uses the [hello kubernetes](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-kubernetes) quickstart.

You can create and apply the above configuration files `nodeappconfig.yaml` and `pythonappconfig.yaml` as described in the [configuration]({{< ref "configuration-concept.md" >}}) to the Kubernetes deployments.

For example, below is how the pythonapp is deployed to Kubernetes in the default namespace with this pythonappconfig configuration file. Do the same for the nodeapp deployment and then look at the logs for the pythonapp to see the calls fail due to the **deny** operation action set in the nodeappconfig file. Change this action to **allow** and re-deploy the apps and you should then see this call succeed.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pythonapp
  namespace: default
  labels:
    app: python
spec:
  replicas: 1
  selector:
    matchLabels:
      app: python
  template:
    metadata:
      labels:
        app: python
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "pythonapp"
        dapr.io/config: "pythonappconfig"
    spec:
      containers:
      - name: python
        image: dapriosamples/hello-k8s-python:edge
 ```  
