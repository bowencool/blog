# Bowen's Blog

Hello, this is my personal blog codebase which is forked from [AstroPaper](https://github.com/satnaing/astro-paper).

大家好，这是我的个人博客代码库，从 [AstroPaper](https://github.com/satnaing/astro-paper) fork 而来。

What are the differences compared to AstroPaper?

- Integration with astro-i18next (requires a significant amount of work)
- Refactored tags (also requires a lot of work)
  - Internationalization support (i18n)
  - Larger file size if there are more related articles
  - Planned to implement RSS subscriptions for tags with a large number of articles (not yet implemented)
- Dark theme toggle using only CSS variables
  - Dual code highlight themes
- Floating table of contents using tocbot, rather than having it in the header
- Giscus integration for comments and discussions
- External links open in new tabs by default
- MDX integration for advanced markdown features
- Planned integration with astro-icon (not yet implemented)
