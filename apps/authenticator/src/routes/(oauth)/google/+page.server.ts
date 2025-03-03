/* eslint-disable @typescript-eslint/only-throw-error */
import { google } from "@/server/providers";
import { redirect } from "@sveltejs/kit";
import { dev } from "$app/environment";
import { generateCodeVerifier, generateState } from "arctic";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = ({ cookies }) => {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const url = google.createAuthorizationURL(state, codeVerifier, [
    "openid",
    "profile",
    "email",
  ]);

  cookies.set("google_oauth_state", state, {
    path: "/",
    httpOnly: !dev,
    secure: !dev,
    maxAge: 60 * 10, // 10 minutes
    sameSite: "lax",
  });

  cookies.set("google_code_verifier", codeVerifier, {
    path: "/",
    httpOnly: !dev,
    secure: !dev,
    maxAge: 60 * 10, // 10 minutes
    sameSite: "lax",
  });

  throw redirect(302, url);
};
