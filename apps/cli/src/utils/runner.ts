import { spawn } from "child_process";

/**
 * Run a command with streaming output
 * @param command The command to run
 * @returns A promise that resolves when the command completes
 */
export function runCommandWithStream(command: string): Promise<number> {
  return new Promise((resolve, reject) => {
    // Split the command into the executable and arguments
    const parts = command.split(" ");
    const cmd = parts[0];
    const args = parts.slice(1);

    // Spawn the process
    const proc = spawn(cmd, args, {
      stdio: "inherit", // This will pipe stdout and stderr to the parent process
      shell: true, // Use shell to support pipes, redirects, etc.
    });

    // Handle process completion
    proc.on("close", (code) => {
      resolve(code ?? 0);
    });

    proc.on("error", (err) => {
      reject(err);
    });
  });
}
