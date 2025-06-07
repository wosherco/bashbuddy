import { ChatVertexAI } from "@langchain/google-vertexai";

import { env } from "../../env";

export function langchainVertexAI() {
  return new ChatVertexAI({
    model: "gemini-2.5-flash-preview-05-20",
    temperature: 0.5,
    maxRetries: 2,
    apiKey: env.GOOGLE_VERTEX_AI_CREDENTIALS,
  });
}
