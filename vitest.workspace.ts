import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  // "packages/*",
  {
    test: {
      name: "rrule",
      root: "./packages/rrule",
      environment: "node",
      globalSetup: "../../vitest.global-setup.ts",
    },
  },
]);
