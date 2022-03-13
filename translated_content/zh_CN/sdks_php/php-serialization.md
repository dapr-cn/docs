---
type: docs
title: "自定义序列化"
linkTitle: "自定义序列化"
weight: 1000
description: 如何配置序列化
no_list: true
---

Dapr 使用 JSON 序列化，因此发送/接收数据时会丢失(复杂) 类型信息。

## 序列化

当从控制器返回对象时，将对象传递到 `DaprClient`， 或将对象存储在状态存储中时，只有公共属性被扫描和序列化。 您可以通过自定义 `\Dapr\Serialization\ISerialization` 来实现。 例如，如果您想要创建一个序列化为字符串的 ID 类型，您可以这样做：

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

这适用于我们拥有完全所有权的任何类型，但它对库或PHP本身的类不适用。 为此，您需要在 DI 容器中注册一个自定义序列器：

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

## 反序列化

除非接口是 `\Dapr\Deserialization\Deserializers\IDeserialize` ，否则反序列化的工作方式完全相同。
