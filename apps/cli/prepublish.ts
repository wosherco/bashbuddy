/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { externalDependencies } from "./bundle.ts";

// Read the original package.json
const packageJson = await Bun.file("package.json").json();

delete packageJson.devDependencies;

const dependencies = Object.keys(packageJson.dependencies);

// Filtering the ones to keep
const dependenciesToKeep = dependencies.filter((dependency) =>
  externalDependencies.some((dep) => dependency.startsWith(dep)),
);

packageJson.dependencies = dependenciesToKeep.reduce((acc, dependency) => {
  acc[dependency] = packageJson.dependencies[dependency];
  return acc;
}, {});

// Write the filtered package.json for publishing
await Bun.write("package.json", JSON.stringify(packageJson, null, 2));
