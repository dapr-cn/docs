---
type: docs
title: "参考：actor"
linkTitle: "Production Reference"
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

它可以使用 `dapr.actors.proxy.generate` 配置密钥。

{{< tabs "GENERATED" "GENERATED_CACHED" "ONLY_EXISTING" "DYNAMIC" >}}
{{% codetab %}}

这是默认的模式。 在这种模式下，每次请求都会生成一个 `eval`类， 它主要用于开发环境而不能应用于生产。 它主要用于开发环境而不能应用于生产。

{{% /codetab %}}
{{% codetab %}}

这与 `ProxyModes::GENERATED` 相同，但这个类存储在临时文件中，所以不需要在每个请求中重新生成。 它不知道何时更新缓存的类，也无法手动生成文件时提供，因此不建议在开发中使用它

{{% /codetab %}}
{{% codetab %}}

在这种模式下，如果不存在代理类，将会抛出异常。 可以用在当你不想在生产生产环境中生成代码时 您必须确保class生成并自动加载。

### 生成代理

您可以创建一个编写器脚本来根据需要生成代理，以利用`ONLY_EXISTING`模式。

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

最后，将dapr配置为仅使用生成的代理：

```php
<?php
// in config.php

return [
    'dapr.actors.proxy.generation' => ProxyFactory::ONLY_EXISTING,
];
```

{{% /codetab %}}
{{% codetab %}}

然而，在这种模式下，代理人满足了接口契约。 它实际上没有实现接口本身 (意指 `instanceof` 将是 `false`). 这种模式利用了PHP中的一些特性来工作，并适用于某些情况 其中code不能是`eval`'d或生成。

{{% /codetab %}}
{{< /tabs >}}

### 请求列表

无论使用哪种模式，创建actor代理都是非常方便的。 在创建actor代理对象时不会发出请求。

当您在代理对象上调用方法时，actor只会为您实现的方法提供服务。 `get_id()` 是本地处理的， `get_emergder()`, `delete_emergder()`, 等由 `daprd` 处理。

## 添加Actor实现

PHP 中的每个执行者必须实现 `\Dapr\Actors\Iactor` 并使用 `\Dapr\Actors\ActorTrait` 特性。 这个支持反射. 使用 `\Dapr\Actors\Actor` 抽象基础类为您服务。 使用 `\Dapr\Actors\Actor` 抽象基础类为您服务。 但是 如果您需要覆盖默认行为，您可以通过实现接口和使用特性来做到这一点。

## 激活和停用

当actor激活时，令牌文件将被写入临时目录（默认情况下，该目录位于linux下 `'/tmp/dapr_'+ sha256（concat（Dapr type，Id））&lt;/ code&gt;和Windows上的<code>'％temp％/ dapr_'+ sha256（concat（Dapr type，Id））&lt;/ code&gt;）。
这种情况持续到actor或host停用。 这允许<code> on_activation `被调用一次 并且只有Dapr激活host上的actor时才执行一次。

## 性能

actor方法的执行效率非常高， `php-fpm` and `nginx`, 或 IIS 在 Windows 上有一个生产设置。 虽然actor是在每个请求上都会构造，actor状态密钥是按需加载，而不是在每个请求时加载。 在分别加载每个key时会有一些开销。 可以通过在状态中存储数据数组来缓解这种情况 ，为了速度而牺牲了一些可用性。 不建议从一开始就这样做，而是在需要 时作为一种优化。

## 版本状态

`ActorState`对象中的变量名直接对应于存储库中的键名。 这意味着如果更改一个变量的类型或名称，可能会出现错误。 为了解决这个问题，您可能需要对状态进行版本控制 因此，您需要重写状态的加载和存储方式。 There are many ways to approach this, one such solution might be something like this:

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

示例代码有很多要优化的地方，在生产中不建议这样使用 很多时候它将取决于您的使用案例，所以在这个SDK 中没有这种情况。 例如，在此示例实现中，针对升级期间可能存在错误的位置保留了先前的值；保留先前的值可以再次运行升级，但是您可能希望删除先前的值。 
