---
type: docs
title: "如何：将访问控制列表配置应用于服务调用"
linkTitle: "服务调用访问控制"
weight: 4000
description: "限制应用程序可以通过服务调用在\"调用\"应用程序上执行什么操作"
---

访问控制可以配置策略，限制*调用*应用程序可以通过服务调用对*被调用*应用程序执行哪些操作。 为了限制来自调用应用程序的特定操作和HTTP verbs 对被调用应用程序的访问，你可以在配置中定义一个访问控制策略规范。

访问控制策略在配置中指定，并应用于 Dapr sidecar </em> 被调用*的应用程序。 示例访问策略如下所示，对被调用应用的访问基于匹配的策略操作。 您可以为所有调用应用程序提供默认的全局操作，如果未指定访问控制策略，则默认行为是允许所有调用应用程序访问被调用的应用程序。</p>

## 基础概念

**TrustDomain** - "信任域"是用于管理信任关系的逻辑组。 每个应用程序都分配有一个信任域，可以在访问控制列表策略规范中指定。 如果未定义策略规范或指定了空信任域，则使用默认值"public"。 此信任域用于在 TLS 证书中生成应用程序的标识。

**App Identity** - Dapr requests the sentry service to generate a [SPIFFE](https://spiffe.io/) id for all applications and this id is attached in the TLS cert. The SPIFFE id is of the format: `**spiffe://\<trustdomain>/ns/\<namespace\>/\<appid\>**`. For matching policies, the trust domain, namespace and app ID values of the calling app are extracted from the SPIFFE id in the TLS cert of the calling app. These values are matched against the trust domain, namespace and app ID values specified in the policy spec. If all three of these match, then more specific policies are further matched. The SPIFFE id is of the format: `**spiffe://\<trustdomain>/ns/\<namespace\>/\<appid\>**`. For matching policies, the trust domain, namespace and app ID values of the calling app are extracted from the SPIFFE id in the TLS cert of the calling app. These values are matched against the trust domain, namespace and app ID values specified in the policy spec. If all three of these match, then more specific policies are further matched. The SPIFFE id is of the format: `**spiffe://\<trustdomain>/ns/\<namespace\>/\<appid\>**`. For matching policies, the trust domain, namespace and app ID values of the calling app are extracted from the SPIFFE id in the TLS cert of the calling app. These values are matched against the trust domain, namespace and app ID values specified in the policy spec. If all three of these match, then more specific policies are further matched.

## 配置属性

下表列出了访问控制、策略和操作的不同属性：

### Access Control

| 属性            | 数据类型   | 说明                             |
| ------------- | ------ | ------------------------------ |
| defaultAction | string | 没有其他策略匹配时的全局默认操作               |
| trustDomain   | string | 分配给应用程序的信任域。 默认值为"public"。     |
| policies      | string | 用于确定调用应用程序可以对被调用的应用程序执行哪些操作的策略 |

### Policies

| 属性            | 数据类型   | 说明                              |
| ------------- | ------ | ------------------------------- |
| app           | string | 允许/拒绝服务调用的调用应用的AppId            |
| namespace     | string | 需要与调用应用的命名空间匹配的命名空间值            |
| trustDomain   | string | 需要与调用应用的信任域匹配的信任域。 默认值为"public" |
| defaultAction | string | 应用级别的默认操作，以防找到应用但未匹配特定操作        |
| operations    | string | 从调用应用允许的操作                      |

### Operations

| 属性       | 数据类型   | 说明                                                                  |
| -------- | ------ | ------------------------------------------------------------------- |
| name     | string | 被调用应用上允许的操作的路径名。 通配符"\*"可用于在匹配路径                                  |
| httpVerb | list   | 列出调用应用程序可以使用的特定http verbs。 通配符"\*"可用于匹配任何 http verbs。 不用于 grpc 调用 |
| action   | string | 访问修饰符。 接受的值"允许"（默认值）或"拒绝"                                           |

## 策略规则

1. 如果未指定访问策略，则默认行为是允许所有应用访问被调用应用上的所有方法
2. 如果未指定全局默认操作，也没有定义特定于应用的策略，则空访问策略将被视为未指定访问策略，默认行为是允许所有应用访问被调用应用上的所有方法。
3. 如果未指定全局默认操作，但已定义了某些特定于应用的策略，则我们采用更安全的选项，即假定全局默认操作以拒绝访问被调用应用上的所有方法。
4. 如果定义了访问策略，并且无法验证传入的应用程序凭据，则全局默认操作将生效。
5. 如果传入应用的信任域或命名空间与应用策略中指定的值不匹配，则会忽略应用策略，并且全局默认操作将生效。

## 策略优先级

与匹配的最具体策略对应的操作将按以下顺序生效：
1. HTTP 情况下的特定 HTTP verbs 或 GRPC 情况下的操作级别操作。
2. 应用级别的默认操作
3. 全局级别的默认操作

## 示例方案

以下是使用访问控制列表进行服务调用的一些示例方案。 请参阅 [配置指南]({{< ref "configuration-concept.md" >}}) 以了解应用程序 sidecar 的可用配置设置。

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

<font size=5>方案2：拒绝访问除信任域外的所有 trustDomain = public, namespace = default, appId = app1, operation = op1</font>

在这种配置下，只有来自appId = app1的方法op1被允许，来自所有其他应用程序的所有其他方法请求，包括app1上的其他方法，都被拒绝。

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

<font size=5>方案 3：拒绝访问所有应用，除非匹配 HTTP 的特定动词和 GRPC 的操作</font>

使用此配置时，以下唯一方案是允许访问的，并且来自所有其他应用（包括 app1 或 app2 上的其他方法）的所有其他方法请求都将被拒绝
* trustDomain = public, namespace = default, appID = app1, operation = op1, http verb = POST/PUT
* trustDomain = "myDomain", namespace = "ns1", appID = app2, operation = op2 and application protocol is GRPC , only HTTP verbs POST/PUT on method op1 from appId = app1 are allowed and all other method requests from all other apps, including other methods on app1, are denied

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

<font size=5>方案 4：允许访问除 trustDomain = public、namespace = default、appId = app1、operation = /op1/* 之外的所有方法，所有 http verbs</font>

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
此示例使用 [hello world](https://github.com/dapr/quickstarts/tree/master/hello-world/README.md) 快速入门。

以下步骤在启用 mTLS 的情况下在本地运行 Sentry 服务，设置必要的环境变量以访问证书，然后启动节点应用和 python 应用，每个应用都引用 Sentry 服务来应用 ACL。

 1. 按照以下步骤在启用了 mTLS 的情况下运行 [自托管模式 Sentry 服务]({{< ref "mtls.md" >}})

 2. 在命令提示符下，设置以下环境变量：

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

3. 运行 daprd，为启用了 mTLS 的node.js应用启动 Dapr sidecar，并引用本地 Sentry 服务：

   ```bash
   daprd --app-id nodeapp --dapr-grpc-port 50002 -dapr-http-port 3501 --log-level debug --app-port 3000 --enable-mtls --sentry-address localhost:50001 --config nodeappconfig.yaml
   ```

4. 在单独的命令提示符下运行 node 应用：

   ```bash
   node app.js
   ```

5. 在另一个命令提示符下，设置以下环境变量：

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

6. 运行 daprd 为启用了 mTLS 的 python 应用启动 Dapr sidecar，引用本地 Sentry 服务：

   ```bash
   daprd --app-id pythonapp   --dapr-grpc-port 50003 --metrics-port 9092 --log-level debug --enable-mtls --sentry-address localhost:50001 --config pythonappconfig.yaml
   ```

7. 在单独的命令提示符下运行 python 应用：

   ```bash
   python app.py
   ```

8. 你应该看到，由于 nodeappconfig 文件中的 **deny** 操作动作，在基于 python 应用程序的命令提示中，对 node 应用程序的调用失败。 将此操作更改为 **allow** 并重新运行应用，然后应看到此调用成功。

### Kubernetes 模式
此示例使用 [hello kubernetes](https://github.com/dapr/quickstarts/tree/master/hello-kubernetes/README.md) 快速入门。

您可以创建并应用上述配置文件 `nodeappconfig.yaml` 和 `pythonconfig.yaml` 由 [configuration]({{< ref "configuration-concept.md" >}}) 描述到 Kubernetes 部署。

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

## 社区示例
Watch this [video](https://youtu.be/j99RN_nxExA?t=1108) on how to apply access control list for service invocation.

<div class="embed-responsive embed-responsive-16by9">
<iframe width="688" height="430" src="https://www.youtube.com/embed/j99RN_nxExA?start=1108" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>