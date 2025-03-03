import { trpc } from "../trpc";
import { ConfigManager } from "./config";

export async function getUser() {
  const token = await ConfigManager.getCloudToken();

  if (!token) {
    return null;
  }

  return await trpc.auth.getUser.query();
}

export async function isLoggedIn() {
  try {
    const user = await getUser();
    return user !== null;
  } catch {
    return false;
  }
}
