import type { z } from "zod";
import { create } from "zustand";

import type {
  getLineGroupToolSchema,
  runCommandToolSchema,
} from "@bashbuddy/agent/tools";

interface UserMessage {
  role: "user";
  content: string;
}

interface AssistantMessage {
  role: "assistant";
  content: string;
}

interface RunCommandToolMessage {
  role: "tool-run-command";
  state?: "pending" | "accepted" | "rejected" | "replying";
  input: z.infer<typeof runCommandToolSchema>;
  output: string;
}

interface GetLineGroupToolMessage {
  role: "tool-get-line-group";
  input: z.infer<typeof getLineGroupToolSchema>;
}

type Message =
  | UserMessage
  | AssistantMessage
  | RunCommandToolMessage
  | GetLineGroupToolMessage;

interface AskChatState {
  state: "connecting" | "connected" | "processing" | "waiting-reply" | "error";
  setState: (
    state:
      | "connecting"
      | "connected"
      | "processing"
      | "waiting-reply"
      | "error",
  ) => void;
  messages: Message[];
  addMessage: (message: Message) => void;
  modifyLastMessage: (callback: (lastMessage: Message) => Message) => void;
}

export const useAskChatState = create<AskChatState>((set) => ({
  state: "connecting",
  setState: (state) => set({ state }),
  messages: [],
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  modifyLastMessage: (callback) =>
    set((state) => ({
      messages: [
        ...state.messages.slice(0, -1),
        callback(state.messages[state.messages.length - 1]),
      ],
    })),
}));

export function getLastMessageFromState(
  state: AskChatState = useAskChatState.getState(),
) {
  return state.messages[state.messages.length - 1];
}
