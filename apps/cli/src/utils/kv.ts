import fs from "fs/promises";
import os from "os";
import path from "path";

// File path for storage
const STORAGE_FILE = path.join(os.homedir(), ".bashbuddy/.kv.json");

/**
 * Utility class for managing local storage operations
 */
export class KVManager {
  /**
   * Ensures the storage file exists and is valid JSON
   * @returns The current storage data
   */
  private static async ensureStorage(): Promise<Record<string, unknown>> {
    try {
      await fs.access(STORAGE_FILE);
      const content = await fs.readFile(STORAGE_FILE, "utf-8");

      return JSON.parse(content) as Record<string, unknown>;
    } catch {
      // File doesn't exist or isn't valid JSON
      const emptyStorage = {};
      await fs.writeFile(STORAGE_FILE, JSON.stringify(emptyStorage, null, 2));
      return emptyStorage;
    }
  }

  /**
   * Save data to storage file
   * @param key The key to store the data under
   * @param data The data to store
   */
  static async save<T>(key: string, data: T): Promise<void> {
    try {
      const storage = await this.ensureStorage();
      storage[key] = data;
      await fs.writeFile(STORAGE_FILE, JSON.stringify(storage, null, 2));
    } catch (error) {
      console.error(`Error saving data for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get data from storage file
   * @param key The key to retrieve data from
   * @param defaultValue The default value to return if no data is found
   * @returns The retrieved data or the default value
   */
  static async get<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const storage = await this.ensureStorage();
      if (key in storage) {
        return storage[key] as T;
      }
    } catch (error) {
      console.error(`Error getting data for key ${key}:`, error);
    }

    return defaultValue;
  }

  /**
   * Delete data from storage file
   * @param key The key to delete
   */
  static async delete(key: string): Promise<void> {
    try {
      const storage = await this.ensureStorage();
      if (key in storage) {
        delete storage[key];
        await fs.writeFile(STORAGE_FILE, JSON.stringify(storage, null, 2));
      }
    } catch (error) {
      console.error(`Error deleting data for key ${key}:`, error);
      throw error;
    }
  }
}
