<script lang="ts">
  import SvelteSeo from "svelte-seo";
  import AnchorWithDisable from "@/components/AnchorWithDisable.svelte";
  import { Button } from "$lib/components/ui/button";
  import { Card } from "$lib/components/ui/card";

  import { SITE_URLS } from "@bashbuddy/consts";

  import type { PageData } from "./$types";

  const { data }: { data: PageData } = $props();
</script>

<SvelteSeo
  title="Account | BashBuddy"
  description="Manage your bashbuddy account settings"
/>

<div class="container mx-auto p-6 space-y-6">
  <div class="flex items-center justify-between">
    <Button variant="outline" href={SITE_URLS.LANDING_URL}>Go Home</Button>
  </div>

  <div class="space-y-4">
    <h1 class="text-4xl font-bold">Welcome Back, {data.user.name}</h1>
    <p class="text-muted-foreground">
      Manage your account, your settings, and your subscription
    </p>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <AnchorWithDisable disabled={true} href="/devices">
      <Card class="p-6 hover:bg-muted/50 transition-colors cursor-pointer">
        <h2 class="text-2xl font-semibold mb-2">Devices</h2>
        <p class="text-muted-foreground">
          Manage your connected devices and settings
        </p>
        <p class="text-muted-foreground">Coming soon!</p>
      </Card>
    </AnchorWithDisable>

    <AnchorWithDisable disabled={!data.stripeEnabled} href="/subscription">
      <Card class="p-6 hover:bg-muted/50 transition-colors cursor-pointer">
        <h2 class="text-2xl font-semibold mb-2">Subscription</h2>
        <p class="text-muted-foreground">
          Manage your subscription and billing details
        </p>
      </Card>
    </AnchorWithDisable>

    <AnchorWithDisable disabled={!data.subscribed} href="/settings">
      <Card class="p-6 hover:bg-muted/50 transition-colors cursor-pointer">
        <h2 class="text-2xl font-semibold mb-2">Settings</h2>
        <p class="text-muted-foreground">Configure your account preferences</p>
      </Card>
    </AnchorWithDisable>
  </div>
</div>
