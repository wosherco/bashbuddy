<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Card, CardContent } from "$lib/components/ui/card";
  import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
  } from "$lib/components/ui/collapsible";
  import { Check, ChevronDown, Copy } from "lucide-svelte";

  import type { PageProps } from "./$types";

  const { data }: PageProps = $props();
  let copied = $state(false);
  let open = $state(false);

  async function copyToken() {
    await navigator.clipboard.writeText(data.token);
    copied = true;
    setTimeout(() => {
      copied = false;
    }, 2000);
  }
</script>

<div class="container mx-auto max-w-md p-6">
  <Card class="mb-8">
    <CardContent class="pt-6">
      <div class="flex items-center gap-2 text-green-600 mb-2">
        <Check size={24} />
        <h1 class="text-xl font-bold">Successfully Logged In</h1>
      </div>
      <p class="text-muted-foreground">
        You've been successfully logged in to the BashBuddy CLI. You can now
        close this window and return to your terminal.
      </p>
    </CardContent>
  </Card>

  <Collapsible bind:open>
    <CollapsibleTrigger
      class="flex w-full items-center justify-between rounded-md border p-4"
    >
      <span class="font-medium">Did the automatic login fail?</span>
      <ChevronDown
        size={16}
        class="transition-transform {open ? 'rotate-180' : ''}"
      />
    </CollapsibleTrigger>
    <CollapsibleContent>
      <div class="mt-4 p-4 border rounded-md bg-muted/50">
        <p class="mb-2 text-sm text-muted-foreground">
          Copy this token and paste it into your terminal:
        </p>
        <div class="relative">
          <div
            class="p-3 bg-muted rounded-md font-mono text-sm overflow-x-auto"
          >
            {data.token ? "*".repeat(data.token.length) : "No token available"}
          </div>
          <Button
            variant="outline"
            size="icon"
            class="absolute right-2 top-2"
            onclick={copyToken}
          >
            {#if copied}
              <Check size={16} class="text-green-600" />
            {:else}
              <Copy size={16} />
            {/if}
          </Button>
        </div>
      </div>
    </CollapsibleContent>
  </Collapsible>
</div>
