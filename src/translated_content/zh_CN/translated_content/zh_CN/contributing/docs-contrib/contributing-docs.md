---
type: docs
title: "贡献者指南"
linkTitle: "贡献者指南"
weight: 10
description: 开始为 Dapr 文档做出贡献
---

在本指南中，您将学习如何向 [Dapr 文档仓库](https://github.com/dapr/docs) 做出贡献。 由于 Dapr 文档发布到 [docs.dapr.io](https://docs.dapr.io)，您必须确保您的贡献编译并正确发布。

## 前期准备

在为 Dapr 文档做贡献之前:

- 查看 [关于一般 Dapr 项目贡献的指导]({{< ref contributing-overview>}}).
- 使用[Hugo](https://gohugo.io/)和[Docsy](https://docsy.dev)主题安装和设置本地环境。 按照存储库中的说明 [README.md](https://github.com/dapr/docs/blob/master/README.md#environment-setup)。
- 分叉并克隆[文档存储库](https://github.com/dapr/docs)。

## 分支指南

Dapr 文档处理分支的方式与大多数代码仓库不同。 没有 `main` 分支，而是给每个分支贴上标签，以匹配运行时版本的主版本和次要版本。 有关完整列表，请访问 [Docs 仓库](https://github.com/dapr/docs#branch-guidance)。

总体而言，所有文档更新都应指向 [Dapr 最新版本的文档分支](https://github.com/dapr/docs)。 最新版本是默认分支 [https://github.com/dapr/docs]。 例如，如果要修复拼写错误、添加注释或澄清某个观点，请在默认 Dapr 分支上进行更改。

对于适用于发布候选版本或文档的预发行版本的任何文档更改，请将更改指向该特定分支。 例如，如果您要记录即将发生的组件或运行时的变更，请在预发行版分支中进行更改。

## 风格和语气

应在所有 Dapr 文档中遵循这些约定，以确保所有文档的体验一致。

| 风格/语气         | 指导                                                        |
| ------------- | --------------------------------------------------------- |
| 大小写           | 只使用大写字母： <br> <ul><li>在句子或标题的开头</li><li>对于专有名词，包括技术名称（Dapr，Redis，Kubernetes 等）</li></ul>              |
| 标题和标题         | 标题和标题必须简短，但描述性强且清晰。                                       |
| 使用简单句子        | 编写易于阅读、可扫描的句子。 提示：跳过正式的语气，像直接与读者交谈一样写作。                   |
| 避免使用第一人称      | 使用第二人称"你"和"你的"，而不是第一人称"我"，"我们"和"我们的"。                     |
| 假设一个"新开发者"的受众 | 对于有经验的开发人员来说，一些看似明显的步骤可能对新手开发人员来说并不那么明显。 给读者提供更明确、更详细的说明。 |
| 使用现在时         | 避免像"这个命令_将_安装Redis"这样的句子。 相反，使用"此命令安装Redis"。              |

## 图表和图像

图表和图片是文档页面中无价的视觉辅助工具。 图表保存在[Dapr Diagrams Deck](https://github.com/dapr/docs/tree/v1.11/daprdocs/static/presentations)中，其中包括风格和图标指南。

在您为文档创建图表时：

- 将它们保存为高分辨率的PNG文件到[images文件夹](https://github.com/dapr/docs/tree/v1.11/daprdocs/static/images)。
- 使用概念或构建块的约定命名PNG文件，以便将它们分组。
  - 例如： `service-invocation-overview.png`.
  - 有关使用短代码调用图像的更多信息，请参阅下面的[图像指南](#images)部分。
- 将图表添加到 `Dapr-Diagrams.pptx` Deck 中的正确部分，以便在例行更新期间可以对其进行修订和更新。

## 贡献新页面

如果您正在创建一篇新文章，请确保您：

- 将新文档放在层次结构中的正确位置。
- 避免创建新的部分。 最有可能的是，正确的位置已经在文档层次结构中。
- 包括完整的 [Hugo front-matter](#front-matter)。

选择下面的主题类型，查看建议模板，帮助您开始。

| 主题类型                                         | 这是什么？                                                       |
| -------------------------------------------- | ----------------------------------------------------------- |
| [概念]({{< ref "concept-template.md" >}})      | 回答问题，“这能帮助我解决什么问题？ 避免重复 API 或组件规范; 提供更多细节。                  |
| [快速入门]({{< ref "quickstart-template.md" >}}) | 提供一个"五分钟到_哇塞！_"的体验。 引导读者快速了解功能或 API 及其在受控示例中的工作原理。          |
| [How-to]({{< ref "howto-template.md" >}})    | 提供了 Dapr 功能或技术的详细实用的逐步操作指南。 鼓励读者尝试他们自己的场景，而不是在快速入门中提供的受控场景。 |

## docs.dapr.io 的要求

确保您的贡献不会破坏网站构建。 Hugo 构建网站的方式需要遵循以下指导：

### 文件和文件夹名称

文件和文件夹名称应该是全局唯一的。
    - `\service-invocation`
    - `service-invocation-overview.md`

### Front-matter

[Front-matter](https://www.docsy.dev/docs/adding-content/content/#page-frontmatter) 是常规标记文件的内容，并将其升级到 Hugo 兼容文档，以呈现到导航栏和 ToC 目录中。

每个页面都需要在文档的顶部有一个这样的部分:

```yaml
---
type: docs
title: "TITLE FOR THE PAGE"
linkTitle: "SHORT TITLE FOR THE NAV BAR"
weight: (number)
description: "1+ SENTENCES DESCRIBING THE ARTICLE"
---
```

#### 示例

```yaml
---
type: docs
title: "服务调用概述"
linkTitle: "概述"
weight: 10
description: "Dapr服务调用的快速概述，以及如何在应用程序中使用它来调用服务。"
---
```

> Weight 确定左侧栏中页面的顺序，其中 0 是最顶部。

Front-matter应完成所有字段，包括类型、标题、链接标题、权重和描述。

- `title` 应该仅有一句话，最后没有句号
- `linkTitle` 应该是1到3个词语，前面的How-to除外。
- `description` 应该是1-2句话，描述读者将在此文档中学习，完成或执行什么。

根据 [样式惯例](#styling-conventions)，标题只能大写第一个字和专有名词，但 "How-To："除外。

- "Getting started with Dapr service invocation"
- "How-To: Setup a local Redis instance"

### 引用其他页面

Hugo `ref` 和 `relref` [shortcodes](https://gohugo.io/content-management/cross-references/) 用于引用其他页面和部分。 这些短代码还允许在页面被错误地重命名或删除时中断构建。

例如，此shortcode与markdown页面的其余部分内联，将链接到章节/文件夹名称的 _index.md:

```md
{{</* ref "folder" */>}}
```

这个shortcode将链接到一个特定的页面:

```md
{{</* ref "page.md" */>}}
```

所有页面和文件夹都需要有_全局唯一的名称_，以使 ref shortcode 正常工作。 如果存在重复的名称，构建将中断并且将抛出错误。

#### 引用其他页面中的部分

要引用另一页面中的特定部分，请在引用末尾添加 `#section-short-name`。

通常，节短名称是节标题的文本，全部为小写，空格更改为"-"。 您可以通过以下方式检查部分的简称：

1. 访问网站页面。
1. 单击部分旁边的链接图标（🔗）。
1. 查看 URL 在导航栏中的呈现。
1. 复制"#"后面的内容作为您的区段短名称。

例如，对于此特定段节，完整引用页面和部分将是:

```md
{{</* ref "contributing-docs.md#referencing-sections-in-other-pages" */>}}
```

## Shortcodes

以下是编写 Dapr 文档的有用 shortcodes

### Images

Docsy和Hugo使用的markdown规范没有提供使用markdown符号调整图片大小的选项。 取而代之的是原始 HTML。

首先将图片放置在 `/daprdocs/static/images` 下，命名惯例为 `[page-name]-[image-name].[png|jpg|svg]`.

然后使用以下项链接到图片:

```md
<img src="/images/[image-filename]" width=1000 alt="Description of image">
```

请不要忘记设置 `alt` 属性，以保持文档的可读性和可访问性。

#### 示例

此 HTML 将在 `overview.md` 页面上显示 `dapr-overview.png` 图片:

```md
<img src="/images/overview-dapr-overview.png" width=1000 alt="Overview diagram of Dapr and its building blocks">
```

### 选项卡式内容

通过 [Hugo shortcodes](https://gohugo.io/content-management/shortcodes/) 可以实现标签。

总体格式为:

```
{{</* tabs [Tab1] [Tab2]>}}

{{% codetab %}}
[Content for Tab1]
{{% /codetab %}}

{{% codetab %}}
[Content for Tab2]
{{% /codetab %}}

{{< /tabs */>}}
```

您所编写的所有内容都将被渲染为Markdown，因此您可以包含图像、代码块、YouTube视频等。

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
这个示例将为此呈现：
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

使用 `code-snippet` 短代码引用来自 `static/code` 目录的代码片段。

```
{{</* code-snippet file="myfile.py" lang="python" */>}}
```

{{% alert title="Warning" color="warning" %}}
所有 Dapr 示例代码都应该在单独的文件中自成一体，而不是在 Markdown 中。 使用此处描述的技术突出显示用户应关注的示例代码部分。
{{% /alert %}}

使用 `lang` (默认 `txt`) 参数来配置用于语法高亮的语言。

使用 `marker` 参数标记将嵌入的截图限制为示例文件的一部分。 当您只想显示较大文件的一部分时，这是非常有用的。 通常，您会通过以下方式完成此操作：

1. 用注释包围重点的代码。
1. 将评论文本传递到 `marker`。

下面的短代码和代码示例:

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

使用 `replace-key-[token]` 和 `replace-value-[token]` 参数，以将嵌入的截图限制为示例文件的一部分。 当您想要缩写代码示例的一部分时，这很有用。 支持使用多个 `token` 的值进行多次替换。

下面的短代码和代码示例:

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

Hugo 可以使用短代码自动嵌入 YouTube 视频:

```
{{</* youtube [VIDEO ID] */>}}
```

#### 示例

给定视频：https://youtu.be/dQw4w9WgXcQ

短代码为：

```
{{</* youtube dQw4w9WgXcQ */>}}
```

### 按钮

若要在网页上创建按钮，请使用 `button` 短码。

可选的 "newtab" 参数将指示页面是否应在新的选项卡中打开。 选项为 "true" 或 "false"。 默认为 "false"，页面将在同一标签页中打开。

#### 链接到外部文件

```
{{</* button text="My Button" link="https://example.com" */>}}
```

{{< button text="My Button" link="https://example.com" >}}

#### 链接到另一个文档

您还可以在按钮中引用页面：

```
{{</* button text="My Button" page="contributing" newtab="true" */>}}
```

{{< button text="My Button" page="contributing" newtab="true" >}}

#### 按钮颜色

您可以使用 Bootstrap 颜色自定义颜色：

```
{{</* button text="My Button" link="https://example.com" color="primary" */>}}
{{</* button text="My Button" link="https://example.com" color="secondary" */>}}
{{</* button text="My Button" link="https://example.com" color="success" */>}}
{{</* button text="My Button" link="https://example.com" color="danger" */>}}
{{</* button text="My Button" link="https://example.com" color="warning" */>}}
{{</* button text="My Button" link="https://example.com" color="info" */>}}
```

{{< button text="My Button" link="https://example.com" color="primary" >}}
{{< button text="My Button" link="https://example.com" color="secondary" >}}
{{< button text="My Button" link="https://example.com" color="success" >}}
{{< button text="My Button" link="https://example.com" color="danger" >}}
{{< button text="My Button" link="https://example.com" color="warning" >}}
{{< button text="My Button" link="https://example.com" color="info" >}}

### 参考

[Docsy 编写指南](https://www.docsy.dev/docs/adding-content/)

## 翻译

添加语言的步骤：

您可以在 [PR 1286](https://github.com/dapr/docs/pull/1286) 中找到一个添加中文语言支持的PR 示例。

添加语言的步骤：

- 在文档 Repo 中打开一个issue，请求创建一个新的特定语言文档
- 创建完成后，在文档仓库中创建 git 子模块：

   ```sh
   git submodule add <remote_url> translations/<language_code>
   ```

- 在 `daprdocs/config.toml` 中添加语言条目：

   ```toml
    [languages.<language_code>]
      title = "Dapr Docs"
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

- 所有其他翻译目录视需要重复上述步骤.

## 下一步

通过复制和工作之一开始 [Dapr 文档模板]({{< ref docs-templates >}}).
