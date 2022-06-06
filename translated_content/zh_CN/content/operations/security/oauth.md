---
type: docs
title: "使用 OAuth 配置端点授权"
linkTitle: "使用 OAuth 配置端点授权"
weight: 2000
description: "在 Web API 的应用程序端点上启用 OAuth 授权"
---

Dapr OAuth 2.0 [中间件]({{< ref "middleware.md" >}}) 允许您使用 [授权代码授予流](https://tools.ietf.org/html/rfc6749#section-4.1)在 Web API 的 Dapr 端点上启用 [OAuth](https://oauth.net/2/) 授权。 还可以将授权令牌注入到端点 API 中，这些 API 可用于对 API 使用 [客户端凭据授予流](https://tools.ietf.org/html/rfc6749#section-4.4)调用的外部 API 进行授权。 当中间件被启用时，任何通过 Dapr 进行的方法调用在被传递给用户代码之前都需要被授权。

这两个流之间的主要区别在于， `授权代码授予流` 需要用户交互并授权用户，而 `客户端凭据授予流` 不需要用户交互并授权服务/应用程序。

## 在授权服务器上注册你的应用程序

不同的授权服务器提供不同的应用注册体验。 下面是一些示例：

* [Azure AAD](https://docs.microsoft.com/azure/active-directory/develop/v1-protocols-oauth-code)
* [Facebook](https://developers.facebook.com/apps)
* [Fitbit](https://dev.fitbit.com/build/reference/web-api/oauth2/)
* [GitHub](https://developer.github.com/apps/building-oauth-apps/creating-an-oauth-app/)
* [Google APIs](https://console.developers.google.com/apis/credentials/consen)
* [Slack](https://api.slack.com/docs/oauth)
* [Twitter](http://apps.twitter.com/)

要了解 Dapr OAuth 中间件，您需要收集以下信息：

* Client ID (see [here](https://www.oauth.com/oauth2-servers/client-registration/client-id-secret/))
* Client secret (see [here](https://www.oauth.com/oauth2-servers/client-registration/client-id-secret/))
* Scopes (see [here](https://oauth.net/2/scope/))
* Authorization URL
* Token URL

一些流行的授权服务器的授权/令牌 URL。

<!-- IGNORE_LINKS -->
| 服务器       | 授权网址                                                          | 令牌网址                                                                                      |
| --------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Azure AAD | <https://login.microsoftonline.com/{tenant}/oauth2/authorize> | <https://login.microsoftonline.com/{tenant}/oauth2/token>                                 |
| GitHub    | <https://github.com/login/oauth/authorize>                    | <https://github.com/login/oauth/access_token>                                             |
| 谷歌        | <https://accounts.google.com/o/oauth2/v2/auth>                | <https://accounts.google.com/o/oauth2/token> <https://www.googleapis.com/oauth2/v4/token> |
| Twitter   | <https://api.twitter.com/oauth/authorize>                     | <https://api.twitter.com/oauth2/token>                                                    |
<!-- END_IGNORE -->

## 定义中间件组件定义

### 定义授权代码授予组件

OAuth 中间件（授权代码）由组件定义：

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
    # forceHTTPS:
    # This key is used to set HTTPS schema on redirect to your API method
    # after Dapr successfully received Access Token from Identity Provider.
    # By default, Dapr will use HTTP on this redirect.
  - name: forceHTTPS
    value: "<set to true if you invoke an API method through Dapr from https origin>"
```

### 为授权代码授予定义自定义管道

要使用 OAuth 中间件（授权代码），你应该创建一个 [自定义管道]({{< ref "middleware.md" >}}) 使用 [Dapr配置]({{< ref "configuration-overview" >}})，如以下样本所示：

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

### 定义客户端凭据授予组件

OAuth（客户端凭据）中间件由组件定义：

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
    # authStyle:
    # "0" means to auto-detect which authentication
    # style the provider wants by trying both ways and caching
    # the successful way for the future.

    # "1" sends the "client_id" and "client_secret"
    # in the POST body as application/x-www-form-urlencoded parameters.

    # "2" sends the client_id and client_password
    # using HTTP Basic Authorization. This is an optional style
    # described in the OAuth2 RFC 6749 section 2.3.1.
  - name: authStyle
    value: "<see comment>"
```

### 为客户端凭据授予定义自定义管道

要使用 OAuth 中间件（授权代码），你应该创建一个 [自定义管道]({{< ref "middleware.md" >}}) 使用 [Dapr 配置]({{< ref "configuration-overview.md" >}})，如以下样本所示：

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

要将上述配置（无论授予类型如何） 应用于 Dapr sidecar，请在 pod 规范中添加 `dapr.io/config` 注解：

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

### 授权码

一旦一切就绪，每当客户试图通过 Dapr sidecar 调用 API 方法（例如调用 *v1.0/invoke/* 端点），如果没有找到访问令牌，它将被重定向到授权的同意页。 否则，访问令牌将被写入 **authHeaderName** 头，并提供给应用程序代码使用。

### 客户端凭据

一旦一切就绪，每当客户端试图通过 Dapr sidecar 调用 API 方法（比如调用 *v1.0/invoke/* 端点）， 如果没有找到现有的有效访问令牌，它将检索到一个新的访问令牌。 访问令牌被写入 **headerName** 头，并提供给应用程序代码使用。 这样，应用就可以在调用中将授权标头中的令牌转发给请求该令牌的外部 API。
