<script lang="ts">
  import SvelteSeo from "svelte-seo";
  import { Button } from "$lib/components/ui/button";
  import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card";
  import { CalendarDays } from "lucide-svelte";

  import type { PageData } from "./$types";

  const { data }: { data: PageData } = $props();
</script>

<SvelteSeo
  title="Subscription | bashbuddy"
  description="Manage your bashbuddy subscription and billing details. View your plan, payment history, and subscription options."
/>

<div class="container mx-auto p-6 space-y-6">
  <div class="flex items-center justify-between">
    <Button variant="outline" href="/">Go Back</Button>
  </div>

  <div class="space-y-4">
    <h1 class="text-4xl font-bold">Subscription</h1>
    <p class="text-muted-foreground">
      Manage your subscription and billing details
    </p>
  </div>

  <div class="flex flex-col gap-6">
    <Card>
      <CardHeader>
        <CardTitle>Subscription Status</CardTitle>
        <CardDescription>
          {#if data.user.subscribedUntil}
            <div class="flex items-center gap-2">
              <CalendarDays class="h-4 w-4" />
              <span
                >Subscribed until {new Date(
                  data.user.subscribedUntil,
                ).toLocaleDateString()}</span
              >
            </div>
          {:else}
            <span>You currently don't have an active subscription</span>
          {/if}
        </CardDescription>
      </CardHeader>
      <CardContent class="grid gap-4">
        {#if !data.user.subscribedUntil}
          <form method="POST" action="?/customerCheckout">
            <Button type="submit" class="w-full">Subscribe Now</Button>
          </form>
        {/if}
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Manage Subscription</CardTitle>
        <CardDescription>
          <p>
            Manage your subscription and billing details, as well as past
            invoices.
          </p>
        </CardDescription>
      </CardHeader>
      <CardContent class="grid gap-4">
        <form method="POST" action="?/customerSession">
          <Button type="submit" variant="outline" class="w-full">
            Manage Subscription
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</div>
