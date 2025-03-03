import * as p from "@clack/prompts";
import { Command } from "commander";

import type { AIMode } from "../utils/config";
import {
  AI_MODES,
  CLOUD_MODE,
  ConfigManager,
  LOCAL_MODE,
} from "../utils/config";

interface ModeCommandOptions {
  set?: string;
}

/**
 * Create the mode command
 * @returns The mode command
 */
export function createModeCommand(): Command {
  const modeCommand = new Command("mode")
    .description("View or change the AI mode (cloud or local)")
    .option("-s, --set <mode>", "Set the AI mode (cloud or local)")
    .action(async (options: ModeCommandOptions) => {
      p.intro("BashBuddy Mode Configuration");

      // If mode is provided, set it
      if (options.set) {
        const modeInput = options.set.toLowerCase();

        // Check if the input is a valid AIMode
        const isValidMode = AI_MODES.includes(modeInput as AIMode);

        if (isValidMode) {
          const mode = modeInput as AIMode;
          await ConfigManager.setMode(mode);
          p.log.success(`AI mode set to ${mode}`);
        } else {
          p.log.error(
            `Invalid mode: ${modeInput}. Valid modes are: ${CLOUD_MODE}, ${LOCAL_MODE}`,
          );
        }
      } else {
        // If no mode is provided, show the current mode and allow changing it
        const currentMode = await ConfigManager.getMode();
        p.log.info(`Current AI mode: ${currentMode}`);

        const newMode = await p.select({
          message: "Select AI mode",
          options: [
            {
              value: CLOUD_MODE,
              label: "Cloud",
              hint: "Use cloud-based AI models",
            },
            {
              value: LOCAL_MODE,
              label: "Local",
              hint: "Use locally downloaded AI models",
            },
          ],
          initialValue: currentMode,
        });

        if (p.isCancel(newMode)) {
          p.cancel("Operation cancelled");
          return;
        }

        if (newMode !== currentMode) {
          await ConfigManager.setMode(newMode);
          p.log.success(`AI mode changed from ${currentMode} to ${newMode}`);
        } else {
          p.log.info(`AI mode unchanged: ${currentMode}`);
        }
      }

      p.outro("Mode configuration complete");
    });

  return modeCommand;
}
