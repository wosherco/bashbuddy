import type { z } from "zod";

import type {
  C2S_AgentMessageSchema,
  S2C_AgentMessageSchema,
} from "./messages";

export { C2S_AgentMessageSchema, S2C_AgentMessageSchema } from "./messages";

export type C2S_AgentMessage = z.infer<typeof C2S_AgentMessageSchema>;
export type S2C_AgentMessage = z.infer<typeof S2C_AgentMessageSchema>;

export interface AgentTransportClient {
  sendMessage: (message: C2S_AgentMessage) => Promise<void> | void;
  onMessage: (message: S2C_AgentMessage) => void;
}

export interface AgentTransportServer {
  sendMessage: (message: S2C_AgentMessage) => Promise<void> | void;
  onMessage: (message: C2S_AgentMessage) => void;
}
