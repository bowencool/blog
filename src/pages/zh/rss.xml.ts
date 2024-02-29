import rss from "@astrojs/rss";
import getSortedPosts from "@utils/getSortedPosts";
import { localizeUrl, localizePath } from "astro-i18next";
import { getPostsByLang } from "@utils/getPosts";
import i18next, { t, changeLanguage } from "i18next";
import type { APIContext } from "astro";

export async function GET(ctx: APIContext) {
  changeLanguage("zh");
  const posts = await getPostsByLang(i18next.language);
  const sortedPosts = getSortedPosts(posts);
  return rss({
    title: t("websiteTitle"),
    description: t("websiteDescription"),
    site: localizeUrl(import.meta.env.SITE),
    // customData: "<image></image>",
    items: sortedPosts.map(({ data, slug }) => {
      const permalink = data.permalink ?? slug;
      const ogImage = data.ogImage ?? `${import.meta.env.SITE}/posts/${permalink}.png`;
      return {
        link: localizePath(`/posts/${permalink}`),
        title: data.title,
        description: `<img src="${ogImage}" /><br>${data.description}`,
        pubDate: new Date(data.modDatetime ?? data.pubDatetime),
      };
    }),
    trailingSlash: true,
  });
}
