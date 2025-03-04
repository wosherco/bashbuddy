import { spawn } from "child_process";
import fs from "fs/promises";
import os from "os";
import path from "path";

import { isWindows } from "./platforms";

/**
 * Gets the last N commands from shell history
 * @param limit Number of commands to retrieve
 * @returns Array of command strings
 */
export async function getShellHistory(limit = 20): Promise<string[]> {
  try {
    // Get history file path
    const historyPath = await getShellHistoryPath();
    if (!historyPath) {
      return [];
    }

    // Read and parse history file
    const content = await fs.readFile(historyPath, "utf8");
    const commands = parseShellHistory(content, path.basename(historyPath));

    // Return the last N commands
    return commands.slice(-limit);
  } catch (error) {
    console.error("Error getting shell history:", error);
    return [];
  }
}

/**
 * Parses shell history content into individual commands
 * @param content Raw history file content
 * @param historyFileName Name of the history file (used to determine format)
 * @returns Array of command strings
 */
function parseShellHistory(content: string, historyFileName: string): string[] {
  // Bash history format (starts with ": timestamp:0;")
  const reBashHistory = /^: \d+:0;/;

  // PowerShell history is stored in XML format
  if (historyFileName.toLowerCase().includes("powershell")) {
    try {
      // Simple regex-based extraction for PowerShell commands
      // This handles the basic format without full XML parsing
      const commands: string[] = [];
      const commandMatches = content.match(
        /<CommandLine>(.+?)<\/CommandLine>/g,
      );

      if (commandMatches) {
        commandMatches.forEach((match) => {
          const command = match.replace(/<CommandLine>|<\/CommandLine>/g, "");
          if (command) commands.push(command);
        });
        return commands;
      }
      return [];
    } catch {
      // Fallback to line-by-line if XML parsing fails
      return content.trim().split("\n");
    }
  }

  // CMD history (doskey) is typically one command per line
  if (historyFileName.toLowerCase().includes("doskey")) {
    return content.trim().split("\n");
  }

  // Default parsing for bash/zsh
  return content
    .trim()
    .split("\n")
    .map((line) => {
      if (reBashHistory.test(line)) {
        return line.split(";").slice(1).join(";");
      }

      // ZSH just places one command on each line
      return line;
    });
}

/**
 * Determines the shell history file path
 * @returns Path to the shell history file
 */
async function getShellHistoryPath(): Promise<string | undefined> {
  // Check if HISTFILE environment variable is set
  if (process.env.HISTFILE) {
    return process.env.HISTFILE;
  }

  const homeDir = os.homedir();

  // Common history file paths
  const paths = [
    path.join(homeDir, ".bash_history"),
    path.join(homeDir, ".zsh_history"),
    path.join(homeDir, ".history"),
  ];

  // Add Windows-specific paths
  if (isWindows) {
    const appData =
      process.env.APPDATA ?? path.join(homeDir, "AppData", "Roaming");

    // PowerShell history paths
    paths.push(
      path.join(
        appData,
        "Microsoft",
        "Windows",
        "PowerShell",
        "PSReadLine",
        "ConsoleHost_history.txt",
      ),
      path.join(
        homeDir,
        "Documents",
        "WindowsPowerShell",
        "PSReadline",
        "ConsoleHost_history.txt",
      ),
      path.join(
        appData,
        "Microsoft",
        "PowerShell",
        "PSReadLine",
        "ConsoleHost_history.txt",
      ),
    );

    // CMD history is typically not stored in a file by default
    // But we can check for potential doskey macros file
    if (process.env.CMDHISTORY) {
      paths.push(process.env.CMDHISTORY);
    }
    paths.push(path.join(homeDir, "doskey.txt"));
  }

  // Find the largest history file (most likely to be the active one)
  let largestFile: string | undefined;
  let largestSize = 0;

  for (const filePath of paths) {
    try {
      const exists = await fs.exists(filePath);
      if (!exists) continue;

      const stats = await fs.stat(filePath);
      if (stats.size > largestSize) {
        largestSize = stats.size;
        largestFile = filePath;
      }
    } catch {
      // Skip files we can't access
      continue;
    }
  }

  return largestFile;
}

/**
 * Gets the current shell type
 * @returns Shell type string (bash, zsh, powershell, cmd, or unknown)
 */
export function getShellType(): string {
  const shell = process.env.SHELL ?? process.env.ComSpec ?? "";
  const shellLower = shell.toLowerCase();

  if (shellLower.includes("bash")) return "bash";
  if (shellLower.includes("zsh")) return "zsh";
  if (shellLower.includes("powershell") || shellLower.includes("pwsh"))
    return "powershell";
  if (shellLower.includes("cmd") || shellLower.includes("command"))
    return "cmd";

  // Try to detect PowerShell from process name
  if (process.platform === "win32" && process.env.PSModulePath)
    return "powershell";

  return "unknown";
}

export async function executeCommand(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(command.split(" ")[0], command.split(" ").slice(1));

    let data = "";

    child.stdout.on("data", (chunk) => {
      data += chunk;
    });

    child.on("close", () => {
      resolve(data.trim());
    });

    child.on("error", (error) => {
      reject(error);
    });
  });
}
