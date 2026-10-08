import { describe, expect, it } from "vitest";
import { isSameOrigin, jsonType, meTarget, needsRefresh, readStart, seal, unseal, type Session } from "./session";

const SECRET = "a-test-secret-that-is-long-enough-0123456789";
const session: Session = {
  // Long values: a short one such as "a1" is found by chance in any sealed text, and the test then fails at random.
  accessToken: "access-token-for-the-test",
  refreshToken: "refresh-token-for-the-test",
  expiresAt: "2026-10-08T12:15:00.000Z",
  user: { id: "reader-1", email: "reader@example.com", scopes: ["bookmarks"] },
};

describe("the session cookie", () => {
  it("is sealed, so the value holds no token in plain text", async () => {
    const value = await seal(session, SECRET);
    expect(value).not.toContain("access-token-for-the-test");
    expect(value).not.toContain("refresh-token-for-the-test");
    expect(value).not.toContain("reader@example.com");
    expect(await unseal(value, SECRET)).toEqual(session);
  });

  it.each([
    ["nothing", undefined],
    ["text that is not a sealed value", "abc"],
    ["a value sealed with another secret", "other"],
    ["a value that was changed", "changed"],
  ])("is no session when it is %s", async (_name, kind) => {
    let value: string | undefined = kind;
    if (kind === "other") value = await seal(session, `${SECRET}-other`);
    if (kind === "changed") {
      const good = await seal(session, SECRET);
      value = `${good.slice(0, -4)}AAAA`;
    }
    expect(await unseal(value, SECRET)).toBeNull();
  });

  it("is no session when the sealed data is not a session", async () => {
    const value = await seal({ accessToken: "a" } as unknown as Session, SECRET);
    expect(await unseal(value, SECRET)).toBeNull();
  });

  // With no secret the site must not fall back to a key that anyone can guess.
  it("refuses to work with no secret, or a short one", async () => {
    await expect(seal(session, "")).rejects.toThrow();
    await expect(seal(session, "short")).rejects.toThrow();
    expect(await unseal("abc", "")).toBeNull();
  });
});

describe("needsRefresh", () => {
  const at = (iso: string) => new Date(iso);
  it("is true two minutes before the end, and after it", () => {
    expect(needsRefresh(session, at("2026-10-08T12:12:59Z"))).toBe(false);
    expect(needsRefresh(session, at("2026-10-08T12:13:01Z"))).toBe(true);
    expect(needsRefresh(session, at("2026-10-08T13:00:00Z"))).toBe(true);
  });
  it("is true for a date that cannot be read", () => {
    expect(needsRefresh({ ...session, expiresAt: "soon" }, at("2026-10-08T12:00:00Z"))).toBe(true);
  });
});

describe("readStart", () => {
  it("splits the state and the verifier", () => {
    expect(readStart("state-1.verifier-1")).toEqual({ state: "state-1", codeVerifier: "verifier-1" });
  });
  it.each([undefined, "", "no-dot", ".verifier", "state."])("is nothing for %j", (value) => {
    expect(readStart(value)).toBeNull();
  });
});

// The session is a cookie, so a write must come from this site's own pages.
describe("isSameOrigin", () => {
  const req = (headers: Record<string, string>) => new Request("https://demo.urantia.dev/api/me/bookmarks", { method: "POST", headers });
  it("accepts a request from this site", () => {
    expect(isSameOrigin(req({ origin: "https://demo.urantia.dev" }))).toBe(true);
  });
  it("refuses another site, a missing origin, and a null origin", () => {
    expect(isSameOrigin(req({ origin: "https://evil.example" }))).toBe(false);
    expect(isSameOrigin(req({}))).toBe(false);
    expect(isSameOrigin(req({ origin: "null" }))).toBe(false);
    expect(isSameOrigin(req({ origin: "https://demo.urantia.dev.evil.example" }))).toBe(false);
  });
});

// The proxy adds the person's token. It must reach the person's own data and nothing else.
describe("meTarget", () => {
  it("builds the address under /me, with the query", () => {
    expect(meTarget([], "")?.toString()).toBe("https://api.urantia.dev/me");
    expect(meTarget(["bookmarks"], "?page=2")?.toString()).toBe("https://api.urantia.dev/me/bookmarks?page=2");
    expect(meTarget(["bookmarks", "1:0.1"], "")?.toString()).toBe("https://api.urantia.dev/me/bookmarks/1%3A0.1");
  });

  it.each([
    [["..", "auth", "apps"]],
    [["bookmarks", "..", "..", "admin", "stats"]],
    [["."]],
    [["%2e%2e", "admin"]],
    [["bookmarks/../../admin"]],
    [["bookmarks\\..\\..\\admin"]],
    [[""]],
  ])("refuses %j, which can leave /me", (path) => {
    const target = meTarget(path, "");
    if (target !== null) expect(target.pathname === "/me" || target.pathname.startsWith("/me/")).toBe(true);
    if (path.some((p) => p === ".." || p === "." || p === "" || p.toLowerCase().includes("%2e"))) expect(target).toBeNull();
  });

  it("cannot be sent to another host by the query or by a segment", () => {
    expect(meTarget(["bookmarks"], "?x=https://evil.example")?.host).toBe("api.urantia.dev");
    expect(meTarget(["//evil.example"], "")?.host ?? "api.urantia.dev").toBe("api.urantia.dev");
  });
});

// The proxy answers on this site's own origin. An answer that a browser reads as a page can run script here.
describe("jsonType", () => {
  it.each(["application/json", "application/json; charset=utf-8", "application/problem+json", "APPLICATION/JSON"])("keeps %s", (type) => {
    expect(jsonType(type)).toBe(type.toLowerCase().split(";")[0].trim());
  });
  it.each(["text/html", "text/html; charset=utf-8", "image/svg+xml", "application/xhtml+xml", "text/plain", "application/json, text/html", "", null])(
    "answers application/json for %j",
    (type) => {
      expect(jsonType(type)).toBe("application/json");
    },
  );
});
