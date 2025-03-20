export interface Post {
  title: string;
  description: string;
  author: string;
  date: string;
  slug: string;
}

export async function getBlogPosts() {
  let posts: Post[] = [];

  const paths = import.meta.glob("$lib/posts/*.svx", { eager: true });

  for (const path in paths) {
    const file = paths[path];
    const slug = path.split("/").at(-1)?.replace(".svx", "");

    if (file && typeof file === "object" && "metadata" in file && slug) {
      const metadata = file.metadata as Omit<Post, "slug">;
      const post = { ...metadata, slug } satisfies Post;
      posts.push(post);
    }
  }

  posts = posts.sort(
    (first, second) =>
      new Date(second.date).getTime() - new Date(first.date).getTime(),
  );

  return posts;
}
