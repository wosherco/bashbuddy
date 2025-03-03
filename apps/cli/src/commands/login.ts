import * as p from "@clack/prompts";
import { Command } from "commander";

import { SITE_URLS } from "@bashbuddy/consts";
import { socketlessMessageSchema } from "@bashbuddy/validators";

import { trpc } from "../trpc";
import { isLoggedIn } from "../utils/auth";
import { CLOUD_MODE, ConfigManager } from "../utils/config";

/**
 * Create the mode command
 * @returns The mode command
 */
export function createLoginCommand(): Command {
  const loginCommand = new Command("login")
    .description("Login to BashBuddy Cloud")
    .action(async () => {
      p.intro("BashBuddy Cloud Login");

      if (await isLoggedIn()) {
        p.log.success(
          "You are already logged in. Run `bashbuddy logout` to logout",
        );
        return;
      }

      const session = await trpc.auth.createAuthSession.mutate();

      p.log.message(
        `Please, access "${SITE_URLS.AUTHENTICATOR_URL}/?authSession=${session.id}&redirectTo=cli"`,
      );

      const tokenPrompt = p.password({
        message:
          "Logging you in... If this doesn't work, you can paste the token manually",
        validate(value) {
          if (value.trim().length < 5) {
            return "Invalid token";
          }
        },
      });

      const sessionSocket = new WebSocket(session.url);

      // sessionSocket.onopen = () => {
      //   p.log.success("Successfully created automatic auth session");
      // };

      sessionSocket.onerror = () => {
        p.log.error(
          "Failed to create automatic auth session. You will need to paste the token manually",
        );
      };

      sessionSocket.onmessage = (event) => {
        try {
          const data = socketlessMessageSchema.safeParse(
            JSON.parse(String(event.data)),
          );

          if (!data.success) {
            return;
          }

          const token = data.data.token;

          if (!token) {
            return;
          }

          // Aborting text prompt sending token
          process.stdin.emit("data", `${token}\r`);
        } catch {
          // Ignore
        }
      };

      const token = await tokenPrompt;

      if (!token || typeof token !== "string") {
        p.log.error("Invalid token");
        return;
      }

      p.log.success("Successfully logged in");

      const spinner = p.spinner();
      spinner.start("Getting your account info...");

      try {
        await ConfigManager.saveCloudToken(token);
        const user = await trpc.auth.getUser.query();
        spinner.stop(`Welcome back, ${user.name}!`);
      } catch {
        spinner.stop(`There was an issue logging in. Please try again.`);
        await ConfigManager.saveCloudToken(null);
      }

      await ConfigManager.setMode(CLOUD_MODE);

      p.outro("Login complete");
      process.exit(0);
    });

  return loginCommand;
}
