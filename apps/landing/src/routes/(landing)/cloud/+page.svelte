<script lang="ts">
  import SvelteSeo from "svelte-seo";
  import LandingCard from "$lib/components/LandingCard.svelte";
  import { Button } from "$lib/components/ui/button";
  import {
    ChevronRight,
    Cloud,
    Cpu,
    DollarSign,
    Globe,
    Settings,
    Shield,
    Zap,
  } from "lucide-svelte";

  import { SITE_URLS } from "@bashbuddy/consts";
</script>

<SvelteSeo
  title="BashBuddy Cloud - Lightning-Fast Command Generation | BashBuddy"
  description="Experience lightning-fast command generation with BashBuddy Cloud. Just $2/month for instant, private command suggestions."
  canonical="https://bashbuddy.run/cloud"
  openGraph={{
    title: "BashBuddy Cloud - Lightning-Fast Command Generation | BashBuddy",
    description:
      "Experience lightning-fast command generation with BashBuddy Cloud. Just $2/month for instant, private command suggestions.",
  }}
  twitter={{
    card: "summary_large_image",
    site: "@wosherco",
  }}
/>

<!-- Hero Section -->
<section class="pt-32 pb-24 bg-gradient-to-b from-zinc-950 to-zinc-900">
  <div class="container mx-auto px-4">
    <div class="text-center mb-16">
      <h1 class="text-5xl md:text-6xl font-bold mb-6">
        <span
          class="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-500"
          >BashBuddy Cloud</span
        >
      </h1>
      <p class="text-xl text-muted-foreground max-w-2xl mx-auto">
        Lightning-fast command generation with our cloud service, <br />just for
        <b>$2/month</b>.
      </p>
    </div>

    <!-- Performance Comparison -->
    <div class="max-w-4xl mx-auto mb-20">
      <h3 class="text-2xl font-semibold text-center mb-8">
        Performance Comparison
      </h3>

      <div class="space-y-6">
        <!-- Cloud Performance Bar -->
        <div
          class="relative h-16 bg-zinc-800/50 rounded-xl overflow-hidden backdrop-blur-md border border-zinc-700/50"
        >
          <div
            class="absolute top-0 left-0 h-full w-[10%] bg-gradient-to-r from-orange-600/70 to-red-600/70 flex items-center pl-4"
          >
            <div class="flex items-center w-full">
              <Cloud class="h-5 w-5 mr-2 text-white" />
              <span class="font-medium text-white">Cloud</span>
              <span class="ml-8 font-mono text-white">200ms</span>
            </div>
          </div>
        </div>

        <!-- Local Performance Bar -->
        <div
          class="relative h-16 bg-zinc-800/50 rounded-xl overflow-hidden backdrop-blur-md border border-zinc-700/50"
        >
          <div
            class="absolute top-0 left-0 h-full w-3/4 bg-gradient-to-r from-zinc-700/50 to-zinc-600/50 flex items-center pl-4"
          >
            <div class="flex items-center w-full">
              <Cpu class="h-5 w-5 mr-2 text-zinc-300" />
              <span class="font-medium">Local (MacBook M4 Pro)</span>
              <span class="ml-auto mr-4 font-mono text-zinc-300">6 seconds</span
              >
            </div>
          </div>
        </div>
      </div>

      <p class="text-center text-muted-foreground mt-6">
        BashBuddy Cloud delivers responses up to <span
          class="text-orange-500 font-semibold">30x faster</span
        > than local processing.
      </p>
    </div>

    <!-- Cloud Features Grid -->
    <div class="flex flex-col lg:grid grid-cols-3 justify-center gap-6">
      <!-- Affordable card -->
      <LandingCard
        icon={DollarSign}
        className="col-span-2"
        title="Really Affordable"
        description="Just $2 per month for instant command generations. No hidden fees."
        button={{
          label: "Subscribe Now",
          onClick: () => (window.location.href = SITE_URLS.ACCOUNT_URL),
        }}
        variant="cloud"
      />

      <!-- Instant Generation card -->
      <LandingCard
        icon={Zap}
        title="Instant Generation"
        description="Get command suggestions in milliseconds. BashBuddy Cloud's optimized infrastructure ensures you never wait for generation <br><br> <b>(powered by <a href='https://groq.com' class='text-[#f55036] hover:underline'>Groq</a>)</b>"
        variant="cloud"
        rawHtml
      />

      <!-- Privacy card -->
      <LandingCard
        icon={Shield}
        title="Completely Private"
        description="Your data is only stored for 10 minutes to enable chat-like behavior. After that, it's <b>permanently deleted</b> from our systems."
        variant="cloud"
        rawHtml
      />

      <!-- Works Everywhere card -->
      <LandingCard
        icon={Globe}
        title="Works Everywhere"
        description="Perfect for servers, low-powered devices, or when you're on the go."
        variant="cloud"
      />

      <!-- Sync Settings card -->
      <LandingCard
        icon={Settings}
        title="Sync Your Settings"
        description="Keep your preferences and customizations synchronized across all your devices. Your BashBuddy experience remains consistent everywhere."
        tags={[{ label: "Coming Soon", primary: true }]}
        variant="cloud"
      />
    </div>

    <!-- Cloud CTA -->
    <div class="mt-16 text-center">
      <Button
        class="gap-2 px-8 py-6 text-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 border-none"
        href={SITE_URLS.ACCOUNT_URL}
      >
        <Zap class="h-5 w-5" />
        Subscribe to BashBuddy Cloud
        <ChevronRight class="h-5 w-5" />
      </Button>
    </div>
  </div>
</section>
