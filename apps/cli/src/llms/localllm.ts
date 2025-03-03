import fs from "fs/promises";
import os from "os";
import path from "path";
import type { Llama, LlamaContext, LlamaModel } from "node-llama-cpp";
import { getLlama, LlamaChatSession } from "node-llama-cpp";

import type { LLM } from "@bashbuddy/agent";

import type { AIModelId } from "../utils/models";

export class NotInitializedError extends Error {
  constructor() {
    super("LocalLLM is not initialized");
  }
}

export class LocalLLM implements LLM {
  private model: AIModelId;
  private loadedModel?: LlamaModel;
  private context?: LlamaContext;
  private session?: LlamaChatSession;
  private llama?: Llama;

  constructor(model: AIModelId) {
    this.model = model;
  }

  async init(): Promise<void> {
    if (!this.llama) {
      this.llama = await getLlama();
    }

    if (!this.loadedModel) {
      const modelPath = path.join(
        os.homedir(),
        ".bashbuddy",
        "models",
        `${this.model}.gguf`,
      );

      const exists = await fs.exists(modelPath);
      if (!exists) {
        throw new Error(`Model ${this.model} not found`);
      }

      this.loadedModel = await this.llama.loadModel({ modelPath });
      this.context = await this.loadedModel.createContext();
    }
  }

  async *infer(systemPrompt: string, prompt: string): AsyncIterable<string> {
    if (!this.context) {
      throw new NotInitializedError();
    }

    if (!this.session) {
      this.session = new LlamaChatSession({
        contextSequence: this.context.getSequence(),
        systemPrompt,
      });
    }

    const { readable, writable } = new TransformStream<string, string>();
    const writer = writable.getWriter();

    // Start the session in a separate promise
    void this.session
      .prompt(prompt, {
        onTextChunk: (chunk: string) => {
          void writer.write(chunk);
        },
      })
      .finally(() => void writer.close());

    // Read from the stream and yield each chunk
    const reader = readable.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      yield value;
    }
  }

  async dispose(): Promise<void> {
    if (this.llama) {
      await this.llama.dispose();
    }
  }
}
