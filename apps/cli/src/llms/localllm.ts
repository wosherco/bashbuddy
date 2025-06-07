import fs from "fs/promises";
import os from "os";
import path from "path";
import type { Llama, LlamaContext, LlamaModel } from "node-llama-cpp";
import { getLlama, LlamaChatSession } from "node-llama-cpp";

import type { LLM, LLMMessage } from "@bashbuddy/agent/legacy";

import type { AIModelId } from "../utils/models";

const supportsSystemPrompt = (model: AIModelId) => {
  return model !== "Gemma-3-12B-IT-Q4_K_M" && model !== "Gemma-3-4B-IT-Q4_K_M";
};

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

  async *infer(messages: LLMMessage[]): AsyncIterable<string> {
    if (!this.context) {
      throw new NotInitializedError();
    }

    if (messages.length === 0) {
      throw new Error("No messages provided");
    }

    const initialMessage = messages[0];

    if (initialMessage.role !== "system") {
      throw new Error("Initial message must be a system message");
    }

    const lastUserMessage = messages
      .toReversed()
      .find((message) => message.role === "user");

    if (!lastUserMessage) {
      throw new Error("No user message provided");
    }

    if (!supportsSystemPrompt(this.model) && messages.length == 2) {
      lastUserMessage.content = `
You're a model that doesn't support system prompts. For that reason, I'll wrap your system prompt with <system> tags, and the user message with <user> tags. TAKE EVERYTHING INSIDE THE SYSTEM TAGS AS THE MOST IMPORTANT INSTRUCTIONS, AND THEN APPLY THEM TO THE USER MESSAGES.

<system>
${initialMessage.content}
</system>

<user>
${lastUserMessage.content}
</user>
`;
    }

    if (!this.session) {
      this.session = new LlamaChatSession({
        contextSequence: this.context.getSequence(),
        systemPrompt: initialMessage.content,
      });
    }

    const { readable, writable } = new TransformStream<string, string>();
    const writer = writable.getWriter();

    // Start the session in a separate promise
    void this.session
      .prompt(lastUserMessage.content, {
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
