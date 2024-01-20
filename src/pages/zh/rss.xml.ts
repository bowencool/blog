import rss from "@astrojs/rss";
import getSortedPosts from "@utils/getSortedPosts";
import { SITE } from "@config";
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
    site: localizeUrl(SITE.website),
    // customData: "<image></image>",
    items: sortedPosts.map(({ data, slug }) => {
      const permalink = data.permalink ?? slug;
      const ogImage = data.ogImage ?? `${SITE.website}/posts/${permalink}.png`;
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
