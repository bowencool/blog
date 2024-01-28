---
pubDatetime: 2024-01-25T13:37:23.000Z
title: 我是如何搭建博客的
permalink: how-do-i-build-my-blog
tags:
  - experience
  - astro
  - frontend
description: 本文讲述了作者在搭建博客的一些思考、权衡以及实践过程中的经验。
---

## 为什么不用已有的成熟方案？

- 打算长期维护的，作为开发者，还是想完全掌控一下
  - 未来不只是博客
  - 如果我在别人的博客上看到好玩的东西，我可以 99% 地确保它可以实现，而不用浪费精力去研究主题或插件。
- Astro 太优秀了，拥有极致性能（孤岛架构）和极致灵活性（随意组合 react / vue, html, md / mdx, 甚至自定义响应，全方位碾压。

## 文章内容储存在哪里？

### Git

- 不需要额外成本
- 直接支持各种交互，直接写 React、Vue 都行（伪需求？）
- 如果将来有付费内容，git 无法承载
- 仓库越来越大，部署也会越来越慢
- tags 管理会非常累

### DB

- 无法插入交互式内容（伪需求？可以使用内嵌 codepen 等方式代替）

### Notion / 飞书云文档 / 语雀

如果我不是程序员，我可能会选择这些，但我是，而且还是个前端。

### 结果

先放 Git 仓库里，后期考虑混合模式。

## 图床

想用 GitHub/Imgur，但国内访问受限，OSS 有恶意流量的风险，先放仓库里吧

## 国际化

要面向全球读者，就得支持中英双语，最想要的交互是对照显示，感觉开发量会有点大。算了先用 astro-i18next 顶一下。

## 订阅

### RSS 订阅

就是一个纯文本内容(xml/json/atom)，Astro 内置

### Email 订阅

有点麻烦，暂不实现

## 账号体系？

两个需求：

### 评论/回应

- [Utterances](https://github.com/utterance/utterances) 开源免费，基于 GitHub Issues. 由于我之前的文章大部分都在 issues 里，所以所有文章评论都不需要操心了，非常适合我。
- [Giscus](https://github.com/giscus) 开源免费，基于 GitHub Discussions. Discussion 比 Issue 的优势是支持楼中楼视图。由于 Issue 可以转成 Discussion ，而且评论也会带过去，所以也非常适合我。
- disqus 个人用户免费，支持更多社交账号登录，**不需要登录即可做出回应**，评论需要登录
- 自研成本过高，尤其是前端交互

最终选择了 Giscus 。

### 付费内容/课程

那必须有自己的账号体系了。而且也可以考虑单独做一个网站。所以先不实现。

## 全平台同步？

### 同步修改内容

有点不现实，不是所有平台都提供 API 的

### 显示全平台的评论、点赞数

暂时没什么必要

### 全平台访问统计信息

暂时没什么必要

## 可以借鉴的仓库

- https://github.com/tangly1024/NotionNext
- https://www.lovchun.com/ 功能挺不错的
- https://github.com/szmxx/blog 深色模式切换特效值得学习

### UI 设计非常好：

- https://github.com/joshwcomeau/blog
- https://github.com/transitive-bullshit/nextjs-notion-starter-kit
- https://github.com/satnaing/satnaing.dev
- https://github.com/judygab/nextjs-portfolio

### 一些工具：

- https://github.com/NotionX/react-notion-x 渲染 notion page
- https://github.com/LetTTGACO/elog 在 Notion / 飞书云文档 / 语雀 / 本地 markdown 之间同步文章

### 起步模板？

- https://astro.build/themes/ Astro 官方收集的仓库，挑了两个相对可行的仓库：
- https://github.com/onwidget/astrowind UI 很不错，但博客相关的功能不太完善
- https://github.com/satnaing/astro-paper UI 风格不太喜欢，但博客功能相对完善

没几个页面，也不复杂，daisyui / shadcn 从头撸一个也行， 可以找一个 i18n 的模板（shadcn 有 v0.dev 加持，其他的可以用 ancodeai.com 代替）

最终选择了 astro-paper + 自己改功能、样式。

## 实践

### 国际化，踩大坑

选择了基于 astro paper 开始开发，然后选择了 astro-i18next 做国际化，踩大坑，怪我自己没看清它还处于 Beta 阶段。

- 首先比较出乎意料的是，国际化参数是在访问的 pathname 里面的，比如`/zh/posts`, 这可能是 SSG 的通病。也就是说（SSG 模式下）需要 copy 页面，而不是仅仅用 `t("xx")` 翻译就完事了。好在这个 copy 过程是自动的 `npx astro-i18next generate`。这个设计也导致了后面一系列的问题。

  - 也可以使用 `src/pages/[lang]/xxx` 目录形式，我不喜欢copy文件，所以后面我尝试了改成这种目录，发现了几个缺点，又改回去了：
    - ~~md 页面就不支持了，比如“About”页面。~~ 可以改用 mdx 直接 import i18next
    - 每个文件都要 定义 `getStaticPaths` 方法，引入了新的复杂度。
      - 改成 SSR 模式，但 astro-i18next 并未测试 SSR

- 各种链接也要套一层： `localizaPath("/posts")`或者添加`<base href="/zh/">`，说实话我一开始以为没多少，但实际上还挺多的，建议直接全局搜索 "href=" 和 "url="

- `astro-i18next generate`命令仅支持 astro 文件！！！ 我觉得 ts 和 tsx 理论上是可以支持一下的，目前来看，像 md, ts, tsx 等需要自己copy & sync，想了想也就一两个 md 加上一个 rss 文件，就算了。如果有tsx，抽象成组件通过 astro 文件套一层入口就行了。

- 没有热更新，可能是因为 locales 文件不在 src 里导致的，懒得测试了。

- `src/pages` 之外的文件不支持，因为语言设置是放在 pathname 里的，必须先有页面请求，才有 i18n 上下文，所以 `src/config.ts` 里面的大部分网站配置都不能用，也就是说 `export const SITE = { title: t("websiteTitle") }`不能用，只能一个一个把 `SITE.title` 改成 `t("websiteTitle")`, 这个也很多！

  - 而且 ts 路由文件里面要在**请求上下文**里切换语言，在文件开头切换语言是无效的。

- astro-i18next 的 `{ t, localizaPath }` 仅支持服务端，孤岛组件（react client component）SSR 没问题，但客户端加载 js 直接报错，这个我解决了。详情查看 https://github.com/yassinedoghri/astro-i18next/issues/84

- slug 重复（ID in pathname）
  - 同一篇博客的不同语言版本 slug 不一样的话，切换语言时，无法正确处理
  - 定义新集合，太蠢了，而且好像也解决不了切换语言的问题
  - 搜了半天，[把 slug 改个名字](https://github.com/withastro/astro/issues/7133#issuecomment-1585751826)就好了，比如我就改成了permalink

### 其他坑

- 开发环境与生产环境行为不一致，也许是 SSR 模式和 SSG 模式行为不一致？这些也能解决，就是感觉不太放心

  - 文章内容的热更新缓存是以 slug 为缓存键，所以本地开发偶尔切换不了语言，修改目标语言文章文件内容才可以切换
  - 引入第三方包的样式时，默认的 `scopedStyleStrategy: "attribute"` 在开发环境正常，在生产环境部分失效

- astro-paper 的 css 样式、组件写的挺乱的。
  - 比如改 `a` 元素的 underline-offset，搜索一下竟然有七八处，有组件里的，有页面里的，有全局样式里的...
  - css 没有使用嵌套语法...

再加上还要改样式，整个仓库代码几乎看完了，早知道我自己从零写了，这也没省多少时间。
