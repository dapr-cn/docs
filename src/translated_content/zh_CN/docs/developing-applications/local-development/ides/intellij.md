---
type: docs
title: "IntelliJ"
linkTitle: "IntelliJ"
weight: 2000
description: "在IntelliJ社区版中配置Dapr调试环境"
---

在开发Dapr应用程序时，通常会使用Dapr CLI来启动您的服务，例如：

```bash
dapr run --app-id nodeapp --app-port 3000 --dapr-http-port 3500 app.js
```

这会使用默认的组件yaml文件（在执行`dapr init`时创建），使您的服务能够与本地Redis容器交互。这种方式在初期非常有用，但如果您需要附加调试器来逐步调试代码，该怎么办？此时，您可以选择不通过Dapr CLI直接启动应用程序。

一种方法是先通过命令行运行`dapr run --`，然后启动您的代码并附加调试器。虽然这种方法可行，但需要在终端和IDE之间切换，并且对其他开发人员来说可能不够直观。

本文档将介绍如何直接在IntelliJ中使用`dapr`进行调试。在开始之前，请确保您已通过`dapr init`初始化了Dapr的开发环境。

让我们开始吧！

## 将Dapr添加为“外部工具”

首先，在修改配置文件之前，请退出IntelliJ。

### IntelliJ配置文件位置
对于版本[2020.1](https://www.jetbrains.com/help/idea/2020.1/tuning-the-ide.html#config-directory)及以上，工具的配置文件应位于：

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

> 对于2019.3或更早版本，配置文件位置不同。请参见[此处](https://www.jetbrains.com/help/idea/2019.3/tuning-the-ide.html#config-directory)了解更多详情。

如有需要，请更改路径中的IntelliJ版本。

在`<CONFIG PATH>/tools/External\ Tools.xml`中创建或编辑文件（如有需要更改路径中的IntelliJ版本）。`<CONFIG PATH>`是操作系统相关的，如上所示。

添加一个新的`<tool></tool>`条目：

```xml
<toolSet name="External Tools">
  ...
  <!-- 1. 每个工具都有自己的app-id，因此为每个要调试的应用程序创建一个 -->
  <tool name="dapr for DemoService in examples" description="Dapr sidecar" showInMainMenu="false" showInEditor="false" showInProject="false" showInSearchPopup="false" disabled="false" useConsole="true" showConsoleOnStdOut="true" showConsoleOnStdErr="true" synchronizeAfterRun="true">
    <exec>
      <!-- 2. 对于Linux或MacOS使用：/usr/local/bin/dapr -->
      <option name="COMMAND" value="C:\dapr\dapr.exe" />
      <!-- 3. 选择不与其他daprd命令条目冲突的应用程序、http和grpc端口（placement地址不应更改）。 -->
      <option name="PARAMETERS" value="run -app-id demoservice -app-port 3000 -dapr-http-port 3005 -dapr-grpc-port 52000" />
      <!-- 4. 使用`components`文件夹所在的文件夹 -->
      <option name="WORKING_DIRECTORY" value="C:/Code/dapr/java-sdk/examples" />
    </exec>
  </tool>
  ...
</toolSet>
```

可选地，您还可以为可以在多个项目中重用的sidecar工具创建一个新条目：

```xml
<toolSet name="External Tools">
  ...
  <!-- 1. 可重用的应用程序端口条目。 -->
  <tool name="dapr with app-port" description="Dapr sidecar" showInMainMenu="false" showInEditor="false" showInProject="false" showInSearchPopup="false" disabled="false" useConsole="true" showConsoleOnStdOut="true" showConsoleOnStdErr="true" synchronizeAfterRun="true">
    <exec>
      <!-- 2. 对于Linux或MacOS使用：/usr/local/bin/dapr -->
      <option name="COMMAND" value="c:\dapr\dapr.exe" />
      <!-- 3. 提示用户4次（按顺序）：应用程序id、应用程序端口、Dapr的http端口、Dapr的grpc端口。 -->
      <option name="PARAMETERS" value="run --app-id $Prompt$ --app-port $Prompt$ --dapr-http-port $Prompt$ --dapr-grpc-port $Prompt$" />
      <!-- 4. 使用`components`文件夹所在的文件夹 -->
      <option name="WORKING_DIRECTORY" value="$ProjectFileDir$" />
    </exec>
  </tool>
  <!-- 1. 无应用程序端口的可重用条目。 -->
  <tool name="dapr without app-port" description="Dapr sidecar" showInMainMenu="false" showInEditor="false" showInProject="false" showInSearchPopup="false" disabled="false" useConsole="true" showConsoleOnStdOut="true" showConsoleOnStdErr="true" synchronizeAfterRun="true">
    <exec>
      <!-- 2. 对于Linux或MacOS使用：/usr/local/bin/dapr -->
      <option name="COMMAND" value="c:\dapr\dapr.exe" />
      <!-- 3. 提示用户3次（按顺序）：应用程序id、Dapr的http端口、Dapr的grpc端口。 -->
      <option name="PARAMETERS" value="run --app-id $Prompt$ --dapr-http-port $Prompt$ --dapr-grpc-port $Prompt$" />
      <!-- 4. 使用`components`文件夹所在的文件夹 -->
      <option name="WORKING_DIRECTORY" value="$ProjectFileDir$" />
    </exec>
  </tool>
  ...
</toolSet>
```

## 创建或编辑运行配置

现在，为要调试的应用程序创建或编辑运行配置。它可以在`main()`函数旁边的菜单中找到。

![编辑运行配置菜单](/images/intellij_debug_menu.png)

现在，添加程序参数和环境变量。这些需要与上面“外部工具”条目中定义的端口匹配。

* 此示例的命令行参数：`-p 3000`
* 此示例的环境变量：`DAPR_HTTP_PORT=3005;DAPR_GRPC_PORT=52000`

![编辑运行配置](/images/intellij_edit_run_configuration.png)

## 开始调试

一旦完成上述一次性配置，调试IntelliJ中的Java应用程序与Dapr需要两个步骤：

1. 通过IntelliJ中的`工具` -> `外部工具`启动`dapr`。

![将dapr作为“外部工具”运行](/images/intellij_start_dapr.png)

2. 以调试模式启动您的应用程序。

![以调试模式启动应用程序](/images/intellij_debug_app.png)

## 总结

调试后，请确保在IntelliJ中停止`dapr`和您的应用程序。

>注意：由于您使用**dapr** ***run*** CLI命令启动了服务，**dapr** ***list***命令将在当前运行的Dapr应用程序列表中显示来自IntelliJ的运行。

祝调试愉快！

## 相关链接

<!-- IGNORE_LINKS -->

- [更改](https://intellij-support.jetbrains.com/hc/en-us/articles/206544519-Directories-used-by-the-IDE-to-store-settings-caches-plugins-and-logs) IntelliJ配置目录位置

<!-- END_IGNORE -->