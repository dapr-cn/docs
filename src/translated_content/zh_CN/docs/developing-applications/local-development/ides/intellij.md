---
type: docs
title: IntelliJ
linkTitle: IntelliJ
weight: 2000
description: 配置 IntelliJ 社区版以使用 Dapr 进行调试
---

开发 Dapr 应用程序时，你通常使用 Dapr CLI 来启动你的 Dapr 服务，就像这样：

```bash
dapr run --app-id nodeapp --app-port 3000 --dapr-http-port 3500 app.js
```

这将使用默认的组件yaml文件（在`dapr init`时创建）以便您的服务能够与本地的Redis容器交互。 当你刚刚入门时这是好的开始，但是如果你想要附加一个debugger到你的服务并且通过VS Code进行单点调试呢？ 在这里你可以使用 dapr cli 而不需要调用 app。

将调试器附加到您的服务中的一种方法是先从命令行中运行 `dapr run --`，然后启动您的代码并附加调试器。 虽然这完全是一个可以接受的解决方案，但它也需要一些额外的步骤（比如在终端和IDE之间进行切换），以及对那些可能想要克隆你的仓库并点击 "play" 按钮开始调试的开发人员进行一些指导。

本文档介绍了如何从IntelliJ中直接使用`dapr`。 作为前提条件，要确保你已经通过 `dapr init` 初始化了 Dapr 的开发环境。

让我们开始吧！

## 添加 Dapr 作为 "External Tool"

首先，退出 IntelliJ 后再修改配置文件。

### IntelliJ 配置文件位置

对于[2020.1](https://www.jetbrains.com/help/idea/2020.1/tuning-the-ide.html#config-directory)及以上版本，工具的配置文件应位于以下位置：

{{< tabs Windows Linux  MacOS >}}

{{% codetab %}}

```powershell
%USERPROFILE%\AppData\Roaming\JetBrains\IntelliJIdea2020.1\tools\
```

{{% /codetab %}}

{{% codetab %}}

```shell
$HOME/.config/JetBrains/IntelliJIdea2020.1/tools/
```

{{% /codetab %}}

{{% codetab %}}

```shell
~/Library/Application\ Support/JetBrains/IntelliJIdea2020.1/tools/
```

{{% /codetab %}}

{{< /tabs >}}

> 2019.3或更早版本的配置文件位置不同， 详情请参阅 [这里](https://www.jetbrains.com/help/idea/2019.3/tuning-the-ide.html#config-directory) 获取更多详细信息。

如有需要，请在路径中更改 IntelliJ 版本。

创建或编辑文件在`<CONFIG PATH>/tools/External\ Tools.xml`中（如有需要，请更改路径中的 IntelliJ 版本）。 如上所述，`<CONFIG PATH>` 是操作系统依赖的。

添加一个新的 `<tool></tool>` 条目:

```xml
<toolSet name="External Tools">
  ...
  <!-- 1. Each tool has its own app-id, so create one per application to be debugged -->
  <tool name="dapr for DemoService in examples" description="Dapr sidecar" showInMainMenu="false" showInEditor="false" showInProject="false" showInSearchPopup="false" disabled="false" useConsole="true" showConsoleOnStdOut="true" showConsoleOnStdErr="true" synchronizeAfterRun="true">
    <exec>
      <!-- 2. For Linux or MacOS use: /usr/local/bin/dapr -->
      <option name="COMMAND" value="C:\dapr\dapr.exe" />
      <!-- 3. Choose app, http and grpc ports that do not conflict with other daprd command entries (placement address should not change). -->
      <option name="PARAMETERS" value="run -app-id demoservice -app-port 3000 -dapr-http-port 3005 -dapr-grpc-port 52000" />
      <!-- 4. Use the folder where the `components` folder is located -->
      <option name="WORKING_DIRECTORY" value="C:/Code/dapr/java-sdk/examples" />
    </exec>
  </tool>
  ...
</toolSet>
```

（可选）您还可以为 sidecar 工具创建一个新条目，该条目可在许多项目中重复使用：

```xml
<toolSet name="External Tools">
  ...
  <!-- 1. Reusable entry for apps with app port. -->
  <tool name="dapr with app-port" description="Dapr sidecar" showInMainMenu="false" showInEditor="false" showInProject="false" showInSearchPopup="false" disabled="false" useConsole="true" showConsoleOnStdOut="true" showConsoleOnStdErr="true" synchronizeAfterRun="true">
    <exec>
      <!-- 2. For Linux or MacOS use: /usr/local/bin/dapr -->
      <option name="COMMAND" value="c:\dapr\dapr.exe" />
      <!-- 3. Prompts user 4 times (in order): app id, app port, Dapr's http port, Dapr's grpc port. -->
      <option name="PARAMETERS" value="run --app-id $Prompt$ --app-port $Prompt$ --dapr-http-port $Prompt$ --dapr-grpc-port $Prompt$" />
      <!-- 4. Use the folder where the `components` folder is located -->
      <option name="WORKING_DIRECTORY" value="$ProjectFileDir$" />
    </exec>
  </tool>
  <!-- 1. Reusable entry for apps without app port. -->
  <tool name="dapr without app-port" description="Dapr sidecar" showInMainMenu="false" showInEditor="false" showInProject="false" showInSearchPopup="false" disabled="false" useConsole="true" showConsoleOnStdOut="true" showConsoleOnStdErr="true" synchronizeAfterRun="true">
    <exec>
      <!-- 2. For Linux or MacOS use: /usr/local/bin/dapr -->
      <option name="COMMAND" value="c:\dapr\dapr.exe" />
      <!-- 3. Prompts user 3 times (in order): app id, Dapr's http port, Dapr's grpc port. -->
      <option name="PARAMETERS" value="run --app-id $Prompt$ --dapr-http-port $Prompt$ --dapr-grpc-port $Prompt$" />
      <!-- 4. Use the folder where the `components` folder is located -->
      <option name="WORKING_DIRECTORY" value="$ProjectFileDir$" />
    </exec>
  </tool>
  ...
</toolSet>
```

## 创建或编辑运行配置

现在，为要调试的应用程序创建或编辑运行配置。 它可以在 `main()` 函数旁边的菜单中找到。

![编辑运行配置菜单](/images/intellij_debug_menu.png)

现在，添加程序参数和环境变量: 这些端口需要与上面 "External Tool" 条目中定义的端口相匹配。

- 本例的命令行参数：`-p 3000`
- 本例的环境变量：`DAPR_HTTP_PORT=3005;DAPR_GRPC_PORT=52000`

![编辑运行配置](/images/intellij_edit_run_configuration.png)

## 开始调试

以上一次性配置完成后，在 IntelliJ 中使用 Dapr 调试 Java 应用程序需要两个步骤：

1. 通过 `Tools` -> `External Tool` 在 IntelliJ 中启动 `dapr`。

![使用 'External Tool' 运行 Dapr](/images/intellij_start_dapr.png)

2. 在调试模式下启动你的应用程序。

![以调试模式启动应用程序](/images/intellij_debug_app.png)

## 收尾

调试之后，确保你在 IntelliJ 中停止了 `dapr` 和你的应用。

> 注意：由于你使用 **dapr** _**run**_ CLI 命令启动服务，所以 **dapr** _**list**_ 命令将在当前使用 Dapr 运行的应用程序列表中显示 IntelliJ 的运行情况。

调试愉快!

## 相关链接

<!-- IGNORE_LINKS -->

- [更改](https://intellij-support.jetbrains.com/hc/en-us/articles/206544519-Directories-used-by-the-IDE-to-store-settings-caches-plugins-and-logs) IntelliJ 配置目录的位置

<!-- END_IGNORE -->
