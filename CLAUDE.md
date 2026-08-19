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
