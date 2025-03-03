import { paraglide } from "@inlang/paraglide-sveltekit/vite";
import { sentrySvelteKit } from "@sentry/sveltekit";
import { enhancedImages } from "@sveltejs/enhanced-img";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    sentrySvelteKit(),
    sveltekit(),
    enhancedImages(),
    paraglide({
      project: "./project.inlang",
      outdir: "./src/lib/paraglide",
    }),
  ],
});
