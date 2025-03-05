<script lang="ts">
  import { onMount } from "svelte";
  import SvelteSeo from "svelte-seo";
  import LandingCard from "$lib/components/LandingCard.svelte";
  import { Button } from "$lib/components/ui/button";
  import {
    Brain,
    Check,
    ChevronRight,
    Circle,
    CircleDot,
    Cloud,
    Copy,
    Cpu,
    DollarSign,
    EyeOff,
    Github,
    Globe,
    Info,
    Lock,
    Rocket,
    Settings,
    Shield,
    Sparkles,
    Terminal,
    User,
    WifiOff,
    Zap,
  } from "lucide-svelte";

  import { SITE_URLS } from "@bashbuddy/consts";

  type ShellType = "bash" | "zsh" | "powershell" | "npm" | "bun";

  let selectedShell = $state<ShellType>("bash");
  let copied = $state(false);

  const shellOptions = [
    { id: "bash" as ShellType, label: "Bash" },
    { id: "zsh" as ShellType, label: "Zsh" },
    { id: "powershell" as ShellType, label: "PowerShell" },
    { id: "npm" as ShellType, label: "npm" },
    { id: "bun" as ShellType, label: "Bun" },
  ];

  const shellCommands: Record<ShellType, string> = {
    bash: "curl -fsSL https://get.bashbuddy.run | bash",
    zsh: "curl -fsSL https://get.bashbuddy.run | zsh",
    powershell: "iwr -useb https://get.bashbuddy.run/install.ps1 | iex",
    npm: "npm install -g bashbuddy",
    bun: "bun install -g bashbuddy",
  };

  function copyCommand() {
    navigator.clipboard.writeText(shellCommands[selectedShell]);
    copied = true;
    setTimeout(() => {
      copied = false;
    }, 2000);
  }

  // Demo examples for How It Works section
  interface DemoExample {
    userInput: string;
    shellType: "bash" | "powershell";
    generatedCommand: string;
    explanation: string;
    prompt: string;
  }

  const demoExamples: DemoExample[] = [
    {
      userInput: "convert test.mov to a x265 mp4",
      shellType: "bash",
      generatedCommand: "ffmpeg -i test.mov -c:v libx265 -c:a copy output.mp4",
      explanation: "Convert test.mov to x265 mp4 using ffmpeg.",
      prompt: "$ ",
    },
    {
      userInput: "get cpu usage of top processes",
      shellType: "powershell",
      generatedCommand:
        "Get-Process | Sort-Object -Property CPU -Descending | Select-Object -First 10 Name,CPU,WorkingSet",
      explanation:
        "Lists the top 10 processes by CPU usage with memory information.",
      prompt: "PS C:\\Users\\you>",
    },
    {
      userInput: "show me what changed in my git repo last week",
      shellType: "bash",
      generatedCommand: 'git log --since="1 week ago" --stat',
      explanation:
        "Display git commits from the last week with file statistics.",
      prompt: "$ ",
    },
  ];

  let selectedDemo = $state(0);
  let carouselInterval: ReturnType<typeof setInterval>;

  // Function to rotate through demo examples
  function rotateDemo() {
    selectedDemo = (selectedDemo + 1) % demoExamples.length;
  }

  onMount(() => {
    // Start the carousel rotation
    carouselInterval = setInterval(rotateDemo, 8000);

    // Clean up on component unmount
    return () => {
      clearInterval(carouselInterval);
    };
  });

  // Function to manually select a demo and reset the interval
  function selectDemo(index: number) {
    selectedDemo = index;
    clearInterval(carouselInterval);
    carouselInterval = setInterval(rotateDemo, 8000);
  }

  // Function to scroll to a section smoothly
  function scrollToSection(id: string) {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }
</script>

<SvelteSeo
  title="Write commands naturally, without worrying about arguments | BashBuddy"
  description="BashBuddy is an AI assistant that helps you get things done. Make your day-to-day less painful."
  canonical="https://bashbuddy.run"
  openGraph={{
    title:
      "Write commands naturally, without worrying about arguments | BashBuddy",
    description:
      "BashBuddy is an AI assistant that helps you get things done. Make your day-to-day less painful.",
    // images: [{ url: "https://bashbuddy.run/og.png" }],
  }}
  twitter={{
    card: "summary_large_image",
    site: "@wosherco",
  }}
/>

<!-- Hero Section -->
<section>
  <div
    class="absolute -z-10 top-0 left-0 w-full h-[100vh] hero-grid-scene overflow-hidden"
  >
    <div class="hero-grid w-[500vw] h-full"></div>
  </div>

  <div
    class="container mx-auto px-4 pt-32 pb-16 flex flex-col items-center justify-center text-center min-h-[80vh]"
  >
    <h1 class="text-5xl md:text-6xl font-bold tracking-tight mb-6">
      <span class="text-primary">Shell Commands</span>, Instantly
    </h1>

    <p class="text-xl md:text-2xl text-muted-foreground max-w-3xl mb-12">
      Write commands naturally without worrying about arguments or syntax.
      BashBuddy understands context and gets things done.
    </p>

    <div class="w-full max-w-2xl rounded-lg shadow-xl mb-10 overflow-hidden">
      <!-- Compact header with tabs -->
      <div
        class="bg-zinc-800/90 backdrop-blur-md border-b border-zinc-700/50 rounded-t-lg"
      >
        <div class="flex">
          {#each shellOptions as option}
            <button
              class="px-4 py-3 text-sm transition-colors relative {selectedShell ===
              option.id
                ? 'text-primary font-medium'
                : 'text-zinc-400 hover:text-zinc-200'}"
              onclick={() => (selectedShell = option.id)}
            >
              {option.label}
              {#if selectedShell === option.id}
                <div
                  class="absolute bottom-0 left-0 w-full h-0.5 bg-primary"
                ></div>
              {/if}
            </button>
          {/each}
        </div>
      </div>

      <!-- Terminal content with enhanced glass effect -->
      <div
        class="terminal-window bg-zinc-900/50 backdrop-blur-lg text-zinc-200 p-6 font-mono text-sm md:text-base relative"
        style="box-shadow: inset 0 0 60px rgba(0, 0, 0, 0.3); border-top: 1px solid rgba(255, 255, 255, 0.05);"
      >
        <div class="flex items-start text-left">
          <span class="mr-2 text-green-400">$</span>
          <code class="text-green-400">{shellCommands[selectedShell]}</code>
        </div>
        <button
          class="absolute top-4 right-4 p-1.5 rounded-md bg-zinc-800/80 hover:bg-zinc-700/80 transition-colors backdrop-blur-sm"
          onclick={copyCommand}
          aria-label="Copy command"
        >
          {#if copied}
            <Check class="h-4 w-4 text-green-500" />
          {:else}
            <Copy class="h-4 w-4 text-zinc-400" />
          {/if}
        </button>
      </div>
    </div>

    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <Button
        variant="outline"
        class="gap-2"
        onclick={() => scrollToSection("how-it-works")}
      >
        <Info class="h-4 w-4" />
        How it works?
      </Button>
      <Button class="gap-2">
        Install today
        <ChevronRight class="h-4 w-4" />
      </Button>
    </div>

    <div class="flex items-center gap-2 mt-8 text-muted-foreground">
      <Lock class="h-4 w-4" />
      <p>
        Completely private & local - <a
          href={`${SITE_URLS.DOCS_URL}/privacy`}
          class="text-primary hover:underline inline-flex items-center"
          >learn more <ChevronRight class="h-3 w-3 ml-0.5" /></a
        >
      </p>
    </div>
  </div>
</section>

<!-- BashBuddy Features Section -->
<section class="py-24 bg-zinc-950">
  <div class="container mx-auto px-4">
    <div class="text-center mb-16">
      <h2 class="text-4xl font-bold mb-4">Powerful Features</h2>
      <p class="text-xl text-muted-foreground max-w-2xl mx-auto">
        BashBuddy is designed to make your command line experience seamless and
        efficient.
      </p>
    </div>

    <div class="flex flex-col w-full lg:grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Context-aware card (larger) -->
      <LandingCard
        className="col-span-2"
        icon={Brain}
        title="Context-aware"
        description="BashBuddy understands your shell environment as well as your current directory. It has context about git repositories and your current projects, making suggestions more relevant and powerful."
        tags={[
          { label: "Shell Context" },
          { label: "Git Integration" },
          { label: "Project Awareness (Coming Soon)" },
        ]}
      />

      <!-- Open Source card -->
      <LandingCard
        icon={Github}
        title="Open Source"
        description="BashBuddy is completely open source. Inspect the code, contribute, or customize it to your needs. We believe in transparency and community-driven development."
        button={{ label: "View on GitHub", icon: Github }}
      />

      <!-- Natural Language card -->
      <LandingCard
        icon={Terminal}
        title="Natural Language"
        description="Write commands in plain text, or just type a half-baked command. BashBuddy translates your natural language into precise shell commands, handling all the complex syntax and arguments for you."
      />

      <!-- Cross-platform card (larger) -->
      <LandingCard
        icon={Globe}
        className="col-span-2"
        title="Cross-platform"
        description="BashBuddy works seamlessly across operating systems and shells. Prefer using powershell? Don't worry, use the same natural language interface regardless. It even works on server environments!"
        tags={[
          { label: "macOS" },
          { label: "Linux" },
          { label: "Windows" },
          { label: "Bash" },
          { label: "Zsh" },
          { label: "PowerShell" },
        ]}
      />
    </div>

    <!-- Features CTA -->
    <div class="mt-16 text-center">
      <Button class="gap-2 px-8 py-6 text-lg">
        <Terminal class="h-5 w-5" />
        Experience the power of BashBuddy
        <ChevronRight class="h-5 w-5" />
      </Button>
    </div>
  </div>
</section>

<!-- How It Works Section -->
<section
  id="how-it-works"
  class="py-24 bg-gradient-to-b from-zinc-950 to-zinc-950"
>
  <div class="container mx-auto px-4">
    <div class="text-center mb-16">
      <h2 class="text-4xl font-bold mb-4">How BashBuddy Works</h2>
      <p class="text-xl text-muted-foreground max-w-2xl mx-auto">
        See BashBuddy in action with real-world examples. Type naturally, get
        precise commands.
      </p>
    </div>

    <!-- Demo Terminal -->
    <div class="max-w-3xl mx-auto mb-16">
      <div class="rounded-lg overflow-hidden shadow-xl min-h-[480px]">
        <!-- Terminal Header -->
        <div
          class="bg-zinc-800 px-4 py-3 flex items-center border-b border-zinc-700/50"
        >
          <div class="flex space-x-2 mr-4">
            <div class="w-3 h-3 rounded-full bg-red-500"></div>
            <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div class="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div class="flex-1 text-center text-sm text-zinc-400 font-medium">
            {demoExamples[selectedDemo]?.shellType === "bash"
              ? "Terminal"
              : "PowerShell"}
          </div>
        </div>

        <!-- Terminal Content -->
        <div class="bg-zinc-900 p-6 font-mono text-sm">
          <!-- User Input -->
          <div class="flex items-start mb-4">
            <span class="mr-2 text-green-400"
              >{demoExamples[selectedDemo]?.prompt}</span
            >
            <div class="flex-1">
              <span class="text-blue-400">bb</span>
              <span class="text-zinc-400">
                {" " + demoExamples[selectedDemo]?.userInput}</span
              >
            </div>
          </div>

          <!-- BashBuddy Output -->
          <div class="border-l-2 border-primary pl-4 py-1 mb-4">
            <div class="text-zinc-100 font-medium mb-2">┌ BashBuddy</div>
            <div class="text-zinc-300 mb-1">│</div>
            <div class="text-primary mb-1">
              ◇ {demoExamples[selectedDemo]?.generatedCommand}
            </div>
            <div class="text-zinc-300 mb-1">│</div>
            <div class="text-zinc-300 mb-1">
              │ Explanation: {demoExamples[selectedDemo]?.explanation}
            </div>
            <div class="text-zinc-300 mb-1">│</div>
            <div class="text-primary font-medium mb-1">
              ◆ What would you like to do with this command?
            </div>
            <div class="text-zinc-300 mb-1">
              │ <CircleDot class="inline h-4 w-4 text-primary" /> Run the command
            </div>
            <div class="text-zinc-300 mb-1">
              │ <Circle class="inline h-4 w-4 text-zinc-400" /> Copy to clipboard
            </div>
            <div class="text-zinc-300 mb-1">
              │ <Circle class="inline h-4 w-4 text-zinc-400" /> Suggest changes
            </div>
            <div class="text-zinc-100 font-medium">└</div>
          </div>
        </div>
      </div>

      <!-- Carousel Indicators -->
      <div class="flex justify-center mt-6 space-x-2">
        {#each demoExamples as _, i}
          <button
            onclick={() => selectDemo(i)}
            class="w-2.5 h-2.5 rounded-full transition-colors {selectedDemo ===
            i
              ? 'bg-primary'
              : 'bg-zinc-600 hover:bg-zinc-500'}"
            aria-label="Select example {i + 1}"
          ></button>
        {/each}
      </div>
    </div>

    <!-- How It Works CTA -->
    <div class="mt-16 text-center">
      <Button class="gap-2 px-8 py-6 text-lg">
        <Terminal class="h-5 w-5" />
        Try BashBuddy Now
        <ChevronRight class="h-5 w-5" />
      </Button>
    </div>
  </div>
</section>

<!-- BashBuddy Cloud Section -->
<section class="py-24 bg-gradient-to-b from-zinc-950 to-zinc-900" id="cloud">
  <div class="container mx-auto px-4">
    <div class="text-center mb-16">
      <h2 class="text-4xl font-bold mb-4">
        <span
          class="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-500"
          >BashBuddy Cloud</span
        >
      </h2>
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
        title="Really Affordable"
        description="Just $2 per month for unlimited command generations. No hidden fees or usage limits."
        button={{ label: "Subscribe Now" }}
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

      <!-- No Logs card -->
      <LandingCard
        icon={EyeOff}
        title="No Logs, No Traces"
        description="We don't keep logs of your commands or usage patterns. Your terminal interactions remain completely private."
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
      >
        <Zap class="h-5 w-5" />
        Subscribe to BashBuddy Cloud
        <ChevronRight class="h-5 w-5" />
      </Button>
    </div>
  </div>
</section>

<!-- BashBuddy Local Section -->
<section class="py-24 bg-zinc-900" id="local">
  <div class="container mx-auto px-4">
    <div class="text-center mb-16">
      <h2 class="text-4xl font-bold mb-4">Run Locally</h2>
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
      <Button variant="outline" class="gap-2 px-8 py-6 text-lg">
        <Cpu class="h-5 w-5" />
        Install BashBuddy Locally
        <ChevronRight class="h-5 w-5" />
      </Button>
    </div>
  </div>
</section>

<!-- What's Coming in the Future Section -->
<section class="py-24 bg-gradient-to-b from-black to-zinc-900" id="roadmap">
  <div class="container mx-auto px-4">
    <div class="text-center mb-16">
      <h2 class="text-4xl font-bold mb-4">What's Coming in the Future</h2>
      <p class="text-xl text-muted-foreground max-w-2xl mx-auto">
        We're constantly improving BashBuddy with exciting new features on the
        horizon.
      </p>
    </div>

    <div class="flex flex-col lg:grid grid-cols-3 justify-center gap-6">
      <!-- Memory card -->
      <LandingCard
        icon={Brain}
        title="Memory"
        description="BashBuddy will remember your past interactions and preferences, learning from your usage patterns to provide increasingly personalized command suggestions over time."
        tags={[{ label: "Coming Soon", primary: true }]}
      />

      <!-- Integrations card -->
      <LandingCard
        icon={Sparkles}
        title="Integrations"
        description="BashBuddy won't just be a CLI tool. It will seamlessly integrate with your favorite tools like Raycast, tmux, Warp, and more."
        tags={[{ label: "Coming Soon", primary: true }]}
      />

      <!-- Agent Mode card -->
      <LandingCard
        icon={Rocket}
        title="Agent Mode"
        description="BashBuddy will intelligently determine extra steps to provide better solutions to your questions, handling complex workflows and multi-step processes automatically."
        tags={[{ label: "Coming Soon", primary: true }]}
      />
    </div>
  </div>
</section>

<!-- Final CTA Section -->
<section class="py-32 bg-gradient-to-b from-zinc-900 to-black">
  <div class="container mx-auto px-4">
    <div class="max-w-5xl mx-auto text-center space-y-12">
      <h2 class="text-6xl md:text-7xl font-bold tracking-tight">
        Transform Your <span class="text-primary">Command Line</span> Experience
        Today
      </h2>

      <p
        class="text-2xl md:text-3xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
      >
        Join thousands of developers who've made their terminal work for them,
        not against them.
      </p>

      <div class="pt-8 flex flex-col md:flex-row gap-6 justify-center">
        <Button class="gap-2 px-10 py-8 text-xl">
          <Terminal class="h-6 w-6" />
          Install BashBuddy
          <ChevronRight class="h-6 w-6" />
        </Button>

        <Button
          variant="outline"
          class="gap-2 px-10 py-8 text-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 hover:from-orange-500/20 hover:to-red-500/20 border-orange-500/30"
        >
          <Zap class="h-6 w-6 text-orange-500" />
          <span
            class="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-500"
          >
            Try BashBuddy Cloud
          </span>
          <ChevronRight class="h-6 w-6 text-orange-500" />
        </Button>
      </div>

      <div
        class="flex items-center justify-center gap-3 pt-8 text-muted-foreground"
      >
        <Shield class="h-5 w-5" />
        <p class="text-lg">
          Your privacy is our priority. All local installations run 100% on your
          device.
        </p>
      </div>
    </div>
  </div>
</section>
