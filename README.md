English | [简体中文](./README-zh.md)

# Bowen's Blog

Hello, this is my personal blog codebase which is forked from [AstroPaper](https://github.com/satnaing/astro-paper).

What are the differences compared to AstroPaper?

- Integration with [astro-i18next](https://github.com/yassinedoghri/astro-i18next) (requires a significant amount of work)
  - For the convenience of toggling languages and the freedom to rename files, this repository utilizes `frontmatter.permalink` instead of `post.slug`. This is because [Astro does not permit identical slugs for different language versions of the same post so far](https://github.com/withastro/astro/issues/7133#issuecomment-1585751826). This also caused a minor cache issue on the local development server.
- Refactored tags
  - Internationalization support (i18n)
  - Show larger size if there are more related articles, see [preview](https://blog.bowen.cool/tags)
  - RSS subscriptions for tags with a large number of articles, for [example](https://blog.bowen.cool/tags/frontend)
- Toggle the dark theme using only CSS variables to implement:
  - Dual code highlighting themes
  - Dual diagram themes
- External links open in new tabs by default
- [Mermaid](https://github.com/mermaid-js/mermaid) integration with dual themes
- Floating table of contents using [tocbot](https://tscanlin.github.io/tocbot/), rather than having it in the header
- [Giscus](https://giscus.app/) integration for comments and discussions
- [MDX](https://mdxjs.com/) integration for advanced markdown features for article collections
- [rehype-autolink-headings](https://github.com/rehypejs/rehype-autolink-headings) integration
- Planned integration with [astro-icon](https://github.com/natemoo-re/astro-icon) or other icon libraries to avoid the need for manually copying SVGs (not yet implemented)

## Known Issues

1. `public/locales` does not support hot reloading for now, moving it to the src directory might be helpful.
2. When developing locally, it's common that the multilingual versions of articles do not match the website settings. Opening and making a modification to the corresponding file to trigger hot reloading can solve this issue; this problem does not exist in production environments.

## How to update

On GitHub: Just Click "Sync fork"

On your local machine:

```bash
# add a remote
git remote add upstream https://github.com/bowencool/blog.git

# merge upstream/main into your branch
git merge upstream/main --no-ff

# or rebase your branch onto upstream/main
git rebase upstream/main && git push -f
```
