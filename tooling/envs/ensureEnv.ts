import fs from "fs/promises";
import path from "path";

if (await fs.exists(path.resolve(__dirname, "../../.env"))) {
  console.log("Env file exists");
} else {
  console.log("Env file does not exist. Copying .env.example to .env");
  // Copying .env.example to .env
  await fs.copyFile(
    path.join(__dirname, "../../.env.example"),
    path.join(__dirname, "../../.env"),
  );
}
