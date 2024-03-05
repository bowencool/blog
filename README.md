# Bowen's Blog

Hello, this is my personal blog codebase which is forked from [AstroPaper](https://github.com/satnaing/astro-paper).

大家好，这是我的个人博客代码库，从 [AstroPaper](https://github.com/satnaing/astro-paper) fork 而来。

What are the differences compared to AstroPaper?

- Integration with [astro-i18next](https://github.com/yassinedoghri/astro-i18next) (requires a significant amount of work)
  - For the convenience of toggling languages and the freedom to rename files, this repository utilizes "frontmatter.permalink" instead of "post.slug". This is because [Astro does not permit identical slugs for different language versions of the same post so far](https://github.com/withastro/astro/issues/7133#issuecomment-1585751826).
- Refactored tags
  - Internationalization support (i18n)
  - Show larger size if there are more related articles, see [preview](https://blog.bowen.cool/tags)
  - RSS subscriptions for tags with a large number of articles, for [example](https://blog.bowen.cool/tags/frontend)
- Dark theme toggle using only CSS variables
  - Dual code highlight themes
- External links open in new tabs by default
- [Mermaid](https://github.com/mermaid-js/mermaid) integration with dual themes
- Floating table of contents using [tocbot](https://tscanlin.github.io/tocbot/), rather than having it in the header
- [Giscus](https://giscus.app/) integration for comments and discussions
- [MDX](https://mdxjs.com/) integration for advanced markdown features
- Planned integration with [astro-icon](https://github.com/natemoo-re/astro-icon) or other icon libraries to avoid the need for manually copying SVGs (not yet implemented)
