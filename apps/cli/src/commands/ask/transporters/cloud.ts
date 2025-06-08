import PQueue from "p-queue";

import type {
  AgentTransportClient,
  C2S_AgentMessage,
  S2C_AgentMessage,
} from "@bashbuddy/agent/transport";
import { S2C_AgentMessageSchema } from "@bashbuddy/agent/transport";

import { CliLLMTools } from "../../../agent/tools";
import { getLastMessageFromState, useAskChatState } from "../state";

export class CloudTransporter implements AgentTransportClient {
  ws: WebSocket;
  toolsImplementation: CliLLMTools;
  messageQueue: PQueue;

  constructor(url: string) {
    this.toolsImplementation = new CliLLMTools();
    this.ws = new WebSocket(url);
    this.messageQueue = new PQueue({ concurrency: 1 });

    this.ws.onmessage = (event) =>
      this.messageQueue.add(async () => {
        const message = await S2C_AgentMessageSchema.parseAsync(
          JSON.parse(String(event.data)),
        );

        this.onMessage(message);
      });

    this.ws.onopen = () => {
      useAskChatState.getState().setState("connected");

      const lastMessage = getLastMessageFromState();
      if (lastMessage.role !== "user") {
        throw new Error("Last message is not a user message");
      }

      this.sendMessage({
        type: "send-reply",
        payload: {
          reply: lastMessage.content,
        },
      });
    };

    this.ws.onclose = () => {
      useAskChatState.getState().setState("error");
    };

    this.ws.onerror = (event) => {
      console.error(event);
      useAskChatState.getState().setState("error");
    };
  }

  sendMessage(message: C2S_AgentMessage) {
    this.ws.send(JSON.stringify(message));
  }

  onMessage(message: S2C_AgentMessage): void {
    switch (message.type) {
      case "agent-start":
        useAskChatState.getState().setState("processing");
        break;
      case "agent-stop":
        useAskChatState.getState().setState("waiting-reply");
        break;
      case "agent-error":
        useAskChatState.getState().setState("error");
        break;
      case "agent-token":
        useAskChatState.getState().modifyLastMessage((lastMessage) => {
          if (lastMessage.role !== "assistant") {
            useAskChatState.getState().addMessage({
              role: "assistant",
              content: message.payload.token,
            });
          } else {
            lastMessage.content += message.payload.token;
          }

          return lastMessage;
        });
        break;
      case "agent-running-tool":
        useAskChatState.getState().modifyLastMessage((lastMessage) => {
          if (message.payload.tool) {
            useAskChatState.getState().addMessage({
              role: "assistant",
              content: "TODO: TOOL CALLED. IS THIS EVEN NEEDED?",
            });
          }

          return lastMessage;
        });
        break;
      case "agent-run-command-tool":
        useAskChatState.getState().addMessage({
          role: "tool-run-command",
          input: message.payload.input,
          output: "",
        });
        // TODO: Run this somewhere else. The user must select between yes, no, or replying.
        void this.toolsImplementation
          .runCommandTool(message.payload.input)
          .then((result) => {
            this.sendMessage({
              type: "agent-run-command-tool-response",
              payload: {
                id: message.payload.id,
                output: result,
              },
            });
          });

        break;
      case "agent-get-line-group-tool":
        useAskChatState.getState().addMessage({
          role: "tool-get-line-group",
          input: message.payload.input,
        });
        void this.toolsImplementation
          .runGetLineGroupTool(message.payload.input)
          .then((result) => {
            this.sendMessage({
              type: "agent-get-line-group-tool-response",
              payload: {
                id: message.payload.id,
                output: result,
              },
            });
          });
        break;
    }
  }
}
