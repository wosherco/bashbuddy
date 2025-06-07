import { ChatLlamaCpp } from "@langchain/community/chat_models/llama_cpp";

export async function load(modelPath: string) {
  return await ChatLlamaCpp.initialize({ modelPath });
}
