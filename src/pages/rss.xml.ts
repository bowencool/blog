import rss from "@astrojs/rss";
import getSortedPosts from "@utils/getSortedPosts";
import { SITE } from "@config";
import { localizeUrl, localizePath } from "astro-i18next";
import { getPostsByLang } from "@utils/getPosts";
import i18next, { t, changeLanguage } from "i18next";
changeLanguage("en");

export async function GET() {
  const posts = await getPostsByLang(i18next.language);
  const sortedPosts = getSortedPosts(posts);
  return rss({
    title: t("websiteTitle"),
    description: t("websiteDescription"),
    site: localizeUrl(SITE.website),
    items: sortedPosts.map(({ data, slug }) => ({
      link: localizePath(`/posts/${slug}`),
      title: data.title,
      description: data.description,
      pubDate: new Date(data.modDatetime ?? data.pubDatetime),
    })),
  });
}
