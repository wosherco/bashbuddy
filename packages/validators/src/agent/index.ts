import { z } from "zod";

export const A2C_TOKEN_STREAM = "A2C_tokenStream";
export const A2C_END = "A2C_end";
export const A2C_RUN_COMMAND = "A2C_runCommand";
export const C2A_COMMAND_RESULT = "C2A_commandResult";

const A2C_tokenStreamSchema = z.object({
  type: z.literal(A2C_TOKEN_STREAM),
  data: z.object({
    text: z.string(),
  }),
});

const A2C_endSchema = z.object({
  type: z.literal(A2C_END),
  data: z.object({
    error: z.string().optional(),
  }),
});

const A2C_runCommandSchema = z.object({
  type: z.literal(A2C_RUN_COMMAND),
  data: z.object({
    command: z.string(),
  }),
});

export const aiToClientMessageSchema = z.discriminatedUnion("type", [
  A2C_tokenStreamSchema,
  A2C_endSchema,
  A2C_runCommandSchema,
]);

export const C2A_commandResultSchema = z.object({
  type: z.literal(C2A_COMMAND_RESULT),
  data: z.object({
    command: z.string(),
    result: z.string(),
  }),
});
