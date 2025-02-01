---
type: docs
title: "Dapr .NET SDK 中更全面的错误模型"
linkTitle: "更全面的错误模型"
weight: 59000
description: 了解如何在 .NET SDK 中使用更全面的错误模型。
---

Dapr .NET SDK 支持由 Dapr 运行时实现的更全面的错误模型。这个模型为应用程序提供了一种丰富错误信息的方式，提供更多上下文信息，使应用程序的用户能够更好地理解问题并更快地解决。您可以在[这里](https://google.aip.dev/193)阅读更多关于更全面错误模型的信息，并可以在[这里](https://github.com/googleapis/googleapis/blob/master/google/rpc/error_details.proto)找到实现这些错误的 Dapr proto 文件。

Dapr .NET SDK 实现了 Dapr 运行时支持的所有细节，这些细节在 `Dapr.Common.Exceptions` 命名空间中实现，并可以通过 `DaprException` 的扩展方法 `TryGetExtendedErrorInfo` 进行访问。目前，此细节提取仅支持存在细节的 `RpcException`。

```csharp
// 扩展错误信息的示例用法

try
{
    // 使用 Dapr 客户端执行某些操作，该操作抛出 DaprException。
}
catch (DaprException daprEx)
{
    if (daprEx.TryGetExtendedErrorInfo(out DaprExtendedErrorInfo errorInfo))
    {
        Console.WriteLine(errorInfo.Code);
        Console.WriteLine(errorInfo.Message);

        foreach (DaprExtendedErrorDetail detail in errorInfo.Details)
        {
            Console.WriteLine(detail.ErrorType);
            switch (detail.ErrorType)
            {
                case ExtendedErrorType.ErrorInfo:
                    Console.WriteLine(detail.Reason);
                    Console.WriteLine(detail.Domain);
                    break;
                default:
                    Console.WriteLine(detail.TypeUrl);
                    break;
            }
        }
    }
}
```

## DaprExtendedErrorInfo

包含与错误相关的 `Code`（状态码）和 `Message`（错误信息），这些信息从内部的 `RpcException` 解析而来。还包含从异常细节中解析的 `DaprExtendedErrorDetails` 集合。

## DaprExtendedErrorDetail

所有细节都实现了抽象的 `DaprExtendedErrorDetail`，并具有相关的 `DaprExtendedErrorType`。

1. [RetryInfo](#retryinfo)

2. [DebugInfo](#debuginfo)

3. [QuotaFailure](#quotafailure)

4. [PreconditionFailure](#preconditionfailure)

5. [RequestInfo](#requestinfo)

6. [LocalizedMessage](#localizedmessage)

7. [BadRequest](#badrequest)

8. [ErrorInfo](#errorinfo)

9. [Help](#help)

10. [ResourceInfo](#resourceinfo)

11. [Unknown](#unknown)

## RetryInfo

告知客户端在重试之前应等待多长时间的信息。提供一个 `DaprRetryDelay`，其属性包括 `Second`（秒偏移）和 `Nano`（纳秒偏移）。

## DebugInfo

服务器提供的调试信息。包含 `StackEntries`（包含堆栈跟踪的字符串集合）和 `Detail`（进一步的调试信息）。

## QuotaFailure

与可能已达到的某些配额相关的信息，例如 API 的每日使用限制。它有一个属性 `Violations`，是 `DaprQuotaFailureViolation` 的集合，每个都包含 `Subject`（请求的主题）和 `Description`（有关失败的更多信息）。

## PreconditionFailure

告知客户端某些必需的前置条件未满足的信息。具有一个属性 `Violations`，是 `DaprPreconditionFailureViolation` 的集合，每个都有 `Subject`（前置条件失败发生的主题，例如 "Azure"）、`Type`（前置条件类型的表示，例如 "TermsOfService"）和 `Description`（进一步描述，例如 "ToS 必须被接受。"）。

## RequestInfo

服务器返回的信息，可用于服务器识别客户端请求。包含 `RequestId` 和 `ServingData` 属性，`RequestId` 是服务器可以解释的某个字符串（例如 UID），`ServingData` 是构成请求一部分的任意数据。

## LocalizedMessage

包含本地化消息及其语言环境。包含 `Locale`（语言环境，例如 "en-US"）和 `Message`（本地化消息）。

## BadRequest

描述错误请求字段。包含 `DaprBadRequestDetailFieldViolation` 的集合，每个都有 `Field`（请求中有问题的字段，例如 'first_name'）和 `Description`（详细说明原因，例如 "first_name 不能包含特殊字符"）。

## ErrorInfo

详细说明错误的原因。包含三个属性，`Reason`（错误原因，应采用 UPPER_SNAKE_CASE 形式，例如 DAPR_INVALID_KEY）、`Domain`（错误所属的域，例如 'dapr.io'）和 `Metadata`，一个基于键值的进一步信息集合。

## Help

为客户端提供资源以进行进一步研究。包含 `DaprHelpDetailLink` 的集合，提供 `Url`（帮助或文档的 URL）和 `Description`（链接提供的内容描述）。

## ResourceInfo

提供与访问资源相关的信息。提供三个属性 `ResourceType`（访问的资源类型，例如 "Azure service bus"）、`ResourceName`（资源名称，例如 "my-configured-service-bus"）、`Owner`（资源的所有者，例如 "subscriptionowner@dapr.io"）和 `Description`（与错误相关的资源的进一步信息，例如 "缺少使用此资源的权限"）。

## Unknown

当详细类型 URL 无法映射到正确的 `DaprExtendedErrorDetail` 实现时返回。提供一个属性 `TypeUrl`（无法解析的类型 URL，例如 "type.googleapis.com/Google.rpc.UnrecognizedType"）。
