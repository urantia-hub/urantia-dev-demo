import { loadSession } from "@/server/auth";

// Who is signed in. The browser gets the person, never a token.
export async function GET() {
  const loaded = await loadSession();
  const headers = { "cache-control": "no-store" };
  if (loaded.state === "unavailable") return Response.json({ user: null, unavailable: true }, { status: 503, headers });
  return Response.json({ user: loaded.state === "signed-in" ? loaded.session.user : null }, { headers });
}
