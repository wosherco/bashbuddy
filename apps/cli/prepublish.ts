/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { parse as parseYaml } from "yaml";

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
  // @ts-expect-error - This is safe because we are filtering the dependencies
  acc[dependency] = packageJson.dependencies[dependency];
  return acc;
}, {});

// Parsing pnpm-workspace.yaml
const pnpmWorkspace = await Bun.file("../../pnpm-workspace.yaml").text();
const pnpmWorkspaceJson = parseYaml(pnpmWorkspace);

// Going through packages, and if there's a catalog:, get the version from pnpm-workspace.yaml
packageJson.dependencies = Object.fromEntries(
  Object.entries(packageJson.dependencies as Record<string, string>).map(
    ([dependency, version]) => {
      if (version.startsWith("catalog:")) {
        const packageInfo = pnpmWorkspaceJson.catalog[dependency];

        return [dependency, packageInfo];
      }

      return [dependency, version];
    },
  ),
);

// Write the filtered package.json for publishing
await Bun.write("package.json", JSON.stringify(packageJson, null, 2));
