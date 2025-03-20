import { error } from "@sveltejs/kit";

import type { PageLoad } from "./$types";

export const prerender = true;

export const load: PageLoad = async ({ params }) => {
  try {
    const post = await import(`$lib/posts/${params.slug}.svx`);

    return { content: post.default, metadata: post.metadata };
  } catch {
    throw error(404, `Post ${params.slug} not found`);
  }
};
