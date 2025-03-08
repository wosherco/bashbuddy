import chalk from "chalk";

import { VERSION } from "../version";

interface UpdateInfo {
  latestVersion: string;
  currentVersion: string;
  updateAvailable: boolean;
}

/**
 * Check for updates to the CLI from npm or GitHub
 * @returns Promise with update information
 */
export async function checkForUpdates(): Promise<UpdateInfo | null> {
  // Try npm first, then fall back to GitHub if npm fails
  const npmUpdate = await checkNpmForUpdates();

  return npmUpdate;
}

/**
 * Check for updates using npm registry
 */
async function checkNpmForUpdates(): Promise<UpdateInfo | null> {
  try {
    // Fetch the latest version from npm
    const response = await fetch("https://registry.npmjs.org/@bashbuddy/cli");

    if (!response.ok) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data = await response.json();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const latestVersion = data["dist-tags"]?.latest as string;

    if (!latestVersion) {
      return null;
    }

    // Compare versions
    const updateAvailable = isNewerVersion(latestVersion, VERSION);

    return {
      latestVersion,
      currentVersion: VERSION,
      updateAvailable,
    };
  } catch {
    // Silently fail - update checks shouldn't interrupt normal operation
    return null;
  }
}

/**
 * Display update notification if an update is available
 * @param updateInfo The update information
 */
export function displayUpdateNotification(updateInfo: UpdateInfo): void {
  if (updateInfo.updateAvailable) {
    console.log(
      chalk.yellow("\n📦 Update available!") +
        chalk.white(
          ` ${updateInfo.currentVersion} → ${chalk.green(updateInfo.latestVersion)}`,
        ) +
        chalk.cyan("\nRun: ") +
        chalk.white("bashbuddy update") +
        chalk.cyan(" to update."),
    );
  }
}

/**
 * Compare version strings to determine if version1 is newer than version2
 * @param version1 First version string (e.g., "1.2.3")
 * @param version2 Second version string (e.g., "1.2.0")
 * @returns True if version1 is newer than version2
 */
function isNewerVersion(version1: string, version2: string): boolean {
  const v1Parts = version1.split(".").map(Number);
  const v2Parts = version2.split(".").map(Number);

  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
    const v1Part = v1Parts[i] || 0;
    const v2Part = v2Parts[i] || 0;

    if (v1Part > v2Part) {
      return true;
    }

    if (v1Part < v2Part) {
      return false;
    }
  }

  return false; // Versions are equal
}
