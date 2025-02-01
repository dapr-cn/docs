---
type: docs
title: "生产参考：actor"
linkTitle: "生产参考"
weight: 1000
description: 在生产环境中执行PHP角色
no_list: true
---

## 代理模式

actor代理有四种模式可供选择。每种模式都有不同的优缺点，您需要在开发和生产中进行权衡。

```php
<?php
\Dapr\Actors\Generators\ProxyFactory::GENERATED;
\Dapr\Actors\Generators\ProxyFactory::GENERATED_CACHED;
\Dapr\Actors\Generators\ProxyFactory::ONLY_EXISTING;
\Dapr\Actors\Generators\ProxyFactory::DYNAMIC;
```

可以通过`dapr.actors.proxy.generation`配置键进行设置。

{{< tabs "GENERATED" "GENERATED_CACHED" "ONLY_EXISTING" "DYNAMIC" >}}
{{% codetab %}}

这是默认模式。在此模式下，每个请求都会生成一个类并通过`eval`执行。主要用于开发环境，不建议在生产中使用。

{{% /codetab %}}
{{% codetab %}}

这与`ProxyModes::GENERATED`相同，但类会存储在一个临时文件中，因此不需要在每个请求时重新生成。由于无法判断何时更新缓存的类，因此不建议在开发中使用，但在无法手动生成文件时可以使用。

{{% /codetab %}}
{{% codetab %}}

在此模式下，如果代理类不存在，则会抛出异常。这对于不希望在生产中生成代码的情况很有用。您必须确保类已生成并预加载/自动加载。

### 生成代理

您可以创建一个composer脚本以按需生成代理，以利用`ONLY_EXISTING`模式。

创建一个`ProxyCompiler.php`

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

然后在`composer.json`中为生成的代理添加一个psr-4自动加载器和一个脚本：

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

最后，配置dapr仅使用生成的代理：

```php
<?php
// 在config.php中

return [
    'dapr.actors.proxy.generation' => ProxyFactory::ONLY_EXISTING,
];
```

{{% /codetab %}}
{{% codetab %}}

在此模式下，代理满足接口契约，但实际上并不实现接口本身（意味着`instanceof`将为`false`）。此模式利用PHP中的一些特性，适用于无法`eval`或生成代码的情况。

{{% /codetab %}}
{{< /tabs >}}

### 请求

创建actor代理在任何模式下都是非常高效的。在创建actor代理对象时没有请求。

当您调用代理对象上的方法时，只有您实现的方法由您的actor实现服务。`get_id()`在本地处理，而`get_reminder()`、`delete_reminder()`等由`daprd`处理。

## actor实现

每个PHP中的actor实现都必须实现`\Dapr\Actors\IActor`并使用`\Dapr\Actors\ActorTrait`特性。这允许快速反射和一些快捷方式。使用`\Dapr\Actors\Actor`抽象基类可以为您做到这一点，但如果您需要覆盖默认行为，可以通过实现接口和使用特性来实现。

## 激活和停用

当actor激活时，会将一个令牌文件写入临时目录（默认情况下在Linux中为`'/tmp/dapr_' + sha256(concat(Dapr type, id))`，在Windows中为`'%temp%/dapr_' + sha256(concat(Dapr type, id))`）。这会一直保留到actor停用或主机关闭。这允许在Dapr在主机上激活actor时仅调用一次`on_activation`。

## 性能

在使用`php-fpm`和`nginx`或Windows上的IIS的生产环境中，actor方法调用非常快。即使actor在每个请求中构建，actor状态键仅在需要时加载，而不是在每个请求中加载。然而，单独加载每个键会有一些开销。可以通过在状态中存储数据数组来缓解这一问题，以速度换取一些可用性。建议不要从一开始就这样做，而是在需要时作为优化。

## 状态版本控制

`ActorState`对象中的变量名称直接对应于存储中的键名。这意味着如果您更改变量的类型或名称，可能会遇到错误。为了解决这个问题，您可能需要对状态对象进行版本控制。为此，您需要覆盖状态的加载和存储方式。有很多方法可以解决这个问题，其中一种解决方案可能是这样的：

```php
<?php

class VersionedState extends \Dapr\Actors\ActorState {
    /**
     * @var int 存储中状态的当前版本。我们给出当前版本的默认值。
     * 然而，它可能在存储中有不同的值。
     */
    public int $state_version = self::VERSION;
    
    /**
     * @var int 数据的当前版本
     */
    private const VERSION = 3;
    
    /**
     * 当您的actor激活时调用。
     */
    public function upgrade() {
        if($this->state_version < self::VERSION) {
            $value = parent::__get($this->get_versioned_key('key', $this->state_version));
            // 在更新数据结构后更新值
            parent::__set($this->get_versioned_key('key', self::VERSION), $value);
            $this->state_version = self::VERSION;
            $this->save_state();
        }
    }
    
    // 如果您在上面的方法中根据需要升级所有键，则在加载/保存时不需要遍历以前的键，
    // 您可以直接获取键的当前版本。
    
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
        // 可选：您可以取消设置键的以前版本
        parent::__set($this->get_versioned_key($key, self::VERSION), $value);
    }
    
    public function __unset(string $key) : void {
        // 取消设置此版本和所有以前版本
        $this->walk_versions(
            self::VERSION, 
            fn($version) => parent::__unset($this->get_versioned_key($key, $version)), 
            fn() => false
        );
    }
}
```

有很多可以优化的地方，在生产中直接使用这个不是一个好主意，但您可以了解它的工作原理。很多将取决于您的用例，这就是为什么在SDK中没有这样的东西。例如，在这个示例实现中，保留了以前的值，以防在升级期间可能出现错误；保留以前的值允许再次运行升级，但您可能希望删除以前的值。