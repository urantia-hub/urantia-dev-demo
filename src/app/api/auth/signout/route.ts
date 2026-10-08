import { cookies } from "next/headers";
import { revokeTokens, signOutUrl } from "@urantia/auth/server";
import { APP_ID, appSecret, clearSession, redirectUri } from "@/server/auth";
import { isSameOrigin, SESSION_COOKIE, unseal } from "@/server/session";

// Step 4: end the sign-in on the service, clear the cookie, and say where the browser goes next.
// That address ends the UrantiaHub account session too, so the next sign-in is not silent.
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "Not allowed." }, { status: 403 });

  const session = await unseal((await cookies()).get(SESSION_COOKIE)?.value, appSecret());
  await clearSession();
  const { signOutToken } = session
    ? await revokeTokens({ appId: APP_ID, refreshToken: session.refreshToken })
    : { signOutToken: null };

  return Response.json({ url: signOutUrl({ appId: APP_ID, returnTo: redirectUri(request), signOutToken }) });
}
