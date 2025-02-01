---
type: docs
title: "服务调用API参考"
linkTitle: "服务调用API"
description: "关于服务调用API的详细文档"
weight: 100
---

Dapr为用户提供了使用唯一命名标识符（appId）来调用其他使用Dapr的应用程序的功能，或者调用不使用Dapr的HTTP端点。
这使得应用程序可以通过命名标识符相互交互，并将服务发现的责任交给Dapr运行时。

## 调用远程Dapr应用上的方法

这个端点允许您在另一个启用了Dapr的应用中调用方法。

### HTTP请求

```
PATCH/POST/GET/PUT/DELETE http://localhost:<daprPort>/v1.0/invoke/<appID>/method/<method-name>
```

## 调用非Dapr端点上的方法

这个端点允许您使用`HTTPEndpoint`资源名称或完全限定域名（FQDN）URL在非Dapr端点上调用方法。

### HTTP请求

```
PATCH/POST/GET/PUT/DELETE http://localhost:<daprPort>/v1.0/invoke/<HTTPEndpoint name>/method/<method-name>

PATCH/POST/GET/PUT/DELETE http://localhost:<daprPort>/v1.0/invoke/<FQDN URL>/method/<method-name>
```

### HTTP响应代码

当一个服务通过Dapr调用另一个服务时，被调用服务的状态码将返回给调用者。
如果存在网络错误或其他瞬态错误，Dapr将返回一个`500`错误，并附带详细的错误信息。

如果用户通过HTTP调用Dapr与启用gRPC的服务通信，来自被调用gRPC服务的错误将返回为`500`，而成功的响应将返回为`200 OK`。

代码 | 描述
---- | -----------
XXX  | 上游状态返回
400  | 未提供方法名称
403  | 访问控制禁止调用
500  | 请求失败

### URL参数

参数 | 描述
--------- | -----------
daprPort | Dapr端口
appID | 与远程应用关联的应用ID
HTTPEndpoint name | 与外部端点关联的HTTPEndpoint资源
FQDN URL | 在外部端点上调用的完全限定域名URL
method-name | 要在远程应用上调用的方法或URL的名称

> 注意，所有URL参数区分大小写。

### 请求内容

在请求中，您可以传递头信息：

```json
{
  "Content-Type": "application/json"
}
```

在请求体中放置您想要发送给服务的数据：

```json
{
  "arg1": 10,
  "arg2": 23,
  "operator": "+"
}
```

### 被调用服务接收到的请求

一旦您的服务代码在另一个启用了Dapr的应用或非Dapr端点中调用了方法，Dapr会在`<method-name>`端点上发送请求，并附带头信息和请求体。

被调用的Dapr应用或非Dapr端点需要监听并响应该端点上的请求。

### 跨命名空间调用

在支持命名空间的托管平台上，Dapr应用ID符合包含目标命名空间的有效FQDN格式。
例如，以下字符串包含应用ID（`myApp`）以及应用运行的命名空间（`production`）。

```
myApp.production
```

#### 支持命名空间的平台

- Kubernetes

### 示例

您可以通过发送以下内容来调用`mathService`服务上的`add`方法：

```shell
curl http://localhost:3500/v1.0/invoke/mathService/method/add \
  -H "Content-Type: application/json"
  -d '{ "arg1": 10, "arg2": 23}'
```

`mathService`服务需要在`/add`端点上监听以接收和处理请求。

对于一个Node应用，这将如下所示：

```js
app.post('/add', (req, res) => {
  let args = req.body;
  const [operandOne, operandTwo] = [Number(args['arg1']), Number(args['arg2'])];

  let result = operandOne + operandTwo;
  res.send(result.toString());
});

app.listen(port, () => console.log(`Listening on port ${port}!`));
```

> 来自远程端点的响应将返回在响应体中。

如果您的服务监听在更嵌套的路径上（例如`/api/v1/add`），Dapr实现了一个完整的反向代理，因此您可以将所有必要的路径片段附加到您的请求URL中，如下所示：

`http://localhost:3500/v1.0/invoke/mathService/method/api/v1/add`

如果您在不同的命名空间中调用`mathService`，您可以使用以下URL：

`http://localhost:3500/v1.0/invoke/mathService.testing/method/api/v1/add`

在此URL中，`testing`是`mathService`运行的命名空间。

#### 非Dapr端点示例

如果`mathService`服务是一个非Dapr应用程序，则可以通过`HTTPEndpoint`以及完全限定域名（FQDN）URL进行服务调用。

```shell
curl http://localhost:3500/v1.0/invoke/mathHTTPEndpoint/method/add \
  -H "Content-Type: application/json"
  -d '{ "arg1": 10, "arg2": 23}'

curl http://localhost:3500/v1.0/invoke/http://mathServiceURL.com/method/add \
  -H "Content-Type: application/json"
  -d '{ "arg1": 10, "arg2": 23}'
```

## 下一步
- [如何：调用和发现服务]({{< ref howto-invoke-discover-services.md >}})