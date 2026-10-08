import { loadSession } from "@/server/auth";
import { isSameOrigin, jsonType, meTarget } from "@/server/session";

// The person's own data. The browser calls this address, and this server adds the token.
// So no token is ever in the browser, where another script can read it.
async function forward(request: Request, { params }: { params: Promise<{ path?: string[] }> }) {
  // The session is a cookie. A write must come from a page of this site.
  if (request.method !== "GET" && !isSameOrigin(request)) {
    return Response.json({ detail: "Not allowed." }, { status: 403 });
  }

  const { path = [] } = await params;
  const target = meTarget(path, new URL(request.url).search);
  if (!target) return Response.json({ detail: "Not found." }, { status: 404 });

  const loaded = await loadSession();
  if (loaded.state === "unavailable") return Response.json({ detail: "The sign-in service has a problem. Try again." }, { status: 503 });
  if (loaded.state === "signed-out") return Response.json({ detail: "Sign in first." }, { status: 401 });

  const hasBody = request.method !== "GET" && request.method !== "DELETE";
  const upstream = await fetch(target, {
    method: request.method,
    headers: {
      Authorization: `Bearer ${loaded.session.accessToken}`,
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
    },
    body: hasBody ? await request.text() : undefined,
    cache: "no-store",
  });

  return new Response(upstream.status === 204 ? null : await upstream.text(), {
    status: upstream.status,
    headers: {
      "content-type": jsonType(upstream.headers.get("content-type")),
      // The browser must not guess another type from the body.
      "x-content-type-options": "nosniff",
      "content-security-policy": "default-src 'none'",
      "cache-control": "no-store",
    },
  });
}

export { forward as GET, forward as POST, forward as PUT, forward as PATCH, forward as DELETE };
