<script lang="ts">
  import SvelteSeo from "svelte-seo";

  import type { PageData } from "./$types";

  const { data }: { data: PageData } = $props();
</script>

<SvelteSeo
  title="Blog | BashBuddy"
  description="Here you'll find more information about BashBuddy, and it's development & features."
/>

<div class="max-w-screen-md mx-auto pt-20 px-4">
  <h1 class="text-3xl font-bold">Blog</h1>
  <h2 class="text-lg">
    Here you'll find more information about BashBuddy, and it's development &
    features.
  </h2>
  <ul class="list-disc list-inside mt-4">
    {#each data.posts as post}
      <li>
        <a href={`/blog/${post.slug}`} class="underline">
          {post.title} - {new Date(post.date).toLocaleDateString()}
        </a>
      </li>
    {/each}
  </ul>
</div>
