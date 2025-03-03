import type { AIModelId } from "./models";
import { KeytarManager } from "./kv";

// Keys for configuration
export const CONFIG_KEYS = {
  MODE: "mode",
  LOCAL_MODEL: "local_model",
  CLOUD_TOKEN: "cloud_token",
};

// Available modes
export const LOCAL_MODE = "local";
export const CLOUD_MODE = "cloud";
export const AI_MODES = [CLOUD_MODE, LOCAL_MODE] as const;
export type AIMode = (typeof AI_MODES)[number];

/**
 * Configuration manager for BashBuddy
 */
export class ConfigManager {
  /**
   * Get the current AI mode
   * @returns The current AI mode (defaults to CLOUD)
   */
  static async getMode(): Promise<AIMode> {
    return await KeytarManager.get<AIMode>(CONFIG_KEYS.MODE, AI_MODES[0]);
  }

  /**
   * Set the AI mode
   * @param mode The mode to set
   */
  static async setMode(mode: AIMode): Promise<void> {
    await KeytarManager.save(CONFIG_KEYS.MODE, mode);
  }

  /**
   * Check if the current mode is local
   * @returns True if the current mode is local
   */
  static async isLocalMode(): Promise<boolean> {
    const mode = await ConfigManager.getMode();
    return mode === AI_MODES[1];
  }

  /**
   * Check if the current mode is cloud
   * @returns True if the current mode is cloud
   */
  static async isCloudMode(): Promise<boolean> {
    const mode = await ConfigManager.getMode();
    return mode === AI_MODES[0];
  }

  /**
   * Save models info
   * @param models The models to save
   */
  static async saveLocalModel(model: AIModelId): Promise<void> {
    await KeytarManager.save(CONFIG_KEYS.LOCAL_MODEL, model);
  }

  /**
   * Get saved models info
   * @returns The saved models info or null if not found
   */
  static async getLocalModel(): Promise<AIModelId | null> {
    return await KeytarManager.get<AIModelId | null>(
      CONFIG_KEYS.LOCAL_MODEL,
      null,
    );
  }

  static async saveCloudToken(token: string | null): Promise<void> {
    await KeytarManager.save(CONFIG_KEYS.CLOUD_TOKEN, token);
  }

  static async getCloudToken(): Promise<string | null> {
    return await KeytarManager.get<string | null>(
      CONFIG_KEYS.CLOUD_TOKEN,
      null,
    );
  }
}
