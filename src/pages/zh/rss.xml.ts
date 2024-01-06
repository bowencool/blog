import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import getSortedPosts from "@utils/getSortedPosts";
import { SITE } from "@config";
import { t } from "i18next";
import { localizeUrl, localizePath } from "astro-i18next";
import { changeLanguage } from "i18next";
changeLanguage("zh");

export async function GET() {
  const posts = await getCollection("blog");
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
