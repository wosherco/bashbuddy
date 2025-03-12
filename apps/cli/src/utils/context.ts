import os from "os";

import type {
  GitContext,
  LLMContext,
  OSContext,
  ShellType,
} from "@bashbuddy/validators";

import {
  getGitCurrentBranch,
  getGitLastBranches,
  getGitLastCommit,
  getGitRemotes,
  getGitRepositoryRoot,
  isGitRepository,
} from "./git";
import { getShellHistory } from "./shell";

export async function getContext(): Promise<LLMContext> {
  let shell = process.env.SHELL;
  if (process.env.PSModulePath) {
    shell = "powershell";
  } else if (!shell) {
    shell = "unknown (use bash)";
  }

  const type = shell.split("/").pop()?.split("-")[0];
  if (!type) {
    throw new Error("SHELL environment variable is not set");
  }

  const pwd = process.cwd();

  // Get the last 20 commands from shell history
  const [history, git] = await Promise.all([
    getShellHistory(),
    getGitContext(),
  ]);

  return {
    shell: {
      type: type as ShellType,
      pwd,
      history,
    },
    git,
    os: getOSContext(),
  };
}

export async function getGitContext(): Promise<GitContext | undefined> {
  const isInGitRepo = await isGitRepository();
  if (!isInGitRepo) {
    return undefined;
  }

  const root = await getGitRepositoryRoot();
  if (!root) {
    return undefined;
  }

  const [currentBranch, remotes, lastCommit, lastBranches] = await Promise.all([
    getGitCurrentBranch(),
    getGitRemotes(),
    getGitLastCommit(),
    getGitLastBranches(),
  ]);

  return {
    root,
    currentBranch,
    remotes,
    lastCommit,
    lastBranches,
  };
}

export function getOSContext(): OSContext {
  return {
    platform: os.platform(),
    arch: os.arch(),
    version: os.release(),
  };
}
