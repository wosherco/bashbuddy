import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Command } from "commander";

import { createAliasCommand } from "./commands/alias";
import { createAskCommand } from "./commands/ask";
import { createLocalCommand } from "./commands/local";
import { createLoginCommand } from "./commands/login";
import { createLogoutCommand } from "./commands/logout";
import { createModeCommand } from "./commands/mode";

// Define package.json interface
interface PackageJson {
  version?: string;
  name?: string;
  [key: string]: unknown;
}

// Get the package.json version dynamically
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageJsonPath = path.resolve(__dirname, "../package.json");
const packageJson = JSON.parse(
  fs.readFileSync(packageJsonPath, "utf8"),
) as PackageJson;
const version = packageJson.version ?? "0.0.1";

/**
 * Create and configure the CLI program
 */
export function createCLI() {
  const program = new Command()
    .name("bashbuddy")
    .description("BashBuddy CLI - Your command line assistant")
    .version(version)
    .action(() => {
      console.log("👋 Welcome to BashBuddy CLI!");
      console.log("Run with --help to see available commands.");
      program.help();
    });

  // Add commands
  program.addCommand(createLocalCommand());
  program.addCommand(createModeCommand());
  program.addCommand(createAskCommand());
  program.addCommand(createLoginCommand());
  program.addCommand(createLogoutCommand());
  program.addCommand(createAliasCommand());

  return program;
}

/**
 * Export the CLI for use in bin/index.ts
 */
export default createCLI;
