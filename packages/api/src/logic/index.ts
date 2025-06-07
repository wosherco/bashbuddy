import { RedisSaver } from "langgraph-db";

import type { LLMTools } from "@bashbuddy/agent/tools";
import type {
  AgentTransportServer,
  C2S_AgentMessage,
  S2C_AgentMessage,
} from "@bashbuddy/agent/transport";
import { createAgent } from "@bashbuddy/agent";

import type { ChatTokenPayload } from "../utils/jwt";
import { langchainVertexAI } from "../utils/ai";

interface BasicWebSocket {
  send: (message: string) => void;
}

export class ClientTransporterHandler implements AgentTransportServer {
  chatDetails: ChatTokenPayload;
  ws: BasicWebSocket;
  tools: LLMTools;
  pendingToolCalls: Record<
    string,
    {
      resolve: (value: never) => void;
      reject: (reason?: unknown) => void;
    }
  > = {};
  context: {
    processing: boolean;
  } = {
    processing: false,
  };

  constructor(chatDetails: ChatTokenPayload, ws: BasicWebSocket) {
    this.chatDetails = chatDetails;
    this.ws = ws;
    this.tools = {
      runCommandTool: (input) => {
        const toolCallId = crypto.randomUUID();
        this.sendMessage({
          type: "agent-run-command-tool",
          payload: {
            id: toolCallId,
            input,
          },
        });

        return new Promise((resolve, reject) => {
          this.pendingToolCalls[toolCallId] = { resolve, reject };
        });
      },
      runGetLineGroupTool: (input) => {
        const toolCallId = crypto.randomUUID();
        this.sendMessage({
          type: "agent-get-line-group-tool",
          payload: {
            id: toolCallId,
            input,
          },
        });

        return new Promise((resolve, reject) => {
          this.pendingToolCalls[toolCallId] = { resolve, reject };
        });
      },
    };
  }

  sendMessage(message: S2C_AgentMessage) {
    this.ws.send(JSON.stringify(message));
  }

  // TODO: Implement lock or queue to handle messages in order
  onMessage(message: C2S_AgentMessage) {
    switch (message.type) {
      case "agent-cancel":
        {
          // TODO: Handle cancel
        }
        break;
      case "send-reply":
        {
          if (this.context.processing) {
            // If we're processing, we ignore
            return;
          }

          this.context.processing = true;

          // TODO: Create a Redis checkpoint saver
          const saver = new RedisSaver({
            url: "redis://localhost:6379",
            ttl: 3600, // Optional TTL in seconds
          });

          const llm = langchainVertexAI();
          const agent = createAgent(llm, this.tools, saver);

          void agent
            .stream(
              {
                messages: [
                  {
                    role: "user",
                    content: message.payload.reply,
                  },
                ],
              },
              {
                configurable: {
                  thread_id: "TODO",
                },
                streamMode: "messages",
              },
            )
            .then(async (stream) => {
              for await (const chunk of stream) {
                console.log(chunk);
              }
            })
            .catch((err) => {
              // TODO: Register error
              this.sendMessage({
                type: "agent-error",
                payload: {
                  error: err instanceof Error ? err.message : String(err),
                },
              });
            });
        }
        break;
      case "agent-run-command-tool-response":
        {
          const toolCall = this.pendingToolCalls[message.payload.id];

          if (toolCall) {
            toolCall.resolve(message.payload.output);
          }
        }
        break;
      case "agent-get-line-group-tool-response":
        {
          const toolCall = this.pendingToolCalls[message.payload.id];

          if (toolCall) {
            toolCall.resolve(message.payload.output);
          }
        }
        break;
    }
  }
}
