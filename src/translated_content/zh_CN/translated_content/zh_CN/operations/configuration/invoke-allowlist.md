---
type: docs
title: "How-To: Apply access control list configuration for service invocation"
linkTitle: "Service Invocation access control"
weight: 4000
description: "Restrict what operations *calling* applications can perform, via service invocation, on the *called* application"
---

Access control enables the configuration of policies that restrict what operations *calling* applications can perform, via service invocation, on the *called* application. To limit access to a called applications from specific operations and HTTP verbs from the calling applications, you can define an access control policy specification in configuration.

访问控制策略在配置中指定，并被应用于*被调用* 应用程序的 Dapr sidecar。 示例访问策略如下所示，基于匹配的策略访问被调用的应用。 您可以为所有调用应用程序提供默认的全局操作，如果未指定访问控制策略，则默认行为是允许所有调用应用程序访问被调用的应用程序。

## 概念

**TrustDomain** - "信任域"是用于管理信任关系的逻辑组。 每个应用程序都分配有一个信任域，可以在访问控制列表策略规范中指定。 如果未定义策略规范或指定了空信任域，则使用默认值 "public"。 此信任域用于在 TLS 证书中生成应用程序的标识。

**App Identity** - Dapr 需要 Sentry 服务来生成 [SPIFFE](https://spiffe.io/) id 给所有应用，并且这个 id 会附加在 TLS 证书中。 SPIFFE id 的格式为：`**spiffe://\&#060;trustdomain&#062;/ns/\&#060;namespace\&#062;/\&#060;appid\&#062;**`.  对应的规范中，信任域，命名空间 和 app ID 会从 SPIFFE id 的 TLS 证书中提取出来。   这些值会对应上规范中相应的值.。 如果这三者都匹配，则进一步匹配更具体的策略。

## 配置属性

下表列出了访问控制、策略和操作的不同属性：

### Access Control

| Property      | 数据类型   | 说明                                                                             |
| ------------- | ------ | ------------------------------------------------------------------------------ |
| defaultAction | string | Global default action when no other policy is matched                          |
| trustDomain   | string | Trust domain assigned to the application. Default is "public".                 |
| policies      | string | Policies to determine what operations the calling app can do on the called app |

### 策略

| Property      | 数据类型   | 说明                                                             |
| ------------- | ------ | -------------------------------------------------------------- |
| app           | string | AppId of the calling app to allow/deny service invocation from |
| namespace     | string | 需要与调用应用的命名空间匹配的命名空间值                                           |
| trustDomain   | string | 需要与调用应用的信任域匹配的信任域。 默认值为 "public"                               |
| defaultAction | string | 应用级别的默认操作，以防找到应用但未匹配特定操作                                       |
| operations    | string | 允许的从调用应用发起的操作                                                  |

### 操作

| Property | 数据类型   | 说明                                                                                                                                                                 |
| -------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| name     | string | Path name of the operations allowed on the called app. Wildcard "\*" can be used in a path to match. Wildcard "\**" can be used to match under multiple paths. |
| httpVerb | list   | 列出调用应用程序可以使用的特定 http 请求方法。 通配符“\*”可用于匹配任何 http 请求方法。 Unused for grpc invocation.                                                                                 |
| action   | string | 访问修饰符。 接受的值为 "allow"（默认值）或 "deny"                                                                                                                                  |

## 策略规则

1. If no access policy is specified, the default behavior is to allow all apps to access to all methods on the called app
2. If no global default action is specified and no app specific policies defined, the empty access policy is treated like no access policy specified and the default behavior is to allow all apps to access to all methods on the called app.
3. If no global default action is specified but some app specific policies have been defined, then we resort to a more secure option of assuming the global default action to deny access to all methods on the called app.
4. If an access policy is defined and if the incoming app credentials cannot be verified, then the global default action takes effect.
5. If either the trust domain or namespace of the incoming app do not match the values specified in the app policy, the app policy is ignored and the global default action takes effect.

## 策略优先级

与匹配的最具体策略对应的操作将按以下顺序生效：
1. Specific HTTP verbs in the case of HTTP or the operation level action in the case of GRPC.
2. 应用级别的默认操作
3. 全局级别的默认操作

## 示例

以下是使用访问控制列表进行服务调用的一些示例方案。 请参阅 [配置指南]({{< ref "configuration-concept.md" >}}) 以了解应用程序 sidecar 的可用配置设置。

<font size=5>Scenario 1: Deny access to all apps except where trustDomain = public, namespace = default, appId = app1</font>

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

在这种配置下，只有来自 appId = app1 的方法 op1 被允许，来自所有其他应用程序的所有其他方法请求，包括 app1 上的其他方法，都被拒绝。

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

使用此配置时，以下唯一方案是允许访问的，并且来自所有其他应用（包括 app1 或 app2 上的其他方法）的所有其他方法请求都将被拒绝
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

<font size=5>方案 5：允许访问 trustDomain = public、namespace = ns1、appId = app1 的所有方法，并拒绝访问 trustDomain = public、namespace = ns2、appId = app1 的所有方法</font>

此方案显示如何指定具有相同应用 ID 但属于不同命名空间的应用程序

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

<font size=5>方案 6：允许访问除 trustDomain = public、namespace = default、appId = app1、operation =/op1/**/a之外的所有方法，所有 http verbs</font>

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
      - name: /op1/**/a
        httpVerb: ['*']
        action: deny
```

## Hello world 示例

这些示例演示如何将访问控制应用于 [hello world](https://github.com/dapr/quickstarts#quickstarts) 快速入门示例，其中 python 应用调用 node.js 应用。 访问控制列表依赖于 Dapr [Sentry 服务]({{< ref "security-concept.md" >}}) 来生成具有 SPIFFE ID 进行身份验证的 TLS 证书，这意味着 Sentry 服务必须在本地运行或部署到您的托管环境（如 Kubernetes 集群）。

下面的 nodeappconfig 示例显示了如何 **拒绝** 从 `pythonapp`访问 `neworder` 方法，其中 python 应用位于 `myDomain` 信任域中，并且命名空间为 `default` 。 nodeapp 位于 `public` 信任域中。

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
此示例使用 [hello world](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-world/README.md) 快速入门。

以下步骤在启用 mTLS 的情况下在本地运行 Sentry 服务，设置必要的环境变量以访问证书，然后启动节点应用和 python 应用，每个应用都引用 Sentry 服务来应用 ACL。

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
   $env:DAPR_TRUST_ANCHORS=$(Get-Content -raw $env:USERPROFILE\.dapr\certs\ca.crt)
   $env:DAPR_CERT_CHAIN=$(Get-Content -raw $env:USERPROFILE\.dapr\certs\issuer.crt)
   $env:DAPR_CERT_KEY=$(Get-Content -raw $env:USERPROFILE\.dapr\certs\issuer.key)
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
   $env:DAPR_TRUST_ANCHORS=$(Get-Content -raw $env:USERPROFILE\.dapr\certs\ca.crt)
   $env:DAPR_CERT_CHAIN=$(Get-Content -raw $env:USERPROFILE\.dapr\certs\issuer.crt)
   $env:DAPR_CERT_KEY=$(Get-Content -raw $env:USERPROFILE\.dapr\certs\issuer.key)
   $env:NAMESPACE="default"
  ```
   {{% /codetab %}}

   {{< /tabs >}}

6. Run daprd to launch a Dapr sidecar for the python app with mTLS enabled, referencing the local Sentry service:

   ```bash
   daprd --app-id pythonapp   --dapr-grpc-port 50003 --metrics-port 9092 --log-level debug --enable-mtls --sentry-address localhost:50001 --config pythonappconfig.yaml
   ```

7. 在单独的命令提示符下运行 python 应用：

   ```bash
   python app.py
   ```

8. 你应该看到，由于 nodeappconfig 文件中的 **deny** 操作动作，在基于 python 应用程序的命令提示中，对 node 应用程序的调用失败。 将此操作更改为 **allow** 并重新运行应用，然后应看到此调用成功。

### Kubernetes 模式
此示例使用 [hello kubernetes](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-kubernetes/README.md) 快速入门。

您可以创建并应用上述配置文件 `nodeappconfig.yaml` 和 `pythonconfig.yaml` 由 [configuration]({{< ref "configuration-concept.md" >}}) 描述到 Kubernetes 部署。

例如，以下是通过这个 pythonappconfig 配置文件将 pythonapp 部署到 Kubernetes 的默认命名空间中。 部署 nodeapp，然后查看 pythonapp 的日志，您会发现由于 nodeappconfig 文件中的 action **deny** Post 请求的设置，pythonapp 的请求失败了。 将 action 改为 **allow** 之后再部署 app，您会发现请求又会成功了。

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

## 社区电话会议演示
观看这个[视频](https://youtu. be/j99RN_nxExA? t=1108) ，了解如何为服务调用应用访问控制列表。

<div class="embed-responsive embed-responsive-16by9">
<iframe width="688" height="430" src="https://www.youtube-nocookie.com/embed/j99RN_nxExA?start=1108" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>