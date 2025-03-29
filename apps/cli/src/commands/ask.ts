import * as p from "@clack/prompts";
import { TRPCClientError } from "@trpc/client";
import chalk from "chalk";
import clipboardy from "clipboardy";
import { Command } from "commander";

import type { LLMMessage } from "@bashbuddy/agent";
import type { LLMContext, LLMResponse } from "@bashbuddy/validators";
import { processPrompt, yamlPrompt } from "@bashbuddy/agent";
import { SITE_URLS } from "@bashbuddy/consts";

import { LocalLLM } from "../llms/localllm";
import { parseYamlResponse, ResponseParseError } from "../llms/parser";
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
    .argument("[question...]", "The question to ask the AI")
    .action((questionParts: string[] = []) => {
      // If no question parts, prompt the user
      if (questionParts.length === 0) {
        promptForQuestion().catch(console.error);
        return;
      }

      // Join all parts of the question with spaces
      const question = questionParts.join(" ");
      execute(question).catch(console.error);
    });

  return askCommand;
}

/**
 * Prompt the user for a question if none was provided
 */
async function promptForQuestion() {
  p.intro("BashBuddy");

  const question = await p.text({
    message: "What would you like to ask?",
    placeholder: "Ask for a command",
  });

  if (p.isCancel(question) || !question) {
    p.cancel("Operation cancelled");
    return;
  }

  await execute(question);
}

interface ConversationState {
  messages: LLMMessage[];
  context: LLMContext;
  chatId: string;
  llm?: LocalLLM;
  isCloudMode: boolean;
  revisionCount: number;
}

async function execute(question: string) {
  p.intro("BashBuddy");

  // Get mode
  const [mode, context] = await Promise.all([
    ConfigManager.getMode(),
    getContext(),
  ]);

  let commandToRun: string | undefined;
  let conversationState: ConversationState;

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

      conversationState = {
        messages: [
          {
            role: "system",
            content: yamlPrompt(context),
          },
          {
            role: "user",
            content: question,
          },
        ],
        context,
        chatId: "local",
        llm,
        isCloudMode: false,
        revisionCount: 1,
      };

      const stream = processPrompt(llm, conversationState.messages);
      commandToRun = await handleInference(stream, conversationState);

      await llm.dispose();

      break;
    }
    case CLOUD_MODE: {
      try {
        const chatId = await trpc.chat.createChat.mutate();

        conversationState = {
          messages: [
            {
              role: "user",
              content: question,
            },
          ],
          context,
          chatId,
          isCloudMode: true,
          revisionCount: 1,
        };

        const stream = await trpc.chat.ask.mutate({
          input: question,
          context,
          chatId,
          useYaml: true,
        });

        commandToRun = await handleInference(stream, conversationState);
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

    p.log.message(chalk.dim(`> ${commandToRun}`));

    await runCommandWithStream(commandToRun);
  } else {
    p.outro("Thanks for using BashBuddy!");
  }
}

/**
 * Process LLM inference and return the parsed response
 */
async function processInference(
  outputStream: AsyncIterable<string>,
  state: ConversationState,
): Promise<LLMResponse | undefined> {
  const llmSpinner = p.spinner();
  llmSpinner.start("Processing...");

  let finalResponse: LLMResponse;

  try {
    const { parsed, raw } = await parseYamlResponse(
      outputStream,
      (response) => {
        if (response.command) {
          llmSpinner.message(response.command);
        }
      },
    );

    finalResponse = parsed;
    state.messages.push({
      role: "model",
      content: raw,
    });
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
  return finalResponse;
}

/**
 * Display command information to the user
 */
function displayCommandInfo(response: LLMResponse): void {
  if (response.wrong) {
    p.log.message(chalk.red("Please, limit yourself to ask for commands. "));
    return;
  }

  if (response.explanation) {
    p.log.message(chalk.dim(`Explanation: ${response.explanation}`));
  }

  if (response.dangerous) {
    p.log.message(
      chalk.red(
        `⚠️  Be careful, buddy has marked this command as dangerous. Make sure to know what it does.`,
      ),
    );
  }
}

/**
 * Generate a new inference stream based on user suggestion
 */
async function generateNewStream(
  suggestion: string,
  state: ConversationState,
): Promise<AsyncIterable<string>> {
  // Add the suggestion to the messages
  state.messages.push({
    role: "user",
    content: suggestion,
  });

  // Increment revision count
  state.revisionCount += 1;

  // Generate a new stream based on mode
  if (state.isCloudMode) {
    return trpc.chat.ask.mutate({
      input: suggestion,
      context: state.context,
      chatId: state.chatId,
      useYaml: true,
    });
  } else {
    if (!state.llm) {
      throw new Error("LLM not initialized");
    }
    return processPrompt(state.llm, state.messages);
  }
}

/**
 * Handle user action on the command
 */
async function handleUserAction(
  response: LLMResponse,
  state: ConversationState,
): Promise<string | undefined> {
  // Options for the select component
  const options = [
    { value: "copyAndRun", label: "Copy & Run" },
    { value: "run", label: "Run the command" },
    { value: "copy", label: "Copy to clipboard" },
  ];

  // Only add the suggest option if we haven't reached the revision limit in cloud mode
  if (!state.isCloudMode || state.revisionCount < 5) {
    options.push({ value: "suggest", label: "Suggest changes" });
  } else if (state.revisionCount >= 5) {
    p.log.message(
      chalk.yellow("You've reached the maximum of 5 revisions in cloud mode."),
    );
  }

  // Replace the text prompt with a select component
  const action = await p.select({
    message: "What would you like to do with this command?",
    options,
    initialValue: "run",
  });

  // Handle user selection
  if (p.isCancel(action)) {
    p.cancel("Operation cancelled");
    return undefined;
  }

  switch (action) {
    case "run":
      return response.command;
    case "copy": {
      // Copy the command to clipboard
      try {
        await clipboardy.write(response.command);
        p.log.success("Command copied to clipboard");
      } catch {
        p.log.error("Failed to copy command to clipboard");
      }

      p.log.message(
        chalk.dim(
          `Feel free to paste the command into your terminal: ${response.command}`,
        ),
      );

      return undefined;
    }
    case "copyAndRun": {
      // Copy the command to clipboard and run it
      try {
        await clipboardy.write(response.command);
        p.log.success("Command copied to clipboard");
      } catch {
        p.log.error(
          `Failed to copy command to clipboard, but will still run. Feel free to copy it: ${response.command}`,
        );
      }

      return response.command;
    }
    case "suggest": {
      // Allow user to suggest changes
      const suggestion = await p.text({
        message: "What changes would you like to suggest?",
        placeholder: "Type your suggestion here",
      });

      if (p.isCancel(suggestion)) {
        p.cancel("Operation cancelled");
        return undefined;
      }

      if (suggestion) {
        const newStream = await generateNewStream(suggestion, state);
        return handleInference(newStream, state);
      }
      return undefined;
    }
    default:
      return undefined;
  }
}

/**
 * Handle the entire inference process
 */
async function handleInference(
  outputStream: AsyncIterable<string>,
  state: ConversationState,
): Promise<string | undefined> {
  // Process the inference
  const finalResponse = await processInference(outputStream, state);

  if (!finalResponse) {
    return undefined;
  }

  // Display command information
  displayCommandInfo(finalResponse);

  // Handle user action
  return handleUserAction(finalResponse, state);
}
