import type { LLMContext } from "@bashbuddy/validators";

import { prompt as jsonPrompt } from "./prompts/json";
import { prompt as yamlPrompt } from "./prompts/yaml";

export async function* processPrompt(
  llm: LLM,
  context: LLMContext,
  userPrompt: string,
  useYaml = false,
): AsyncIterable<string> {
  const prompt = useYaml ? yamlPrompt(context) : jsonPrompt(context);

  const stream = llm.infer(prompt, userPrompt);

  for await (const chunk of stream) {
    yield chunk;
  }
}

export interface LLM {
  /**
   * Takes a prompt string and returns a stream of string responses
   * @param systemPrompt The system prompt to use
   * @param prompt The input prompt to process
   * @returns A stream of string responses
   */
  infer(systemPrompt: string, prompt: string): AsyncIterable<string>;
}
