---
type: docs
title: 概念文章模板
linkTitle: 概念文章模板
weight: 10
description: 创建概念文章的建议模板和指南
---

## 贡献新的概念或概述文章

概念性（或概述）文章回答以下问题：

- 你为什么要关心这个功能？
- 它能帮他们解决什么问题?

虽然组件、API或SDK规范可以帮助读者了解如何使用或处理这些功能，但概念文章提供了更深入的内容和背景。 链接到规范文章，但尽量不要简单重复规范。

在命名概念文章时，请确保其在名称、参数和术语方面与规范一致。 确保根据需要更新两者。

{{% alert title="注意" color="primary" %}}
这个模板只是一个建议。 根据您的文档目的随意更改。
{{% /alert %}}

了解有关[贡献Dapr文档]({{< ref contributing-docs.md >}})的更多信息，例如[前置内容]({{< ref "contributing-docs.md#front-matter" >}})和[短代码]({{< ref "contributing-docs.md#shortcodes" >}})。

### 模板

```md
---
type: #Required; docs
title: #Required; Brief, clear title
linkTitle: #Required; Brief title
weight: #Required; Use the correct weight based on hierarchy
description: #Required; One-sentence description of what to expect in the article
---

<!--
Remove all the comments in this template before opening a PR.
-->

<!-- 
H1: The title in the Hugo front-matter serves as the article's markdown H1. 
-->

<!-- Introductory paragraph  
Required. Brief intro that describes the concepts that the article will cover. Link off to the appropriate reference, specs, or how-to guides to provide context. -->

<!-- 
Include a diagram or image, if possible. 
-->

## <Section 1 H2>

<!-- 
Add your content here.  
-->

## <Section 2 H2>

<!-- 
Each H2 step should start with a noun/descriptive word.
-->

## <Section 3 H2>

<!--
Add your content here.
-->

<!--
Include diagrams or images throughout, where applicable.
-->

## Try out <concept>

<!-- 
If applicable, include a section with links to the related quickstart, how-to guides, or tutorials. --> 

### Quickstarts and tutorials

Want to put the Dapr <topic> API to the test? Walk through the following quickstart and tutorials to see <topic> in action:

| Quickstart/tutorial | Description |
| ------------------- | ----------- |
| [<topic> quickstart](link) | Description of the quickstart. |
| [<topic> tutorial](link) | Description of the tutorial. |

### Start using <topic> directly in your app

Want to skip the quickstarts? Not a problem. You can try out the <topic> building block directly in your application. After [Dapr is installed](link), you can begin using the <topic> API, starting with [the <topic> how-to guide](link).


-->

## Next steps

<!--
Link to related pages and examples. For example, the related API spec, related building blocks, etc.
-->

```
