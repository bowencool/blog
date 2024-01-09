import { getCollection } from "astro:content";

function getPostLang(postId: string) {
  return postId.match(/^(\w+)\//)?.[1] || "en";
}
// export default function filterPosts(post) {third}
export async function getPostsByLang(lang: string) {
  const allPosts = await getCollection("blog");
  const map = new Map<string, any[]>();
  const filteredPosts: typeof allPosts = [];
  allPosts.forEach(({ data, id, slug }, index) => {
    if (data.draft) return;
    const { permalink } = data;
    const key = permalink || slug;
    // console.log(index, id, key, postLang);

    if (!map.has(key)) {
      map.set(key, [allPosts[index]]);
    } else {
      const posts = map.get(key);
      posts!.push(allPosts[index]);
    }
  });
  // let i = 0;
  map.forEach((posts, key) => {
    // console.log(i++, key, posts.length);
    const targetLangPost = posts.find(post => getPostLang(post.id) === lang);
    if (targetLangPost) {
      // console.log("\thit", targetLangPost.id);
      filteredPosts.push(targetLangPost);
    } else {
      // console.log("\tmiss", posts[0].id);
      filteredPosts.push(posts[0]);
    }
  });
  console.log(lang, filteredPosts.length, allPosts.length);
  return filteredPosts;
}
