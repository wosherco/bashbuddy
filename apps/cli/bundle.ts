import { $ } from "bun";

// Filling the version and the git sha
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
const version = (await Bun.file("./package.json").json()).version as number;
const commitSha = (await $`git rev-parse HEAD`.text()).trim();

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
