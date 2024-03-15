---
type: docs
title: .NET SDK中的Actor序列化
linkTitle: Actor序列化
weight: 300000
description: 使用.NET中的远程Actors对您的类型进行序列化的必要步骤
---

Dapr actor 包允许您在 .NET 应用程序中使用 Dapr 虚拟 actor，并进行强类型远程调用，但如果您打算从方法中发送和接收强类型数据，则需要了解一些关键原则。 在本指南中，您将学习如何配置您的类和记录，以便它们在运行时正确地进行序列化和反序列化。

# 数据合同序列化

当通过远程代理调用Dapr的虚拟actor时，您的数据将使用一个称为[数据契约序列化器](https://learn.microsoft.com/en-us/dotnet/framework/wcf/feature-details/serializable-types)的序列化引擎进行序列化，该引擎由[DataContractSerializer](https://learn.microsoft.com/en-us/dotnet/api/system.runtime.serialization.datacontractserializer)类实现，将您的C#类型转换为XML文档并进行相应的反序列化。 当发送或接收原始类型（如字符串或整数）时，此序列化过程是透明的，您无需进行任何准备工作。 然而，当使用诸如您创建的复杂类型时，有一些重要的规则需要考虑，以确保此过程顺利进行。

此序列化框架与 Dapr 无关，由.NET团队在 [.NET Github 仓库](https://github.com/dotnet/runtime/blob/main/src/libraries/System.Private.DataContractSerialization/src/System/Runtime/Serialization/DataContractSerializer.cs) 中单独维护。

## 可序列化的类型

在使用数据契约序列化器时，有几个重要的注意事项需要记住：

- 默认情况下，所有类型、可读/可写属性（在构造后）和标记为公开可见的字段都会被序列化
- 所有类型都必须公开一个无参数的构造函数，或者用 DataContractAttribute 属性进行修饰
- 仅在使用DataContractAttribute属性时支持仅初始化的setter
- 只读字段，没有Get和Set方法的属性，以及具有私有Get和Set方法的内部或私有属性在序列化过程中将被忽略
- 序列化支持使用KnownTypesAttribute属性通过使用其他未标记有DataContractAttribute属性的复杂类型
- 如果一个类型被标记为DataContractAttribute属性，那么你希望序列化和反序列化的所有成员都必须被标记为DataMemberAttribute属性，否则它们将被设置为它们的默认值

## 反序列化是如何工作的？

反序列化所使用的方法取决于类型是否使用了[DataContractAttribute](https://learn.microsoft.com/en-us/dotnet/api/system.runtime.serialization.datacontractattribute)属性进行装饰。 如果此属性不存在，则使用无参数构造函数创建类型的实例。 然后，使用各自的设置器将每个属性和字段映射到类型中，并将实例返回给调用者。

如果类型被标记为`[DataContract]`，序列化器会使用反射读取类型的元数据，并根据是否标记了`DataMemberAttribute`属性来确定应该包含哪些属性或字段，这是基于选择加入的方式进行的。 然后它在内存中分配一个未初始化的对象（避免使用任何构造函数，无论是参数化的还是非参数化的），然后直接在每个映射的属性或字段上设置值，即使是私有的或使用了只读的设置器。 序列化回调在整个过程中根据需要被调用，然后将对象返回给调用方。

强烈推荐使用序列化属性，因为它们可以提供更大的灵活性，可以覆盖名称和命名空间，并且通常可以使用更多的现代C#功能。 虽然默认的序列化程序可以用于基本类型，但不建议用于任何自定义类型，无论是类、结构体还是记录类型。  建议如果您使用DataContractAttribute属性装饰一个类型，您也要明确地使用DataMemberAttribute属性装饰您想要序列化或反序列化的每个成员。

### .NET 类

在数据契约序列化器中，类是完全支持的，前提是遵循本页面和[数据契约序列化器](https://learn.microsoft.com/en-us/dotnet/framework/wcf/feature-details/serializable-types)文档中的其他规则。

在这里最重要的是要记住，你必须要么有一个公共的无参数构造函数，要么你必须用适当的属性进行修饰。 让我们回顾一些例子，以真正澄清什么能够工作，什么不能工作。

在下面的示例中，我们展示了一个名为Doodad的简单类。 我们这里没有提供一个显式的构造函数，所以编译器会提供一个默认的无参数构造函数。 因为我们正在使用[支持的原始类型](###supported-primitive-types)（Guid、string和int32），并且所有成员都有公共的getter和setter，所以不需要任何属性，我们将能够在从Dapr actor方法发送和接收时无问题地使用这个类。

```csharp
public class Doodad
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public int Count { get; set; }
}
```

默认情况下，这将使用类型中成员的名称以及实例化时使用的任何值进行序列化：

```xml
<Doodad>
  <Id>a06ced64-4f42-48ad-84dd-46ae6a7e333d</Id>
  <Name>DoodadName</Name>
  <Count>5</Count>
</Doodad>
```

所以让我们来调整一下 - 让我们添加自己的构造函数，并且只在成员上使用只读属性设置器。 这将无法进行序列化和反序列化，不是因为使用了只读设置器，而是因为没有无参数的构造函数。

```csharp
// WILL NOT SERIALIZE PROPERLY!
public class Doodad
{
    public Doodad(string name, int count)
    {
        Id = Guid.NewGuid();
        Name = name;
        Count = count;
    }

    public Guid Id { get; set; }
    public string Name { get; init; }
    public int Count { get; init; }
}
```

如果我们为该类型添加一个公共的无参数构造函数，我们就可以继续并且这将在没有进一步注解的情况下工作。

```csharp
public class Doodad
{
    public Doodad()
    {
    }

    public Doodad(string name, int count)
    {
        Id = Guid.NewGuid();
        Name = name;
        Count = count;
    }

    public Guid Id { get; set; }
    public string Name { get; set; }
    public int Count { get; set; }
}
```

但是如果我们不想添加这个构造函数呢？ 也许您不希望开发人员意外地使用错误的构造函数创建此 Doodad 的实例。 这就是更灵活的属性的用处所在。 如果您使用[DataContractAttribute](https://learn.microsoft.com/en-us/dotnet/api/system.runtime.serialization.datacontractattribute)属性装饰您的类型，您可以去掉无参数的构造函数，它将再次正常工作。

```csharp
[DataContract]
public class Doodad
{
    public Doodad(string name, int count)
    {
        Id = Guid.NewGuid();
        Name = name;
        Count = count;
    }

    public Guid Id { get; set; }
    public string Name { get; set; }
    public int Count { get; set; }
}
```

在上面的示例中，我们不需要再使用[DataMemberAttribute](https://learn.microsoft.com/en-us/dotnet/api/system.runtime.serialization.datamemberattribute)属性，因为我们再次使用了序列化器支持的[内置基元类型](###supported-primitive-types)。 但是，如果我们使用属性，我们会获得更多的灵活性。 通过DataContractAttribute属性，我们可以使用Namespace参数指定自己的XML命名空间，并通过Name参数在序列化为XML文档时更改类型的名称。

这是一种推荐的做法，将DataContractAttribute属性附加到类型上，并将DataMemberAttribute属性附加到您想要序列化的所有成员上 - 如果它们不是必需的，并且您不更改默认值，它们将被忽略，但它们为您提供了一种机制，以选择序列化否则不会包括的成员，比如那些标记为私有的成员或者是复杂类型或集合本身。

请注意，如果您选择将私有成员序列化，它们的值将被序列化为纯文本-它们可以被查看、拦截和潜在地根据您在序列化后如何处理数据进行操作，因此在您的用例中是否要标记这些成员是一个重要的考虑因素。

在下面的示例中，我们将看到如何使用属性来更改一些成员的序列化名称，并引入[IgnoreDataMemberAttribute](https://learn.microsoft.com/en-us/dotnet/api/system.runtime.serialization.ignoredatamemberattribute)属性。 正如名称所示，这告诉序列化器跳过该属性，即使它本来符合序列化的条件。 此外，由于我在类型上使用了DataContractAttribute属性进行装饰，这意味着我可以在属性上使用只能在初始化时设置的setter。

```csharp
[DataContract(Name="Doodad")]
public class Doodad
{
    public Doodad(string name = "MyDoodad", int count = 5)
    {
        Id = Guid.NewGuid();
        Name = name;
        Count = count;
    }

    [DataMember(Name = "id")]
    public Guid Id { get; init; }
    [IgnoreDataMember]
    public string Name { get; init; }
    [DataMember]
    public int Count { get; init; }
}
```

当这个被序列化时，由于我们正在更改序列化成员的名称，我们可以预期使用默认值创建一个新的Doodad实例进行序列化:

```xml
<Doodad>
  <id>a06ced64-4f42-48ad-84dd-46ae6a7e333d</id>
  <Count>5</Count>
</Doodad>
```

#### C# 12中的类 - 主要构造函数

C# 12 带给我们类的主要构造函数。 使用主构造函数意味着编译器将被阻止创建默认的隐式无参数构造函数。 虽然类上的主构造函数不会生成任何公共属性，但这意味着如果您在主构造函数中传递任何参数或在类中使用非原始类型，您将需要指定自己的无参数构造函数或使用序列化属性。

这里是一个示例，我们在主构造函数中使用ILogger将其注入到一个字段中，并且添加了自己的无参数构造函数，而不需要任何属性。

```csharp
public class Doodad(ILogger<Doodad> _logger)
{
    public Doodad() {} //Our parameterless constructor

    public Doodad(string name, int count)
    {
        Id = Guid.NewGuid();
        Name = name;
        Count = count;
    }

    public Guid Id { get; set; }
    public string Name { get; set; }
    public int Count { get; set; } 
}
```

并且使用我们的序列化属性（同样，选择init-only setters，因为我们使用了序列化属性）：

```csharp
[DataContract]
public class Doodad(ILogger<Doodad> _logger)
{
    public Doodad(string name, int count)
    {
        Id = Guid.NewGuid();
        Name = name;
        Count = count;
    }

    [DataMember]
    public Guid Id { get; init; }
    [DataMember]
    public string Name { get; init; }
    [DataMember]
    public int Count { get; init; }
}
```

### .NET 结构体

结构体受到Data Contract序列化器的支持，前提是它们被标记为DataContractAttribute属性，并且您希望序列化的成员被标记为DataMemberAttribute属性。 此外，为了支持反序列化，该结构体还需要具有无参数的构造函数。 即使在C# 10中启用了自定义的无参数构造函数，这也是有效的。

```csharp
[DataContract]
public struct Doodad
{
    [DataMember]
    public int Count { get; set; }
}
```

### .NET Records

Records 在C# 9中引入，与类在序列化方面遵循完全相同的规则。 我们建议您使用DataContractAttribute属性装饰所有记录，并使用DataMemberAttribute属性装饰您希望序列化的成员，以便在使用此功能或其他较新的C#功能时不会遇到任何反序列化问题。 因为记录类默认使用只读属性的 init-only setter，并鼓励使用主构造函数，将这些属性应用于您的类型可以确保序列化程序可以适当地处理您的类型。

通常，记录以使用新的主构造函数概念的简单的一行语句呈现：

```csharp
public record Doodad(Guid Id, string Name, int Count);
```

当你在Dapr actor方法调用中使用它时，如果没有可用的无参数构造函数，也没有使用上述属性进行装饰，它将抛出错误，鼓励使用序列化属性。

在这里，我们添加了一个显式的无参数构造函数，这样就不会抛出错误，但是在反序列化过程中，由于它们是使用只读设置器创建的，所以没有任何值被设置。 因为这个不使用DataContractAttribute属性或者DataMemberAttribute属性在任何成员上，所以在反序列化过程中，序列化器将无法正确地映射目标成员。

```csharp
public record Doodad(Guid Id, string Name, int Count)
{
    public Doodad() {}
}
```

这种方法不使用额外的构造函数，而是依赖于序列化属性。 因为我们使用DataContractAttribute属性标记类型，并使用DataMemberAttribute属性装饰每个成员，所以序列化引擎将能够将XML文档映射到我们的类型而没有问题。

```csharp
[DataContract]
public record Doodad(
        [property: DataMember] Guid Id,
        [property: DataMember] string Name,
        [property: DataMember] int Count)
```

### 支持的基本类型

在.NET中有几种被视为原始类型的类型，可以在开发者无需额外努力的情况下进行序列化：

- [Byte](https://learn.microsoft.com/zh-cn/dotnet/api/system.byte)
- [SByte](https://learn.microsoft.com/zh-cn/dotnet/api/system.sbyte)
- [Int16](https://learn.microsoft.com/zh-cn/dotnet/api/system.int16)
- [Int32](https://learn.microsoft.com/zh-cn/dotnet/api/system.int32)
- [Int64](https://learn.microsoft.com/zh-cn/dotnet/api/system.int64)
- [UInt16](https://learn.microsoft.com/zh-cn/dotnet/api/system.uint16)
- [UInt32](https://learn.microsoft.com/zh-cn/dotnet/api/system.uint32)
- [UInt64](https://learn.microsoft.com/zh-cn/dotnet/api/system.uint64)
- [Single](https://learn.microsoft.com/zh-cn/dotnet/api/system.single)
- [Double](https://learn.microsoft.com/zh-cn/dotnet/api/system.double)
- [Boolean](https://learn.microsoft.com/zh-cn/dotnet/api/system.boolean)
- [Char](https://learn.microsoft.com/zh-cn/dotnet/api/system.char)
- [Decimal](https://learn.microsoft.com/zh-cn/dotnet/api/system.decimal)
- [Object](https://learn.microsoft.com/zh-cn/dotnet/api/system.object)
- [String](https://learn.microsoft.com/zh-cn/dotnet/api/system.string)

实际上还有其他类型，它们不是原始类型，但具有类似的内置支持：

- [DateTime](https://learn.microsoft.com/zh-cn/dotnet/api/system.datetime)
- [TimeSpan](https://learn.microsoft.com/zh-cn/dotnet/api/system.timespan)
- [Guid](https://learn.microsoft.com/zh-cn/dotnet/api/system.guid)
- [Uri](https://learn.microsoft.com/zh-cn/dotnet/api/system.uri)
- [XmlQualifiedName](https://learn.microsoft.com/zh-cn/dotnet/api/system.xml.xmlqualifiedname)

再次，如果您想通过您的Actor方法传递这些类型，无需额外考虑，因为它们会被序列化和反序列化而无问题。 此外，自身标有(SerializeableAttribute)[https\://learn.microsoft.com/en-us/dotnet/api/system.serializableattribute]属性的类型将被序列化。

### 枚举类型

枚举，包括标志枚举，在适当标记的情况下是可序列化的。 要序列化的枚举成员必须使用[EnumMemberAttribute](https://learn.microsoft.com/en-us/dotnet/api/system.runtime.serialization.enummemberattribute)属性进行标记。 在此属性的可选Value参数中传递自定义值，将允许您指定在序列化文档中用于成员的值，而不是让序列化程序根据成员的名称推导出来。

枚举类型不要求类型被`DataContractAttribute`属性修饰，只要你希望序列化的成员被`EnumMemberAttribute`属性修饰即可。

```csharp
public enum Colors
{
    [EnumMember]
    Red,
    [EnumMember(Value="g")]
    Green,
    Blue, //Even if used by a type, this value will not be serialized as it's not decorated with the EnumMember attribute
}
```

### 集合类型

关于数据联系序列化器，所有实现 [IEnumerable](https://learn.microsoft.com/en-us/dotnet/api/system.collections.ienumerable) 接口的集合类型，包括数组和泛型集合，都被视为集合。 那些实现了[IDictionary](https://learn.microsoft.com/en-us/dotnet/api/system.collections.idictionary)或通用的[IDictionary\<TKey, TValue>](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.idictionary-2)的类型被视为字典集合；其他所有类型都被视为列表集合。

与其他复杂类型类似，集合类型必须提供一个无参数的构造函数。 此外，它们还必须有一个名为Add的方法，以便可以正确地进行序列化和反序列化。 这些集合类型使用的类型必须本身带有`DataContractAttribute`属性，或者按照本文档中的描述进行序列化。

### 数据合同版本控制

由于数据合同序列化器仅在Dapr中与通过代理方法将.NET SDK中的值序列化到Dapr actor实例并从中反序列化时使用，因此几乎不需要考虑数据合同的版本控制，因为数据不会在使用相同的序列化器的应用程序版本之间持久化。 对于那些对于学习更多关于数据合同版本控制感兴趣的人，请访问[这里](https://learn.microsoft.com/zh-cn/dotnet/framework/wcf/feature-details/data-contract-versioning)。

### 已知类型

通过对每个类型都使用[DataContractAttribute](https://learn.microsoft.com/en-us/dotnet/api/system.runtime.serialization.datacontractattribute)属性进行标记，可以轻松地嵌套自己的复杂类型。 这将告诉序列化程序如何执行反序列化操作。
但是如果你正在使用多态类型，并且其中一个成员是一个基类或接口，而该基类或接口有派生类或其他实现呢？ 在这里，您将使用[KnownTypeAttribute](https://learn.microsoft.com/en-us/dotnet/api/system.runtime.serialization.knowntypeattribute)属性，向序列化器提供关于如何进行的提示。

当你将 [KnownTypeAttribute](https://learn.microsoft.com/en-us/dotnet/api/system.runtime.serialization.knowntypeattribute) 属性应用于一个类型时，你正在通知数据契约序列化器可能遇到的子类型，使其能够正确处理这些类型的序列化和反序列化，即使在运行时实际类型与声明类型不同。

```chsarp
[DataContract]
[KnownType(typeof(DerivedClass))]
public class BaseClass
{
    //Members of the base class
}

[DataContract]
public class DerivedClass : BaseClass 
{
    //Additional members of the derived class
}
```

在这个示例中，`BaseClass` 被标记为 `[KnownType(typeof(DerivedClass))]`，这告诉数据契约序列化器 `DerivedClass` 是 `BaseClass` 的一个可能的实现，它可能需要进行序列化或反序列化。 没有这个属性，当序列化遇到实际上是`DerivedClass`类型的`BaseClass`实例时，序列化器将无法识别`DerivedClass`，这可能会导致序列化异常，因为序列化器不知道如何处理派生类型。 通过将所有可能的派生类型指定为已知类型，您可以确保序列化器能够正确处理该类型及其成员。

有关使用`[KnownType]`的更多信息和示例，请参阅[官方文档](https://learn.microsoft.com/en-us/dotnet/framework/wcf/feature-details/data-contract-known-types)。
