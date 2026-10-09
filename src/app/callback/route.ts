import { NextResponse, type NextRequest } from "next/server";
import { exchangeCode } from "@urantia/auth/server";
import { APP_ID, appSecret, redirectUri, saveSession, toSession } from "@/server/auth";
import { ASK_COOKIE, readStart, START_COOKIE } from "@/server/session";

// Step 2: the sign-in page returns here. Check the state, exchange the code, keep the session.
// The same address is the return address of a sign-out, which arrives with no code.
export async function GET(request: NextRequest) {
  const home = (problem?: string) => {
    const url = new URL("/", request.url);
    if (problem) url.searchParams.set("signin", problem);
    url.hash = "account";
    const response = NextResponse.redirect(url);
    response.cookies.set(START_COOKIE, "", { path: "/callback", maxAge: 0 });
    return response;
  };

  const params = request.nextUrl.searchParams;
  if (params.get("error")) return home("denied");
  const code = params.get("code");
  if (!code) return home();

  // The state must be the one that this browser was given at the start.
  const start = readStart(request.cookies.get(START_COOKIE)?.value);
  if (!start || params.get("state") !== start.state) return home("expired");

  try {
    const tokens = await exchangeCode({
      appId: APP_ID,
      code,
      codeVerifier: start.codeVerifier,
      redirectUri: redirectUri(request),
      appSecret: appSecret(),
    });
    await saveSession(toSession(tokens));
    // The person signed in again, so the next sign-in does not need the question.
    const response = home();
    response.cookies.set(ASK_COOKIE, "", { path: "/", maxAge: 0 });
    return response;
  } catch {
    return home("failed");
  }
}
