<script lang="ts">
  import { fade, slide } from "svelte/transition";
  import { page } from "$app/stores";
  import { clickOutside } from "$lib/actions/click-outside";
  import { Button } from "$lib/components/ui/button";
  import * as m from "$lib/paraglide/messages.js";
  import { cn } from "$lib/utils";
  import { Menu, X } from "lucide-svelte";

  import { SITE_URLS } from "@bashbuddy/consts";

  let isMenuOpen = $state(false);
  const { pathname } = $props();
  let scrollY = $state(0);
  let prevScrollY = $state(0);
  let isScrollingUp = $state(true);
  let headerElement = $state<HTMLElement | null>(null);

  // Enhanced reactive state for header appearance
  const isAtTop = $derived(scrollY < 20);
  const isHomePage = $derived(pathname === "/");
  const isTransparent = $derived(isHomePage && isAtTop);

  // Calculate smooth transition values
  const floatingProgress = $derived(Math.min(1, Math.max(0, scrollY / 100)));
  const headerWidth = $derived(
    `min(100%, max(${100 - floatingProgress * 20}%, 1200px))`,
  );
  const headerBorderRadius = $derived(`${floatingProgress * 0.75}rem`);
  const headerMarginTop = $derived(`${floatingProgress * 0.5}rem`);
  const headerOpacity = $derived(
    isTransparent ? 0 : Math.min(0.75, floatingProgress * 0.85),
  );
  const headerBlur = $derived(`${floatingProgress * 12}px`);
  const headerShadowOpacity = $derived(floatingProgress * 0.1);
  const headerScale = $derived(1 - floatingProgress * 0.02);

  // Track scroll direction with debounce-like behavior
  $effect(() => {
    if (Math.abs(scrollY - prevScrollY) > 10) {
      isScrollingUp = scrollY < prevScrollY;
      prevScrollY = scrollY;
    }
  });

  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }

  function closeMenu() {
    isMenuOpen = false;
  }
</script>

<svelte:window bind:scrollY />

<div
  class="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 transition-all duration-300 ease-in-out"
>
  <header
    bind:this={headerElement}
    class={cn(
      "transform-gpu",
      isTransparent
        ? ""
        : "backdrop-blur supports-[backdrop-filter]:bg-background/60",
    )}
    style={`
      width: ${headerWidth}; 
      border-radius: ${headerBorderRadius}; 
      margin-top: ${headerMarginTop};
      box-shadow: 0 ${floatingProgress * 10}px ${floatingProgress * 15}px rgba(0,0,0,${headerShadowOpacity});
      background-color: ${isTransparent ? "transparent" : `hsl(var(--background) / ${headerOpacity})`};
      backdrop-filter: blur(${headerBlur});
      border: ${floatingProgress > 0.1 ? "1px" : "0px"} solid hsl(var(--border) / ${floatingProgress * 0.4});
      transform: translateY(0) scale(${headerScale});
      transition: all 400ms cubic-bezier(0.16, 1, 0.3, 1);
    `}
  >
    <nav class="flex h-14 items-center justify-between px-4">
      <!-- Logo -->
      <a href="/" class="text-xl font-bold"> BashBuddy </a>

      <!-- Desktop Navigation -->
      <div class="hidden md:flex items-center justify-between flex-1">
        <div class="flex items-center justify-center flex-1 gap-4">
          <div class="flex gap-2 items-center">
            <Button href="/#how-it-works" variant="ghost">How it works?</Button>
            <Button href="/#cloud" variant="ghost" class="text-orange-600">
              Cloud
            </Button>
            <Button href="/#local" variant="ghost" class="text-primary">
              Local
            </Button>
            <Button href="/#roadmap" variant="ghost">Roadmap</Button>

            <div class="h-4 w-px bg-border" role="separator"></div>

            <Button href={SITE_URLS.DOCS_URL} variant="ghost" target="_blank">
              Documentation
            </Button>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <Button href="/download">Install BashBuddy</Button>
          <Button
            href={SITE_URLS.ACCOUNT_URL}
            class="bg-orange-600 hover:bg-orange-700">Go to account</Button
          >
        </div>
      </div>

      <!-- Mobile Menu Button -->
      <button
        class="md:hidden p-2"
        onclick={toggleMenu}
        aria-label="Toggle menu"
      >
        {#if isMenuOpen}
          <X class="h-6 w-6" />
        {:else}
          <Menu class="h-6 w-6" />
        {/if}
      </button>
    </nav>

    <!-- Mobile Navigation -->
    {#if isMenuOpen}
      <div
        class="md:hidden fixed inset-x-0 top-14 z-40"
        transition:fade={{ duration: 200 }}
      >
        <div
          class="fixed border-b bg-background/95 backdrop-blur-sm"
          style={`
            left: ${headerElement?.offsetLeft}px; 
            right: ${headerElement?.offsetLeft}px; 
            width: ${headerElement?.offsetWidth}px; 
            border-radius: 0 0 ${headerBorderRadius} ${headerBorderRadius};
            transition: all 400ms cubic-bezier(0.16, 1, 0.3, 1);
          `}
          transition:slide={{ duration: 200 }}
          use:clickOutside={{ enabled: isMenuOpen, cb: closeMenu }}
        >
          <div class="px-4 py-2 flex flex-col gap-4">
            <div class="flex flex-col">
              <a
                href="/#how-it-works"
                class="text-sm font-medium transition-colors hover:text-primary py-3"
                onclick={closeMenu}
              >
                How it works?
              </a>
              <a
                href="/#cloud"
                class="text-sm font-medium transition-colors hover:text-orange-600 py-3 text-orange-600"
                onclick={closeMenu}
              >
                Cloud
              </a>
              <a
                href="/#local"
                class="text-sm font-medium transition-colors hover:text-primary py-3 text-primary"
                onclick={closeMenu}
              >
                Local
              </a>
              <a
                href="/#roadmap"
                class="text-sm font-medium transition-colors hover:text-primary py-3"
                onclick={closeMenu}
              >
                Roadmap
              </a>
              <div class="h-px w-full bg-border my-2" role="separator"></div>
              <a
                href={SITE_URLS.DOCS_URL}
                class="text-sm font-medium transition-colors hover:text-primary py-3"
                target="_blank"
                onclick={closeMenu}
              >
                Documentation
              </a>
            </div>
            <div class="flex flex-col gap-2 pb-4">
              <a
                href="/download"
                class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                onclick={closeMenu}
              >
                Install BashBuddy
              </a>
              <a
                href={SITE_URLS.ACCOUNT_URL}
                class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-orange-600 hover:bg-orange-700 text-white h-10 px-4 py-2"
                onclick={closeMenu}
              >
                Go to account
              </a>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </header>
</div>
