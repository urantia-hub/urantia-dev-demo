import { describe, expect, it } from "vitest";
import { AuthError } from "@urantia/auth/server";
import { callWithSession } from "./me";
import type { Session } from "./session";

const session = (token: string): Session => ({
  accessToken: token,
  refreshToken: `refresh-of-${token}`,
  expiresAt: "2030-01-01T00:00:00.000Z",
  user: { id: "u1", email: "reader@example.com", scopes: ["bookmarks"] },
});
const answer = (status: number) => new Response(status === 204 ? null : "{}", { status });

function run(over: { statuses: number[]; refresh?: () => Promise<Session> }) {
  const sent: string[] = [];
  const queue = [...over.statuses];
  let refreshes = 0;
  return {
    sent,
    refreshes: () => refreshes,
    result: callWithSession(session("old"), {
      send: async (token) => {
        sent.push(token);
        return answer(queue.shift() ?? 500);
      },
      refresh: async () => {
        refreshes++;
        return over.refresh ? over.refresh() : session("new");
      },
    }),
  };
}

describe("a call to the API for the person", () => {
  it("passes a good answer on, and keeps the session as it is", async () => {
    const r = run({ statuses: [200] });
    const out = await r.result;
    expect(out.response.status).toBe(200);
    expect(out.session).toBe("keep");
    expect(r.refreshes()).toBe(0);
  });

  it("passes an answer that is not about the sign-in on, such as 404 and 403", async () => {
    for (const status of [403, 404, 500]) {
      const out = await run({ statuses: [status] }).result;
      expect(out.response.status).toBe(status);
      expect(out.session).toBe("keep");
    }
  });

  // The API refuses the token: it ended early, or the person removed this app on the accounts site.
  it("gets a new token after a refusal, and tries one more time", async () => {
    const r = run({ statuses: [401, 200] });
    const out = await r.result;
    expect(r.sent).toEqual(["old", "new"]);
    expect(out.response.status).toBe(200);
    expect(out.session).toEqual(session("new"));
  });

  it("ends the sign-in when the refresh is refused: the person removed this app", async () => {
    const r = run({ statuses: [401], refresh: async () => { throw new AuthError("refused", "no"); } });
    const out = await r.result;
    expect(out.response.status).toBe(401);
    expect(out.session).toBe("end");
    expect(r.sent).toEqual(["old"]);
  });

  it("ends the sign-in when the new token is refused too", async () => {
    const out = await run({ statuses: [401, 401] }).result;
    expect(out.response.status).toBe(401);
    expect(out.session).toBe("end");
  });

  // An outage of the sign-in service must not sign the person out.
  it("keeps the sign-in and answers 503 when the refresh cannot be reached", async () => {
    const out = await run({ statuses: [401], refresh: async () => { throw new Error("network"); } }).result;
    expect(out.response.status).toBe(503);
    expect(out.session).toBe("keep");
  });
});
