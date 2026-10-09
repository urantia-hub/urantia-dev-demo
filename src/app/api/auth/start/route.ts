import { NextResponse, type NextRequest } from "next/server";
import { createAuthorizeUrl } from "@urantia/auth/server";
import { APP_ID, redirectUri, SCOPES } from "@/server/auth";
import { ASK_COOKIE, asksAccount, START_COOKIE } from "@/server/session";

// Step 1: make the sign-in address, keep the state and the verifier in a short-lived cookie, and go.
export async function GET(request: NextRequest) {
  // After a sign-out, the accounts site asks "Continue as …?" in place of a silent sign-in.
  const askAccount = asksAccount(request.cookies.get(ASK_COOKIE)?.value);
  const { url, state, codeVerifier } = await createAuthorizeUrl({ appId: APP_ID, redirectUri: redirectUri(request), scopes: SCOPES, askAccount });
  const response = NextResponse.redirect(url);
  response.cookies.set(START_COOKIE, `${state}.${codeVerifier}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/callback",
    maxAge: 600,
  });
  return response;
}
