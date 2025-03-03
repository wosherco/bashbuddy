<script lang="ts">
  import type { WithoutChild } from "bits-ui";
  import { cn } from "$lib/utils.js";
  import { Accordion as AccordionPrimitive } from "bits-ui";

  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: WithoutChild<AccordionPrimitive.ContentProps> = $props();
</script>

<AccordionPrimitive.Content
  bind:ref
  class={cn(
    "data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm transition-all",
    className,
  )}
  {...restProps}
>
  <div class="pb-4 pt-0">
    {@render children?.()}
  </div>
</AccordionPrimitive.Content>
