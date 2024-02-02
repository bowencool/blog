import rss from "@astrojs/rss";
import { localizeUrl, localizePath } from "astro-i18next";
import { getPostsByLang } from "@utils/getPosts";
import { t, changeLanguage } from "i18next";
import type { APIContext } from "astro";
import getUniqueTags, { type Tag } from "@utils/getUniqueTags";
import { SITE } from "@config";

export async function getStaticPaths() {
  const posts = await getPostsByLang("en");
  const tags = getUniqueTags(posts);
  return tags
    .filter(tag => SITE.tagRssable(tag))
    .map(tag => {
      return {
        params: { tag: tag.slug },
        props: { tag },
      };
    });
}

export async function GET(ctx: APIContext<{ tag: Tag }, { tag: string }>) {
  changeLanguage("en");
  const { tag } = ctx.props;
  const postsByTag = tag.posts;
  return rss({
    title: `${t("tags")}:${t("tags:" + tag.slug)} | ${t("websiteTitle")}`,
    description: t("tagsDesc{{tag}}", { tag: t("tags:" + tag.slug) }),
    site: localizeUrl(import.meta.env.SITE),
    // customData: "<image></image>",
    items: postsByTag.map(({ data, slug }) => {
      const permalink = data.permalink ?? slug;
      const ogImage =
        data.ogImage ?? `${import.meta.env.SITE}/posts/${permalink}.png`;
      return {
        link: localizePath(`/posts/${permalink}`),
        title: data.title,
        description: `${data.description}<img src="${ogImage}" />`,
        pubDate: new Date(data.modDatetime ?? data.pubDatetime),
      };
    }),
    trailingSlash: true,
  });
}
