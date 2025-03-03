<script lang="ts">
  import type { Snippet } from "svelte";
  import { cn } from "@/utils";

  interface Props {
    href?: string;
    disabled?: boolean;
    target?: "_blank" | "_self" | "_parent" | "_top";
    class?: string;
    children?: Snippet;
  }

  const {
    href,
    disabled = false,
    target,
    class: className,
    children,
  }: Props = $props();

  const actualHref = $derived(disabled ? undefined : href);
  const actualClass = $derived(
    cn(className, disabled && "pointer-events-none opacity-50"),
  );
</script>

<a href={actualHref} {target} class={actualClass}>
  {@render children?.()}
</a>
