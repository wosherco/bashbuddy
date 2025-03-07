import * as p from "@clack/prompts";
import { TRPCClientError } from "@trpc/client";
import chalk from "chalk";
import clipboardy from "clipboardy";
import { Command } from "commander";

import type { LLMResponse } from "@bashbuddy/validators";
import { processPrompt } from "@bashbuddy/agent";
import { SITE_URLS } from "@bashbuddy/consts";

import { isV2 } from "../consts";
import { LocalLLM } from "../llms/localllm";
import {
  parseLLMResponse,
  parseYamlResponse,
  ResponseParseError,
} from "../llms/parser";
import { trpc } from "../trpc";
import { CLOUD_MODE, ConfigManager, LOCAL_MODE } from "../utils/config";
import { getContext } from "../utils/context";
import { runCommandWithStream } from "../utils/runner";

/**
 * Create the mode command
 * @returns The mode command
 */
export function createAskCommand(): Command {
  const askCommand = new Command("ask")
    .description("Ask a question to the AI")
    .argument("<question...>", "The question to ask the AI")
    .action((questionParts: string[]) => {
      // Join all parts of the question with spaces
      const question = questionParts.join(" ");
      execute(question).catch(console.error);
    });

  return askCommand;
}

async function execute(question: string) {
  p.intro("BashBuddy");

  // Get mode
  const [mode, context] = await Promise.all([
    ConfigManager.getMode(),
    getContext(),
  ]);

  let commandToRun: string | undefined;

  switch (mode) {
    case LOCAL_MODE: {
      const model = await ConfigManager.getLocalModel();

      if (!model) {
        p.log.error(
          "You've not set a local model yet. Run `bashbuddy local` to set one.",
        );
        return;
      }

      const llm = new LocalLLM(model);

      const modelSpinner = p.spinner();
      modelSpinner.start("Loading model...");
      await llm.init();
      modelSpinner.stop("Model loaded!");

      const createNewOutputStream = (newUserInput: string) =>
        Promise.resolve(processPrompt(llm, context, newUserInput, isV2()));

      commandToRun = await cliInfer(
        await createNewOutputStream(question),
        createNewOutputStream,
        1,
        false,
      );

      await llm.dispose();

      break;
    }
    case CLOUD_MODE: {
      try {
        const chatId = await trpc.chat.createChat.mutate();

        const createNewOutputStream = (newUserInput: string) =>
          trpc.chat.ask.mutate({
            input: newUserInput,
            context,
            chatId,
          });

        commandToRun = await cliInfer(
          await createNewOutputStream(question),
          createNewOutputStream,
          1,
          true,
        );
      } catch (err) {
        if (err instanceof TRPCClientError) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          const code = err.data?.code as string | undefined;

          if (code === "UNAUTHORIZED") {
            return p.log.error(
              "You're not logged in. Run `bashbuddy login` to login, or use `bashbuddy local` to setup BashBuddy locally.",
            );
          } else if (code === "FORBIDDEN") {
            return p.log.error(
              `You're not subscribed to BashBuddy. Go to ${chalk.underline(
                `${SITE_URLS.ACCOUNT_URL}/subscription`,
              )} to subscribe.`,
            );
          } else if (code === "NOT_FOUND") {
            return p.log.error(
              "Chat not found. Please start a new chat and try again.",
            );
          } else if (code === "PAYLOAD_TOO_LARGE") {
            return p.log.error("Chat is too long. Please start a new chat.");
          } else if (code === "TOO_MANY_REQUESTS") {
            return p.log.error("Too many requests. Please try again later.");
          } else if (code === "BAD_REQUEST") {
            return p.log.error(
              "You've reached the maximum of 5000 completions this month. Contact us to increase this limit.",
            );
          }
        }

        throw err;
      }
      break;
    }
  }

  if (commandToRun) {
    p.outro("Running command...");
    await runCommandWithStream(commandToRun);
  } else {
    p.outro("Thanks for using BashBuddy!");
  }
}

async function cliInfer(
  outputStream: AsyncIterable<string>,
  createNewOutputStream: (
    newUserInput: string,
  ) => Promise<AsyncIterable<string>>,
  revisionCount = 1,
  isCloudMode = false,
): Promise<string | undefined> {
  const llmSpinner = p.spinner();
  llmSpinner.start("Processing...");

  let finalResponse: LLMResponse;

  try {
    finalResponse = await (isV2() ? parseYamlResponse : parseLLMResponse)(
      outputStream,
      (response) => {
        if (response.command) {
          llmSpinner.message(response.command);
        }
      },
    );
  } catch (err) {
    if (err instanceof ResponseParseError) {
      llmSpinner.stop("Failed to parse LLM response");
      p.log.error(
        "An issue has occurred while parsing the LLM response. Try again please.",
      );
      return undefined;
    }
    throw err;
  }

  llmSpinner.stop(finalResponse.command);

  if (finalResponse.wrong) {
    p.log.message(chalk.red("Please, limit yourself to ask for commands. "));

    return;
  }

  if (finalResponse.explanation) {
    p.log.message(chalk.dim(`Explanation: ${finalResponse.explanation}`));
  }

  if (finalResponse.dangerous) {
    p.log.message(
      chalk.red(
        `⚠️  We careful, buddy has marked this command as dangerous. Make sure to know what it does.`,
      ),
    );
  }

  // Options for the select component
  const options = [
    { value: "run", label: "Run the command" },
    { value: "copy", label: "Copy to clipboard" },
  ];

  // Only add the suggest option if we haven't reached the revision limit in cloud mode
  if (!isCloudMode || revisionCount < 5) {
    options.push({ value: "suggest", label: "Suggest changes" });
  } else if (revisionCount >= 5) {
    p.log.message(
      chalk.yellow("You've reached the maximum of 5 revisions in cloud mode."),
    );
  }

  // Replace the text prompt with a select component
  const action = await p.select({
    message: "What would you like to do with this command?",
    options,
  });

  // Handle user selection
  if (p.isCancel(action)) {
    p.cancel("Operation cancelled");
    return undefined;
  }

  switch (action) {
    case "run":
      // Run the command (original behavior when pressing enter)
      return finalResponse.command;
    case "copy": {
      // Copy the command to clipboard
      try {
        await clipboardy.write(finalResponse.command);
        p.log.success("Command copied to clipboard");
      } catch {
        p.log.error("Failed to copy command to clipboard");
      }
      return undefined;
    }
    case "suggest": {
      // Allow user to suggest changes (original behavior when typing)
      const suggestion = await p.text({
        message: "What changes would you like to suggest?",
        placeholder: "Type your suggestion here",
      });

      if (p.isCancel(suggestion)) {
        p.cancel("Operation cancelled");
        return undefined;
      }

      if (suggestion) {
        return cliInfer(
          await createNewOutputStream(suggestion),
          createNewOutputStream,
          revisionCount + 1,
          isCloudMode,
        );
      }
      return undefined;
    }
    default:
      return undefined;
  }
}
