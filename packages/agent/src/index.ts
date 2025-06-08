import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { AIMessage } from "@langchain/core/messages";
import type { BaseCheckpointSaver } from "@langchain/langgraph";
import { tool } from "@langchain/core/tools";
import { MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { Langfuse } from "langfuse";

import type { LLMTools } from "./tools";
import { getLineGroupToolSchema, runCommandToolSchema } from "./tools";

// Initialize Langfuse conditionally
const langfuse =
  process.env.LANGFUSE_BASEURL &&
  process.env.LANGFUSE_SECRET_KEY &&
  process.env.LANGFUSE_PUBLIC_KEY &&
  // * Not tracking on prod :D
  process.env.PUBLIC_ENVIRONMENT === "development"
    ? new Langfuse({
        secretKey: process.env.LANGFUSE_SECRET_KEY,
        publicKey: process.env.LANGFUSE_PUBLIC_KEY,
        baseUrl: process.env.LANGFUSE_BASEURL,
      })
    : undefined;

export function createAgent<T extends BaseChatModel>(
  llm: T,
  toolsImplementation: LLMTools,
  checkpointer: BaseCheckpointSaver,
  traceConfig?: {
    sessionId?: string;
    userId?: string;
  },
) {
  const runCommandTool = tool(
    async (input) => {
      const trace = langfuse?.trace({
        name: "agent.tool.run-command",
        id: `${traceConfig?.sessionId}-${Date.now()}`,
        userId: traceConfig?.userId,
        metadata: { tool: "run-command", input },
      });

      const span = trace?.span({
        name: "run-command-execution",
        input,
      });

      try {
        const response = await toolsImplementation.runCommandTool(input);
        span?.end({ output: response });
        return response;
      } catch (error) {
        span?.end({});
        throw error;
      }
    },
    {
      name: "run-command",
      description: "Run a command on the user's terminal",
      schema: runCommandToolSchema,
    },
  );

  const runGetLineGroupTool = tool(
    async (input) => {
      const trace = langfuse?.trace({
        name: "agent.tool.get-line-group",
        id: `${traceConfig?.sessionId}-${Date.now()}`,
        userId: traceConfig?.userId,
        metadata: { tool: "get-line-group", input },
      });

      const span = trace?.span({
        name: "get-line-group-execution",
        input,
      });

      try {
        const response = await toolsImplementation.runGetLineGroupTool(input);
        span?.end({ output: response });
        return response;
      } catch (error) {
        span?.end({});
        throw error;
      }
    },
    {
      name: "run-get-line-group",
      description:
        "Get a group of lines from the stdout or stderr of a command.",
      schema: getLineGroupToolSchema,
    },
  );

  // Define the tools and tool node
  const tools = [runCommandTool, runGetLineGroupTool];
  const toolNode = new ToolNode(tools);

  if (!llm.bindTools) {
    throw new Error("LLM does not support tools");
  }

  // Create the model with tools bound
  const modelWithTools = llm.bindTools(tools);

  // Define the function that determines whether to continue or not
  function shouldContinue({ messages }: typeof MessagesAnnotation.State) {
    const lastMessage = messages[messages.length - 1] as AIMessage;

    // If the LLM makes a tool call, then we route to the "tools" node
    if (lastMessage.tool_calls?.length) {
      return "tools";
    }

    // Check if the AI has explicitly indicated it's finished
    const content = lastMessage.content as string;
    if (
      content &&
      (content.includes("[FINISHED]") ||
        content.includes("[DONE]") ||
        content.includes("[COMPLETE]"))
    ) {
      return "__end__";
    }

    // Otherwise, continue with the agent (recursive thinking)
    return "agent";
  }

  // Define the function that calls the model
  async function callModel(state: typeof MessagesAnnotation.State) {
    const trace = langfuse?.trace({
      name: "agent.call-model",
      id: `${traceConfig?.sessionId}-model-${Date.now()}`,
      userId: traceConfig?.userId,
      metadata: {
        messageCount: state.messages.length,
        lastMessageType:
          state.messages[state.messages.length - 1]?.constructor.name,
      },
    });

    const span = trace?.span({
      name: "llm-invocation",
      input: { messageCount: state.messages.length },
    });

    try {
      const systemPrompt = `You're a helpful assistant that can run commands and get lines from the stdout or stderr of a command. The user will input some instructions to achieve a goal through their terminal, and you have to achieve it.

You can think step by step and respond multiple times as you work through the problem. You have access to tools when needed, but you can also continue thinking and planning without using tools.

Available tools:
- run-command: Run a command on the user's terminal  
- run-get-line-group: Get a group of lines from the stdout or stderr of a command

When you have completely finished helping the user and achieved their goal, end your final response with [FINISHED] to indicate you're done.

Feel free to:
- Explain your approach and reasoning
- Break down complex tasks into steps
- Use tools when needed
- Continue thinking and responding as you work through the problem
- Only signal [FINISHED] when the task is truly complete or you want to stop so the user can reply

To start, explain your approach and reasoning to the user, and then start calling tools. Don't call tools directly from the start.`;

      // Add system message if it's not already there
      const messages = state.messages;
      const hasSystemMessage =
        messages.length > 0 && messages[0]?.content === systemPrompt;

      const messagesToProcess = hasSystemMessage
        ? messages
        : [{ role: "system", content: systemPrompt }, ...messages];

      const response = await modelWithTools.invoke(messagesToProcess);

      span?.end({
        output: {
          content: response.content,
          hasToolCalls: !!response.tool_calls?.length,
          toolCallCount: response.tool_calls?.length ?? 0,
        },
      });

      // We return a list, because this will get added to the existing list
      return { messages: [response] };
    } catch (error) {
      span?.end({});
      throw error;
    }
  }

  // Define the graph
  const workflow = new StateGraph(MessagesAnnotation)
    .addNode("agent", callModel)
    .addNode("tools", toolNode)
    .addEdge("__start__", "agent") // __start__ is a special name for the entrypoint
    .addEdge("tools", "agent") // After tools, always go back to agent
    .addConditionalEdges("agent", shouldContinue, {
      tools: "tools",
      agent: "agent", // Self-loop for continued thinking
      __end__: "__end__",
    });

  // Compile it into a LangChain Runnable with checkpointer
  const agent = workflow.compile({ checkpointer });

  return agent;
}
