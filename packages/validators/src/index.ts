import { z } from "zod";

export function uniqueArray<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Output = any,
  Def extends z.ZodTypeDef = z.ZodTypeDef,
  Input = Output,
>(schema: z.ZodType<Output, Def, Input>) {
  return z
    .array(schema)
    .refine((items) => new Set(items).size === items.length, {
      message: "All items must be unique, no duplicate values allowed",
    });
}

export const gitContextSchema = z.object({
  currentBranch: z.string().nullable(),
  root: z.string(),
  remotes: z.string().nullable(),
  lastCommit: z.string().nullable(),
  lastBranches: z.string().nullable(),
});

export type GitContext = z.infer<typeof gitContextSchema>;

const shellTypes = ["bash", "sh", "zsh", "fish", "powershell", "cmd"] as const;
const shellTypeSchema = z.enum(shellTypes);

export type ShellType = (typeof shellTypes)[number];

export const shellContextSchema = z.object({
  // Not that strict, totally fine. It's just to have an idea.
  type: shellTypeSchema.or(z.string()),
  pwd: z.string(),
  history: z.array(z.string()).default([]),
});

export type ShellContext = z.infer<typeof shellContextSchema>;

export const osContextSchema = z.object({
  platform: z.string(),
  arch: z.string(),
  version: z.string(),
});

export type OSContext = z.infer<typeof osContextSchema>;

export const contextSchema = z.object({
  shell: shellContextSchema,
  git: gitContextSchema.optional(),
  os: osContextSchema,
});

export type LLMContext = z.infer<typeof contextSchema>;

export const llmResponseSchema = z.object({
  command: z.string(),
  explanation: z
    .string()
    .optional()
    .nullable()
    .describe("A short and concise explanation of the command"),
  dangerous: z
    .boolean()
    .default(false)
    .describe(
      "Mark as true if the command does an action that's not reversible or could be dangerous, like deleting files/progress.",
    ),
  wrong: z
    .boolean()
    .optional()
    .nullable()
    .describe(
      "If the user is not requesting a command, set this to true. This will send a warning to the user for their missbehavior.",
    ),
});

export type LLMResponse = z.infer<typeof llmResponseSchema>;

export const socketlessMessageSchema = z.object({
  token: z.string(),
});

export type SocketlessMessage = z.infer<typeof socketlessMessageSchema>;
