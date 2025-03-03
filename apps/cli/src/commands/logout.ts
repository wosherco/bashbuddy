import * as p from "@clack/prompts";
import { Command } from "commander";

import { trpc } from "../trpc";
import { isLoggedIn } from "../utils/auth";
import { ConfigManager } from "../utils/config";

/**
 * Create the mode command
 * @returns The mode command
 */
export function createLogoutCommand(): Command {
  const logoutCommand = new Command("logout")
    .description("Logout from BashBuddy Cloud")
    .action(async () => {
      p.intro("BashBuddy Cloud Logout");

      if (!(await isLoggedIn())) {
        p.log.success("You are not logged in. Use `bashbuddy login` to login");
        return;
      }

      try {
        await trpc.auth.logout.mutate();
        await ConfigManager.saveCloudToken(null);
      } catch {
        await ConfigManager.saveCloudToken(null);
      }

      p.outro("Successfully logged out");
    });

  return logoutCommand;
}
