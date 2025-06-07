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

  constructor(url: string) {
    this.toolsImplementation = new CliLLMTools();
    this.ws = new WebSocket(url);

    this.ws.onmessage = (event) => {
      const message = S2C_AgentMessageSchema.parse(
        JSON.parse(String(event.data)),
      );
      this.onMessage(message);
    };

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

  // TODO: Put a queue here to avoid race conditions. We need to process messages in order.
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
          input: message.payload,
          output: "",
        });
        // TODO: Run this somewhere else. The user must select between yes, no, or replying.
        void this.toolsImplementation
          .runCommandTool(message.payload)
          .then((result) => {
            this.sendMessage({
              type: "agent-run-command-tool-response",
              payload: result,
            });
          });

        break;
      case "agent-get-line-group-tool":
        useAskChatState.getState().addMessage({
          role: "tool-get-line-group",
          input: message.payload,
        });
        void this.toolsImplementation
          .runGetLineGroupTool(message.payload)
          .then((result) => {
            this.sendMessage({
              type: "agent-get-line-group-tool-response",
              payload: result,
            });
          });
        break;
    }
  }
}
