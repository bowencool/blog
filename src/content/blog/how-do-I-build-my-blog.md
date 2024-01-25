---
pubDatetime: 2024-01-25T13:37:23.000Z
title: How do I build my Blog
permalink: how-do-i-build-my-blog
tags:
  - experience
  - astro
  - frontend
description: This article describes some of the author's thoughts, tradeoffs, and experiences in building a blog in practice.
---

# Why not use existing mature solutions?

- For long-term maintenance, as a developer, I still want to have complete control
  - The future is not just about blogs
  - If I find something interesting on someone else's blog, I am 99% certain that I can implement it without wasting energy on researching themes or plugins.
- Astro is too excellent, with ultimate performance (island architecture) and extreme flexibility (arbitrary combination of react / vue, html, md / mdx, or even custom response), all-round crushing.

# Where to store the article contents?

## Git

- No additional cost required
- Directly support various interactions, writing in React or Vue directly (pseudo requirement?)
- If there is paid content in the future, Git cannot handle it
- The repository will become larger and deployment will also become slower
- Managing tags will be very tiring

## DB

- Can't insert interactive content (pseudo-requirement? Can use inline codepen etc. instead)

## Notion / Feishu Docs / Yuque

If I were not a programmer, I might choose these, but I am, and also a front-end one.

## The Result

Put it in the Git repository first, and consider a hybrid mode later.

# Image hosting service

I'd like to use GitHub/Imgur, but Chinese access is restricted. The Aliyun OSS risks malicious traffic, so I'll put it in the git repository for now.

# I18n

In order to reach a global audience, I need to support both Chinese and English languages. The most desired interaction is side-by-side display, but it feels like the development workload might be quite large. Just use astro-i18next for now.

# Subscription

## RSS

It is a plain text content (xml/json/atom), built into Astro

## Email

A little bit of trouble, will not be realized for the time being

# Account system?

Two demands:

## Comments/Responses

- [Utterances](https://github.com/utterance/utterances) Open source and free, based on GitHub Issues. Since most of my previous posts were in issues, all the post comments are out of the way, perfect for me.
- [Giscus](https://github.com/giscus) Open source and free, based on GitHub Discussions. The advantage of Discussion over Issue is that it supports nested views. Since Issues can be converted into Discussions, and comments will also be carried over, it is also very suitable for me.
- Disqus is free for individual users, and support logging in with more social accounts. **No need to log in to respond**, but logging in is required for commenting.
- The cost of self-development is too high, especially for front-end interactions

My final choice was Giscus.

## Paid content/courses

That must have my own account system. And also consider making a separate website. So I won't realize it for now.

# Synchronize across all platforms?

## Modify content synchronously

A bit unrealistic, not all platforms provide API

## Display all the comments and the total number of likes across all platforms

It's not necessary for now.

## Access statistics for all platforms

It's not necessary for now.

# Projects that can be learned from

https://github.com/tangly1024/NotionNext
https://www.lovchun.com/ The function is pretty good
https://github.com/szmxx/blog Dark mode switching effects are worth learning

## The UI design is very good:

https://github.com/joshwcomeau/blog
https://github.com/transitive-bullshit/nextjs-notion-starter-kit
https://github.com/satnaing/satnaing.dev
https://github.com/judygab/nextjs-portfolio

## Some tools:

https://github.com/NotionX/react-notion-x Render notion page in react
https://github.com/LetTTGACO/elog Synchronize posts between Notion / Feishu Docs / Yuque / local markdown

## Starting boilerplate?

https://astro.build/themes/ Astro's official collection of themes, and I've picked two that are relatively viable:
https://github.com/onwidget/astrowind Very nice UI but lacks some features specific to blogs
https://github.com/satnaing/astro-paper I don’t really like its UI style, but the blog function is relatively complete

Not many pages, not complicated, daisyui / shadcn can make one from scratch, I can also find a boilerplate with i18n (shadcn is powered by v0.dev, others can use ancodeai.com instead)

I ended up going with astro-paper + changing the features and styles myself.

# Start working

## I18n, A Big Trap

I chose to start development based on Astro paper, and then chose astro-i18next for internationalization. I ran into a big problem, which was my own fault for not realizing that it was still in the Beta stage.

- First of all, what is surprising is that the internationalization parameters are within the accessed pathname, such as `/zh/posts`, which may be a common issue in SSG. In other words (under SSG mode), it requires copying pages instead of just using `t("xx")` for translation. Fortunately, this copying process is automatic with `npx astro-i18next generate`. This design also leads to a series of subsequent problems.

  - You can also use the `src/pages/[lang]/xxx` directory format. I don't like copying files, so I tried changing to this directory structure later and found a few drawbacks, so I changed it back:
    - ~~md pages are no longer supported, such as the "About" page.~~ You can switch to using mdx and directly import i18next.
    - Each file needs to define the `getStaticPaths` method, introducing new complexity.
    - Changed to SSR mode, but astro-i18next has not been tested for SSR.

- All kinds of links should also be wrapped in a layer: `localizaPath("/posts")` or add `<base href="/zh/">`. To be honest, I initially thought there weren't many, but actually there are quite a few. I suggest directly searching globally for "href=" and "url=".

- The "astro-i18next generate" command only supports astro files!!! I think theoretically it should also support ts and tsx. Currently, it seems that you need to copy & sync files like md, ts, and tsx yourself. After giving it some thought, there are only two md files and an rss file anyway. If there is a tsx file, you can abstract it into a component and wrap it with an entry in the astro file.

- No HMR, probably due to the locales file not being in the src, too lazy to test.

- Files outside of `src/pages` are not supported because the language setting is placed in the pathname. There must be a page request first to have an i18n context, so most of the website configurations in src/config.ts cannot be used. This means that `export const SITE = { title: t("websiteTitle") }` cannot be used, and each instance of `SITE.title` needs to be changed to `t("websiteTitle")`, which is quite a lot!

  - Moreover, in the ts route file, it is necessary to switch languages within the **request context**. Switching languages at the top of the file won't work.

- The `{ t, localizaPath }` of astro-i18next only works on server-side rendering. It works fine with isolated components (react client component) SSR, but it throws an error when loading js directly on the client side. I have resolved this issue. For more details, please see https://github.com/yassinedoghri/astro-i18next/issues/84

- duplicate content entry slugs (ID in pathname)

  - If the slugs of different language versions of the same blog are not the same, it will not be handled correctly when switching languages.
  - Defining new collections is stupid and doesn't seem to solve the problem of switching languages
  - After half a dozen searches, [change the name of the slug](https://github.com/withastro/astro/issues/7133#issuecomment-1585751826) is fine, for example I changed it to permalink

- The behavior of the development environment is inconsistent with that of the production environment. Perhaps this is due to the inconsistency between SSR mode and SSG mode? These issues can be resolved, but it feels somewhat uneasy.

  - The HMR cache for article content uses the slug as the cache key, so switching languages in local development requires modifying the content of the target language's article file in order to switch.
  - When importing styles from third-party packages, the default `scopedStyleStrategy: "attribute"` works normally in the development environment but partially fails in the production environment.

- The CSS styles and components in astro-paper are quite messy.
  - For example, when trying to change the underline-offset of the `a` element, I found seven or eight occurrences, some in components, some on pages, and some in global styles...
  - The CSS weren't writen using nested syntax...

Furthermore, I still need to change the style. I've almost finished reading through the entire code of this repository. If I had known earlier, I would have written it from scratch myself, that didn't save much time.
