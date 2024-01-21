import type { APIRoute } from "astro";
import { type CollectionEntry } from "astro:content";
import { generateOgImageForPost } from "@utils/generateOgImages";
import { getPostsByLang } from "@utils/getPosts";
import { changeLanguage } from "i18next";

export async function getStaticPaths() {
  const posts = await getPostsByLang("en").then(p =>
    p.filter(({ data }) => !data.draft && !data.ogImage)
  );

  return posts.map(post => ({
    params: { permalink: post.data.permalink },
    props: post,
  }));
}

export const GET: APIRoute = async ({ props }) => {
  changeLanguage("en");
  const isChineseTitle = props.data.title.match(/[\u4e00-\u9fa5]/);
  if (isChineseTitle) {
    return new Response(null, {
      status: 302,
      headers: { Location: "/og.jpg" },
    });
  }
  return new Response(
    await generateOgImageForPost(props as CollectionEntry<"blog">),
    {
      headers: { "Content-Type": "image/png" },
    }
  );
};
