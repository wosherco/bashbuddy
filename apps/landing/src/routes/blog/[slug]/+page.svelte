<script lang="ts">
  import SvelteSeo from "svelte-seo";

  import type { PageData } from "./$types";

  const { data }: { data: PageData } = $props();
</script>

<SvelteSeo
  title={data.metadata.title}
  description={data.metadata.description}
  openGraph={{
    type: "article",
    title: data.metadata.title,
    description: data.metadata.description,
    images: [
      {
        url: data.metadata.image,
        alt: data.metadata.title,
      },
    ],
  }}
/>

<article class="prose dark:prose-invert mt-20 mx-auto max-w-prose px-4">
  <a href="/blog" class="mb-4">⬅️ Go Back</a>
  <h1 class="text-3xl font-bold pt-8">{data.metadata.title}</h1>
  <description class="text-lg pt-2">{data.metadata.description}</description>
  <img src={data.metadata.image} alt={data.metadata.title} />
  <p class="pt-2">
    Author: {data.metadata.author} | Published: {new Date(
      data.metadata.date,
    ).toLocaleDateString()}
  </p>
  <div class=" mt-4">
    <data.content />
  </div>
</article>
