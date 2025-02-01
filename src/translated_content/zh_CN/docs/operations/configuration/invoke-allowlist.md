---
type: docs
title: "操作指南：为服务调用配置应用访问控制列表"
linkTitle: "服务调用访问控制"
weight: 4000
description: "限制调用应用程序可以执行的操作"
---

通过访问控制，您可以配置策略，限制调用应用程序在被调用应用程序上通过服务调用可以执行的操作。您可以在配置模式中定义访问控制策略规范，以限制访问：
- 从特定操作到被调用应用程序，以及
- 从调用应用程序到HTTP动词。

访问控制策略在配置中指定，并应用于被调用应用程序的Dapr sidecar。对被调用应用程序的访问基于匹配的策略操作。

您可以为所有调用应用程序提供一个默认的全局操作。如果未指定访问控制策略，默认行为是允许所有调用应用程序访问被调用应用程序。

[查看访问策略示例。](#example-scenarios)

## 术语

### `trustDomain`

“信任域”是用于管理信任关系的逻辑分组。每个应用程序都被分配一个信任域，可以在访问控制列表策略规范中指定。如果未定义策略规范或指定了空的信任域，则使用默认值“public”。信任域用于在TLS证书中生成应用程序的身份。

### 应用程序身份

Dapr请求sentry服务为所有应用程序生成一个[SPIFFE](https://spiffe.io/) ID。此ID附加在TLS证书中。

SPIFFE ID的格式为：`**spiffe://\<trustdomain>/ns/\<namespace\>/\<appid\>**`。

对于匹配策略，从调用应用程序的TLS证书中提取调用应用程序的信任域、命名空间和应用程序ID值。这些值与策略规范中指定的信任域、命名空间和应用程序ID值进行匹配。如果这三者都匹配，则进一步匹配更具体的策略。

## 配置属性

下表列出了访问控制、策略和操作的不同属性：

### 访问控制

| 属性            | 类型   | 描述 |
|-----------------|--------|------|
| `defaultAction` | string | 当没有其他策略匹配时的全局默认操作 |
| `trustDomain`   | string | 分配给应用程序的信任域。默认值为“public”。 |
| `policies`      | string | 确定调用应用程序可以在被调用应用程序上执行哪些操作的策略 |

### 策略

| 属性            | 类型   | 描述 |
|-----------------|--------|------|
| `app`           | string | 允许/拒绝服务调用的调用应用程序的AppId |
| `namespace`     | string | 需要与调用应用程序的命名空间匹配的命名空间值 |
| `trustDomain`   | string | 需要与调用应用程序的信任域匹配的信任域。默认值为“public” |
| `defaultAction` | string | 如果找到应用程序但没有匹配的特定操作，则应用程序级别的默认操作 |
| `operations`    | string | 允许从调用应用程序进行的操作 |

### 操作

| 属性       | 类型   | 描述 |
|------------|--------|------|
| `name`     | string | 允许在被调用应用程序上进行的操作的路径名称。通配符“\*”可以用于路径中进行匹配。通配符“\**”可以用于匹配多个路径下的内容。 |
| `httpVerb` | list   | 调用应用程序可以使用的特定HTTP动词列表。通配符“\*”可以用于匹配任何HTTP动词。未用于grpc调用。 |
| `action`   | string | 访问修饰符。接受的值为“allow”（默认）或“deny” |

## 策略规则

1. 如果未指定访问策略，默认行为是允许所有应用程序访问被调用应用程序上的所有方法。
1. 如果未指定全局默认操作且未定义特定应用程序策略，则空访问策略被视为未指定访问策略。默认行为是允许所有应用程序访问被调用应用程序上的所有方法。
1. 如果未指定全局默认操作但已定义了一些特定应用程序策略，则我们采用更安全的选项，假设全局默认操作为拒绝访问被调用应用程序上的所有方法。
1. 如果定义了访问策略且无法验证传入应用程序凭据，则全局默认操作生效。
1. 如果传入应用程序的信任域或命名空间与应用程序策略中指定的值不匹配，则忽略应用程序策略，全局默认操作生效。

## 策略优先级

最具体的匹配策略对应的操作生效，按以下顺序排列：
1. 在HTTP的情况下为特定HTTP动词，或在GRPC的情况下为操作级别操作。
1. 应用程序级别的默认操作
1. 全局级别的默认操作

## 示例场景

以下是使用访问控制列表进行服务调用的一些示例场景。请参阅[配置指南]({{< ref "configuration-concept.md" >}})以了解应用程序sidecar的可用配置设置。

### 场景1：

拒绝所有应用程序的访问，除非`trustDomain` = `public`，`namespace` = `default`，`appId` = `app1`

通过此配置，所有调用方法的`appId` = `app1`被允许。来自其他应用程序的所有其他调用请求被拒绝。

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

### 场景2：

拒绝所有应用程序的访问，除非`trustDomain` = `public`，`namespace` = `default`，`appId` = `app1`，`operation` = `op1`

通过此配置，只有来自`appId` = `app1`的方法`op1`被允许。来自所有其他应用程序的所有其他方法请求，包括`app1`上的其他方法，均被拒绝。

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

### 场景3：

拒绝所有应用程序的访问，除非匹配特定的HTTP动词和GRPC操作

通过此配置，只有以下场景被允许访问。来自所有其他应用程序的所有其他方法请求，包括`app1`或`app2`上的其他方法，均被拒绝。

- `trustDomain` = `public`，`namespace` = `default`，`appID` = `app1`，`operation` = `op1`，`httpVerb` = `POST`/`PUT`
- `trustDomain` = `"myDomain"`，`namespace` = `"ns1"`，`appID` = `app2`，`operation` = `op2`且应用程序协议为GRPC

只有来自`appId` = `app1`的方法`op1`上的`httpVerb` `POST`/`PUT`被允许。来自所有其他应用程序的所有其他方法请求，包括`app1`上的其他方法，均被拒绝。

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

### 场景4：

允许访问所有方法，除非`trustDomain` = `public`，`namespace` = `default`，`appId` = `app1`，`operation` = `/op1/*`，所有`httpVerb`

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

### 场景5：

允许访问所有方法，`trustDomain` = `public`，`namespace` = `ns1`，`appId` = `app1`，并拒绝访问所有方法，`trustDomain` = `public`，`namespace` = `ns2`，`appId` = `app1`

此场景展示了如何指定具有相同应用程序ID但属于不同命名空间的应用程序。

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

### 场景6：

允许访问所有方法，除非`trustDomain` = `public`，`namespace` = `default`，`appId` = `app1`，`operation` = `/op1/**/a`，所有`httpVerb`

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

## "hello world" 示例

在这些示例中，您将学习如何将访问控制应用于[hello world](https://github.com/dapr/quickstarts/tree/master/tutorials)教程。

访问控制列表依赖于Dapr [Sentry服务]({{< ref "security-concept.md" >}})生成带有SPIFFE ID的TLS证书进行身份验证。这意味着Sentry服务要么在本地运行，要么部署到您的托管环境中，例如Kubernetes集群。

下面的`nodeappconfig`示例展示了如何**拒绝**来自`pythonapp`的`neworder`方法的访问，其中Python应用程序位于`myDomain`信任域和`default`命名空间中。Node.js应用程序位于`public`信任域中。

### nodeappconfig.yaml

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

### pythonappconfig.yaml

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

在本教程中，您将：
- 在本地运行启用mTLS的Sentry服务
- 设置访问证书所需的环境变量
- 启动Node应用程序和Python应用程序，每个应用程序都引用Sentry服务以应用ACL

#### 先决条件

- 熟悉在自托管模式下运行启用mTLS的[Sentry服务]({{< ref "mtls.md" >}})
- 克隆[hello world](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-world/README.md)教程

#### 运行Node.js应用程序

1. 在命令提示符中，设置这些环境变量：

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

1. 运行daprd以启动Node.js应用程序的Dapr sidecar，启用mTLS，引用本地Sentry服务：

   ```bash
   daprd --app-id nodeapp --dapr-grpc-port 50002 -dapr-http-port 3501 --log-level debug --app-port 3000 --enable-mtls --sentry-address localhost:50001 --config nodeappconfig.yaml
   ```

1. 在另一个命令提示符中运行Node.js应用程序：

   ```bash
   node app.js
   ```

#### 运行Python应用程序

1. 在另一个命令提示符中，设置这些环境变量：

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

1. 运行daprd以启动Python应用程序的Dapr sidecar，启用mTLS，引用本地Sentry服务：

   ```bash
   daprd --app-id pythonapp   --dapr-grpc-port 50003 --metrics-port 9092 --log-level debug --enable-mtls --sentry-address localhost:50001 --config pythonappconfig.yaml
   ```
1. 在另一个命令提示符中运行Python应用程序：

   ```bash
   python app.py
   ```

您应该在Python应用程序命令提示符中看到对Node.js应用程序的调用失败，这是由于`nodeappconfig`文件中的**拒绝**操作。将此操作更改为**允许**并重新运行应用程序以查看此调用成功。

### Kubernetes模式

#### 先决条件

- 熟悉在自托管模式下运行启用mTLS的[Sentry服务]({{< ref "mtls.md" >}})
- 克隆[hello world](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-world/README.md)教程

#### 配置Node.js和Python应用程序

您可以创建并应用上述[`nodeappconfig.yaml`](#nodeappconfigyaml)和[`pythonappconfig.yaml`](#pythonappconfigyaml)配置文件，如[配置]({{< ref "configuration-concept.md" >}})中所述。

例如，下面的Kubernetes Deployment展示了Python应用程序如何在默认命名空间中使用此`pythonappconfig`配置文件部署到Kubernetes。

对Node.js部署执行相同操作，并查看Python应用程序的日志以查看由于`nodeappconfig`文件中设置的**拒绝**操作而导致的调用失败。

将此操作更改为**允许**并重新部署应用程序以查看此调用成功。

##### 部署YAML示例

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

## 演示

观看此[视频](https://youtu.be/j99RN_nxExA?t=1108)了解如何为服务调用应用访问控制列表。

<div class="embed-responsive embed-responsive-16by9">
<iframe width="688" height="430" src="https://www.youtube-nocookie.com/embed/j99RN_nxExA?start=1108" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

## 下一步

{{< button text="Dapr API允许列表" page="api-allowlist" >}}
