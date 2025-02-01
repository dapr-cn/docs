---
type: docs
title: "贡献者指南"
linkTitle: "贡献者指南"
weight: 10
description: 开始为 Dapr 文档做贡献
---

在本指南中，您将学习如何为 [Dapr 文档库](https://github.com/dapr/docs) 做出贡献。由于 Dapr 文档发布在 [docs.dapr.io](https://docs.dapr.io)，您需要确保您的贡献能够正确编译和发布。

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/uPYuXcaEs-c" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## 先决条件

在为 Dapr 文档做贡献之前：

- 查看 [关于 Dapr 项目贡献的一般指导]({{< ref contributing-overview>}})。
- 使用 [Hugo](https://gohugo.io/) 和 [Docsy](https://docsy.dev) 主题安装并设置您的本地环境。请按照库中的 [README.md](https://github.com/dapr/docs/blob/master/README.md#environment-setup) 中的说明进行操作。
- 分叉并克隆 [文档库](https://github.com/dapr/docs)。

## 分支指导

Dapr 文档的分支管理与大多数代码库不同。没有主分支，每个分支都与运行时发布的主要和次要版本相匹配。完整列表请访问 [Docs repo](https://github.com/dapr/docs#branch-guidance)。

通常，您所有的文档更新都应提交到 [Dapr 最新版本的文档分支](https://github.com/dapr/docs)。最新版本是默认分支 [https://github.com/dapr/docs]。例如，如果您正在修复拼写错误、添加注释或澄清某个点，请将您的更改提交到默认的 Dapr 分支。

对于适用于候选发布或预发布版本的文档更改，请将您的更改指向该特定分支。例如，如果您正在记录即将对组件或运行时的更改，请将您的更改提交到预发布分支。

## 风格和语气

在所有 Dapr 文档中应遵循风格和语气惯例，以确保所有文档的一致性：

| 风格/语气 | 指导 |
| ---------- | -------- |
| 大小写 | 仅在以下情况下使用大写：<br> <ul><li>句子或标题的开头</li><li>专有名词，包括技术名称（Dapr、Redis、Kubernetes 等）</li></ul> |
| 标题和标题 | 标题和标题必须简洁，但描述性和清晰。 |
| 使用简单句子 | 写出易于阅读、可扫描的句子。提示：跳过正式语气，像直接与读者交谈一样写作。 |
| 避免使用第一人称 | 代替第一人称 "I"、"we" 和 "our"，使用第二人称 "you" 和 "your"。 |
| 假设 "新开发者" 受众 | 对于经验丰富的开发者来说一些看似显而易见的步骤可能对新开发者并不那么明显。为读者提供更明确、详尽的说明。 |
| 使用现在时 | 避免使用诸如 "this command _will_ install Redis" 的句子。相反，使用 "This command installs Redis"。 |

## 图表和图像

图表和图像是文档页面中无价的视觉辅助工具。使用 [Dapr 图表模板套件](https://github.com/dapr/docs/tree/v1.14/daprdocs/static/presentations) 中的图表样式和图标。

为您的文档创建图表的过程：

1. 下载 [Dapr 图表模板套件](https://github.com/dapr/docs/tree/v1.14/daprdocs/static/presentations) 以使用图标和颜色。
1. 添加新幻灯片并创建您的图表。
1. 将图表截屏为高分辨率 PNG 文件并保存在 [images 文件夹](https://github.com/dapr/docs/tree/v1.14/daprdocs/static/images)中。
1. 使用概念或构建块的命名约定命名您的 PNG 文件，以便它们被分组。
  - 例如：`service-invocation-overview.png`。
  - 有关使用短代码调用图像的更多信息，请参见下面的 [图像指导](#images) 部分。
1. 使用 HTML `<image>` 标签将图表添加到文档中的适当部分。
1. 在您的 PR 中，评论图表幻灯片（而不是截屏），以便维护者可以审查并将其添加到图表套件中。

## 贡献新文档页面

如果您正在创建新文章，请确保您：

- 将新文档放置在层次结构中的正确位置。
- 避免创建新部分。大多数情况下，正确的位置已经在文档层次结构中。
- 包含完整的 [Hugo front-matter](#front-matter)。

选择下面的主题类型以查看建议的模板，帮助您入门。

| 主题类型 | 它是什么？ |
| ---------- | ----------- |
| [概念]({{< ref "concept-template.md" >}}) | 回答问题，“这能帮助我解决什么问题？”避免重复 API 或组件规范；提供更多细节。 |
| [快速入门]({{< ref "quickstart-template.md" >}}) | 提供 "五分钟到 _wow_" 的体验。快速引导读者通过一个功能或 API 以及它在受控示例中的工作方式。 |
| [操作指南]({{< ref "howto-template.md" >}}) | 提供通过 Dapr 功能或技术的详细、实用的分步指南。鼓励读者尝试自己的场景，而不是快速入门中提供的受控场景。 |

## docs.dapr.io 的要求

确保您的贡献不会破坏网站构建。Hugo 构建网站的方式需要遵循以下指导：

### 文件和文件夹名称

文件和文件夹名称应在全局范围内唯一。
    - `\service-invocation`
    - `service-invocation-overview.md`

### Front-matter

[Front-matter](https://www.docsy.dev/docs/adding-content/content/#page-frontmatter) 是将常规 markdown 文件升级为 Hugo 兼容文档以呈现到导航栏和目录中的内容。

每个页面都需要在文档顶部有一个这样的部分：

```yaml
---
type: docs
title: "页面标题"
linkTitle: "导航栏短标题"
weight: (数字)
description: "1+ 句描述文章"
---
```

#### 示例

```yaml
---
type: docs
title: "服务调用概述"
linkTitle: "概述"
weight: 10
description: "Dapr 服务调用的快速概述以及如何在应用程序中使用它来调用服务"
---
```

> 权重决定了左侧边栏中页面的顺序，0 为最顶部。

Front-matter 应包括所有字段，包括 type、title、linkTitle、weight 和 description。

- `title` 应为 1 句，末尾无句号
- `linkTitle` 应为 1-3 个词，除了 How-to 前缀。
- `description` 应为 1-2 句，说明读者将在本文档中学习、完成或执行的内容。

根据 [样式惯例](#styling-conventions)，标题应仅大写第一个词和专有名词，除了 "How-To:"

- "开始使用 Dapr 服务调用"
- "How-To: 设置本地 Redis 实例"

### 引用其他页面

Hugo `ref` 和 `relref` [短代码](https://gohugo.io/content-management/cross-references/) 用于引用其他页面和部分。这些短代码还允许在页面被错误重命名或删除时中断构建。

例如，这个短代码，与其余的 markdown 页面内联书写，将链接到该部分/文件夹名称的 _index.md：

```md
{{</* ref "folder" */>}}
```

而这个短代码将链接到特定页面：

```md
{{</* ref "page.md" */>}}
```

所有页面和文件夹需要有 _全局唯一名称_ 以便 ref 短代码正常工作。如果有重复名称，构建将中断并抛出错误。

#### 引用其他页面中的部分

要引用其他页面中的特定部分，请在引用的末尾添加 `#section-short-name`。

一般规则是，部分短名称是部分标题的文本，全部小写，空格改为 "-". 您可以通过以下方式检查部分短名称：

1. 访问网站页面。
1. 点击部分旁边的链接图标 (🔗)。
1. 查看 URL 在导航栏中的呈现方式。
1. 复制 "#" 后的内容作为您的部分短名称。

例如，对于此特定部分，完整的页面和部分引用将是：

```md
{{</* ref "contributing-docs.md#referencing-sections-in-other-pages" */>}}
```

## 短代码

以下是撰写 Dapr 文档的有用短代码

### 图像

Docsy 和 Hugo 使用的 markdown 规范没有提供使用 markdown 符号调整图像大小的选项。相反，使用原始 HTML。

首先将图像放在 `/daprdocs/static/images` 下，命名约定为 `[page-name]-[image-name].[png|jpg|svg]`。

然后链接到图像：

```md
<img src="/images/[image-filename]" width=1000 alt="图像描述">
```

不要忘记设置 `alt` 属性以保持文档的可读性和可访问性。

#### 示例

此 HTML 将在 `overview.md` 页面上显示 `dapr-overview.png` 图像：

```md
<img src="/images/overview-dapr-overview.png" width=1000 alt="Dapr 及其构建块的概述图">
```

### 选项卡内容

选项卡通过 [Hugo 短代码](https://gohugo.io/content-management/shortcodes/) 实现。

整体格式是：

```
{{</* tabs [Tab1] [Tab2]>}}

{{% codetab %}}
[Tab1 的内容]
{{% /codetab %}}

{{% codetab %}}
[Tab2 的内容]
{{% /codetab %}}

{{< /tabs */>}}
```

您撰写的所有内容都将被渲染为 markdown，因此您可以包含图像、代码块、YouTube 视频等。

#### 示例

````
{{</* tabs Windows Linux MacOS>}}

{{% codetab %}}
```powershell
powershell -Command "iwr -useb https://raw.githubusercontent.com/dapr/cli/master/install/install.ps1 | iex"
```
{{% /codetab %}}

{{% codetab %}}
```bash
wget -q https://raw.githubusercontent.com/dapr/cli/master/install/install.sh -O - | /bin/bash
```
{{% /codetab %}}

{{% codetab %}}
```bash
brew install dapr/tap/dapr-cli
```
{{% /codetab %}}

{{< /tabs */>}}
````

此示例将呈现为：

{{< tabs Windows Linux MacOS>}}

{{% codetab %}}

```powershell
powershell -Command "iwr -useb https://raw.githubusercontent.com/dapr/cli/master/install/install.ps1 | iex"
```

{{% /codetab %}}

{{% codetab %}}

```bash
wget -q https://raw.githubusercontent.com/dapr/cli/master/install/install.sh -O - | /bin/bash
```

{{% /codetab %}}

{{% codetab %}}

```bash
brew install dapr/tap/dapr-cli
```

{{% /codetab %}}

{{< /tabs >}}

### 嵌入代码片段

使用 `code-snippet` 短代码引用 `static/code` 目录中的代码片段。

```
{{</* code-snippet file="myfile.py" lang="python" */>}}
```

{{% alert title="警告" color="warning" %}}
所有 Dapr 示例代码应自包含在单独的文件中，而不是在 markdown 中。使用这些技术突出显示用户应关注的示例代码部分。
{{% /alert %}}

使用 `lang`（默认 `txt`）参数配置用于语法高亮的语言。

使用 `marker` 参数将嵌入的片段限制为示例文件的一部分。当您只想显示较大文件的一部分时，这很有用。通常，您可以通过以下方式实现：

1. 用注释包围感兴趣的代码。
1. 将注释文本传递给 `marker`。

下面的短代码和代码示例：

```
{{</* code-snippet file="./contributing-1.py" lang="python" marker="#SAMPLE" */>}}
```

```python
import json
import time

from dapr.clients import DaprClient

#SAMPLE
with DaprClient() as d:
    req_data = {
        'id': 1,
        'message': 'hello world'
    }

    while True:
        # Create a typed message with content type and body
        resp = d.invoke_method(
            'invoke-receiver',
            'my-method',
            data=json.dumps(req_data),
        )

        # Print the response
        print(resp.content_type, flush=True)
        print(resp.text(), flush=True)

        time.sleep(2)
#SAMPLE
```

将产生以下输出：

{{< code-snippet file="contributing-1.py" lang="python" marker="#SAMPLE" >}}

使用 `replace-key-[token]` 和 `replace-value-[token]` 参数将嵌入的片段限制为示例文件的一部分。当您想要缩略代码示例的一部分时，这很有用。支持多个 `token` 的多个替换。

下面的短代码和代码示例：

```
{{</* code-snippet file="./contributing-2.py" lang="python" replace-key-imports="#IMPORTS" replace-value-imports="# Import statements"  */>}}
```

```python
#IMPORTS
import json
import time
#IMPORTS

from dapr.clients import DaprClient

with DaprClient() as d:
    req_data = {
        'id': 1,
        'message': 'hello world'
    }

    while True:
        # Create a typed message with content type and body
        resp = d.invoke_method(
            'invoke-receiver',
            'my-method',
            data=json.dumps(req_data),
        )

        # Print the response
        print(resp.content_type, flush=True)
        print(resp.text(), flush=True)

        time.sleep(2)
```

将产生以下输出：

{{< code-snippet file="./contributing-2.py" lang="python" replace-key-imports="#IMPORTS" replace-value-imports="# Import statements"  >}}

### YouTube 视频

Hugo 可以使用短代码自动嵌入 YouTube 视频：

```
{{</* youtube [VIDEO ID] */>}}
```

#### 示例

给定视频 https://youtu.be/dQw4w9WgXcQ

短代码将是：

```
{{</* youtube dQw4w9WgXcQ */>}}
```

### 按钮

要在网页中创建按钮，请使用 `button` 短代码。

可选的 "newtab" 参数将指示页面是否应在新选项卡中打开。选项为 "true" 或 "false"。默认值为 "false"，页面将在同一选项卡中打开。

#### 链接到外部页面

```
{{</* button text="我的按钮" link="https://example.com" */>}}
```

{{< button text="我的按钮" link="https://example.com" >}}

#### 链接到其他文档页面

您也可以在按钮中引用页面：

```
{{</* button text="我的按钮" page="contributing" newtab="true" */>}}
```

{{< button text="我的按钮" page="contributing" newtab="true" >}}

#### 按钮颜色

您可以使用 Bootstrap 颜色自定义颜色：

```
{{</* button text="我的按钮" link="https://example.com" color="primary" */>}}
{{</* button text="我的按钮" link="https://example.com" color="secondary" */>}}
{{</* button text="我的按钮" link="https://example.com" color="success" */>}}
{{</* button text="我的按钮" link="https://example.com" color="danger" */>}}
{{</* button text="我的按钮" link="https://example.com" color="warning" */>}}
{{</* button text="我的按钮" link="https://example.com" color="info" */>}}
```

{{< button text="我的按钮" link="https://example.com" color="primary" >}}
{{< button text="我的按钮" link="https://example.com" color="secondary" >}}
{{< button text="我的按钮" link="https://example.com" color="success" >}}
{{< button text="我的按钮" link="https://example.com" color="danger" >}}
{{< button text="我的按钮" link="https://example.com" color="warning" >}}
{{< button text="我的按钮" link="https://example.com" color="info" >}}

### 参考

[Docsy 撰写指南](https://www.docsy.dev/docs/adding-content/)

## 翻译

Dapr 文档支持使用 git 子模块和 Hugo 内置语言支持将语言翻译添加到文档中。

您可以在 [PR 1286](https://github.com/dapr/docs/pull/1286) 中找到添加中文语言支持的示例 PR。

添加语言的步骤：

- 在文档库中打开一个问题，请求创建一个新的语言特定文档库
- 创建后，在文档库中创建一个 git 子模块：

   ```sh
   git submodule add <remote_url> translations/<language_code>
   ```

- 在 `daprdocs/config.toml` 中添加一个语言条目：

   ```toml
    [languages.<language_code>]
      title = "Dapr 文档"
      weight = 3
      contentDir = "content/<language_code>"
      languageName = "<language_name>"
   ```

- 在 `daprdocs/config.toml` 中创建一个挂载：

   ```toml
   [[module.mounts]]
     source = "../translations/docs-<language_code>/content/<language_code>"
     target = "content"
     lang = "<language_code>"
   ```

- 根据需要为所有其他翻译目录重复上述步骤。

## 下一步

通过复制并从 [Dapr 文档模板]({{< ref docs-templates >}}) 开始。