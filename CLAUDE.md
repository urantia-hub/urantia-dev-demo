# urantia-dev-demo

Interactive demo site for the Urantia Papers API, live at demo.urantia.dev.
Every widget calls the public API at api.urantia.dev through the
`@urantia/api` SDK — no backend of its own.

## Tech Stack

- Framework: Next.js 16 (App Router)
- SDK: `@urantia/api` + `@urantia/auth` (published from `urantia-dev-sdks/`)
- Styling: Tailwind CSS
- Package manager: npm, and `package-lock.json` is the only lockfile. Do not
  add a `yarn.lock`.

## Commands

- `npm run dev` — Start dev server
- `npm run build` — Production build

## Deploy

Vercel project `urantia-dev-demo`, team Adams Technologies, domain
demo.urantia.dev.

**The git auto-deploy is broken.** It stopped firing after 2026-05-05
(likely when the repo moved from `kelsonic/` to the `urantia-hub` org);
pushes to main build nothing. Until the git connection is re-linked in the
Vercel dashboard (Project Settings → Git), deploy from this checkout:

```bash
npx vercel deploy --prod --scope adams-technologies
```

The checkout is already linked to the project (`.vercel/`). After a deploy,
verify state READY on the expected commit via the Vercel MCP
(`list_deployments`) — a failed build silently keeps the old deployment live.

## Sign-in (since 2026-10-08)

The demo is the reference for a sign-in with a UrantiaHub account from a server. It uses `@urantia/auth/server`.

- The tokens are in a sealed cookie that scripts cannot read (`src/server/session.ts`). The browser never holds a token.
- `GET /api/auth/start` starts a sign-in. `GET /callback` finishes it, and it is also the return address of a sign-out.
- `GET /api/auth/session` says who is signed in. `POST /api/auth/signout` ends the sign-in here, on the service, and on the accounts site.
- The person's data goes through `/api/me/...`, which adds the token on the server and refreshes it when it is near its end.
- A write must come from this site's own pages (`isSameOrigin`), because the session is a cookie.
- An outage of the sign-in service does not sign a person out. Only a refusal does.
- `DEMO_APP_SECRET` is the app secret, and the key of the cookie is made from it. It is a server setting only.
- `npm test` runs the unit tests. CI runs types, tests, and a build.

