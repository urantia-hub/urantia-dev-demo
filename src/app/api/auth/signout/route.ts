import { cookies } from "next/headers";
import { revokeTokens } from "@urantia/auth/server";
import { APP_ID, appSecret, clearSession } from "@/server/auth";
import { ASK_COOKIE, isSameOrigin, SESSION_COOKIE, unseal } from "@/server/session";

// Step 4: end the sign-in on the service and clear the cookie. The person does not leave this page.
// The UrantiaHub account itself stays signed in; the person ends that on the account page. So the
// next sign-in here is not silent: it shows the sign-in page of the accounts site (see ASK_COOKIE).
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "Not allowed." }, { status: 403 });

  const jar = await cookies();
  const session = await unseal(jar.get(SESSION_COOKIE)?.value, appSecret());
  await clearSession();
  jar.set(ASK_COOKIE, "1", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
  if (session) await revokeTokens({ appId: APP_ID, refreshToken: session.refreshToken });

  return Response.json({ signedOut: true });
}
