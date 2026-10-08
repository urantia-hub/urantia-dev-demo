// The demo's sign-in with a UrantiaHub account, on the server entry of @urantia/auth.
// This file is the part that an app copies: where the session is kept, and when it is refreshed.

import { cookies } from "next/headers";
import { AuthError, refreshTokens, type Tokens } from "@urantia/auth/server";
import { needsRefresh, seal, SESSION_COOKIE, SESSION_SECONDS, unseal, type Session } from "./session";

export const APP_ID = "demo";
export const SCOPES = ["bookmarks", "notes", "reading-progress", "preferences"];

// The app secret also makes the key of the session cookie. It is a setting of the server, never of the browser.
export const appSecret = () => process.env.DEMO_APP_SECRET ?? "";

// The address that the app registered. The sign-in returns here.
export const redirectUri = (request: Request) => `${new URL(request.url).origin}/callback`;

export const toSession = (tokens: Tokens): Session => ({
  accessToken: tokens.accessToken,
  refreshToken: tokens.refreshToken,
  expiresAt: tokens.expiresAt,
  user: { id: tokens.userId, email: tokens.email, scopes: tokens.scopes },
});

const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/" };

export async function saveSession(session: Session): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, await seal(session, appSecret()), { ...cookieOptions, maxAge: SESSION_SECONDS });
}

export async function clearSession(): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, "", { ...cookieOptions, maxAge: 0 });
}

export type Loaded =
  | { state: "signed-in"; session: Session }
  | { state: "signed-out" }
  // The sign-in service has a problem, and the access token ended. The person stays signed in.
  | { state: "unavailable" };

// The session of this request, with a fresh access token.
export async function loadSession(): Promise<Loaded> {
  const session = await unseal((await cookies()).get(SESSION_COOKIE)?.value, appSecret());
  if (!session) return { state: "signed-out" };
  if (!needsRefresh(session)) return { state: "signed-in", session };

  try {
    const fresh = toSession(await refreshTokens({ appId: APP_ID, refreshToken: session.refreshToken }));
    await saveSession(fresh);
    return { state: "signed-in", session: fresh };
  } catch (error) {
    // Only a refusal ends the sign-in. An outage does not.
    if (error instanceof AuthError && error.kind === "refused") {
      await clearSession();
      return { state: "signed-out" };
    }
    return new Date(session.expiresAt) > new Date() ? { state: "signed-in", session } : { state: "unavailable" };
  }
}
