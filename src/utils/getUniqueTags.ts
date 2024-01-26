import { slugifyStr } from "./slugify";
import type { CollectionEntry } from "astro:content";

export interface Tag {
  slug: string;
  originalTagString: string;
  count: number;
  posts: CollectionEntry<"blog">[];
}

const getUniqueTags = (posts: CollectionEntry<"blog">[]) => {
  const map = new Map<string, Tag>();
  posts.forEach(post => {
    post.data.tags.forEach(originalTagString => {
      const slug = slugifyStr(originalTagString);
      if (map.has(slug)) {
        const tag = map.get(slug) as Tag;
        tag.count++;
        tag.posts.push(post);
      } else {
        map.set(slug, {
          originalTagString: originalTagString,
          slug: slug,
          count: 1,
          posts: [post],
        });
      }
    });
  });

  const tags = Array.from(map.values()).sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count;
    } else {
      return a.originalTagString.localeCompare(b.originalTagString);
    }
  });
  return tags;
};

export default getUniqueTags;
