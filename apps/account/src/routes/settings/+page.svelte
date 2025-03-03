<script lang="ts">
  import SvelteSeo from "svelte-seo";
  import { Button } from "$lib/components/ui/button";
</script>

<SvelteSeo
  title="Settings | bashbuddy"
  description="Configure your bashbuddy account preferences and personalize your experience with custom settings and configurations."
/>

<div class="container mx-auto p-6 space-y-6">
  <div class="flex items-center justify-between">
    <Button variant="outline" href="/">Go Back</Button>
  </div>

  <div class="space-y-4">
    <h1 class="text-4xl font-bold">Settings</h1>
    <p class="text-muted-foreground">
      Configure your account preferences and settings
    </p>
  </div>

  <div class="text-center text-muted-foreground pt-12">
    <p>Settings configuration will be available soon.</p>
    <p>Check back later for more options.</p>
  </div>
</div>
