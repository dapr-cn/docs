---
type: docs
title: "Dapr PHP SDK"
linkTitle: "PHP"
weight: 1000
description: 用于开发Dapr应用的PHP SDK包
no_list: true
---

Dapr提供了一个SDK，帮助开发PHP应用程序。通过它，您可以使用Dapr创建PHP客户端、服务器和虚拟actor。

## 设置

### 先决条件

- [Composer](https://getcomposer.org/)
- [PHP 8](https://www.php.net/)

### 可选先决条件

- [Docker](https://www.docker.com/)
- [xdebug](http://xdebug.org/) -- 用于调试

## 初始化您的项目

在您希望创建服务的目录中，运行`composer init`并回答提示的问题。
使用`composer require dapr/php-sdk`安装此SDK以及您可能需要的其他依赖项。

## 配置您的服务

创建一个config.php文件，并复制以下内容：

```php
<?php

use Dapr\Actors\Generators\ProxyFactory;
use Dapr\Middleware\Defaults\{Response\ApplicationJson,Tracing};
use Psr\Log\LogLevel;
use function DI\{env,get};

return [
    // 设置日志级别
    'dapr.log.level'               => LogLevel::WARNING,

    // 在每个请求上生成一个新的代理 - 推荐用于开发
    'dapr.actors.proxy.generation' => ProxyFactory::GENERATED,
    
    // 在此处放置任何订阅
    'dapr.subscriptions'           => [],
    
    // 如果此服务将托管任何actor，请在此处添加它们
    'dapr.actors'                  => [],
    
    // 配置Dapr在多长时间后认为actor空闲
    'dapr.actors.idle_timeout'     => null,
    
    // 配置Dapr检查空闲actor的频率
    'dapr.actors.scan_interval'    => null,
    
    // 配置Dapr在关闭期间等待actor完成的时间
    'dapr.actors.drain_timeout'    => null,
    
    // 配置Dapr是否应等待actor完成
    'dapr.actors.drain_enabled'    => null,
    
    // 您可以在此处更改Dapr的端口设置
    'dapr.port'                    => env('DAPR_HTTP_PORT', '3500'),
    
    // 添加任何自定义序列化例程
    'dapr.serializers.custom'      => [],
    
    // 添加任何自定义反序列化例程
    'dapr.deserializers.custom'    => [],
    
    // 以下设置为默认中间件，按指定顺序处理
    'dapr.http.middleware.request'  => [get(Tracing::class)],
    'dapr.http.middleware.response' => [get(ApplicationJson::class), get(Tracing::class)],
];
```

## 创建您的服务

创建`index.php`并放入以下内容：

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

## 试用

使用`dapr init`初始化Dapr，然后使用`dapr run -a dev -p 3000 -- php -S 0.0.0.0:3000`启动项目。

您现在可以打开一个网页浏览器并访问[http://localhost:3000/hello/world](http://localhost:3000/hello/world)，将`world`替换为您的名字、宠物的名字或您想要的任何内容。

恭喜，您已经创建了您的第一个Dapr服务！期待看到您会用它做些什么！

## 更多信息

- [Packagist](https://packagist.org/packages/dapr/php-sdk)
- [Dapr SDK 序列化]({{< ref sdk-serialization.md >}})
