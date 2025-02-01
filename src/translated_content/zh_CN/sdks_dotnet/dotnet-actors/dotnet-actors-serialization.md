---
type: docs
title: ".NET SDK 中的 Actor 序列化"
linkTitle: "Actor 序列化"
weight: 300000
description: 使用 .NET 中的远程 Actor 序列化类型的必要步骤
---

# Actor 序列化

Dapr actor 包使您能够在 .NET 应用程序中使用 Dapr 虚拟 actor，您可以选择使用弱类型或强类型客户端。每种方式都有不同的序列化方法。本文档将回顾这些差异，并传达一些在任一场景中需要理解的关键基本规则。

请注意，由于序列化方法的不同，弱类型和强类型 actor 客户端不能交替使用。使用一个 actor 客户端持久化的数据将无法通过另一个 actor 客户端访问，因此在整个应用程序中选择一种并一致使用非常重要。

## 弱类型 Dapr Actor 客户端

本节将介绍如何配置 C# 类型，以便在使用弱类型 actor 客户端时正确进行序列化和反序列化。这些客户端使用基于字符串的方法名称，并通过 System.Text.Json 序列化器来处理请求和响应负载。请注意，这个序列化框架并不是 Dapr 特有的，而是由 .NET 团队在 [.NET GitHub 仓库](https://github.com/dotnet/runtime/tree/main/src/libraries/System.Text.Json) 中单独维护的。

当使用弱类型 Dapr Actor 客户端从各种 actor 调用方法时，不需要独立序列化或反序列化方法负载，因为 SDK 会透明地为您处理这些操作。

客户端将使用您构建的 .NET 版本中可用的最新 System.Text.Json 版本，序列化受 [相关 .NET 文档](https://learn.microsoft.com/en-us/dotnet/standard/serialization/system-text-json/overview) 中提供的所有固有功能的影响。

序列化器将配置为使用 `JsonSerializerOptions.Web` [默认选项](https://learn.microsoft.com/en-us/dotnet/standard/serialization/system-text-json/configure-options?pivots=dotnet-8-0#web-defaults-for-jsonserializeroptions)，除非通过自定义选项配置覆盖，这意味着将应用以下内容：
- 属性名称的反序列化以不区分大小写的方式进行
- 属性名称的序列化使用 [驼峰命名法](https://en.wikipedia.org/wiki/Camel_case)，除非属性被 `[JsonPropertyName]` 属性覆盖
- 反序列化将从数字和/或字符串值读取数值

### 基本序列化

在以下示例中，我们展示了一个名为 Doodad 的简单类，尽管它也可以是一个记录。

```csharp
public class Doodad
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public int Count { get; set; }
}
```

默认情况下，这将使用类型中成员的名称以及实例化时的值进行序列化：

```json
{"id": "a06ced64-4f42-48ad-84dd-46ae6a7e333d", "name": "DoodadName", "count": 5}
```

### 覆盖序列化属性名称

可以通过将 `[JsonPropertyName]` 属性应用于所需属性来覆盖默认属性名称。

通常，对于您要持久化到 actor state 的类型，这不是必需的，因为您不打算独立于 Dapr 相关功能读取或写入它们，但以下内容仅用于清楚地说明这是可能的。

#### 覆盖类上的属性名称

以下是使用 `JsonPropertyName` 更改序列化后第一个属性名称的示例。请注意，`Count` 属性上最后一次使用 `JsonPropertyName` 与预期的序列化结果相匹配。这主要是为了演示应用此属性不会对任何内容产生负面影响——事实上，如果您稍后决定更改默认序列化选项但仍需要一致地访问之前序列化的属性，这可能是更可取的，因为 `JsonPropertyName` 将覆盖这些选项。

```csharp
public class Doodad
{
    [JsonPropertyName("identifier")]
    public Guid Id { get; set; }
    public string Name { get; set; }
    [JsonPropertyName("count")]
    public int Count { get; set; }
}
```

这将序列化为以下内容：

```json
{"identifier": "a06ced64-4f42-48ad-84dd-46ae6a7e333d", "name": "DoodadName", "count": 5}
```

#### 覆盖记录上的属性名称

让我们尝试对 C# 12 或更高版本中的记录做同样的事情：

```csharp
public record Thingy(string Name, [JsonPropertyName("count")] int Count); 
```

由于在主构造函数中传递的参数（在 C# 12 中引入）可以应用于记录中的属性或字段，因此在某些模糊情况下，使用 `[JsonPropertyName]` 属性可能需要指定您打算将属性应用于属性而不是字段。如果需要这样做，您可以在主构造函数中指明：

```csharp
public record Thingy(string Name, [property: JsonPropertyName("count")] int Count);
```

如果 `[property: ]` 应用于不需要的 `[JsonPropertyName]` 属性，它不会对序列化或反序列化产生负面影响，因为操作将正常进行，就像它是一个属性一样（如果没有标记为这样，通常会这样）。

### 枚举类型

枚举，包括平面枚举，可以序列化为 JSON，但持久化的值可能会让您感到惊讶。同样，开发人员不应独立于 Dapr 处理序列化数据，但以下信息至少可以帮助诊断为什么看似轻微的版本迁移没有按预期工作。

以下是提供一年中不同季节的 `enum` 类型：

```csharp
public enum Season
{
    Spring,
    Summer,
    Fall,
    Winter
}
```

我们将使用一个单独的演示类型来引用我们的 `Season`，同时展示这如何与记录一起工作：

```csharp
public record Engagement(string Name, Season TimeOfYear);
```

给定以下初始化实例：

```csharp
var myEngagement = new Engagement("Ski Trip", Season.Winter);
```

这将序列化为以下 JSON：

```json
{"name":  "Ski Trip", "season":  3}
```

这可能会让人意外，我们的 `Season.Winter` 值被表示为 `3`，但这是因为序列化器将自动使用从零开始的枚举值的数字表示，并为每个可用的附加值递增数字值。同样，如果进行迁移并且开发人员更改了枚举的顺序，这将在您的解决方案中引发破坏性更改，因为序列化的数字值在反序列化时将指向不同的值。

相反，`System.Text.Json` 提供了一个 `JsonConverter`，它将选择使用基于字符串的值而不是数字值。需要将 `[JsonConverter]` 属性应用于枚举类型本身以启用此功能，但随后将在引用枚举的任何下游序列化或反序列化操作中实现。

```csharp
[JsonConverter(typeof(JsonStringEnumConverter<Season>))]
public enum Season
{
    Spring,
    Summer,
    Fall,
    Winter
}
```

使用我们上面 `myEngagement` 实例中的相同值，这将生成以下 JSON：

```json
{"name":  "Ski Trip", "season":  "Winter"}
```

因此，枚举成员可以在不担心在反序列化期间引入错误的情况下进行调整。

#### 自定义枚举值

System.Text.Json 序列化平台不支持使用 `[EnumMember]` 来更改序列化或反序列化期间使用的枚举值，但在某些情况下这可能很有用。同样，假设您正在重构解决方案以为各种枚举应用更好的名称。您正在使用上面详细介绍的 `JsonStringEnumConverter<TType>`，因此您将枚举的名称保存为值而不是数字值，但如果您更改枚举名称，这将引入破坏性更改，因为名称将不再与 state 中的内容匹配。

请注意，如果您选择使用此方法，您应该为所有枚举成员装饰 `[EnumMeber]` 属性，以便为每个枚举值一致地应用值，而不是随意地。没有任何东西会在构建或运行时验证这一点，但这被认为是最佳实践操作。

在这种情况下，如何在仍然更改枚举成员名称的同时指定持久化的精确值？使用自定义 `JsonConverter` 和扩展方法，可以从附加的 `[EnumMember]` 属性中提取值。将以下内容添加到您的解决方案中：

```csharp
public sealed class EnumMemberJsonConverter<T> : JsonConverter<T> where T : struct, Enum
{
    /// <summary>读取并将 JSON 转换为类型 <typeparamref name="T" />。</summary>
    /// <param name="reader">读取器。</param>
    /// <param name="typeToConvert">要转换的类型。</param>
    /// <param name="options">指定要使用的序列化选项的对象。</param>
    /// <returns>转换后的值。</returns>
    public override T Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        // 从 JSON 读取器获取字符串值
        var value = reader.GetString();

        // 遍历所有枚举值
        foreach (var enumValue in Enum.GetValues<T>())
        {
            // 从 EnumMember 属性中获取值（如果有）
            var enumMemberValue = GetValueFromEnumMember(enumValue);

            // 如果值匹配，返回枚举值
            if (value == enumMemberValue)
            {
                return enumValue;
            }
        }

        // 如果没有找到匹配项，抛出异常
        throw new JsonException($"Invalid value for {typeToConvert.Name}: {value}");
    }

    /// <summary>将指定的值写为 JSON。</summary>
    /// <param name="writer">要写入的写入器。</param>
    /// <param name="value">要转换为 JSON 的值。</param>
    /// <param name="options">指定要使用的序列化选项的对象。</param>
    public override void Write(Utf8JsonWriter writer, T value, JsonSerializerOptions options)
    {
        // 从 EnumMember 属性中获取值（如果有）
        var enumMemberValue = GetValueFromEnumMember(value);

        // 将值写入 JSON 写入器
        writer.WriteStringValue(enumMemberValue);
    }

    private static string GetValueFromEnumMember(T value)
    {
        MemberInfo[] member = typeof(T).GetMember(value.ToString(), BindingFlags.DeclaredOnly | BindingFlags.Static | BindingFlags.Public);
        if (member.Length == 0)
            return value.ToString();
        object[] customAttributes = member.GetCustomAttributes(typeof(EnumMemberAttribute), false);
        if (customAttributes.Length != 0)
        {
            EnumMemberAttribute enumMemberAttribute = (EnumMemberAttribute)customAttributes;
            if (enumMemberAttribute != null && enumMemberAttribute.Value != null)
                return enumMemberAttribute.Value;
        }
        return value.ToString();
    }
}
```

现在让我们添加一个示例枚举器。我们将设置一个值，使用每个枚举成员的小写版本来演示这一点。不要忘记用 `JsonConverter` 属性装饰枚举，并在上节中使用我们的自定义转换器代替数字到字符串的转换器。

```csharp
[JsonConverter(typeof(EnumMemberJsonConverter<Season>))]
public enum Season
{
    [EnumMember(Value="spring")]
    Spring,
    [EnumMember(Value="summer")]
    Summer,
    [EnumMember(Value="fall")]
    Fall,
    [EnumMember(Value="winter")]
    Winter
}
```

让我们使用之前的示例记录。我们还将添加一个 `[JsonPropertyName]` 属性以增强演示：

```csharp
public record Engagement([property: JsonPropertyName("event")] string Name, Season TimeOfYear);
```

最后，让我们初始化这个新实例：

```csharp
var myEngagement = new Engagement("Conference", Season.Fall);
```

这次，序列化将考虑附加的 `[EnumMember]` 属性中的值，为我们提供了一种机制来重构我们的应用程序，而无需为 state 中现有的枚举值制定复杂的版本控制方案。

```json
{"event":  "Conference",  "season":  "fall"}
```

## 强类型 Dapr Actor 客户端

在本节中，您将学习如何配置类和记录，以便在使用强类型 actor 客户端时，它们在运行时能够正确序列化和反序列化。这些客户端是使用 .NET 接口实现的，并且<u>不</u>与使用其他语言编写的 Dapr actor 兼容。

此 actor 客户端使用称为 [数据契约序列化器](https://learn.microsoft.com/en-us/dotnet/framework/wcf/feature-details/serializable-types) 的引擎序列化数据，该引擎将您的 C# 类型转换为 XML 文档。此序列化框架并不是 Dapr 特有的，而是由 .NET 团队在 [.NET GitHub 仓库](https://github.com/dotnet/runtime/blob/main/src/libraries/System.Private.DataContractSerialization/src/System/Runtime/Serialization/DataContractSerializer.cs) 中单独维护的。

在发送或接收原始类型（如字符串或整数）时，此序列化会透明地进行，您无需进行任何准备。然而，当处理您创建的复杂类型时，有一些重要规则需要考虑，以便此过程顺利进行。

### 可序列化类型

使用数据契约序列化器时需要牢记几个重要注意事项：

- 默认情况下，所有类型、读/写属性（构造后）和标记为公开可见的字段都会被序列化
- 所有类型必须公开一个无参数构造函数或用 DataContractAttribute 属性装饰
- 仅在使用 DataContractAttribute 属性时支持仅初始化的设置器
- 只读字段、没有 Get 和 Set 方法的属性以及具有私有 Get 和 Set 方法的内部或属性在序列化期间会被忽略
- 通过使用 KnownTypesAttribute 属性，支持使用其他复杂类型的类型的序列化，这些复杂类型本身未标记为 DataContractAttribute 属性
- 如果类型标记为 DataContractAttribute 属性，则您希望序列化和反序列化的所有成员也必须用 DataMemberAttribute 属性装饰，否则它们将被设置为默认值

### 反序列化如何工作？

反序列化使用的方法取决于类型是否用 [DataContractAttribute](https://learn.microsoft.com/en-us/dotnet/api/system.runtime.serialization.datacontractattribute) 属性装饰。如果没有此属性，则使用无参数构造函数创建类型的实例。然后使用各自的设置器将每个属性和字段映射到类型中，并将实例返回给调用者。

如果类型标记为 `[DataContract]`，则序列化器会使用反射读取类型的元数据，并根据它们是否标记为 DataMemberAttribute 属性来确定应包含哪些属性或字段，因为这是基于选择加入的。然后在内存中分配一个未初始化的对象（避免使用任何构造函数，无论是否有参数），然后直接在每个映射的属性或字段上设置值，即使是私有的或使用仅初始化的设置器。在整个过程中会根据需要调用序列化回调，然后将对象返回给调用者。

强烈建议使用序列化属性，因为它们提供了更多灵活性来覆盖名称和命名空间，并且通常使用更多现代 C# 功能。虽然默认序列化器可以依赖于原始类型，但不建议用于您自己的任何类型，无论它们是类、结构还是记录。建议如果您用 DataContractAttribute 属性装饰类型，还要显式装饰您希望序列化或反序列化的每个成员的 DataMemberAttribute 属性。

#### .NET 类

只要遵循本页和 [数据契约序列化器](https://learn.microsoft.com/en-us/dotnet/framework/wcf/feature-details/serializable-types) 文档中详细说明的其他规则，类在数据契约序列化器中是完全支持的。

这里最重要的是要记住，您必须要么有一个公共无参数构造函数，要么用适当的属性装饰它。让我们通过一些示例来真正澄清什么会起作用，什么不会。

在以下示例中，我们展示了一个名为 Doodad 的简单类。我们没有提供显式构造函数，因此编译器将提供一个默认的无参数构造函数。因为我们使用的是 [支持的原始类型](###supported-primitive-types)（Guid、string 和 int32），并且我们所有的成员都有公共的 getter 和 setter，所以不需要任何属性，我们将能够在从 Dapr actor 方法发送和接收时使用此类而不会出现问题。

```csharp
public class Doodad
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public int Count { get; set; }
}
```

默认情况下，这将使用类型中成员的名称以及实例化时的值进行序列化：

```xml
<Doodad>
  <Id>a06ced64-4f42-48ad-84dd-46ae6a7e333d</Id>
  <Name>DoodadName</Name>
  <Count>5</Count>
</Doodad>
```

所以让我们调整一下——让我们添加我们自己的构造函数，并仅在成员上使用仅初始化的设置器。这将无法正确序列化和反序列化，不是因为使用了仅初始化的设置器，而是因为缺少无参数构造函数。

```csharp
// 无法正确序列化！
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

如果我们为类型添加一个公共无参数构造函数，我们就可以继续使用它，而无需进一步的注释。

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

但如果我们不想添加这个构造函数怎么办？也许您不希望您的开发人员意外地使用意外的构造函数创建此 Doodad 的实例。这就是更灵活的属性有用的地方。如果您用 [DataContractAttribute](https://learn.microsoft.com/en-us/dotnet/api/system.runtime.serialization.datacontractattribute) 属性装饰您的类型，您可以删除无参数构造函数，它将再次起作用。

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

在上面的示例中，我们不需要使用 [DataMemberAttribute](https://learn.microsoft.com/en-us/dotnet/api/system.runtime.serialization.datamemberattribute) 属性，因为我们使用的是序列化器支持的 [内置原始类型](###supported-primitive-types)。但是，如果我们使用这些属性，我们确实可以获得更多的灵活性。通过 DataContractAttribute 属性，我们可以使用 Namespace 参数指定我们自己的 XML 命名空间，并通过 Name 参数更改类型在序列化为 XML 文档时使用的名称。

建议的做法是将 DataContractAttribute 属性附加到类型，并将 DataMemberAttribute 属性附加到您希望序列化的所有成员上——如果它们不是必需的，并且您没有更改默认值，它们将被忽略，但它们为您提供了一种机制，可以选择加入序列化原本不会包含的成员，例如标记为私有的成员，或者它们本身是复杂类型或集合。

请注意，如果您选择序列化私有成员，它们的值将被序列化为纯文本——它们很可能会被查看、拦截，并可能根据您序列化后如何处理数据而被操控，因此在您的用例中是否要标记这些成员是一个重要的考虑因素。

在以下示例中，我们将查看使用属性更改某些成员的序列化名称，并引入 [IgnoreDataMemberAttribute](https://learn.microsoft.com/en-us/dotnet/api/system.runtime.serialization.ignoredatamemberattribute) 属性。顾名思义，这告诉序列化器跳过此属性，即使它本来有资格进行序列化。此外，由于我用 DataContractAttribute 属性装饰了类型，这意味着我可以在属性上使用仅初始化的设置器。

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

当这个被序列化时，因为我们更改了序列化成员的名称，我们可以期望使用默认值的新 Doodad 实例被序列化为：

```xml
<Doodad>
  <id>a06ced64-4f42-48ad-84dd-46ae6a7e333d</id>
  <Count>5</Count>
</Doodad>
```

##### C# 12 中的类 - 主构造函数

C# 12 为类引入了主构造函数。使用主构造函数意味着编译器将被阻止创建默认的隐式无参数构造函数。虽然类上的主构造函数不会生成任何公共属性，但这意味着如果您将任何参数传递给主构造函数或在类中有非原始类型，您将需要指定您自己的无参数构造函数或使用序列化属性。

这是一个示例，我们使用主构造函数将 ILogger 注入到一个字段中，并添加我们自己的无参数构造函数，而无需任何属性。

```csharp
public class Doodad(ILogger<Doodad> _logger)
{
    public Doodad() {} //我们的无参数构造函数

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

以及使用我们的序列化属性（再次选择仅初始化的设置器，因为我们使用的是序列化属性）：

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

#### .NET 结构体

只要它们标记为 DataContractAttribute 属性，并且您希望序列化的成员标记为 DataMemberAttribute 属性，结构体就可以被数据契约序列化器支持。此外，为了支持反序列化，结构体还需要有一个无参数构造函数。即使您定义了自己的无参数构造函数（在 C# 10 中启用），这也能正常工作。

```csharp
[DataContract]
public struct Doodad
{
    [DataMember]
    public int Count { get; set; }
}
```

#### .NET 记录

记录是在 C# 9 中引入的，在序列化方面遵循与类完全相同的规则。我们建议您应该用 DataContractAttribute 属性装饰所有记录，并用 DataMemberAttribute 属性装饰您希望序列化的成员，以便在使用此或其他较新的 C# 功能时不会遇到反序列化问题。因为记录类默认使用仅初始化的设置器来设置属性，并鼓励使用主构造函数，所以将这些属性应用于您的类型可以确保序列化器能够正确处理您的类型。

通常，记录以使用新主构造函数概念的简单单行语句呈现：

```csharp
public record Doodad(Guid Id, string Name, int Count);
```

这将抛出一个错误，鼓励使用序列化属性，因为在 Dapr actor 方法调用中使用它时没有可用的无参数构造函数，也没有用上述属性装饰。

在这里，我们添加了一个显式的无参数构造函数，它不会抛出错误，但在反序列化期间不会设置任何值，因为它们是使用仅初始化的设置器创建的。因为这没有使用 DataContractAttribute 属性或任何成员上的 DataMemberAttribute 属性，序列化器将无法在反序列化期间正确映射目标成员。

```csharp
public record Doodad(Guid Id, string Name, int Count)
{
    public Doodad() {}
}
```

这种方法不需要额外的构造函数，而是依赖于序列化属性。因为我们用 DataContractAttribute 属性标记类型，并为每个成员装饰自己的 DataMemberAttribute 属性，序列化引擎将能够从 XML 文档映射到我们的类型而不会出现问题。

```csharp
[DataContract]
public record Doodad(
        [property: DataMember] Guid Id,
        [property: DataMember] string Name,
        [property: DataMember] int Count)
```

#### 支持的原始类型

.NET 中有几种内置类型被认为是原始类型，并且可以在不需要开发人员额外努力的情况下进行序列化：

- [Byte](https://learn.microsoft.com/en-us/dotnet/api/system.byte)
- [SByte](https://learn.microsoft.com/en-us/dotnet/api/system.sbyte)
- [Int16](https://learn.microsoft.com/en-us/dotnet/api/system.int16)
- [Int32](https://learn.microsoft.com/en-us/dotnet/api/system.int32)
- [Int64](https://learn.microsoft.com/en-us/dotnet/api/system.int64)
- [UInt16](https://learn.microsoft.com/en-us/dotnet/api/system.uint16)
- [UInt32](https://learn.microsoft.com/en-us/dotnet/api/system.uint32)
- [UInt64](https://learn.microsoft.com/en-us/dotnet/api/system.uint64)
- [Single](https://learn.microsoft.com/en-us/dotnet/api/system.single)
- [Double](https://learn.microsoft.com/en-us/dotnet/api/system.double)
- [Boolean](https://learn.microsoft.com/en-us/dotnet/api/system.boolean)
- [Char](https://learn.microsoft.com/en-us/dotnet/api/system.char)
- [Decimal](https://learn.microsoft.com/en-us/dotnet/api/system.decimal)
- [Object](https://learn.microsoft.com/en-us/dotnet/api/system.object)
- [String](https://learn.microsoft.com/en-us/dotnet/api/system.string)

还有其他类型实际上不是原始类型，但具有类似的内置支持：

- [DateTime](https://learn.microsoft.com/en-us/dotnet/api/system.datetime)
- [TimeSpan](https://learn.microsoft.com/en-us/dotnet/api/system.timespan)
- [Guid](https://learn.microsoft.com/en-us/dotnet/api/system.guid)
- [Uri](https://learn.microsoft.com/en-us/dotnet/api/system.uri)
- [XmlQualifiedName](https://learn.microsoft.com/en-us/dotnet/api/system.xml.xmlqualifiedname)

同样，如果您想通过 actor 方法传递这些类型，则不需要额外的考虑，因为它们将被序列化和反序列化而不会出现问题。此外，标记为 (SerializeableAttribute)[https://learn.microsoft.com/en-us/dotnet/api/system.serializableattribute] 属性的类型将被序列化。

#### 枚举类型

枚举，包括标志枚举，如果适当标记，可以序列化。您希望序列化的枚举成员必须标记为 [EnumMemberAttribute](https://learn.microsoft.com/en-us/dotnet/api/system.runtime.serialization.enummemberattribute) 属性才能被序列化。在此属性的可选 Value 参数中传递自定义值将允许您指定用于成员的值，而不是让序列化器从成员的名称中派生它。

枚举类型不需要用 `DataContractAttribute` 属性装饰——只需要您希望序列化的成员用 `EnumMemberAttribute` 属性装饰。

```csharp
public enum Colors
{
    [EnumMember]
    Red,
    [EnumMember(Value="g")]
    Green,
    Blue, //即使被类型使用，此值也不会被序列化，因为它没有用 EnumMember 属性装饰
}
```

#### 集合类型

对于数据契约序列化器，所有实现 [IEnumerable](https://learn.microsoft.com/en-us/dotnet/api/system.collections.ienumerable) 接口的集合类型，包括数组和泛型集合，都被视为集合。那些实现 [IDictionary](https://learn.microsoft.com/en-us/dotnet/api/system.collections.idictionary) 或泛型 [IDictionary<TKey, TValue>](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.idictionary-2) 的类型被视为字典集合；所有其他类型是列表集合。

与其他复杂类型类似，集合类型必须有一个可用的无参数构造函数。此外，它们还必须有一个名为 Add 的方法，以便能够正确序列化和反序列化。这些集合类型使用的类型本身必须标记为 `DataContractAttribute` 属性或如本文档中所述的其他可序列化类型。

#### 数据契约版本控制

由于数据契约序列化器仅在 Dapr 中用于通过代理方法将 .NET SDK 中的值序列化到 Dapr actor 实例中，因此几乎不需要考虑数据契约的版本控制，因为数据不会在使用相同序列化器的应用程序版本之间持久化。对于那些有兴趣了解更多关于数据契约版本控制的人，请访问[这里](https://learn.microsoft.com/en-us/dotnet/framework/wcf/feature-details/data-contract-versioning)。

#### 已知类型

通过将每个类型标记为 [DataContractAttribute](https://learn.microsoft.com/en-us/dotnet/api/system.runtime.serialization.datacontractattribute) 属性，可以轻松地嵌套您自己的复杂类型。这会通知序列化器如何执行反序列化。
但如果您正在处理多态类型，并且您的成员之一是具有派生类或其他实现的基类或接口，该怎么办？在这里，您将使用 [KnownTypeAttribute](https://learn.microsoft.com/en-us/dotnet/api/system.runtime.serialization.knowntypeattribute) 属性来提示序列化器如何继续。

当您将 [KnownTypeAttribute](https://learn.microsoft.com/en-us/dotnet/api/system.runtime.serialization.knowntypeattribute) 属性应用于类型时，您是在通知数据契约序列化器它可能遇到的子类型，从而允许它正确处理这些类型的序列化和反序列化，即使运行时的实际类型与声明的类型不同。

```chsarp
[DataContract]
[KnownType(typeof(DerivedClass))]
public class BaseClass
{
    //基类的成员
}

[DataContract]
public class DerivedClass : BaseClass 
{
    //派生类的附加成员
}
```

在此示例中，`BaseClass` 被标记为 `[KnownType(typeof(DerivedClass))]`，这告诉数据契约序列化器 `DerivedClass` 是 `BaseClass` 的可能实现，它可能需要序列化或反序列化。如果没有此属性，当序列化器遇到一个实际上是 `DerivedClass` 类型的 `BaseClass` 实例时，它将不知道如何处理派生类型，这可能导致序列化异常。通过将所有可能的派生类型指定为已知类型，您可以确保序列化器能够正确处理类型及其成员。

有关使用 `[KnownType]` 的更多信息和示例，请参阅[官方文档](https://learn.microsoft.com/en-us/dotnet/framework/wcf/feature-details/data-contract-known-types)。
