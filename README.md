# urantia-dev-demo

Interactive demo site for the [Urantia Papers API](https://urantia.dev), showcasing what you can build with the free, open API.

**Live site:** [demo.urantia.dev](https://demo.urantia.dev)

## Features

- **Semantic Search** — Ask a question, find conceptually related passages
- **Keyword Search** — Traditional full-text search with AND/OR/phrase modes
- **Random Quote** — Discover inspiring passages with one tap
- **Audio Player** — Listen to any passage in multiple voices, with Spotify links
- **Entity Explorer** — Browse 4,400+ beings, places, and concepts
- **Passage Lookup** — Look up any reference with surrounding context
- **Reading Plan Builder** — Generate multi-day reading plans from any topic

## Tech Stack

- Next.js 16 (App Router, Turbopack)
- TypeScript
- Tailwind CSS v4
- [`@urantia/api`](https://www.npmjs.com/package/@urantia/api) — official TypeScript SDK
- Deployed on Vercel

## Related Projects

- [urantia.dev](https://urantia.dev) — API documentation
- [api.urantia.dev](https://api.urantia.dev) — Live API
- [urantiahub.com](https://urantiahub.com) — Reading platform
- [@urantia/api](https://www.npmjs.com/package/@urantia/api) — TypeScript SDK (used by this demo)
- [@urantia/auth](https://www.npmjs.com/package/@urantia/auth) — OAuth client SDK

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
