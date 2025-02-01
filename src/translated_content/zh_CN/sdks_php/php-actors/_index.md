---
type: docs
title: "虚拟Actor"
linkTitle: "Actor"
weight: 1000
description: 如何构建actor
no_list: true
---

如果你对actor模式不熟悉，学习actor模式的最佳地方是[Actor概述]({{< ref actors-overview.md >}})。

在PHP SDK中，actor分为客户端和actor（也称为运行时）两部分。作为actor的客户端，你需要通过`ActorProxy`类与远程actor进行交互。此类通过几种配置策略之一动态生成代理类。

编写actor时，系统可以为你管理状态。你可以接入actor的生命周期，并定义提醒和定时器。这为你处理适合actor模式的各种问题提供了强大的能力。

## Actor代理

每当你想与actor通信时，你需要获取一个代理对象来进行通信。代理负责序列化你的请求，反序列化响应，并将其返回给你，同时遵循指定接口定义的契约。

为了创建代理，你首先需要一个接口来定义如何与actor发送和接收内容。例如，如果你想与一个仅跟踪计数的计数actor通信，你可以定义如下接口：

```php
<?php
#[\Dapr\Actors\Attributes\DaprType('Counter')]
interface ICount {
    function increment(int $amount = 1): void;
    function get_count(): int;
}
```

将此接口放在actor和客户端都可以访问的共享库中是个好主意（如果两者都是用PHP编写的）。`DaprType`属性告诉DaprClient要发送到的actor的名称。它应与实现的`DaprType`匹配，尽管你可以根据需要覆盖类型。

```php
<?php
$app->run(function(\Dapr\Actors\ActorProxy $actorProxy) {
    $actor = $actorProxy->get(ICount::class, 'actor-id');
    $actor->increment(10);
});
```

## 编写Actor

要创建actor，你需要实现之前定义的接口，并添加`DaprType`属性。所有actor*必须*实现`IActor`，然而有一个`Actor`基类实现了样板代码，使你的实现更简单。

这是计数器actor：

```php
<?php
#[\Dapr\Actors\Attributes\DaprType('Count')]
class Counter extends \Dapr\Actors\Actor implements ICount {
    function __construct(string $id, private CountState $state) {
        parent::__construct($id);
    }
    
    function increment(int $amount = 1): void {
        $this->state->count += $amount;
    }
    
    function get_count(): int {
        return $this->state->count;
    }
}
```

构造函数是最重要的部分。它至少需要一个名为`id`的参数，即actor的id。任何额外的参数都由DI容器注入，包括你想使用的任何`ActorState`。

### Actor生命周期

actor通过构造函数在每个针对该actor类型的请求中实例化。你可以使用它来计算临时状态或处理你需要的任何请求特定的启动，例如设置其他客户端或连接。

actor实例化后，可能会调用`on_activation()`方法。`on_activation()`方法在actor“唤醒”时或首次创建时调用。它不会在每个请求上调用。

接下来，调用actor方法。这可能来自定时器、提醒或客户端。你可以执行任何需要完成的工作和/或抛出异常。

最后，工作的结果返回给调用者。经过一段时间（取决于服务的配置方式），actor将被停用，并调用`on_deactivation()`方法。如果主机崩溃、daprd崩溃或发生其他错误导致无法成功调用，则可能不会调用此方法。

## Actor State

actor状态是一个扩展`ActorState`的“普通旧PHP对象”（POPO）。`ActorState`基类提供了一些有用的方法。以下是一个示例实现：

```php
<?php
class CountState extends \Dapr\Actors\ActorState {
    public int $count = 0;
}
```

## 注册Actor

Dapr期望在启动时知道服务可能托管的actor。你需要将其添加到配置中：

{{< tabs "生产环境" "开发环境" >}}

{{% codetab %}}

如果你想利用预编译的依赖注入，你需要使用工厂：

```php
<?php
// 在config.php中

return [
    'dapr.actors' => fn() => [Counter::class],
];
```

启动应用所需的全部内容：

```php
<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = \Dapr\App::create(
    configure: fn(\DI\ContainerBuilder $builder) => $builder->addDefinitions('config.php')->enableCompilation(__DIR__)
);
$app->start();
```

{{% /codetab %}}
{{% codetab %}}

```php
<?php
// 在config.php中

return [
    'dapr.actors' => [Counter::class]
];
```

启动应用所需的全部内容：

```php
<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = \Dapr\App::create(configure: fn(\DI\ContainerBuilder $builder) => $builder->addDefinitions('config.php'));
$app->start();
```

{{% /codetab %}}
{{< /tabs >}}