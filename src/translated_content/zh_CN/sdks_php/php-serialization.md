---
type: docs
title: "自定义序列化"
linkTitle: "自定义序列化器"
weight: 1000
description: 如何配置序列化
no_list: true
---

Dapr 使用 JSON 进行序列化，因此在发送或接收数据时，复杂类型的信息可能会丢失。

## 序列化

当从控制器返回对象、将对象传递给 `DaprClient` 或将对象存储在状态存储中时，只有公共属性会被扫描和序列化。您可以通过实现 `\Dapr\Serialization\ISerialize` 接口来自定义此行为。例如，如果您想创建一个序列化为字符串的 ID 类型，可以这样实现：

```php
<?php

class MyId implements \Dapr\Serialization\Serializers\ISerialize 
{
    public string $id;
    
    public function serialize(mixed $value, \Dapr\Serialization\ISerializer $serializer): mixed
    {
        // $value === $this
        return $this->id; 
    }
}
```

这种方法适用于我们完全控制的类型，但不适用于库或 PHP 自带的类。对于这些情况，您需要在依赖注入容器中注册一个自定义序列化器：

```php
<?php
// 在 config.php 中

class SerializeSomeClass implements \Dapr\Serialization\Serializers\ISerialize 
{
    public function serialize(mixed $value, \Dapr\Serialization\ISerializer $serializer): mixed 
    {
        // 序列化 $value 并返回结果
    }
}

return [
    'dapr.serializers.custom' => [SomeClass::class => new SerializeSomeClass()],
];
```

## 反序列化

反序列化的过程与序列化类似，只是使用的接口是 `\Dapr\Deserialization\Deserializers\IDeserialize`。
