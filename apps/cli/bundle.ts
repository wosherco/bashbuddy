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
  target: "bun",
  external: externalDependencies,
});
