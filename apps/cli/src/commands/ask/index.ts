import * as p from "@clack/prompts";
import { Command } from "commander";

import { trpc } from "../../trpc";
import { runAskCommand } from "./command";
import { useAskChatState } from "./state";
import { CloudTransporter } from "./transporters/cloud";

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

async function execute(question: string) {
  // For now we're assuming cloud only
  const chatSessionDetails = await trpc.v2.chat.createChatSession.mutate();
  const transporter = new CloudTransporter(chatSessionDetails.url);

  useAskChatState.getState().addMessage({
    role: "user",
    content: question,
  });

  return runAskCommand(transporter);
}
