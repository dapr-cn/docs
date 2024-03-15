---
type: docs
title: Dapr Java SDK
linkTitle: Java
weight: 1000
description: 开发 Dapr 应用程序的 Java SDK 包
cascade:
  github_repo: https://github.com/dapr/java-sdk
  github_subdir: daprdocs/content/en/java-sdk-docs
  path_base_for_github_subdir: content/en/developing-applications/sdks/java/
  github_branch: master
---

Dapr 提供了各种包来帮助开发 Java 应用程序。 使用它们，您可以使用 Dapr 创建 Java 客户端、服务器和虚拟 Actor。

## 前期准备

- 已安装[Dapr CLI]({{< ref install-dapr-cli.md >}})
- 初始化[Dapr环境]({{< ref install-dapr-selfhost.md >}})
- JDK 11 或更高版本 - 已发布的 jar 与 Java 8 兼容：
  - [AdoptOpenJDK 11 - LTS](https://adoptopenjdk.net/)
  - [Oracle的JDK 15](https://www.oracle.com/java/technologies/javase-downloads.html)
  - [Oracle的JDK 11 - LTS](https://www.oracle.com/java/technologies/javase-jdk11-downloads.html)
  - [OpenJDK](https://openjdk.java.net/)
- 安装以下 Java 构建工具之一：
  - [Maven 3.x](https://maven.apache.org/install.html)
  - [Gradle 6.x](https://gradle.org/install/)

## 导入 Dapr 的 Java SDK

接下来，导入Java SDK包以开始使用。 选择您首选的构建工具以了解如何导入。



{{% codetab %}}

<!--Maven-->

对于 Maven 项目，请将以下内容添加到您的 `pom.xml` 文件中：

```xml
<project>
  ...
  <dependencies>
    ...
    <!-- Dapr's core SDK with all features, except Actors. -->
    <dependency>
      <groupId>io.dapr</groupId>
      <artifactId>dapr-sdk</artifactId>
      <version>1.10.0</version>
    </dependency>
    <!-- Dapr's SDK for Actors (optional). -->
    <dependency>
      <groupId>io.dapr</groupId>
      <artifactId>dapr-sdk-actors</artifactId>
      <version>1.10.0</version>
    </dependency>
    <!-- Dapr's SDK integration with SpringBoot (optional). -->
    <dependency>
      <groupId>io.dapr</groupId>
      <artifactId>dapr-sdk-springboot</artifactId>
      <version>1.10.0</version>
    </dependency>
    ...
  </dependencies>
  ...
</project>
```



{{% codetab %}}

<!--Gradle-->

对于 Gradle 项目，请将以下内容添加到你的 `build.gradle` 文件中：

```java
dependencies {
...
    // Dapr's core SDK with all features, except Actors.
    compile('io.dapr:dapr-sdk:1.10.0')
    // Dapr's SDK for Actors (optional).
    compile('io.dapr:dapr-sdk-actors:1.10.0')
    // Dapr's SDK integration with SpringBoot (optional).
    compile('io.dapr:dapr-sdk-springboot:1.10.0')
}
```



{{< /tabs >}}

如果您还使用Spring Boot，则可能会遇到一个常见问题，即Dapr SDK使用的OkHttp版本与Spring Boot材料清单中指定的版本冲突。

您可以通过在项目中指定兼容的 `OkHttp` 版本来解决此问题，以匹配 Dapr SDK 使用的版本：

```xml
<dependency>
  <groupId>com.squareup.okhttp3</groupId>
  <artifactId>okhttp</artifactId>
  <version>1.10.0</version>
</dependency>
```

## 试试吧

对 Dapr Java SDK 进行测试。 通过以下Java快速入门和教程了解Dapr的实际操作:

| SDK 示例                                                                                                 | 说明                                    |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------- |
| [快速入门]({{< ref quickstarts >}}) | 使用 Java SDK 在短短几分钟内体验 Dapr 的 API 构建块。 |
| [SDK示例](https://github.com/dapr/java-sdk/tree/master/examples)                                         | 克隆 SDK 存储库以尝试一些示例并开始使用。               |

```java
import io.dapr.client.DaprClient;
import io.dapr.client.DaprClientBuilder;

try (DaprClient client = (new DaprClientBuilder()).build()) {
  // sending a class with message; BINDING_OPERATION="create"
  client.invokeBinding(BINDING_NAME, BINDING_OPERATION, myClass).block();

  // sending a plain string
  client.invokeBinding(BINDING_NAME, BINDING_OPERATION, message).block();
}
```

- 有关输出绑定的完整指南，请访问[操作方法：使用绑定]({{< ref howto-bindings.md >}})。
- 访问[Java SDK示例](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/bindings/http)获取代码示例和指南，尝试使用输出绑定。

## 可用软件包

<div class="card-deck">
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>客户端</b></h5>
      <p class="card-text">创建 Java 客户端，与 Dapr sidecar 和其他 Dapr 应用程序进行交互。</p>
      
      
      <a href="{{< ref java-client ></a>
    </div>
  </div>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>工作流程</b></h5>
      <p class="card-text">创建和管理与其他Dapr API配合工作的工作流（Workflow）（使用Java）。</p>
      
      
      <a href="{{< ref workflow ></a>
    </div>
  </div>
</div>
