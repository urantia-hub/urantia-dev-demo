"use client";

import { useEffect, useState } from "react";

export default function CallbackPage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleCallback() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const state = params.get("state");
      const err = params.get("error");

      if (err) {
        setError(err);
        return;
      }

      if (!code) {
        setError("No authorization code received.");
        return;
      }

      // Verify state for CSRF protection
      const savedState = sessionStorage.getItem("urantia_auth_state");
      if (state && savedState && state !== savedState) {
        setError("State mismatch — possible CSRF attack.");
        return;
      }
      sessionStorage.removeItem("urantia_auth_state");

      try {
        // Exchange code via our server-side route (which holds the app secret)
        const res = await fetch("/api/auth/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.detail || "Token exchange failed");
        }

        const { data } = await res.json();

        // Store session in localStorage (same format as @urantia/auth v0.2.0)
        const session = {
          user: {
            id: data.userId,
            email: data.email ?? null,
            scopes: data.scopes ?? [],
          },
          accessToken: data.accessToken,
          refreshToken: data.refreshToken ?? null,
          expiresAt: data.expiresAt,
        };
        localStorage.setItem("urantia_auth_session", JSON.stringify(session));

        // Redirect back to the account section
        window.location.href = "/#account";
      } catch (e) {
        setError(e instanceof Error ? e.message : "Authentication failed");
      }
    }

    handleCallback();
  }, []);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="max-w-md rounded-lg border border-red-500/20 bg-red-500/10 p-6 text-center">
          <h1 className="text-lg font-semibold text-red-400">
            Authentication Error
          </h1>
          <p className="mt-2 text-sm text-red-300">{error}</p>
          <a
            href="/"
            className="mt-4 inline-block text-sm text-primary hover:underline"
          >
            Back to demo
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-4 text-sm text-gray-400">Signing you in...</p>
      </div>
    </div>
  );
}
