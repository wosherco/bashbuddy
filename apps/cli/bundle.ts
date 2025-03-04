import { $ } from "bun";

let version = "0.0.0";
let commitSha = "unknown";

try {
  // Filling the version and the git sha
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  version = (await Bun.file("./package.json").json()).version as string;
  commitSha = (await $`git rev-parse HEAD`.text()).trim();
} catch (error) {
  console.warn("Warning: Failed to retrieve version or commit SHA:", error);
}

await Bun.write(
  "./src/version.ts",
  `export const VERSION = "${version}";\nexport const GIT_SHA = "${commitSha}";`,
);

// Define external dependencies to exclude from the bundle
export const externalDependencies = [
  "@node-llama-cpp",
  "@reflink",
  "node-llama-cpp",
];

await Bun.build({
  entrypoints: ["./bin/index.ts"],
  outdir: "./dist",
  minify: true,
  target: "node",
  external: externalDependencies,
});
