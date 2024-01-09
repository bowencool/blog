import { getCollection } from "astro:content";

// export default function filterPosts(post) {third}
export async function getPostsByLang(lang: string) {
  const allPosts = await getCollection("blog");
  const filteredPosts = allPosts.filter(({ data, id }) => {
    if (data.draft) return false;
    if (lang === "en") {
      return !id.match("\\w+/");
    } else {
      console.log(lang, id, id.startsWith(`${lang}/`));
      return id.startsWith(`${lang}/`);
    }
  });
  // TODO 仅移除重复的文章，而不是移除所有非当前语言的文章
  // console.log(filteredPosts.length);
  return filteredPosts;
}
