<script lang="ts">
  import SvelteSeo from "svelte-seo";
  import { Calendar, User } from "lucide-svelte";

  import type { PageData } from "./$types";

  const { data }: { data: PageData } = $props();
</script>

<SvelteSeo
  title="Blog | BashBuddy"
  description="Here you'll find more information about BashBuddy, and it's development & features."
/>

<div class="max-w-screen-lg mx-auto pt-20 px-4">
  <h1 class="text-4xl font-bold mb-2">Blog</h1>
  <h2 class="text-lg text-muted-foreground mb-8">
    Here you'll find more information about BashBuddy, and it's development &
    features.
  </h2>

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {#each data.posts as post}
      <a href={`/blog/${post.slug}`} class="group">
        <div
          class="border rounded-lg overflow-hidden h-full transition-all duration-200 hover:shadow-md flex flex-col"
        >
          {#if post.image}
            <div class="aspect-video overflow-hidden">
              <img
                src={post.image}
                alt={post.title}
                class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          {:else}
            <div class="aspect-video bg-muted flex items-center justify-center">
              <div class="text-2xl font-semibold text-muted-foreground">
                BashBuddy
              </div>
            </div>
          {/if}

          <div class="p-4 flex-grow flex flex-col">
            <h3
              class="text-xl font-semibold mb-2 group-hover:text-primary transition-colors"
            >
              {post.title}
            </h3>
            <p class="text-muted-foreground text-sm mb-4 flex-grow">
              {post.description}
            </p>
            <div
              class="flex items-center justify-between text-xs text-muted-foreground mt-auto"
            >
              <div class="flex items-center gap-1">
                <User size={14} />
                <span>{post.author}</span>
              </div>
              <div class="flex items-center gap-1">
                <Calendar size={14} />
                <span>{new Date(post.date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </a>
    {/each}
  </div>
</div>
