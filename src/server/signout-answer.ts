// Did the server end the session? The page says "signed out" only for this.
// This file has no other code, so the page can use it with nothing of the server in its bundle.
export const signedOutFor = (status: number | undefined, body: unknown): boolean =>
  status !== undefined && status >= 200 && status < 300 && typeof body === "object" && body !== null && (body as { signedOut?: unknown }).signedOut === true;
