---
type: docs
title: "Dapr PHP SDK"
linkTitle: "PHP"
weight: 1000
description: 开发 Dapr 应用程序的 PHP SDK 包
no_list: true
---

Dapr提供了帮助开发 PHP 应用程序各种包。 你可以使用他们来创建 PHP 客户端、服务器和 virtual actors。

## 设置

### 先决条件

- [Composer](https://getcomposer.org/)
- [PHP 8](https://www.php.net/)

### 可选条件

- [Docker](https://www.docker.com/)
- [xdebug](http://xdebug. org/) --用于调试

## 初始化您的项目

在您想要创建服务的目录中，运行 `composer init` 并确认命令执行。 安装 `dapr/php-sdk` 和您可能希望使用的其他依赖项。

## 配置服务

创建一个 config.php ，复制下面的内容：

```php
<?php

use Dapr\Actors\Generators\ProxyFactory;
use Dapr\Middleware\Defaults\{Response\ApplicationJson,Tracing};
use Psr\Log\LogLevel;
use function DI\{env,get};

return [
    // set the log level
    'dapr.log.level'               => LogLevel::WARNING,

    // Generate a new proxy on each request - recommended for development
    'dapr.actors.proxy.generation' => ProxyFactory::GENERATED,

    // put any subscriptions here
    'dapr.subscriptions'           => [],

    // if this service will be hosting any actors, add them here
    'dapr.actors'                  => [],

    // if this service will be hosting any actors, configure how long until dapr should consider an actor idle
    'dapr.actors.idle_timeout'     => null,

    // if this service will be hosting any actors, configure how often dapr will check for idle actors 
    'dapr.actors.scan_interval'    => null,

    // if this service will be hosting any actors, configure how long dapr will wait for an actor to finish during drains
    'dapr.actors.drain_timeout'    => null,

    // if this service will be hosting any actors, configure if dapr should wait for an actor to finish
    'dapr.actors.drain_enabled'    => null,

    // you shouldn't have to change this, but the setting is here if you need to
    'dapr.port'                    => env('DAPR_HTTP_PORT', '3500'),

    // add any custom serialization routines here
    'dapr.serializers.custom'      => [],

    // add any custom deserialization routines here
    'dapr.deserializers.custom'    => [],

    // the following has no effect, as it is the default middlewares and processed in order specified
    'dapr.http.middleware.request'  => [get(Tracing::class)],
    'dapr.http.middleware.response' => [get(ApplicationJson::class), get(Tracing::class)],
];
```

## 创建一个服务

修改`index.php`，内容如下:

```php
<?php

require_once __DIR__.'/vendor/autoload.php';

use Dapr\App;

$app = App::create(configure: fn(\DI\ContainerBuilder $builder) => $builder->addDefinitions(__DIR__ . '/config.php'));
$app->get('/hello/{name}', function(string $name) {
    return ['hello' => $name];
});
$app->start();
```

## 试试吧

用` dapr init `初始化dapr，然后用` dapr run -a dev -p 3000-php -S 0.0.0.0:3000 `启动项目。

现在，您可以打开网络浏览器访问[ http://localhost:3000/ hello/world ](http://localhost:3000/hello/world)用您的名字，宠物的名字或您想要的任何名称替换` world `。

恭喜，你已经建立了你的Dapr 服务！ 我很高兴看到您会怎么做！

## 更多信息

- [Packagist](https://packagist.org/packages/dapr/php-sdk)
- [Dapr SDK 序列化]({{< ref sdk-serialization.md >}})
