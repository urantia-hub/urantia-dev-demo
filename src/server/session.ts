// The session of the demo: the tokens of a signed-in person, sealed in a cookie that scripts cannot read.
// The browser never holds a token. Each request for the person's data goes through this server.

import { EncryptJWT, jwtDecrypt } from "jose";

export const SESSION_COOKIE = "demo_session";
export const START_COOKIE = "demo_auth_start";
// The session lives as long as a refresh token: 90 days from the last use.
export const SESSION_SECONDS = 90 * 24 * 60 * 60;
// Refresh this long before the access token ends.
const REFRESH_AHEAD_MS = 2 * 60 * 1000;

export type Session = {
  accessToken: string;
  refreshToken: string;
  /** When the access token ends. ISO date. */
  expiresAt: string;
  user: { id: string; email: string | null; scopes: string[] };
};

// A key for the cookie, made from the secret. The secret itself is never the key.
async function keyFrom(secret: string): Promise<Uint8Array> {
  if (secret.length < 32) throw new Error("The session secret is not set, or it is too short.");
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`demo-session-cookie:${secret}`));
  return new Uint8Array(digest);
}

export async function seal(session: Session, secret: string): Promise<string> {
  return new EncryptJWT({ s: session })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_SECONDS}s`)
    .encrypt(await keyFrom(secret));
}

// The session in a cookie value, or null for anything that is not one.
export async function unseal(value: string | undefined, secret: string): Promise<Session | null> {
  if (!value) return null;
  try {
    const { payload } = await jwtDecrypt(value, await keyFrom(secret), { contentEncryptionAlgorithms: ["A256GCM"], keyManagementAlgorithms: ["dir"] });
    return asSession(payload.s);
  } catch {
    return null;
  }
}

function asSession(value: unknown): Session | null {
  if (typeof value !== "object" || value === null) return null;
  const s = value as Partial<Session>;
  if (typeof s.accessToken !== "string" || typeof s.refreshToken !== "string" || typeof s.expiresAt !== "string") return null;
  if (typeof s.user !== "object" || s.user === null || typeof s.user.id !== "string") return null;
  return {
    accessToken: s.accessToken,
    refreshToken: s.refreshToken,
    expiresAt: s.expiresAt,
    user: {
      id: s.user.id,
      email: typeof s.user.email === "string" ? s.user.email : null,
      scopes: Array.isArray(s.user.scopes) ? s.user.scopes.filter((x): x is string => typeof x === "string") : [],
    },
  };
}

export function needsRefresh(session: Session, now: Date = new Date()): boolean {
  const end = new Date(session.expiresAt).getTime();
  return Number.isNaN(end) || end - now.getTime() < REFRESH_AHEAD_MS;
}

// The state and the verifier of a sign-in that was started, from its short-lived cookie.
export function readStart(value: string | undefined): { state: string; codeVerifier: string } | null {
  const [state, codeVerifier, ...rest] = (value ?? "").split(".");
  if (!state || !codeVerifier || rest.length > 0) return null;
  return { state, codeVerifier };
}

// The session is a cookie, so a request that changes something must come from a page of this site.
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  return origin !== null && origin === new URL(request.url).origin;
}

const API_URL = "https://api.urantia.dev";

// The address of the person's own data for a request to /api/me/..., or null for a path that can leave /me.
// The proxy adds the person's token, so it must not be steered to another part of the API.
export function meTarget(path: readonly string[], search: string): URL | null {
  for (const segment of path) {
    if (segment === "" || segment === "." || segment === ".." || /%2e/i.test(segment)) return null;
  }
  const target = new URL(`/me${path.map((segment) => `/${encodeURIComponent(segment)}`).join("")}`, API_URL);
  target.search = search;
  if (target.origin !== API_URL) return null;
  if (target.pathname !== "/me" && !target.pathname.startsWith("/me/")) return null;
  return target;
}
