---
type: docs
title: "使用 OAuth 配置端点授权"
linkTitle: "使用 OAuth 配置端点授权"
weight: 2000
description: "为您的 Web API 启用应用程序端点的 OAuth 授权"
---

Dapr 的 OAuth 2.0 中间件允许您在 Dapr 端点上为 Web API 启用 OAuth 授权，支持 [授权码模式](https://tools.ietf.org/html/rfc6749#section-4.1)。您还可以将授权令牌注入到端点 API 中，这些令牌可用于通过 [客户端凭证模式](https://tools.ietf.org/html/rfc6749#section-4.4)对 API 调用的外部 API 进行授权。启用中间件后，所有通过 Dapr 的方法调用在传递给用户代码之前都需要进行授权。

这两种模式的主要区别在于，`授权码模式`需要用户交互并授权用户，而`客户端凭证模式`不需要用户交互，授权的是服务或应用程序。

## 在授权服务器上注册您的应用程序

不同的授权服务器提供不同的应用程序注册体验。以下是一些示例：
<!-- IGNORE_LINKS -->
* [Microsoft Entra ID](https://docs.microsoft.com/azure/active-directory/develop/v1-protocols-oauth-code)
* [Facebook](https://developers.facebook.com/apps)
* [Fitbit](https://dev.fitbit.com/build/reference/web-api/oauth2/)
* [GitHub](https://developer.github.com/apps/building-oauth-apps/creating-an-oauth-app/)
* [Google APIs](https://console.developers.google.com/apis/credentials/consen)
* [Slack](https://api.slack.com/docs/oauth)
* [Twitter](http://apps.twitter.com/)
<!-- END_IGNORE -->
要配置 Dapr OAuth 中间件，您需要收集以下信息：

* 客户端 ID (参见 [这里](https://www.oauth.com/oauth2-servers/client-registration/client-id-secret/))
* 客户端密钥 (参见 [这里](https://www.oauth.com/oauth2-servers/client-registration/client-id-secret/))
* 范围 (参见 [这里](https://oauth.net/2/scope/))
* 授权 URL
* 令牌 URL

一些流行的授权服务器的授权/令牌 URL：

<!-- IGNORE_LINKS -->
| 服务器  | 授权 URL | 令牌 URL |
|---------|-------------------|-----------|
|Microsoft Entra ID|<https://login.microsoftonline.com/{tenant}/oauth2/authorize>|<https://login.microsoftonline.com/{tenant}/oauth2/token>|
|GitHub|<https://github.com/login/oauth/authorize>|<https://github.com/login/oauth/access_token>|
|Google|<https://accounts.google.com/o/oauth2/v2/auth>|<https://accounts.google.com/o/oauth2/token> <https://www.googleapis.com/oauth2/v4/token>|
|Twitter|<https://api.twitter.com/oauth/authorize>|<https://api.twitter.com/oauth2/token>|
<!-- END_IGNORE -->

## 定义中间件组件

### 定义授权码模式组件

OAuth 中间件（授权码模式）由以下组件定义：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: oauth2
  namespace: default
spec:
  type: middleware.http.oauth2
  version: v1
  metadata:
  - name: clientId
    value: "<your client ID>"
  - name: clientSecret
    value: "<your client secret>"
  - name: scopes
    value: "<comma-separated scope names>"
  - name: authURL
    value: "<authorization URL>"
  - name: tokenURL
    value: "<token exchange URL>"
  - name: redirectURL
    value: "<redirect URL>"
  - name: authHeaderName
    value: "<header name under which the secret token is saved>"
  - name: forceHTTPS
    value: "<set to true if you invoke an API method through Dapr from https origin>"
```

### 为授权码模式定义自定义管道

要使用 OAuth 中间件（授权码模式），您需要使用 [Dapr 配置]({{< ref "configuration-overview" >}}) 创建一个 [自定义管道]({{< ref "middleware.md" >}})，如下所示：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: pipeline
  namespace: default
spec:
  httpPipeline:
    handlers:
    - name: oauth2
      type: middleware.http.oauth2
```

### 定义客户端凭证模式组件

OAuth（客户端凭证模式）中间件由以下组件定义：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: myComponent
spec:
  type: middleware.http.oauth2clientcredentials
  version: v1
  metadata:
  - name: clientId
    value: "<your client ID>"
  - name: clientSecret
    value: "<your client secret>"
  - name: scopes
    value: "<comma-separated scope names>"
  - name: tokenURL
    value: "<token issuing URL>"
  - name: headerName
    value: "<header name under which the secret token is saved>"
  - name: endpointParamsQuery
    value: "<list of additional key=value settings separated by ampersands or semicolons forwarded to the token issuing service>"
  - name: authStyle
    value: "<see comment>"
```

### 为客户端凭证模式定义自定义管道

要使用 OAuth 中间件（客户端凭证模式），您需要使用 [Dapr 配置]({{< ref "configuration-overview.md" >}}) 创建一个 [自定义管道]({{< ref "middleware.md" >}})，如下所示：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: pipeline
  namespace: default
spec:
  httpPipeline:
    handlers:
    - name: myComponent
      type: middleware.http.oauth2clientcredentials
```

## 应用配置

要将上述配置（无论授权类型）应用到您的 Dapr sidecar，请在您的 pod 规范中添加一个 ```dapr.io/config``` 注释：

```yaml
apiVersion: apps/v1
kind: Deployment
...
spec:
  ...
  template:
    metadata:
      ...
      annotations:
        dapr.io/enabled: "true"
        ...
        dapr.io/config: "pipeline"
...
```

## 访问访问令牌

### 授权码模式

配置完成后，每当客户端尝试通过 Dapr sidecar 调用 API 方法时（例如调用 *v1.0/invoke/* 端点），如果未找到访问令牌，客户端将被重定向到授权同意页面。否则，访问令牌将写入 **authHeaderName** 头中，供应用程序代码使用。

### 客户端凭证模式

配置完成后，每当客户端尝试通过 Dapr sidecar 调用 API 方法时（例如调用 *v1.0/invoke/* 端点），如果未找到现有的有效令牌，将检索一个新的访问令牌。访问令牌将写入 **headerName** 头中，供应用程序代码使用。这样，应用程序可以在调用请求该令牌的外部 API 时在授权头中转发令牌。