import { Command } from "commander";

import { createAliasCommand } from "./commands/alias";
import { createAskCommand } from "./commands/ask";
import { createCloudCommand } from "./commands/cloud";
import { createLocalCommand } from "./commands/local";
import { createLoginCommand } from "./commands/login";
import { createLogoutCommand } from "./commands/logout";
import { createModeCommand } from "./commands/mode";
import { createUpdateCommand } from "./commands/update";
import { GIT_SHA, VERSION } from "./version";

/**
 * Create and configure the CLI program
 */
export function createCLI() {
  const program = new Command()
    .name("bashbuddy")
    .description("BashBuddy CLI - Your command line assistant")
    .version(`${VERSION} (${GIT_SHA})`)
    .argument("[command]", "The command to run")
    .action((command) => {
      if (command) {
        program.outputHelp();
      } else {
        console.log("👋 Welcome to BashBuddy CLI!");
        console.log("Run with --help to see available commands.");
        program.outputHelp();
      }
    });

  // Add commands
  program.addCommand(createLocalCommand());
  program.addCommand(createCloudCommand());
  program.addCommand(createModeCommand());
  program.addCommand(createAskCommand());
  program.addCommand(createLoginCommand());
  program.addCommand(createLogoutCommand());
  program.addCommand(createAliasCommand());
  program.addCommand(createUpdateCommand());

  return program;
}

/**
 * Export the CLI for use in bin/index.ts
 */
export default createCLI;
