/** @deprecated */
export interface LLMMessage {
  role: "user" | "model" | "system";
  content: string;
}

/** @deprecated */
export { prompt as yamlPrompt } from "./prompts/yaml";
/** @deprecated */
export { prompt as jsonPrompt } from "./prompts/json";

/** @deprecated */
export async function* processPrompt(
  llm: LLM,
  messages: LLMMessage[],
): AsyncIterable<string> {
  const stream = llm.infer(messages);

  for await (const chunk of stream) {
    yield chunk;
  }
}

/** @deprecated */
export interface LLM {
  /**
   * Takes a prompt string and returns a stream of string responses
   * @param systemPrompt The system prompt to use
   * @param prompt The input prompt to process
   * @returns A stream of string responses
   */
  infer(messages: LLMMessage[]): AsyncIterable<string>;
}
