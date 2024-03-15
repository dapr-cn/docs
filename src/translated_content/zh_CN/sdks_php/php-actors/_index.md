---
type: docs
title: Virtual Actor
linkTitle: Actors
weight: 1000
description: 如何创建 actor
no_list: true
---

如果您不熟悉 actor 模式，了解 actor 模式的最佳位置是
[Actor 概述]({{< ref actors-overview\.md >}})

在 PHP SDK 中，actor 有两个方面，即客户端和 Actor(也称为运行时)。 作为 actor 的客户端，你将通过 `ActorProxy` 类与远程 actor 交互。 此类使用多个已配置策略中的一个来动态生成代理类。

编写 actor 时，可以为您管理状态。 您可以挂钩到 actor 生命周期，并定义提示器和计时器。 这为您提供了相当大的能力来处理 Actor 模式适合的所有类型的问题。

## Actor 代理

每当你想要与 actor 通信时，你都需要一个代理对象来执行此操作。 代理负责序列化请求，反序列化响应，并将其返回，同时遵守指定接口定义的约束。

为了创建代理，您首先需要一个接口来定义从 actor 发送和接收的方式和内容。
例如，如果要与仅跟踪计数的计数 actor 进行通信，则可以按定义接口如下：

```php
<?php
#[\Dapr\Actors\Attributes\DaprType('Counter')]
interface ICount {
    function increment(int $amount = 1): void;
    function get_count(): int;
}
```

最好将此接口放在一个共享库中，参与者和客户端都可以访问该库（如果两者都是用 PHP 编写的）。 `DaprType` 属性告诉 DaprClient 要发送到的 actor 的名称。 它应该与实现的 `DaprType` 相匹配，尽管你可以根据需要覆盖这个类型。

```php
<?php
$app->run(function(\Dapr\Actors\ActorProxy $actorProxy) {
    $actor = $actorProxy->get(ICount::class, 'actor-id');
    $actor->increment(10);
});
```

## 编写 Actor

要创建一个演员，您需要实现之前定义的接口，并且还需要添加 `DaprType` 属性。 所有
actors _必须_ 实现 `IActor`，但是有一个 `Actor` 基类来实现基类，使您的实现更加简单。

这是一个计数器 actor：

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

最重要的一点是构造函数。 它至少需要一个参数，其名称为 `id` ，这是 actor 的id。 任何其他参数都由 DI 容器注入，包括任何要使用的 `ActorState`。

### Actor 的生命周期

Actor 通过构造函数在每个针对该 actor 类型的请求中被实例化。 你可以用它来计算临时状态，或者处理你所需要的任何一种特定请求的启动，例如设置其他客户端或连接。

在 actor 被实例化之后，`on_activation()` 方法可能被调用。 `on_activation()` 方法在 Actor 每次"唤醒"或首次创建时调用。 并非在每个请求上调用。

接下来，调用 actor 方法。 这可能来自计时器、提醒或客户端。 您可以执行任何需要完成的工作和/或抛出异常。

最后，工作结果将返回给调用方。 一段时间后（取决于您配置服务的方式），actor将被停用，并且`on_deactivation()`将被调用。 如果主机死机、daprd 崩溃或发生阻止其成功调用的其他错误，则可能不会调用此操作。

## Actor 状态

Actor状态是一个"Plain Old PHP Object"（POPO），它继承自`ActorState`。 `ActorState`基类提供了几个有用的方法。 下面是一个示例实现：

```php
<?php
class CountState extends \Dapr\Actors\ActorState {
    public int $count = 0;
}
```

## 注册一个Actor

Dapr 希望知道服务在启动时可以托管哪些 actor。 您需要将其添加到配置中：



{{% codetab %}}

如果要利用预编译的依赖关系注入，则需要使用工厂：

```php
<?php
// in config.php

return [
    'dapr.actors' => fn() => [Counter::class],
];
```

启动应用程序所需的所有内容：

```php
<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = \Dapr\App::create(
    configure: fn(\DI\ContainerBuilder $builder) => $builder->addDefinitions('config.php')->enableCompilation(__DIR__)
);
$app->start();
```



```php
<?php
// in config.php

return [
    'dapr.actors' => [Counter::class]
];
```

启动应用程序所需的所有内容：

```php
<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = \Dapr\App::create(configure: fn(\DI\ContainerBuilder $builder) => $builder->addDefinitions('config.php'));
$app->start();
```

