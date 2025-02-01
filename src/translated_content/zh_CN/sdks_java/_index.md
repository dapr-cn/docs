---
type: docs
title: "Dapr Java SDK"
linkTitle: "Java"
weight: 1000
description: Java SDK包，用于开发Dapr应用
cascade:
  github_repo: https://github.com/dapr/java-sdk
  github_subdir: daprdocs/content/en/java-sdk-docs
  path_base_for_github_subdir: content/en/developing-applications/sdks/java/
  github_branch: master
---

Dapr 提供多种包以帮助开发 Java 应用程序。通过这些包，您可以使用 Dapr 创建 Java 客户端、服务器和虚拟 actor。

## 前提条件

- 已安装 [Dapr CLI]({{< ref install-dapr-cli.md >}})
- 已初始化 [Dapr 环境]({{< ref install-dapr-selfhost.md >}})
- JDK 11 或更高版本 - 发布的 jar 与 Java 8 兼容：
    - [AdoptOpenJDK 11 - LTS](https://adoptopenjdk.net/)
    - [Oracle 的 JDK 15](https://www.oracle.com/java/technologies/javase-downloads.html)
    - [Oracle 的 JDK 11 - LTS](https://www.oracle.com/java/technologies/javase-jdk11-downloads.html)
    - [OpenJDK](https://openjdk.java.net/)
- 安装以下 Java 构建工具之一：
    - [Maven 3.x](https://maven.apache.org/install.html)
    - [Gradle 6.x](https://gradle.org/install/)

## 导入 Dapr Java SDK

接下来，导入 Java SDK 包以开始使用。选择您喜欢的构建工具以了解如何导入。

{{< tabs Maven Gradle >}}

{{% codetab %}}
<!--Maven-->

对于 Maven 项目，将以下内容添加到您的 `pom.xml` 文件中：

```xml
<project>
  ...
  <dependencies>
    ...
    <!-- Dapr 的核心 SDK，包含所有功能，actor 除外。 -->
    <dependency>
      <groupId>io.dapr</groupId>
      <artifactId>dapr-sdk</artifactId>
      <version>1.13.1</version>
    </dependency>
    <!-- Dapr 的 actor SDK（可选）。 -->
    <dependency>
      <groupId>io.dapr</groupId>
      <artifactId>dapr-sdk-actors</artifactId>
      <version>1.13.1</version>
    </dependency>
    <!-- Dapr 与 SpringBoot 的 SDK 集成（可选）。 -->
    <dependency>
      <groupId>io.dapr</groupId>
      <artifactId>dapr-sdk-springboot</artifactId>
      <version>1.13.1</version>
    </dependency>
    ...
  </dependencies>
  ...
</project>
```
{{% /codetab %}}

{{% codetab %}}
<!--Gradle-->

对于 Gradle 项目，将以下内容添加到您的 `build.gradle` 文件中：

```java
dependencies {
...
    // Dapr 的核心 SDK，包含所有功能，actor 除外。
    compile('io.dapr:dapr-sdk:1.13.1')
    // Dapr 的 actor SDK（可选）。
    compile('io.dapr:dapr-sdk-actors:1.13.1')
    // Dapr 与 SpringBoot 的 SDK 集成（可选）。
    compile('io.dapr:dapr-sdk-springboot:1.13.1')
}
```

{{% /codetab %}}

{{< /tabs >}}

如果您也在使用 Spring Boot，可能会遇到一个常见问题，即 Dapr SDK 使用的 `OkHttp` 版本与 Spring Boot _Bill of Materials_ 中指定的版本冲突。

您可以通过在项目中指定与 Dapr SDK 使用的版本兼容的 `OkHttp` 版本来解决此问题：

```xml
<dependency>
  <groupId>com.squareup.okhttp3</groupId>
  <artifactId>okhttp</artifactId>
  <version>1.13.1</version>
</dependency>
```

## 试用

测试 Dapr Java SDK。通过 Java 快速入门和教程来查看 Dapr 的实际应用：

| SDK 示例 | 描述 |
| ----------- | ----------- |
| [快速入门]({{< ref quickstarts >}}) | 使用 Java SDK 在几分钟内体验 Dapr 的 API 构建块。 |
| [SDK 示例](https://github.com/dapr/java-sdk/tree/master/examples) | 克隆 SDK 仓库以尝试一些示例并开始使用。 |

```java
import io.dapr.client.DaprClient;
import io.dapr.client.DaprClientBuilder;

try (DaprClient client = (new DaprClientBuilder()).build()) {
  // 发送带有消息的类；BINDING_OPERATION="create"
  client.invokeBinding(BINDING_NAME, BINDING_OPERATION, myClass).block();

  // 发送纯字符串
  client.invokeBinding(BINDING_NAME, BINDING_OPERATION, message).block();
}
```

- 有关输出 bindings 的完整指南，请访问 [How-To: Output bindings]({{< ref howto-bindings.md >}})。
- 访问 [Java SDK 示例](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/bindings/http) 以获取代码示例和尝试输出 bindings 的说明。

## 可用包

<div class="card-deck">
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>客户端</b></h5>
      <p class="card-text">创建与 Dapr sidecar 和其他 Dapr 应用程序交互的 Java 客户端。</p>
      <a href="{{< ref java-client >}}" class="stretched-link"></a>
    </div>
  </div>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>工作流</b></h5>
      <p class="card-text">创建和管理与其他 Dapr API 一起使用的工作流。</p>
      <a href="{{< ref workflow >}}" class="stretched-link"></a>
    </div>
  </div>
</div>