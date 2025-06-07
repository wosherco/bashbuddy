import { z } from "zod";

export const lineGroupSchema = z.object({
  from: z.number(),
  to: z.number(),
  lines: z.array(z.string()),
});

export const runCommandToolSchema = z.object({
  mode: z
    .enum(["SCRIPT", "COMMAND"])
    .describe(
      "SCRIPT mode will run a bash (or powershell) script. COMMAND mode will run a command on the user's terminal. Prefer COMMAND mode if you can.",
    ),
  command: z.string().describe("The command or script to run."),
});

export const runCommandToolResponseSchema = z
  .object({
    id: z
      .string()
      .describe(
        "The ID of the command. This can be used to get other lines of stdout or stderr.",
      ),
    stdout: z.array(lineGroupSchema),
    stdoutTotalLines: z
      .number()
      .describe("The total number of lines in the stdout."),
    stderr: z.array(lineGroupSchema),
    stderrTotalLines: z
      .number()
      .describe("The total number of lines in the stderr."),
    exitCode: z.number().describe("The exit code of the command."),
  })
  .or(
    z.object({
      cancelled: z.boolean(),
    }),
  );

export const getLineGroupToolSchema = z.object({
  id: z
    .string()
    .describe(
      "The ID of the command. This can be used to get other lines of stdout or stderr.",
    ),
  output: z.enum(["stdout", "stderr"]),
  from: z.number().describe("The line number to start from. 0-indexed."),
  to: z.number().describe("The line number to end at. 0-indexed."),
});

export const getLineGroupToolResponseSchema = z.object({
  lines: z.array(z.string()),
});

export interface LLMTools {
  runCommandTool: (
    input: z.infer<typeof runCommandToolSchema>,
  ) => Promise<z.infer<typeof runCommandToolResponseSchema>>;
  runGetLineGroupTool: (
    input: z.infer<typeof getLineGroupToolSchema>,
  ) => Promise<z.infer<typeof lineGroupSchema>>;
}
