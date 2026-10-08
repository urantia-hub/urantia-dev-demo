import { NextResponse } from "next/server";
import { createAuthorizeUrl } from "@urantia/auth/server";
import { APP_ID, redirectUri, SCOPES } from "@/server/auth";
import { START_COOKIE } from "@/server/session";

// Step 1: make the sign-in address, keep the state and the verifier in a short-lived cookie, and go.
export async function GET(request: Request) {
  const { url, state, codeVerifier } = await createAuthorizeUrl({ appId: APP_ID, redirectUri: redirectUri(request), scopes: SCOPES });
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
