import { NextRequest, NextResponse } from "next/server";

const API_URL = "https://api.urantia.dev";
const APP_ID = "demo";
const APP_SECRET = process.env.DEMO_APP_SECRET ?? "";

export async function POST(req: NextRequest) {
  const { code, codeVerifier } = await req.json();

  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  const body: Record<string, string> = {
    code,
    appId: APP_ID,
    appSecret: APP_SECRET,
  };
  if (codeVerifier) body.codeVerifier = codeVerifier;

  const res = await fetch(`${API_URL}/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
