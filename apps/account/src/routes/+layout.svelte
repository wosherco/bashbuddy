<script lang="ts">
  import "../app.css";

  import SvelteSeo from "svelte-seo";
  import { Toaster } from "@/components/ui/sonner";
  import Header from "$lib/components/Header.svelte";

  import type { LayoutData } from "./$types";

  export let data: LayoutData;
</script>

<SvelteSeo
  title="Account | BashBuddy"
  description="Manage your BashBuddy account settings"
  noindex={true}
/>

<Toaster />

<div class="min-h-screen flex flex-col">
  <Header user={data.user} />
  <main class="flex-1">
    <slot />
  </main>
</div>
