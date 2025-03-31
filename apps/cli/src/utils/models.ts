import fs from "fs/promises";
import os from "os";
import path from "path";

import type { ProgressData } from "./downloadManager";
import { DownloadManager } from "./downloadManager";
import { executeCommand } from "./shell";

export const QWEN_2_5_7B = "Qwen-2.5-7B-Instruct-Q6_K";
export const QWEN_2_5_7B_INST = "Qwen-2.5-7B-Instruct-Q4_K_M";
export const META_LLAMA_3_1_8B_INST = "Meta-Llama-3.1-8B-Instruct-Q4_K_M";
export const META_LLAMA_3_1_8B_INST_Q8 = "Meta-Llama-3.1-8B-Instruct-Q8_0";
export const GEMMA_3_4B_IT = "Gemma-3-4B-IT-Q4_K_M";
export const GEMMA_3_12B_IT = "Gemma-3-12B-IT-Q4_K_M";

export const ALL_MODEL_IDS = [
  QWEN_2_5_7B,
  QWEN_2_5_7B_INST,
  META_LLAMA_3_1_8B_INST,
  META_LLAMA_3_1_8B_INST_Q8,
  GEMMA_3_4B_IT,
  GEMMA_3_12B_IT,
] as const;

export type AIModelId = (typeof ALL_MODEL_IDS)[number];

export interface AIModel {
  id: AIModelId;
  name: string;
  downloadUrl: string;
  size: string;
  requiredRAM: number; // RAM in GB
  filePath?: string;
  isDownloaded?: boolean;
  recommended?: boolean;
}

// Available models
export const availableModels: AIModel[] = [
  {
    id: QWEN_2_5_7B,
    name: "Qwen 2.5 7B Q6",
    downloadUrl:
      "https://huggingface.co/bartowski/Qwen2.5-7B-Instruct-GGUF/resolve/main/Qwen2.5-7B-Instruct-Q6_K.gguf",
    size: "6.65 GB",
    requiredRAM: 10,
  },
  {
    id: QWEN_2_5_7B_INST,
    name: "Qwen 2.5 7B Q4",
    downloadUrl:
      "https://huggingface.co/bartowski/Qwen2.5-7B-Instruct-GGUF/resolve/main/Qwen2.5-7B-Instruct-Q4_K_M.gguf",
    size: "4.58 GB",
    requiredRAM: 8,
    recommended: true,
  },
  {
    id: META_LLAMA_3_1_8B_INST,
    name: "Llama 3.1 8B Q4",
    downloadUrl:
      "https://huggingface.co/bartowski/Meta-Llama-3.1-8B-Instruct-GGUF/resolve/main/Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf",
    size: "4.92 GB",
    requiredRAM: 8,
    recommended: true,
  },
  {
    id: META_LLAMA_3_1_8B_INST_Q8,
    name: "Llama 3.1 8B Q8",
    downloadUrl:
      "https://huggingface.co/bartowski/Meta-Llama-3.1-8B-Instruct-GGUF/resolve/main/Meta-Llama-3.1-8B-Instruct-Q8_0.gguf",
    size: "8.54 GB",
    requiredRAM: 12,
  },

  {
    id: GEMMA_3_4B_IT,
    name: "Gemma 3 4B Q4",
    downloadUrl:
      "https://huggingface.co/unsloth/gemma-3-4b-it-GGUF/resolve/main/gemma-3-4b-it-Q4_K_M.gguf",
    size: "2.4 GB",
    requiredRAM: 4,
  },
  {
    id: GEMMA_3_12B_IT,
    name: "Gemma 3 12B Q4",
    downloadUrl:
      "https://huggingface.co/unsloth/gemma-3-12b-it-GGUF/resolve/main/gemma-3-12b-it-Q4_K_M.gguf",
    size: "7.3 GB",
    requiredRAM: 12,
  },

  // It's fucking stupid
  // {
  //   id: "Llama-3.2-3B-Instruct-Q4_K_M",
  //   name: "Llama 3.2 3B Q4",
  //   description: "(Not recommended) Light, fast, not accurate",
  //   downloadUrl:
  //     "https://huggingface.co/unsloth/Llama-3.2-3B-Instruct-GGUF/resolve/main/Llama-3.2-3B-Instruct-Q4_K_M.gguf",
  //   size: "2.02 GB",
  //   requiredRAM: 4,
  // },

  // TODO: Needs testing (maybe too big?)
  // {
  //   id: "Phi-4-Q4",
  //   name: "Phi-4 Q4",
  //   description: "",
  //   downloadUrl:
  //     "https://huggingface.co/microsoft/phi-4-gguf/resolve/main/phi-4-q4.gguf",
  //   size: "9.05 GB",
  //   requiredRAM: 16,
  // },
] as const;

// Hardware acceleration types
export interface HardwareAcceleration {
  type: "none" | "cuda" | "metal" | "vulkan";
  available: boolean;
  details?: string;
}

/**
 * Model manager for handling local AI models
 */
export class ModelManager {
  /**
   * Get the models directory
   * @returns The path to the models directory
   */
  static async getModelsDir(): Promise<string> {
    const homeDir = os.homedir();
    const modelsDir = path.join(homeDir, ".bashbuddy", "models");

    try {
      await fs.mkdir(modelsDir, { recursive: true });
    } catch (error) {
      console.error("Error creating models directory:", error);
    }

    return modelsDir;
  }

  /**
   * Check which models are downloaded
   * @param models The models to check
   * @returns The models with updated download status
   */
  static async checkDownloadedModels(models: AIModel[]): Promise<AIModel[]> {
    const modelsDir = await ModelManager.getModelsDir();

    return await Promise.all(
      models.map(async (model) => {
        const filePath = path.join(modelsDir, `${model.id}.gguf`);
        let isDownloaded = false;

        try {
          await fs.access(filePath);
          isDownloaded = true;
        } catch {
          // File doesn't exist, model is not downloaded
        }

        return {
          ...model,
          filePath,
          isDownloaded,
        };
      }),
    );
  }

  /**
   * Detect hardware acceleration capabilities
   * @returns Information about available hardware acceleration
   */
  static async detectHardwareAcceleration(): Promise<HardwareAcceleration[]> {
    const accelerations: HardwareAcceleration[] = [];

    try {
      // Check for CUDA (NVIDIA GPU)
      const output = await executeCommand(
        "bunx --no node-llama-cpp inspect gpu",
      );

      // Check for CUDA support
      if (output.includes("CUDA") && !output.includes("CUDA: not available")) {
        const cudaDetails =
          output
            .split("\n")
            .find((line) => line.includes("CUDA"))
            ?.trim() ?? "CUDA detected";
        accelerations.push({
          type: "cuda",
          available: true,
          details: cudaDetails,
        });
      } else {
        accelerations.push({
          type: "cuda",
          available: false,
        });
      }

      // Check for Metal (Apple Silicon)
      if (
        output.includes("Metal") &&
        !output.includes("Metal: not available")
      ) {
        const metalDetails =
          output
            .split("\n")
            .find((line) => line.includes("Metal"))
            ?.trim() ?? "Metal detected";
        accelerations.push({
          type: "metal",
          available: true,
          details: metalDetails,
        });
      } else if (process.platform === "darwin") {
        accelerations.push({
          type: "metal",
          available: false,
        });
      }

      // Check for Vulkan
      if (
        output.includes("Vulkan") &&
        !output.includes("Vulkan: not available")
      ) {
        const vulkanDetails =
          output
            .split("\n")
            .find((line) => line.includes("Vulkan"))
            ?.trim() ?? "Vulkan detected";
        accelerations.push({
          type: "vulkan",
          available: true,
          details: vulkanDetails,
        });
      } else {
        accelerations.push({
          type: "vulkan",
          available: false,
        });
      }
    } catch (error) {
      console.error("Error detecting hardware acceleration:", error);
    }

    // If no acceleration was detected, add "none"
    if (
      accelerations.length === 0 ||
      !accelerations.some((acc) => acc.available)
    ) {
      accelerations.push({
        type: "none",
        available: true,
        details: "No hardware acceleration detected",
      });
    }

    return accelerations;
  }

  /**
   * Check system capabilities
   * @returns System RAM information, capability status, and hardware acceleration
   */
  static async checkSystemCapabilities(): Promise<{
    totalRAM: number;
    isCapable: boolean;
    hardwareAcceleration: HardwareAcceleration[];
  }> {
    // Get system memory info
    const totalRAM = Math.floor(os.totalmem() / (1024 * 1024 * 1024)); // Convert to GB

    // Always set isCapable to true - we'll let the user decide if they want to run the model
    // The canModelRunOnSystem method will provide recommendations based on total RAM
    const isCapable = true;

    // Detect hardware acceleration
    const hardwareAcceleration =
      await ModelManager.detectHardwareAcceleration();

    return {
      totalRAM,
      isCapable,
      hardwareAcceleration,
    };
  }

  /**
   * Check if a model can run on the system
   * @param model The model to check
   * @param freeRAM The available RAM in GB
   * @returns Whether the model can run and a recommendation
   */
  static canModelRunOnSystem(model: AIModel, totalRam: number): string {
    // Always allow the model to run, but provide recommendations based on total RAM
    let recommendation = "";

    // Check if total RAM is less than model required + 10GB buffer
    if (totalRam < model.requiredRAM + 10) {
      recommendation = `This model recommends at least ${model.requiredRAM} GB of total RAM, but your system has ${totalRam} GB. Performance may be degraded.`;
    }

    return recommendation;
  }

  /**
   * Download a model
   * @param model The model to download
   * @param onProgress Optional callback for progress updates
   * @returns Whether the download was successful
   */
  static async downloadModel(
    model: AIModel,
    onProgress?: (progress: ProgressData) => void,
  ): Promise<boolean> {
    try {
      if (!model.filePath) {
        throw new Error("Model file path is not defined");
      }

      return await DownloadManager.downloadFile(
        model.downloadUrl,
        model.filePath,
        onProgress,
      );
    } catch (error) {
      console.error(`Error downloading model: ${String(error)}`);
      return false;
    }
  }
}
