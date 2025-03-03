<script lang="ts">
  import * as Avatar from "@/components/ui/avatar/index.js";
  import { Button, buttonVariants } from "@/components/ui/button";
  import { Card } from "@/components/ui/card";
  import CardContent from "@/components/ui/card/card-content.svelte";
  import CardFooter from "@/components/ui/card/card-footer.svelte";
  import CardHeader from "@/components/ui/card/card-header.svelte";
  import CardTitle from "@/components/ui/card/card-title.svelte";
  import { enhance } from "$app/forms";

  import { SITE_URLS } from "@bashbuddy/consts";

  import type { PageData } from "./$types";

  const { data }: { data: PageData } = $props();

  function formatUrl(path: string) {
    return `/${path}?${data.redirectTo ? `redirectTo=${data.redirectTo}` : ""}`;
  }
</script>

<main class="flex justify-center items-center min-h-[100dvh]">
  <Card>
    <CardHeader>
      <CardTitle class="text-center">BashBuddy</CardTitle>
    </CardHeader>
    <hr class="mt-4" />
    <CardContent>
      <div class="flex flex-col gap-4 justify-center items-center">
        {#if data.user !== null}
          <Avatar.Root class="w-24 h-24">
            <!-- Adjust the width and height as needed -->
            <Avatar.Image
              src={data.user.image}
              class="object-cover w-full h-full"
            />
            <Avatar.Fallback
              class="flex items-center justify-center w-full h-full"
            >
              {data.user.name.slice(0, 2).toUpperCase()}
            </Avatar.Fallback>
          </Avatar.Root>
          <p>You are logged in as <b>{data.user.name}</b></p>

          <div class="flex flex-col gap-4">
            <a href={formatUrl("redirect")} class={`${buttonVariants()} w-full`}
              >Continue</a
            >
            <form method="post" use:enhance class="w-full">
              <Button class="w-full" variant="destructive" type="submit"
                >Logout</Button
              >
            </form>
          </div>
        {:else}
          <a href={formatUrl("google")} class={buttonVariants()}
            >Continue with Google</a
          >
        {/if}
      </div>
    </CardContent>
    <CardFooter>
      <p class="text-center text-sm text-muted-foreground">
        By using BashBuddy, you agree to our
        <a
          href={`${SITE_URLS.LANDING_URL}/terms-of-service`}
          class="underline"
          target="_blank">Terms of Service</a
        >
        and
        <a
          href={`${SITE_URLS.LANDING_URL}/privacy-policy`}
          class="underline"
          target="_blank">Privacy Policy</a
        >.
      </p>
    </CardFooter>
  </Card>
</main>
