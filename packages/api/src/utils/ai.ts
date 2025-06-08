import { ChatVertexAI } from "@langchain/google-vertexai";
import { file } from "bun";

import { env } from "../../env";

let initialized = false;

async function ensureInitialization() {
  if (initialized) {
    return;
  }

  const credentialsPath = ".temp/credentials.json";

  await file(credentialsPath).write(env.GOOGLE_VERTEX_AI_CREDENTIALS);
  process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;

  initialized = true;
}

export async function langchainVertexAI() {
  await ensureInitialization();

  return new ChatVertexAI({
    model: "gemini-2.5-flash-preview-05-20",
    temperature: 0.5,
    maxRetries: 2,
  });
}
