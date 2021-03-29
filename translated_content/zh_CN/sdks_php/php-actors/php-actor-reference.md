---
type: 文档
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

这是默认的模式。 在这种模式下，每次请求都会生成一个 `eval`类， 它主要用于开发环境而不能应用于生产。

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

Every actor implementation in PHP must implement `\Dapr\Actors\IActor` and use the `\Dapr\Actors\ActorTrait` trait. This allows for fast reflection and some shortcuts. Using the `\Dapr\Actors\Actor` abstract base class does this for you, but if you need to override the default behavior, you can do so by implementing the interface and using the trait.

## Activation and deactivation

When an actor activates, a token file is written to a temporary directory (by default this is in `'/tmp/dapr_' + sha256(concat(Dapr type, id))` in linux and `'%temp%/dapr_' + sha256(concat(Dapr type, id))` on Windows). This is persisted until the actor deactivates, or the host shuts down. This allows for `on_activation` to be called once and only once when Dapr activates the actor on the host.

## Performance

Actor method invocation is very fast on a production setup with `php-fpm` and `nginx`, or IIS on Windows. Even though the actor is constructed on every request, actor state keys are only loaded on-demand and not during each request. However, there is some overhead in loading each key individually. This can be mitigated by storing an array of data in state, trading some usability for speed. It is not recommended doing this from the start, but as an optimization when needed.

## Versioning state

The names of the variables in the `ActorState` object directly correspond to key names in the store. This means that if you change the type or name of a variable, you may run into errors. To get around this, you may need to version your state object. In order to do this, you'll need to override how state is loaded and stored. There are many ways to approach this, one such solution might be something like this:

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

There's a lot to be optimized, and it wouldn't be a good idea to use this verbatim in production, but you can get the gist of how it would work. A lot of it will depend on your use case which is why there's not something like this in the SDK. For instance, in this example implementation, the previous value is kept for where there may be a bug during an upgrade; keeping the previous value allows for running the upgrade again, but you may wish to delete the previous value. 
