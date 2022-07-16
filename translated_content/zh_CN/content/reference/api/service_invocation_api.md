---
type: docs
title: "服务调用 API 参考"
linkTitle: "服务调用 API"
description: "有关服务调用 API 的详细文档"
weight: 100
---

Dapr为用户提供了调用具有唯一ID的其他应用程序的能力。 这种功能允许应用程序通过命名的标识符进行交互，并将服务发现的负担放在Dapr运行时上。

## 在一个远程 dapr 应用程序上调用方法

此端点允许你在另一个启用了 Dapr 的应用中调用方法。

### HTTP 请求

```
PATCH/POST/GET/PUT/DELETE http://localhost:<daprPort>/v1.0/invoke/<appId>/method/<method-name>
```

### HTTP 响应码

当一个服务使用 Dapr 调用另一个服务时，被调用服务的状态代码将返回给调用方。 如果出现网络错误或其他暂时性错误，Dapr 将返回 `500` 错误，并显示详细的错误消息。

如果用户通过 HTTP 调用 Dapr 与启用了 gRPC 的服务通信，则来自调用 gRPC 服务的错误将返回为 `500` ，成功响应将返回为 `200OK`。

| 代码  | 说明        |
| --- | --------- |
| XXX | 返回上游状态    |
| 400 | 未给出方法名称   |
| 403 | 调用被访问控制禁止 |
| 500 | 请求失败      |

### URL 参数

| 参数          | 说明                    |
| ----------- | --------------------- |
| daprPort    | dapr 端口。              |
| appId       | 与远程应用关联的应用 ID         |
| method-name | 要在远程应用上调用的方法或 url 的名称 |

> 注意：所有的 URL 参数都是大小写敏感的。

### 请求内容

在请求中，您可以传递标头：

```json
{
  "Content-Type": "application/json"
}
```

在请求正文中放置要发送到服务的数据：

```json
{
  "arg1": 10,
  "arg2": 23,
  "operator": "+"
}
```

### 被调用的服务收到的请求

一旦你的服务代码调用了另一个启用Dapr的应用程序中的方法，Dapr将把请求连标头和正文一起发送到 `<method-name>` 端点上的应用程序。

被调用的的 Dapr 应用需要侦听并响应该端点上的请求。

### 跨命名空间调用

在支持命名空间的托管平台上，Dapr 应用 ID 符合包含目标命名空间的有效 FQDN 格式。 例如，以下字符串包含应用 ID （`myApp`）以及运行应用的命名空间 （`production`）。

```
myApp.production
```

#### 命名空间支持的平台

- Kubernetes

### 示例

您可以通过发送以下内容来调用 `mathService` 服务上的 `add` 方法：

```shell
curl http://localhost:3500/v1.0/invoke/mathService/method/add \
  -H "Content-Type: application/json"
  -d '{ "arg1": 10, "arg2": 23}'
```

`mathService` 服务需要侦听 `/add` 终结点才能接收和处理请求。

对于 Node 应用，如下所示：

```js
app.post('/add', (req, res) => {
  let args = req.body;
  const [operandOne, operandTwo] = [Number(args['arg1']), Number(args['arg2'])];

  let result = operandOne + operandTwo;
  res.send(result.toString());
});

app.listen(port, () => console.log(`Listening on port ${port}!`));
```

> 来自远程终结点的响应将在响应正文中返回。

当您的服务侦听更多嵌套路径时（例如 `/api/v1/add`），Dapr 实现了一个完全反向代理，因此您可以将所有必要的路径片段附加到请求 URL，如下所示：

`http://localhost:3500/v1.0/invoke/mathService/method/api/v1/add`

如果要在不同的命名空间上调用 `mathService` ，则可以使用以下 URL：

`http://localhost:3500/v1.0/invoke/mathService.testing/method/api/v1/add`

在此 URL 中， `testing` 是 `mathService` 运行的命名空间。

## 下一步
- [入门指南：发现并调用服务]({{< ref howto-invoke-discover-services.md >}})
