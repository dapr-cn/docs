---
type: docs
title: "自定义序列化"
linkTitle: "自定义序列化"
weight: 1000
description: 如何配置序列化
no_list: true
---

Dapr 使用 JSON 序列化，因此发送/接收数据时会丢失(复杂) 类型信息。

## 序列化（Serialization）

When returning an object from a controller, passing an object to the `DaprClient`, or storing an object in a state store, only public properties are scanned and serialized. You can customize this behavior by implementing `\Dapr\Serialization\ISerialize`. For example, if you wanted to create an ID type that serialized to a string, you may implement it like so:

```php
<?php

class MyId implements \Dapr\Serialization\Serializers\ISerialize 
{
    public string $id;

    public function serialize(mixed $value,\Dapr\Serialization\ISerializer $serializer): mixed
    {
        // $value === $this
        return $this->id; 
    }
}
```

This works for any type that we have full ownership over, however, it doesn't work for classes from libraries or PHP itself. For that, you need to register a custom serializer with the DI container:

```php
<?php
// in config.php

class SerializeSomeClass implements \Dapr\Serialization\Serializers\ISerialize 
{
    public function serialize(mixed $value,\Dapr\Serialization\ISerializer $serializer) : mixed 
    {
        // serialize $value and return the result
    }
}

return [
    'dapr.serializers.custom'      => [SomeClass::class => new SerializeSomeClass()],
];
```

## Deserialization

Deserialization works exactly the same way, except the interface is `\Dapr\Deserialization\Deserializers\IDeserialize`.
