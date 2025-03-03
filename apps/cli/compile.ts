import { existsSync } from "node:fs";
import { mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { $ } from "bun";

// Define all supported targets
const TARGETS = {
  linux: {
    x64: [""],
    arm64: [""],
    "x64-musl": [""],
    "arm64-musl": [""],
  },
  windows: {
    x64: [""],
    arm64: [], // Not supported yet
  },
  darwin: {
    x64: [""],
    arm64: [""],
  },
};

// Parse command line arguments
const args = process.argv.slice(2);

// Show help if requested
if (args.includes("--help") || args.includes("-h")) {
  showHelp();
  process.exit(0);
}

// Parse arguments
const entryPoint = args[0] || "./bin/index.ts";
const outDir = args[1] || "./dist";
const specificPlatforms = args.slice(2);

function showHelp() {
  console.log(`
🚀 BashBuddy Cross-Platform Build Script

Usage:
  bun run compile.ts [entry-point] [output-directory] [platform-filters...]
  
Arguments:
  entry-point         The entry point file (default: ./bin/index.ts)
  output-directory    The directory to output the builds (default: ./dist)
  platform-filters    Optional platform filters to build only specific platforms

Examples:
  bun run compile.ts                           # Build all platforms with defaults
  bun run compile.ts ./src/main.ts ./builds    # Custom entry and output
  bun run compile.ts ./bin/index.ts ./dist linux-x64  # Build only Linux x64
  bun run compile.ts ./bin/index.ts ./dist darwin windows-x64  # Build macOS and Windows x64

Supported Platforms:
  - linux-x64, linux-x64-baseline, linux-x64-modern
  - linux-arm64
  - linux-x64-musl, linux-x64-musl-baseline, linux-x64-musl-modern
  - linux-arm64-musl
  - windows-x64, windows-x64-baseline, windows-x64-modern
  - darwin-x64, darwin-x64-baseline, darwin-x64-modern
  - darwin-arm64

Options:
  --help, -h          Show this help message
  `);
}

function getAllPlatforms() {
  const platforms = [];

  for (const [os, architectures] of Object.entries(TARGETS)) {
    for (const [arch, variants] of Object.entries(architectures)) {
      for (const variant of variants) {
        const platformKey = `${os}-${arch}${variant ? `-${variant}` : ""}`;
        platforms.push(platformKey);
      }
    }
  }

  return platforms;
}

async function main() {
  // Create output directory if it doesn't exist
  if (!existsSync(outDir)) {
    await mkdir(outDir, { recursive: true });
  }

  console.log(
    `🚀 Building BashBuddy for ${specificPlatforms.length ? "specific" : "all"} platforms`,
  );
  console.log(`📄 Entry point: ${entryPoint}`);
  console.log(`📁 Output directory: ${outDir}`);

  if (specificPlatforms.length) {
    console.log(`🎯 Target platforms: ${specificPlatforms.join(", ")}`);
  }

  let buildCount = 0;
  const startTime = Date.now();
  const allPlatforms = getAllPlatforms();

  // Build for each target
  for (const [os, architectures] of Object.entries(TARGETS)) {
    for (const [arch, variants] of Object.entries(architectures)) {
      for (const variant of variants) {
        // Skip if specific platforms were provided and this one isn't included
        if (specificPlatforms.length > 0) {
          const platformKey = `${os}-${arch}${variant ? `-${variant}` : ""}`;

          // Check if any of the specified platforms match this one
          const shouldBuild = specificPlatforms.some((filter) => {
            // Exact match
            if (platformKey === filter) return true;

            // OS match (e.g., "linux" matches "linux-x64")
            if (filter === os && platformKey.startsWith(`${os}-`)) return true;

            // OS-arch match (e.g., "linux-x64" matches "linux-x64-modern")
            if (platformKey.startsWith(filter)) return true;

            return false;
          });

          if (!shouldBuild) continue;
        }

        // Construct target string
        const targetVariant = variant ? `-${variant}` : "";
        const target = `bun-${os}-${arch}${targetVariant}`;

        // Construct output filename
        const fileExtension = os === "windows" ? ".exe" : "";
        const variantSuffix = variant ? `-${variant}` : "";
        const outFile = join(
          outDir,
          `bashbuddy-${os}-${arch}${variantSuffix}${fileExtension}`,
        );

        console.log(`\n🔨 Building for ${target}...`);

        try {
          // Run the build command
          const result =
            await $`bun build ${entryPoint} --compile --minify --sourcemap --bytecode --target=${target} --outfile ${outFile}`.quiet();

          if (result.exitCode === 0) {
            console.log(`✅ Successfully built for ${target}`);
            console.log(`📦 Output: ${outFile}`);
            buildCount++;
          } else {
            console.error(`❌ Failed to build for ${target}`);
            console.error(result.stderr.toString());
          }
        } catch (error) {
          console.error(`❌ Error building for ${target}:`, error);
        }
      }
    }
  }

  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;

  console.log(
    `\n🎉 Build complete! Built ${buildCount} executables in ${duration.toFixed(2)}s`,
  );
}

main().catch((error) => {
  console.error("❌ Build failed:", error);
  process.exit(1);
});
