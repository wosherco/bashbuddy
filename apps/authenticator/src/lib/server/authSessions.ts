import { socketless } from "@bashbuddy/socketless";

export async function notifyAuthSessionCreated(
  authSessionId: string,
  token: string,
) {
  try {
    await socketless.sendMessage(
      {
        token,
      },
      {
        identifiers: `authSession:v1:${authSessionId}`,
      },
    );
  } catch {
    // TODO: There's a bug where it returns a 500, ignore
  }
}
