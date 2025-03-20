<script lang="ts">
  import SvelteSeo from "svelte-seo";
  import LandingCard from "$lib/components/LandingCard.svelte";
  import { Button } from "$lib/components/ui/button";
  import { ChevronRight, Cpu, Shield, User, WifiOff } from "lucide-svelte";

  import { SITE_URLS } from "@bashbuddy/consts";
</script>

<SvelteSeo
  title="Run BashBuddy Locally - Complete Privacy with Your Own Hardware | BashBuddy"
  description="Experience BashBuddy with complete privacy and the power of your own hardware. Zero connection required, hardware accelerated."
  canonical="https://bashbuddy.run/local"
  openGraph={{
    title:
      "Run BashBuddy Locally - Complete Privacy with Your Own Hardware | BashBuddy",
    description:
      "Experience BashBuddy with complete privacy and the power of your own hardware. Zero connection required, hardware accelerated.",
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
        Run <span class="text-primary">Locally</span>
      </h1>
      <p class="text-xl text-muted-foreground max-w-2xl mx-auto">
        Complete privacy with the power of your own hardware.
      </p>
    </div>

    <div class="flex flex-col lg:grid grid-cols-3 justify-center gap-6">
      <!-- Offline card -->
      <LandingCard
        icon={WifiOff}
        title="Zero Connection Required"
        description="Work completely offline. All data stays on your device, making BashBuddy perfect for secure environments or when you're off the grid."
      />

      <!-- Hardware Accelerated card -->
      <LandingCard
        icon={Cpu}
        className="col-span-2"
        title="Hardware Accelerated"
        description="BashBuddy leverages your GPU with Metal (macOS), CUDA (NVIDIA), and Vulkan support to deliver the fastest possible local inference performance. (powered by <a href='https://github.com/withcatai/node-llama-cpp' class='text-primary hover:underline'>node-llama-cpp</a>)"
        rawHtml
        tags={[{ label: "Metal" }, { label: "CUDA" }, { label: "Vulkan" }]}
      />

      <!-- Data Privacy card -->
      <LandingCard
        icon={Shield}
        className="col-span-2"
        title="Complete Data Privacy"
        description="Your commands, context, and data never leave your device. Perfect for handling sensitive information or working in regulated environments."
      />

      <!-- No account required card -->
      <LandingCard
        icon={User}
        title="No Account Required"
        description="No need to create an account or sign in. Just install and start typing."
      />
    </div>

    <!-- Local CTA -->
    <div class="mt-16 text-center">
      <Button
        class="gap-2 px-8 py-6 text-lg"
        href={`${SITE_URLS.DOCS_URL}/install`}
      >
        <Cpu class="h-5 w-5" />
        Install BashBuddy Locally
        <ChevronRight class="h-5 w-5" />
      </Button>
    </div>
  </div>
</section>
