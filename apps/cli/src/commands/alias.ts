import fs from "fs/promises";
import os from "os";
import path from "path";
import * as p from "@clack/prompts";
import chalk from "chalk";
import { Command } from "commander";

import { getShellType } from "../utils/shell";

/**
 * Create the alias command
 * @returns The alias command
 */
export function createAliasCommand(): Command {
  const aliasCommand = new Command("alias")
    .description("Configure shell alias 'bb' for BashBuddy")
    .action(() => {
      execute().catch(console.error);
    });

  return aliasCommand;
}

async function execute() {
  p.intro("BashBuddy Alias Setup");

  const shellType = getShellType();
  const homeDir = os.homedir();

  let configFile: string;
  let aliasContent: string;

  // Determine shell config file and alias format based on shell type
  switch (shellType) {
    case "zsh":
      configFile = path.join(homeDir, ".zshrc");
      aliasContent = `
# BashBuddy alias
bb() {
  bashbuddy ask "$@"
}
`;
      break;
    case "bash":
      configFile = path.join(homeDir, ".bashrc");
      aliasContent = `
# BashBuddy alias
bb() {
  bashbuddy ask "$@"
}
`;
      break;
    case "fish":
      configFile = path.join(homeDir, ".config", "fish", "config.fish");
      aliasContent = `
# BashBuddy alias
function bb
  bashbuddy ask $argv
end
`;
      break;
    case "powershell":
      configFile = await getPowerShellProfilePath();
      aliasContent = `
# BashBuddy alias
function bb { 
  bashbuddy ask $args 
}
`;
      break;
    default:
      p.log.error(
        `Unsupported shell type: ${shellType}. Please manually add an alias for 'bashbuddy ask' to your shell configuration.`,
      );
      p.outro("Alias setup failed.");
      return;
  }

  try {
    // Check if config file exists
    try {
      await fs.access(configFile);
    } catch {
      // Create directory if it doesn't exist (for fish shell)
      if (shellType === "fish") {
        await fs.mkdir(path.dirname(configFile), { recursive: true });
      }

      // Create the config file if it doesn't exist
      await fs.writeFile(configFile, "", "utf8");
      p.log.message(`Created new config file: ${configFile}`);
    }

    // Read the current config file
    const configContent = await fs.readFile(configFile, "utf8");

    // Check if the alias already exists
    if (configContent.includes("# BashBuddy alias")) {
      p.log.success(`Alias 'bb' is already configured in ${configFile}`);
    } else {
      // Add the alias to the config file
      const updatedContent = configContent + "\n" + aliasContent;
      await fs.writeFile(configFile, updatedContent, "utf8");
      p.log.success(`Added alias 'bb' to ${configFile}`);
    }

    p.log.message(
      `${chalk.green("✓")} Alias 'bb' configured. You can now use ${chalk.bold(
        "bb <your question>",
      )} as a shorthand for ${chalk.bold("bashbuddy ask <your question>")}.`,
    );
    p.log.message(
      `${chalk.yellow("!")} You may need to restart your terminal or run ${chalk.bold(
        shellType === "fish" ? "source " + configFile : "source " + configFile,
      )} for the changes to take effect.`,
    );
  } catch (error) {
    p.log.error(`Failed to configure alias: ${(error as Error).message}`);
    p.log.message(
      `You can manually add the following to your shell config file (${configFile}):\n${aliasContent}`,
    );
  }

  p.outro("Alias setup completed.");
}

/**
 * Get the PowerShell profile path
 * @returns Path to the PowerShell profile
 */
async function getPowerShellProfilePath(): Promise<string> {
  const homeDir = os.homedir();
  const documentsDir = path.join(homeDir, "Documents");

  // Check if we're in PowerShell Core or Windows PowerShell
  const isPowerShellCore = process.env.TERM_PROGRAM === "pwsh";

  let profilePath: string;

  if (isPowerShellCore) {
    profilePath = path.join(
      documentsDir,
      "PowerShell",
      "Microsoft.PowerShell_profile.ps1",
    );
  } else {
    profilePath = path.join(
      documentsDir,
      "WindowsPowerShell",
      "Microsoft.PowerShell_profile.ps1",
    );
  }

  // Create directory if it doesn't exist
  await fs.mkdir(path.dirname(profilePath), { recursive: true });

  return profilePath;
}
