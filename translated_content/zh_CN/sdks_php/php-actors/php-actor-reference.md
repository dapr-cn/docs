---
type: docs
title: "生产参考：Actor"
linkTitle: "生产参考"
weight: 1000
description: 在生产中使用 PHP actor
no_list: true
---

## 代理模式

Actor 代理有四种处理方式。 每种模式都需要您在开发和生产过程中权衡。

```php
<?php
\Dapr\Actors\Generators\ProxyFactory::GENERATED;
\Dapr\Actors\Generators\ProxyFactory::GENERATED_CACHED;
\Dapr\Actors\Generators\ProxyFactory::ONLY_EXISTING;
\Dapr\Actors\Generators\ProxyFactory::DYNAMIC;
```

可以使用 `dapr.actor.proxy.generation` 配置键来设置它。

{{< tabs "GENERATED" "GENERATED_CACHED" "ONLY_EXISTING" "DYNAMIC" >}}
{{% codetab %}}

这是默认的模式。 在这种模式下，每次请求都会生成一个 `eval` 类并进行 `eval`。 它主要用于开发环境而不能应用于生产。

{{% /codetab %}}
{{% codetab %}}

这与 `ProxyModes::GENERATED` 相同，但这个类存储在临时文件中，所以不需要在每个请求中重新生成。 它不知道何时更新缓存的类，所以不鼓励在开发中使用它，但在手动生成文件不可行的情况下可以使用。

{{% /codetab %}}
{{% codetab %}}

在这种模式下，如果不存在代理类，将会抛出异常。 当你不想在生产中生成代码时，这很有用。 你必须确保该类被生成并被预先/自动加载。

### 生成代理

你可以创建一个 composer 脚本来按需生成代理，以利用 `ONLY_EXISTING` 模式。

创建 `ProxyCompiler.php`

```php
<?php

class ProxyCompiler {
    private const PROXIES = [
        MyActorInterface::class,
        MyOtherActorInterface::class,
    ];

    private const PROXY_LOCATION = __DIR__.'/proxies/';

    public static function compile() {
        try {
            $app = \Dapr\App::create();
            foreach(self::PROXIES as $interface) {
                $output = $app->run(function(\DI\FactoryInterface $factory) use ($interface) {
                    return \Dapr\Actors\Generators\FileGenerator::generate($interface, $factory);
                });
                $reflection = new ReflectionClass($interface);
                $dapr_type = $reflection->getAttributes(\Dapr\Actors\Attributes\DaprType::class)[0]->newInstance()->type;
                $filename = 'dapr_proxy_'.$dapr_type.'.php';
                file_put_contents(self::PROXY_LOCATION.$filename, $output);
                echo "Compiled: $interface";
            }
        } catch (Exception $ex) {
            echo "Failed to generate proxy for $interface\n{$ex->getMessage()} on line {$ex->getLine()} in {$ex->getFile()}\n";
        }
    }
}
```

然后在 `composer.json` 中为生成的代理添加一个 psr-4 自动加载器和脚本：

```json
{
  "autoload": {
    "psr-4": {
      "Dapr\\Proxies\\": "path/to/proxies"
    }
  },
  "scripts": {
    "compile-proxies": "ProxyCompiler::compile"
  }
}
```

最后，将 dapr 配置为仅使用生成的代理：

```php
<?php
// in config.php

return [
    'dapr.actors.proxy.generation' => ProxyFactory::ONLY_EXISTING,
];
```

{{% /codetab %}}
{{% codetab %}}

在此模式下，代理满足接口契约，但是，它实际上并没有实现接口本身（这意味着 `instanceof` 将为 `false`）。 此模式利用 PHP 中的一些特性来工作，并且适用于代码无法 `eval` 或生成的情况。

{{% /codetab %}}
{{< /tabs >}}

### 请求

无论使用哪种模式，创建 actor 代理都是非常方便的。 创建 actor 代理对象时不发出任何请求。

在代理对象上调用方法时，只有你实现的方法才会由你的 actor 实现提供服务。 `get_id()` 在本地处理， `get_emergder()`, `delete_emergder()` 等由 `daprd` 处理。

## Actor 实现

PHP 中的每个 actor 实现都必须实现 `\Dapr\Actor\IActor` ，并使用 `\Dapr\Actor\ActorTrait` 特征。 这个允许快速反射和一些快捷方式。 使用 `\Dapr\Actor\Actor` 抽象基类可以执行此操作，但，如果需要覆盖默认行为，可以通过实现接口并使用 trait 来实现。

## 激活和停用

当 actor 激活时, 令牌文件被写入到临时目录 (默认情况下，在 linux 中是 `'/tmp/dapr_' + sha256(concat(Dapr type, id))`，而在 windows 中是 `'%temp%/dapr_' + sha256(concat(Dapr type, id))`). 这将一直保持，直到 actor 停用或主机关闭。 这允许 `on_activation` 被调用一次，并且仅在 Dapr 激活主机上的 actor 时被调用一次。

## 性能

Actor 方法调用在用 `php-fpm` ， `nginx` 或 WINDOWS 上的 IIS 做的生产设置上的非常快。 虽然 actor 在每个请求中都会构造，但 actor 状态键只是按需加载，而不是在每次请求中加载。 然而，单独加载每个键会有一些开销。 这可以通过在状态中存储一个数据数组来缓解，用一些可用性换取速度。 不建议从一开始就这样做，而是在需要时作为一种优化。

## 版本控制状态

`ActorState` 对象中的变量名直接对应于存储中的键名。 这意味着如果更改变量的类型或名称，可能会出现错误。 为了解决这个问题，您可能需要对状态对象进行版本控制。 因此，您需要覆盖状态的加载和存储方式。 有很多方法可以解决这个问题，其中有一个解决方案可能是这样的：

```php
<?php

class VersionedState extends \Dapr\Actors\ActorState {
    /**
     * @var int The current version of the state in the store. We give a default value of the current version. 
     * However, it may be in the store with a different value. 
     */
    public int $state_version = self::VERSION;

    /**
     * @var int The current version of the data
     */
    private const VERSION = 3;

    /**
     * Call when your actor activates.
     */
    public function upgrade() {
        if($this->state_version < self::VERSION) {
            $value = parent::__get($this->get_versioned_key('key', $this->state_version));
            // update the value after updating the data structure
            parent::__set($this->get_versioned_key('key', self::VERSION), $value);
            $this->state_version = self::VERSION;
            $this->save_state();
        }
    }

    // if you upgrade all keys as needed in the method above, you don't need to walk the previous
    // keys when loading/saving and you can just get the current version of the key.

    private function get_previous_version(int $version): int {
        return $this->has_previous_version($version) ? $version - 1 : $version;
    }

    private function has_previous_version(int $version): bool {
        return $version >= 0;
    }

    private function walk_versions(int $version, callable $callback, callable $predicate): mixed {
        $value = $callback($version);
        if($predicate($value) || !$this->has_previous_version($version)) {
            return $value;
        }
        return $this->walk_versions($this->get_previous_version($version), $callback, $predicate);
    }

    private function get_versioned_key(string $key, int $version) {
        return $this->has_previous_version($version) ? $version.$key : $key;
    }

    public function __get(string $key): mixed {
        return $this->walk_versions(
            self::VERSION, 
            fn($version) => parent::__get($this->get_versioned_key($key, $version)),
            fn($value) => isset($value)
        );
    }

    public function __isset(string $key): bool {
        return $this->walk_versions(
            self::VERSION,
            fn($version) => parent::__isset($this->get_versioned_key($key, $version)),
            fn($isset) => $isset
        );
    }

    public function __set(string $key,mixed $value): void {
        // optional: you can unset previous versions of the key
        parent::__set($this->get_versioned_key($key, self::VERSION), $value);
    }

    public function __unset(string $key) : void {
        // unset this version and all previous versions
        $this->walk_versions(
            self::VERSION, 
            fn($version) => parent::__unset($this->get_versioned_key($key, $version)), 
            fn() => false
        );
    }
}
```

有很多需要优化的地方，在生产中照搬使用此不是一个好主意，但您可以了解它的工作原理要点。 这在很大程度上取决于你的使用情况，这就是为什么SDK中没有这样的东西 的原因。 例如，在此示例实现中，将保留以前的值，以表示在升级过程中可能存在错误的位置; 保留以前的值允许再次运行升级，但您可能希望删除以前的值。 
