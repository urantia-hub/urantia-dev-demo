import { AuthError } from "@urantia/auth/server";
import type { Session } from "./session";

// One call to the API for the person, with what it means for the session.
// The API can refuse a token that this server still holds as good: the token ended early, or the
// person removed this app on the accounts site. Then the app must follow, and not show "signed in".

export type Called = {
  response: Response;
  // "keep": as it is. "end": the person is signed out. A session: the new one, to save.
  session: "keep" | "end" | Session;
};

const answer = (status: number, detail: string) => Response.json({ detail }, { status });

export async function callWithSession(
  session: Session,
  deps: { send: (accessToken: string) => Promise<Response>; refresh: (session: Session) => Promise<Session> },
): Promise<Called> {
  const first = await deps.send(session.accessToken);
  if (first.status !== 401) return { response: first, session: "keep" };

  // The token was refused. Ask for a new one. Only a refusal ends the sign-in: an outage does not.
  let fresh: Session;
  try {
    fresh = await deps.refresh(session);
  } catch (error) {
    if (error instanceof AuthError && error.kind === "refused") {
      return { response: answer(401, "Sign in again."), session: "end" };
    }
    return { response: answer(503, "The sign-in service has a problem. Try again."), session: "keep" };
  }

  const second = await deps.send(fresh.accessToken);
  if (second.status === 401) return { response: answer(401, "Sign in again."), session: "end" };
  return { response: second, session: fresh };
}
