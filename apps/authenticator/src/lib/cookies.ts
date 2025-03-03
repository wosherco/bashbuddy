import type { Cookies } from "@sveltejs/kit";
import { dev } from "$app/environment";

export function setRedirectCookie(cookies: Cookies, redirect?: string | null) {
  if (redirect) {
    cookies.set("redirect", redirect, {
      path: "/",
      maxAge: 60 * 10,
      secure: !dev,
    });
  }
}

export function getRedirectCookie(cookies: Cookies, clear = true) {
  const redirect = cookies.get("redirect");
  if (clear) {
    cookies.delete("redirect", { path: "/" });
  }
  return redirect;
}

export function setAuthSessionCookie(cookies: Cookies, authSessionId: string) {
  cookies.set("authSession", authSessionId, {
    path: "/",
    maxAge: 60 * 10,
    secure: !dev,
  });
}

export function getAuthSessionCookie(cookies: Cookies, clear = true) {
  const authSessionId = cookies.get("authSession");
  if (clear) {
    cookies.delete("authSession", { path: "/" });
  }
  return authSessionId;
}

export function clearAuthCookies(cookies: Cookies) {
  cookies.delete("authSession", { path: "/" });
  cookies.delete("redirect", { path: "/" });
}
