[English](./README.md) | 简体中文

# Bowen 的博客

大家好，这是我的个人博客代码库，从 [AstroPaper](https://github.com/satnaing/astro-paper) fork 而来。

与 AstroPaper 相比有什么不同？

- 与 [astro-i18next](https://github.com/yassinedoghri/astro-i18next) 的集成（需要大量工作）
  - 为了方便切换语言和自由重命名文件，此仓库使用 `frontmatter.permalink` 而不是 `post.slug`。这是因为[Astro 到目前为止不允许同一篇文章的不同语言版本有相同的 slugs](https://github.com/withastro/astro/issues/7133#issuecomment-1585751826)。这也在本地开发服务器上引起了一个小缓存问题。
- 标签的重构：
  - 国际化支持 (i18n)
  - 如果相关文章更多，则显示较大尺寸，参见[预览](https://blog.bowen.cool/tags)
  - 对拥有大量文章的标签提供 RSS 订阅，例如[示例](https://blog.bowen.cool/tags/frontend)
- 仅使用纯 CSS 变量实现深色主题切换，以便进一步实现：
  - 双“代码高亮”主题
  - 双“图表”主题
- 外部链接默认在新标签页中打开
- [Mermaid](https://github.com/mermaid-js/mermaid) 集成双主题
- 使用 [tocbot](https://tscanlin.github.io/tocbot/) 实现浮动目录，而非放置于文章开头
- [Giscus](https://giscus.app/) 集成评论和讨论功能
- [MDX](https://mdxjs.com/) 集成用于文章集合高级 Markdown 功能
- [rehype-autolink-headings](https://github.com/rehypejs/rehype-autolink-headings) 集成
- 计划与 [astro-icon](https://github.com/natemoo-re/astro-icon) 或其他图标库集成以避免手动复制 SVG（尚未实现）

## 已知问题

1. `public/locales` 暂不支持热更新，移动到 src 目录下也许有用。
2. 本地开发时经常出现文章的多语言版本与网站设置对应不上，打开对应文件进行一次修改保存触发热更新即可，生产环境无此问题。

## 如何更新

在 GitHub 上：只需点击 `Sync fork`

在您的本地机器上：

```bash
# 添加一个远程仓库
git remote add upstream https://github.com/bowencool/blog.git

# 将 upstream/main 合并到你的分支中
git merge upstream/main --no-ff

# 或者将你的分支变基到 upstream/main 上
git rebase upstream/main && git push -f
```