<script lang="ts">
  import { ParaglideJS } from "@inlang/paraglide-sveltekit";
  import { page } from "$app/stores";
  import { Toaster } from "$lib/components/ui/sonner/index.js";
  import { i18n } from "$lib/i18n";

  import Footer from "../components/Footer.svelte";
  import Header from "../components/Header.svelte";

  import "../app.css";

  import { browser } from "$app/environment";
  import { afterNavigate, beforeNavigate, onNavigate } from "$app/navigation";
  import posthog from "posthog-js";

  const { children } = $props();

  beforeNavigate(({ to, from }) => {
    if (browser) {
      posthog.capture("$pageleave");
    }
  });

  afterNavigate(({ to }) => {
    if (browser) {
      posthog.capture("$pageview");
    }
  });

  onNavigate((navigation) => {
    if (!document.startViewTransition) return;

    return new Promise((resolve) => {
      document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
      });
    });
  });
</script>

<ParaglideJS {i18n}>
  <Toaster />
  <Header pathname={$page.url.pathname} />
  <main class="min-h-[100dvh]">
    {@render children()}
  </main>
  <Footer />
</ParaglideJS>
