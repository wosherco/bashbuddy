import { z } from "zod";

import {
  getLineGroupToolSchema,
  lineGroupSchema,
  runCommandToolResponseSchema,
  runCommandToolSchema,
} from "../tools";

export const S2C_AgentStartMessage = z.object({
  type: z.literal("agent-start"),
});

export const S2C_AgentStopMessage = z.object({
  type: z.literal("agent-stop"),
});

export const C2S_AgentCancelMessage = z.object({
  type: z.literal("agent-cancel"),
});

export const S2C_AgentErrorMessage = z.object({
  type: z.literal("agent-error"),
  payload: z.object({
    error: z.string(),
  }),
});

export const S2C_AgentTokenMessage = z.object({
  type: z.literal("agent-token"),
  payload: z.object({
    token: z.string(),
  }),
});

export const C2S_SendReplyMessage = z.object({
  type: z.literal("send-reply"),
  payload: z.object({
    reply: z.string(),
  }),
});

// For tools

export const S2C_AgentRunCommandToolMessage = z.object({
  type: z.literal("agent-run-command-tool"),
  payload: z.object({
    id: z.string(),
    input: runCommandToolSchema,
  }),
});
export const C2S_AgentRunCommandToolResponseMessage = z.object({
  type: z.literal("agent-run-command-tool-response"),
  payload: z.object({
    id: z.string(),
    output: runCommandToolResponseSchema,
  }),
});

export const S2C_AgentGetLineGroupToolMessage = z.object({
  type: z.literal("agent-get-line-group-tool"),
  payload: z.object({
    id: z.string(),
    input: getLineGroupToolSchema,
  }),
});
export const C2S_AgentGetLineGroupToolResponseMessage = z.object({
  type: z.literal("agent-get-line-group-tool-response"),
  payload: z.object({
    id: z.string(),
    output: lineGroupSchema,
  }),
});

// THE END

export const S2C_AgentMessageSchema = z.discriminatedUnion("type", [
  S2C_AgentStartMessage,
  S2C_AgentStopMessage,
  S2C_AgentErrorMessage,
  S2C_AgentTokenMessage,

  // Tools
  S2C_AgentRunCommandToolMessage,
  S2C_AgentGetLineGroupToolMessage,
]);

export const C2S_AgentMessageSchema = z.discriminatedUnion("type", [
  C2S_AgentCancelMessage,
  C2S_SendReplyMessage,

  // Tools
  C2S_AgentRunCommandToolResponseMessage,
  C2S_AgentGetLineGroupToolResponseMessage,
]);
