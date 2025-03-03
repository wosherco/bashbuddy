#!/usr/bin/env node
import createCLI from "../src/index";

/**
 * Main function to run the CLI
 */
async function main(): Promise<void> {
  try {
    const program = createCLI();
    await program.parseAsync(process.argv);
  } catch (error) {
    console.error("Error running CLI:", error);
    process.exit(1);
  }
}

// Run the main function with error handling
void main().catch((error: unknown) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
