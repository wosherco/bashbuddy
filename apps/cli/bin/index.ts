#!/usr/bin/env bun
import { isDev } from "@bashbuddy/consts";

import createCLI from "../src/index";
import {
  checkForUpdates,
  displayUpdateNotification,
} from "../src/utils/updateChecker";

/**
 * Main function to run the CLI
 */
async function main(): Promise<void> {
  const updateInfoPromise = checkForUpdates();
  try {
    const program = createCLI();
    program.exitOverride((_) => {
      // Ignore
    });
    await program.parseAsync(process.argv);
  } catch (error) {
    console.error("Error running CLI:", error);
    process.exit(1);
  }

  const updateInfo = await updateInfoPromise;
  if (updateInfo && !isDev) {
    displayUpdateNotification(updateInfo);
  }
}

// Run the main function with error handling
void main().catch((error: unknown) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
