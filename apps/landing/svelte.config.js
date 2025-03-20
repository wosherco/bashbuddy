import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { mdsvex } from "mdsvex";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import { sitemapWrapAdapter } from "sveltekit-static-sitemap";

/** @type {import('mdsvex').MdsvexOptions} */
const mdsvexOptions = {
  extensions: [".svx"],

  rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
};

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://svelte.dev/docs/kit/integrations
  // for more information about preprocessors
  preprocess: [vitePreprocess(), mdsvex(mdsvexOptions)],

  kit: {
    // adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
    // If your environment is not supported, or you settled on a specific environment, switch out the adapter.
    // See https://svelte.dev/docs/kit/adapters for more information about adapters.
    adapter: sitemapWrapAdapter(
      adapter({
        fallback: "404.html",
      }),
      {
        sitemapFile: "sitemap-index.xml",
      }
    ),
    paths: {
      relative: false,
    },
    env: {
      dir: "../../",
    },
    prerender: {
      origin: "https://bashbuddy.run",
    },
  },
  extensions: [".svelte", ".svx"],
};

export default config;
