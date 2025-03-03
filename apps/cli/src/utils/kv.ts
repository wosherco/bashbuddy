import keytar from "keytar";

// Service name for keytar
const SERVICE_NAME = "bashbuddy";

/**
 * Utility class for managing keytar operations
 */
export class KeytarManager {
  /**
   * Save data to keytar
   * @param key The key to store the data under
   * @param data The data to store
   */
  static async save<T>(key: string, data: T): Promise<void> {
    try {
      await keytar.setPassword(SERVICE_NAME, key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving data for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get data from keytar
   * @param key The key to retrieve data from
   * @param defaultValue The default value to return if no data is found
   * @returns The retrieved data or the default value
   */
  static async get<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const dataJson = await keytar.getPassword(SERVICE_NAME, key);
      if (dataJson) {
        return JSON.parse(dataJson) as T;
      }
    } catch (error) {
      console.error(`Error getting data for key ${key}:`, error);
    }

    return defaultValue;
  }

  /**
   * Delete data from keytar
   * @param key The key to delete
   */
  static async delete(key: string): Promise<void> {
    try {
      await keytar.deletePassword(SERVICE_NAME, key);
    } catch (error) {
      console.error(`Error deleting data for key ${key}:`, error);
      throw error;
    }
  }
}
