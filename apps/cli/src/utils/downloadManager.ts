import fs, { createWriteStream } from "fs";
import os from "os";
import path from "path";
import { Readable } from "stream";
import { pipeline } from "stream/promises";
import { ReadableStream } from "stream/web";
import chalk from "chalk";

// For progress tracking
export interface ProgressData {
  total: number;
  downloaded: number;
  percent: number;
  speed: number; // bytes per second
  eta: number; // seconds
}

/**
 * Download manager for handling file downloads with progress tracking
 */
export class DownloadManager {
  /**
   * Get a temporary directory for downloads
   * @returns Path to a temporary directory
   */
  static getTempDir(): string {
    const tempDir = path.join(os.tmpdir(), "bashbuddy-downloads");

    // Create the directory if it doesn't exist
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    return tempDir;
  }

  /**
   * Download a file with progress tracking
   * @param url URL to download from
   * @param destinationPath Final destination path
   * @param onProgress Callback for progress updates
   * @returns Promise that resolves when download is complete
   */
  static async downloadFile(
    url: string,
    destinationPath: string,
    onProgress?: (progress: ProgressData) => void,
  ): Promise<boolean> {
    const tempDir = this.getTempDir();
    const tempFilePath = path.join(
      tempDir,
      `download-${Date.now()}-${path.basename(destinationPath)}`,
    );

    try {
      // Ensure destination directory exists
      const destDir = path.dirname(destinationPath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      // Create write stream to temporary file
      const fileStream = createWriteStream(tempFilePath);

      // Setup cleanup on process exit
      const cleanupOnExit = () => {
        if (fs.existsSync(tempFilePath)) {
          try {
            fs.unlinkSync(tempFilePath);
            console.log(`Cleaned up temporary file: ${tempFilePath}`);
          } catch (err) {
            console.error(
              `Failed to clean up temporary file: ${tempFilePath}`,
              err,
            );
          }
        }
      };

      // Register cleanup handlers
      process.on("SIGINT", cleanupOnExit);
      process.on("SIGTERM", cleanupOnExit);

      // Fetch the file
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
      }

      const contentLength = Number(
        response.headers.get("content-length") ?? "0",
      );

      if (!response.body) {
        throw new Error("Response body is null");
      }

      const reader = response.body.getReader();

      let downloadedBytes = 0;
      const startTime = Date.now();
      let lastReportTime = startTime;

      // Create a readable stream from the reader
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            while (true) {
              const { done, value } = await reader.read();

              if (done) {
                controller.close();
                break;
              }

              downloadedBytes += value.length;
              controller.enqueue(value);

              // Calculate progress
              const now = Date.now();
              const elapsedSeconds = (now - startTime) / 1000;
              const speed = downloadedBytes / elapsedSeconds; // bytes per second
              const remainingBytes = contentLength - downloadedBytes;
              const eta = speed > 0 ? remainingBytes / speed : 0;
              const percent = contentLength
                ? (downloadedBytes / contentLength) * 100
                : 0;

              // Report progress at most every 100ms to avoid excessive updates
              if (now - lastReportTime > 100 && onProgress) {
                lastReportTime = now;
                onProgress({
                  total: contentLength,
                  downloaded: downloadedBytes,
                  percent,
                  speed,
                  eta,
                });
              }
            }
          } catch (error) {
            controller.error(error);
          }
        },
      });

      // Convert Web ReadableStream to Node.js Readable stream
      const nodeReadable = Readable.fromWeb(readableStream);

      // Pipe the readable stream to the file
      await pipeline(nodeReadable, fileStream);

      // Move the file from temp location to final destination
      fs.renameSync(tempFilePath, destinationPath);

      // Clean up event handlers
      process.off("SIGINT", cleanupOnExit);
      process.off("SIGTERM", cleanupOnExit);

      return true;
    } catch (error) {
      console.error(`Error downloading file: ${String(error)}`);

      // Clean up temp file if it exists
      if (fs.existsSync(tempFilePath)) {
        try {
          fs.unlinkSync(tempFilePath);
        } catch (err) {
          console.error(
            `Failed to clean up temporary file: ${tempFilePath}`,
            err,
          );
        }
      }

      return false;
    }
  }

  /**
   * Format bytes to a human-readable string
   * @param bytes Number of bytes
   * @returns Formatted string (e.g., "1.5 MB")
   */
  static formatBytes(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));

    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  }

  /**
   * Format seconds to a human-readable time string
   * @param seconds Number of seconds
   * @returns Formatted string (e.g., "2m 30s")
   */
  static formatTime(seconds: number): string {
    if (!isFinite(seconds) || seconds < 0) {
      return "Unknown";
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  /**
   * Render a progress bar for the console
   * @param progress Progress data
   * @returns Formatted progress bar string
   */
  static renderProgressBar(progress: ProgressData): string {
    const barWidth = 30;
    const filled = Math.round((progress.percent / 100) * barWidth);
    const empty = barWidth - filled;

    const filledBar = chalk.green("█".repeat(filled));
    const emptyBar = chalk.gray("░".repeat(empty));

    const downloadedFormatted = this.formatBytes(progress.downloaded);
    const totalFormatted = this.formatBytes(progress.total);
    const speedFormatted = `${this.formatBytes(progress.speed)}/s`;
    const etaFormatted = this.formatTime(progress.eta);
    const percentFormatted = progress.percent.toFixed(1);

    return [
      `${filledBar}${emptyBar} ${percentFormatted}%`,
      `${downloadedFormatted} / ${totalFormatted}`,
      `Speed: ${speedFormatted}`,
      `ETA: ${etaFormatted}`,
    ].join(" | ");
  }
}
