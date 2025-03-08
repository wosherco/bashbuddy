import { execSync } from "child_process";
import chalk from "chalk";
import { Command } from "commander";

/**
 * Create the update command
 * @returns The update command
 */
export function createUpdateCommand(): Command {
  const updateCommand = new Command("update")
    .description("Update the CLI")
    .action(() => {
      try {
        console.log(
          chalk.blue("Updating BashBuddy CLI to the latest version..."),
        );
        execSync("bun i -g @bashbuddy/cli@latest", { stdio: "inherit" });
        console.log(
          chalk.green("✓ BashBuddy CLI has been updated successfully!"),
        );
        process.exit(0);
      } catch (error) {
        console.error(chalk.red("Failed to update BashBuddy CLI:"), error);
        process.exit(1);
      }
    });

  return updateCommand;
}
