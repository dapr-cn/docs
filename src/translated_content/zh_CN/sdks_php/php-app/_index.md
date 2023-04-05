---
type: docs
title: "App"
linkTitle: "App"
weight: 1000
description: 使用 App 类
no_list: true
---

In PHP, there is no default router. Thus, the `\Dapr\App` class is provided. It uses [Nikic's FastRoute](https://github.com/nikic/FastRoute) under the hood. However, you are free to use any router or framework that you'd like. Just check out the `add_dapr_routes()` method in the `App` class to see how actors and subscriptions are implemented.

每个应用都应该以 `App::create()` 开头，它需要两个参数，第一个是现有的DI 容器， 第二个是回调到 `ContainerBuilder` 并添加您自己的配置。

您应该从那里定义路由，然后调用 `$app->start()` 来执行当前请求的路由。


```php
<?php
// app.php

require_once __DIR__ . '/vendor/autoload.php';

$app = \Dapr\App::create(configure: fn(\DI\ContainerBuilder $builder) => $builder->addDefinitions('config.php'));

// add a controller for GET /test/{id} that returns the id
$app->get('/test/{id}', fn(string $id) => $id);

$app->start();
```

## Returning from a controller

从控制器返回任何数据都会被序列化为 json 对象。 您也可以请求 Psr Response对象并返回该对象，允许您自定义 headers 并控制整个响应：

```php
<?php
$app = \Dapr\App::create(configure: fn(\DI\ContainerBuilder $builder) => $builder->addDefinitions('config.php'));

// add a controller for GET /test/{id} that returns the id
$app->get('/test/{id}', 
    fn(
        string $id, 
        \Psr\Http\Message\ResponseInterface $response, 
        \Nyholm\Psr7\Factory\Psr17Factory $factory) => $response->withBody($factory->createStream($id)));

$app->start();
```

## 将应用程序作为客户端

当你只想使用 Dapr 作为客户端，例如在现有代码中，你可以调用 `$app->run()`。 通常情况下，特别是在生产中不需要自定义配置，但您可能想使用编译的DI 容器：

```php
<?php
// app.php

require_once __DIR__ . '/vendor/autoload.php';

$app = \Dapr\App::create(configure: fn(\DI\ContainerBuilder $builder) => $builder->enableCompilation(__DIR__));
$result = $app->run(fn(\Dapr\DaprClient $client) => $client->get('/invoke/other-app/method/my-method'));
```

## Using in other frameworks

A `DaprClient` object is provided, in fact, all the sugar used by the `App` object is built on the `DaprClient`.

```php
<?php

require_once __DIR__ . '/vendor/autoload.php';

$clientBuilder = \Dapr\Client\DaprClient::clientBuilder();

// you can customize (de)serialization or comment out to use the default JSON serializers.
$clientBuilder = $clientBuilder->withSerializationConfig($yourSerializer)->withDeserializationConfig($yourDeserializer);

// you can also pass it a logger
$clientBuilder = $clientBuilder->withLogger($myLogger);

// and change the url of the sidecar, for example, using https
$clientBuilder = $clientBuilder->useHttpClient('https://localhost:3800') 
```

There are several functions you can call before 
