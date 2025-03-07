import { executeCommand } from "./shell";

async function runGitCommand(command: string): Promise<string> {
  return executeCommand(`git ${command}`);
}

/**
 * Checks if the current directory is inside a git repository
 * @returns {boolean} True if inside a git repository, false otherwise
 */
export async function isGitRepository(): Promise<boolean> {
  try {
    // Run 'git rev-parse --is-inside-work-tree' to check if we're in a git repo
    const result = await runGitCommand("rev-parse --is-inside-work-tree");

    // If the command was successful and returned "true", we're in a git repo
    return result === "true";
  } catch {
    // If there was an error executing the command, we're not in a git repo
    // or git is not installed
    return false;
  }
}

/**
 * Gets the root directory of the git repository
 * @returns {string|null} The absolute path to the git repository root, or null if not in a git repository
 */
export async function getGitRepositoryRoot(): Promise<string | null> {
  try {
    // Run 'git rev-parse --show-toplevel' to get the root directory of the git repo
    const result = await runGitCommand("rev-parse --show-toplevel");

    // If the command was successful, return the path to the git repo root
    if (result) {
      return result;
    }

    return null;
  } catch {
    // If there was an error executing the command, we're not in a git repo
    // or git is not installed
    return null;
  }
}

/**
 * Gets the current branch of the git repository
 * @returns {string|null} The current branch, or null if not in a git repository
 */
export async function getGitCurrentBranch(): Promise<string | null> {
  try {
    const result = await runGitCommand("branch --show-current");
    return result;
  } catch {
    return null;
  }
}

/**
 * Gets the remotes of the git repository
 * @returns {string|null} The remotes of the git repository, or null if not in a git repository
 */
export async function getGitRemotes(): Promise<string | null> {
  try {
    const result = await runGitCommand("remote -v");
    return result;
  } catch {
    return null;
  }
}

/**
 * Gets the last commit of the git repository
 * @returns {string|null} The last commit, or null if not in a git repository
 */
export async function getGitLastCommit(): Promise<string | null> {
  try {
    const result = await runGitCommand(
      "log -1 --pretty=format:'%h %s %an %ad'",
    );
    return result || null;
  } catch {
    return null;
  }
}

/**
 * Gets the last branches of the git repository
 * @returns {string|null} The last branches, or null if not in a git repository
 */
export async function getGitLastBranches(): Promise<string | null> {
  try {
    const result = await runGitCommand(
      "branch -r --sort=-committerdate | head -n 4",
    );
    return result;
  } catch {
    return null;
  }
}
