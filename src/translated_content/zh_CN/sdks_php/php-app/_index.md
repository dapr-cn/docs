---
type: docs
title: "应用程序"
linkTitle: "应用"
weight: 1000
description: 使用 App 类
no_list: true
---

PHP 中没有默认的路由器。因此，提供了 `\Dapr\App` 类。它底层使用了 [Nikic 的 FastRoute](https://github.com/nikic/FastRoute)。然而，你可以选择任何你喜欢的路由器或框架。只需查看 `App` 类中的 `add_dapr_routes()` 方法，了解 actor 和订阅是如何实现的。

每个应用程序都应该以 `App::create()` 开始，它接受两个参数，第一个是现有的 DI 容器（如果有的话），第二个是一个回调，用于挂钩到 `ContainerBuilder` 并添加你自己的配置。

接下来，你应该定义你的路由，然后调用 `$app->start()` 来执行当前请求的路由。

```php
<?php
// app.php

require_once __DIR__ . '/vendor/autoload.php';

$app = \Dapr\App::create(configure: fn(\DI\ContainerBuilder $builder) => $builder->addDefinitions('config.php'));

// 添加一个控制器用于 GET /test/{id}，返回 id
$app->get('/test/{id}', fn(string $id) => $id);

$app->start();
```

## 从控制器返回

你可以从控制器返回任何内容，它将被序列化为一个 JSON 对象。你也可以请求 Psr Response 对象并返回它，这样你就可以自定义头信息，并控制整个响应：

```php
<?php
$app = \Dapr\App::create(configure: fn(\DI\ContainerBuilder $builder) => $builder->addDefinitions('config.php'));

// 添加一个控制器用于 GET /test/{id}，返回 id
$app->get('/test/{id}', 
    fn(
        string $id, 
        \Psr\Http\Message\ResponseInterface $response, 
        \Nyholm\Psr7\Factory\Psr17Factory $factory) => $response->withBody($factory->createStream($id)));

$app->start();
```

## 将应用程序用作客户端

当你只想将 Dapr 用作客户端时，比如在现有代码中，你可以调用 `$app->run()`。在这些情况下，通常不需要自定义配置，不过，在生产环境中你可能希望使用编译的 DI 容器：

```php
<?php
// app.php

require_once __DIR__ . '/vendor/autoload.php';

$app = \Dapr\App::create(configure: fn(\DI\ContainerBuilder $builder) => $builder->enableCompilation(__DIR__));
$result = $app->run(fn(\Dapr\DaprClient $client) => $client->get('/invoke/other-app/method/my-method'));
```

## 在其他框架中使用

提供了一个 `DaprClient` 对象，实际上，`App` 对象使用的所有语法糖都是基于 `DaprClient` 构建的。

```php
<?php

require_once __DIR__ . '/vendor/autoload.php';

$clientBuilder = \Dapr\Client\DaprClient::clientBuilder();

// 你可以自定义（反）序列化，或者注释掉以使用默认的 JSON 序列化器。
$clientBuilder = $clientBuilder->withSerializationConfig($yourSerializer)->withDeserializationConfig($yourDeserializer);

// 你也可以传递一个日志记录器
$clientBuilder = $clientBuilder->withLogger($myLogger);

// 并更改 sidecar 的 URL，例如，使用 https
$clientBuilder = $clientBuilder->useHttpClient('https://localhost:3800') 
```

在调用之前有几个函数可以使用
