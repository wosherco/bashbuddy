import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { BaseCheckpointSaver } from "@langchain/langgraph";
import { tool } from "@langchain/core/tools";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

import type { LLMTools } from "./tools";
import { getLineGroupToolSchema, runCommandToolSchema } from "./tools";

export function createAgent<T extends BaseChatModel>(
  llm: T,
  toolsImplementation: LLMTools,
  checkpointer: BaseCheckpointSaver,
) {
  const runCommandTool = tool(
    async (input) => {
      const response = await toolsImplementation.runCommandTool(input);

      return response;
    },
    {
      name: "run-command",
      description: "Run a command on the user's terminal",
      schema: runCommandToolSchema,
    },
  );

  const runGetLineGroupTool = tool(
    async (input) => {
      const response = await toolsImplementation.runGetLineGroupTool(input);
      return response;
    },
    {
      name: "run-get-line-group",
      description:
        "Get a group of lines from the stdout or stderr of a command.",
      schema: getLineGroupToolSchema,
    },
  );

  const agent = createReactAgent({
    llm,
    tools: [runCommandTool, runGetLineGroupTool],
    prompt:
      "You're a helpful assistant that can run commands and get lines from the stdout or stderr of a command. The user will input some instructions to achieve a goal, you through their terminal, you have to achieve it.",
    checkpointer,
  });

  return agent;
}
