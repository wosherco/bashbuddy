<script lang="ts">
  import { goto } from "$app/navigation";
  import { env } from "$env/dynamic/public";
  import * as Avatar from "$lib/components/ui/avatar/index.js";
  import { Button } from "$lib/components/ui/button";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import { cn } from "$lib/components/utils";

  import type { User } from "@bashbuddy/db/schema";

  const { user }: { user: User } = $props();
</script>

<header class="border-b">
  <div class="container flex h-16 items-center px-4">
    <div class="flex items-center gap-2">
      <a href="/" class="text-xl font-bold">BashBuddy</a>
    </div>

    <div class="ml-auto flex items-center gap-2">
      {#if user}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger class="flex items-center gap-2">
            <Avatar.Root class="h-8 w-8">
              <Avatar.Image
                src={user.profilePicture}
                alt={user.name ?? user.email}
              />
              <Avatar.Fallback>
                {user.name[0]?.toUpperCase() ?? user.email[0]?.toUpperCase()}
              </Avatar.Fallback>
            </Avatar.Root>
            <span class="hidden md:inline-block">{user.name ?? user.email}</span
            >
          </DropdownMenu.Trigger>
          <DropdownMenu.Content class="w-56">
            <DropdownMenu.Label>My Account</DropdownMenu.Label>
            <DropdownMenu.Separator />
            <DropdownMenu.Item>
              <button
                type="button"
                class="w-full text-left"
                onclick={() =>
                  (window.location.href = `${env.PUBLIC_AUTHENTICATOR_URL}?redirectTo=account`)}
              >
                Log out
              </button>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      {/if}
    </div>
  </div>
</header>
