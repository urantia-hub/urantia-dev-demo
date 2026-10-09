import { cookies } from "next/headers";
import { revokeTokens, signOutUrl } from "@urantia/auth/server";
import { APP_ID, appSecret, clearSession, redirectUri } from "@/server/auth";
import { ASK_COOKIE, isSameOrigin, SESSION_COOKIE, unseal, wantsFullSignOut } from "@/server/session";

// Step 4: end the sign-in on the service and clear the cookie. The person does not leave this page.
// The person is still signed in on the accounts site, so the next sign-in asks which account to use.
//
// With { everywhere: true } the answer also holds an address of the accounts site, which ends the
// UrantiaHub account session too and returns here. That is the sign-out for a shared computer.
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "Not allowed." }, { status: 403 });
  const full = wantsFullSignOut(await request.json().catch(() => null));

  const jar = await cookies();
  const session = await unseal(jar.get(SESSION_COOKIE)?.value, appSecret());
  await clearSession();
  jar.set(ASK_COOKIE, "1", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
  const { signOutToken } = session ? await revokeTokens({ appId: APP_ID, refreshToken: session.refreshToken }) : { signOutToken: null };

  if (!full) return Response.json({ signedOut: true });
  return Response.json({ signedOut: true, url: signOutUrl({ appId: APP_ID, returnTo: redirectUri(request), signOutToken }) });
}
