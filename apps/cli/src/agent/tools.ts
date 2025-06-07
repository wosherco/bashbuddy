import { spawn } from "child_process";
import EventEmitter from "node:events";
import type { z } from "zod";

import type {
  getLineGroupToolSchema,
  lineGroupSchema,
  LLMTools,
  runCommandToolResponseSchema,
  runCommandToolSchema,
} from "@bashbuddy/agent/tools";

export const LINE_CHARACTER_LIMIT = 1000;

interface ILLMToolsEventMap {
  stdout: [string];
  stderr: [string];
  complete: [number];
  error: [Error];
}

export class CliLLMTools
  extends EventEmitter<ILLMToolsEventMap>
  implements LLMTools
{
  ranCommands: Record<
    string,
    {
      stdout: string[];
      stderr: string[];
      exitCode: number;
    }
  > = {};

  async runCommandTool(
    input: z.infer<typeof runCommandToolSchema>,
  ): Promise<z.infer<typeof runCommandToolResponseSchema>> {
    // We ignore the cancel option, because if we're here, the user has accepted the command

    const id = crypto.randomUUID();

    const stdout: string[] = [];
    const stderr: string[] = [];

    let stdoutBuffer = "";
    let stderrBuffer = "";

    let codeCache: number | undefined;
    let errCache: Error | undefined;

    await new Promise((resolve) => {
      const proc = spawn(input.command);

      proc.stdout.on("data", (chunk: Buffer) => {
        const stringified = chunk.toString();

        this.emit("stdout", stringified);

        stdoutBuffer += stringified;
        while (
          stdoutBuffer.includes("\n") ||
          stdoutBuffer.length > LINE_CHARACTER_LIMIT
        ) {
          const [line, rest] = stdoutBuffer.split("\n", 2);

          // Split the line every 500 characters and push each chunk
          for (let i = 0; i < line.length; i += 500) {
            stdout.push(line.slice(i, i + 500));
          }

          stdoutBuffer = rest;
        }
      });

      proc.stderr.on("data", (chunk: Buffer) => {
        const stringified = chunk.toString();

        this.emit("stderr", stringified);

        stderrBuffer += stringified;
        while (
          stderrBuffer.includes("\n") ||
          stderrBuffer.length > LINE_CHARACTER_LIMIT
        ) {
          const [line, rest] = stderrBuffer.split("\n", 2);

          // Split the line every 500 characters and push each chunk
          for (let i = 0; i < line.length; i += 500) {
            stderr.push(line.slice(i, i + 500));
          }

          stderrBuffer = rest;
        }
      });

      proc.on("close", (code) => {
        codeCache = code ?? undefined;
        resolve(code);
      });

      proc.on("exit", (code) => {
        codeCache = code ?? undefined;
        resolve(code);
      });

      proc.on("error", (error) => {
        errCache = error;
        resolve(error);
      });
    });

    if (errCache) {
      this.emit("error", errCache);
    } else {
      this.emit("complete", codeCache ?? 0);
    }

    this.ranCommands[id] = {
      stdout,
      stderr,
      exitCode: codeCache ?? 0,
    };

    const stdoutReduced = stdout.slice(0, 100);
    const stderrReduced = stderr.slice(0, 100);

    return {
      id,
      stdout: [
        {
          from: 0,
          to: stdoutReduced.length - 1,
          lines: stdoutReduced,
        },
      ],
      stderr: [
        {
          from: 0,
          to: stderrReduced.length - 1,
          lines: stderrReduced,
        },
      ],
      stderrTotalLines: stderr.length,
      stdoutTotalLines: stdout.length,
      exitCode: codeCache ?? 0,
    };
  }

  runGetLineGroupTool(
    input: z.infer<typeof getLineGroupToolSchema>,
  ): Promise<z.infer<typeof lineGroupSchema>> {
    const commandData = this.ranCommands[input.id];

    const output =
      input.output === "stdout" ? commandData.stdout : commandData.stderr;

    // Validate line range
    if (input.from < 0 || input.to >= output.length || input.from > input.to) {
      return Promise.reject(
        new Error(
          `Invalid line range: ${input.from}-${input.to}. Available lines: 0-${output.length - 1}`,
        ),
      );
    }

    // Extract the requested lines
    const requestedLines = output.slice(input.from, input.to + 1);

    return Promise.resolve({
      from: input.from,
      to: input.to,
      lines: requestedLines,
    });
  }
}
