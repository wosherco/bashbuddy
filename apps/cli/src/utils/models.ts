import fs from "fs/promises";
import os from "os";
import path from "path";
import { $ } from "bun";

import type { ProgressData } from "./downloadManager";
import { DownloadManager } from "./downloadManager";

// Define model interface
export interface AIModel {
  id: string;
  name: string;
  description: string;
  downloadUrl: string;
  size: string;
  requiredRAM: number; // RAM in GB
  filePath?: string;
  isDownloaded?: boolean;
}

// Available models
export const availableModels: AIModel[] = [
  {
    id: "Meta-Llama-3.1-8B-Instruct-Q4_K_M",
    name: "Llama 3.1 8B Q4",
    description: "Quantized to 4-bit, faster but less accurate",
    downloadUrl:
      "https://huggingface.co/bartowski/Meta-Llama-3.1-8B-Instruct-GGUF/resolve/main/Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf",
    size: "4.92 GB",
    requiredRAM: 8,
  },
  {
    id: "Meta-Llama-3.1-8B-Instruct-Q8_0",
    name: "Llama 3.1 8B Q8",
    description: "Quantized to 8-bit, faster and more accurate",
    downloadUrl:
      "https://huggingface.co/bartowski/Meta-Llama-3.1-8B-Instruct-GGUF/resolve/main/Meta-Llama-3.1-8B-Instruct-Q8_0.gguf",
    size: "8.54 GB",
    requiredRAM: 12,
  },
];

export type AIModelId = (typeof availableModels)[number]["id"];

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
      const output = await $`bunx --no node-llama-cpp inspect gpu`.text();

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
    freeRAM: number;
    isCapable: boolean;
    hardwareAcceleration: HardwareAcceleration[];
  }> {
    // Get system memory info
    const totalRAM = Math.floor(os.totalmem() / (1024 * 1024 * 1024)); // Convert to GB
    const freeRAM = Math.floor(os.freemem() / (1024 * 1024 * 1024)); // Convert to GB

    // Check if system has enough RAM for at least the smallest model
    const minRequiredRAM = Math.min(
      ...availableModels.map((model) => model.requiredRAM),
    );
    const isCapable = freeRAM >= minRequiredRAM;

    // Detect hardware acceleration
    const hardwareAcceleration =
      await ModelManager.detectHardwareAcceleration();

    return {
      totalRAM,
      freeRAM,
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
  static canModelRunOnSystem(
    model: AIModel,
    freeRAM: number,
  ): {
    canRun: boolean;
    recommendation: string;
  } {
    const canRun = freeRAM >= model.requiredRAM;
    let recommendation = "";

    if (!canRun) {
      recommendation = `This model requires at least ${model.requiredRAM} GB of RAM, but you only have ${freeRAM} GB available.`;
    } else if (freeRAM < model.requiredRAM * 1.5) {
      recommendation = `This model will run, but performance might be limited. Consider closing other applications for better performance.`;
    }

    return { canRun, recommendation };
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
