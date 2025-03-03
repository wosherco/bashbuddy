import { env } from "$env/dynamic/private";
import { Google } from "arctic";

export const google = new Google(
  env.AUTH_GOOGLE_CLIENT_ID,
  env.AUTH_GOOGLE_CLIENT_SECRET,
  env.AUTH_GOOGLE_CALLBACK_URL,
);
