import * as p from "@clack/prompts";
import chalk from "chalk";
import { Command } from "commander";

import { SITE_URLS } from "@bashbuddy/consts";

import { getUser } from "../utils/auth";
import { CLOUD_MODE, ConfigManager } from "../utils/config";

/**
 * Create the cloud command
 * @returns The cloud command
 */
export function createCloudCommand(): Command {
  const cloudCommand = new Command("cloud")
    .description("Manage cloud subscriptions")
    .action(async () => {
      p.intro("BashBuddy Cloud");

      const user = await getUser();

      if (!user) {
        p.log.error("You're not logged in. Run `bashbuddy login` to login.");
        return;
      }

      const isSubscribed =
        user.subscribedUntil !== null && user.subscribedUntil > new Date();

      if (isSubscribed) {
        p.log.success(
          `You're subscribed to BashBuddy Cloud until "${user.subscribedUntil?.toDateString()}"!`,
        );
        await ConfigManager.setMode(CLOUD_MODE);
      } else {
        p.log.error(
          `You're not subscribed to BashBuddy Cloud. Visit ${chalk.underline(
            `${SITE_URLS.ACCOUNT_URL}`,
          )} to subscribe.`,
        );
      }

      p.outro("Thank you for using BashBuddy Cloud!");
    });

  return cloudCommand;
}
