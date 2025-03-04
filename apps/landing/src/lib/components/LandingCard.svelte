<script lang="ts">
  import type { ComponentType } from "svelte";
  import { cn } from "$lib/utils";

  export let icon: ComponentType;
  export let title: string;
  export let description: string;
  export let tags: { label: string; primary?: boolean }[] = [];
  export let button: {
    label: string;
    icon?: ComponentType;
    onClick?: () => void;
  } | null = null;
  export let variant: "default" | "cloud" = "default";
  export let className = "";
  export let rawHtml = false;
</script>

<div
  class={cn(
    "rounded-xl backdrop-blur-md bg-zinc-800/30 border border-zinc-700/50 p-8 transition-all duration-300 w-full group",
    variant === "cloud"
      ? "hover:bg-zinc-800/50 hover:border-orange-500/50 hover:shadow-[0_0_30px_rgba(249,115,22,0.1)]"
      : "hover:bg-zinc-800/50 hover:border-primary/50 hover:shadow-[0_0_30px_rgba(0,0,0,0.3)]",
    className,
  )}
>
  <div class="flex items-center mb-4">
    <div
      class="p-3 rounded-lg {variant === 'cloud'
        ? 'bg-orange-500/10 text-orange-500 group-hover:bg-orange-500/20'
        : 'bg-primary/10 text-primary group-hover:bg-primary/20'} 
      mr-4 transition-colors"
    >
      <svelte:component this={icon} class="h-6 w-6" />
    </div>
    <h3 class="text-2xl font-semibold">{title}</h3>
  </div>

  <p class="text-muted-foreground mb-4">
    {#if rawHtml}
      {@html description}
    {:else}
      {description}
    {/if}
  </p>

  {#if tags.length > 0}
    <div class="flex flex-wrap gap-2">
      {#each tags as tag}
        <span
          class="px-3 py-1 text-xs rounded-full {tag.primary
            ? variant === 'cloud'
              ? 'bg-orange-500/20 text-orange-400'
              : 'bg-primary/20 text-primary'
            : 'bg-zinc-700/50 text-zinc-300'}"
        >
          {tag.label}
        </span>
      {/each}
    </div>
  {/if}

  {#if button}
    <div class="mt-4">
      <button
        class="w-full {variant === 'cloud'
          ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 border-0 text-white py-2 px-4 rounded-md'
          : 'border border-zinc-700 hover:border-primary/50 text-zinc-300 py-2 px-4 rounded-md transition-colors'} 
        flex items-center justify-center gap-2"
        on:click={button.onClick}
      >
        {#if button.icon}
          <svelte:component this={button.icon} class="h-4 w-4" />
        {/if}
        {button.label}
      </button>
    </div>
  {/if}
</div>
