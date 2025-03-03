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
  import { XCircle } from "lucide-svelte";
</script>

<SvelteSeo
  title="Subscription Canceled | bashbuddy"
  description="Your subscription checkout was canceled."
/>

<div class="container mx-auto p-6 space-y-6">
  <Card class="max-w-md mx-auto">
    <CardHeader>
      <div class="flex justify-center mb-4">
        <XCircle class="h-12 w-12 text-red-500" />
      </div>
      <CardTitle class="text-center">Checkout Canceled</CardTitle>
      <CardDescription class="text-center">
        You've canceled the subscription checkout process. No charges were made.
      </CardDescription>
    </CardHeader>
    <CardContent class="flex flex-col gap-4">
      <Button href="/subscription">Try Again</Button>
      <Button variant="outline" href="/">Return Home</Button>
    </CardContent>
  </Card>
</div>
