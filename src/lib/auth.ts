import { UrantiaAuth } from "@urantia/auth";

export const auth = new UrantiaAuth({
  appId: "demo",
  redirectUri:
    typeof window !== "undefined"
      ? `${window.location.origin}/callback`
      : "http://localhost:3000/callback",
});
