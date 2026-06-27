# Flashcards

A flashcard app for language learning (or any subject): fully custom decks, studied with spaced repetition, synced to the cloud.

The full product and architecture documentation — including the reasoning behind every major decision — lives in [`/docs`](docs/README.md), with the decision log itself in [`/docs/adr`](docs/adr/README.md). Start there before touching code.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in your Supabase project's URL and publishable key
npm run dev
```

## Scripts

| Command                           | Does                               |
| --------------------------------- | ---------------------------------- |
| `npm run dev`                     | Start the dev server               |
| `npm run build`                   | Typecheck and build for production |
| `npm run preview`                 | Serve the production build locally |
| `npm run lint` / `lint:fix`       | ESLint                             |
| `npm run format` / `format:check` | Prettier                           |
| `npm run typecheck`               | TypeScript only, no bundling       |
| `npm run test` / `test:watch`     | Vitest                             |

## Deploying to Vercel

This is a static Vite SPA — Vercel's Vite framework preset detects `npm run build` / `dist` automatically, and [`vercel.json`](vercel.json) adds the rewrite a client-routed SPA needs (without it, refreshing a nested route like `/decks/abc123` 404s on a static host, since there's no `/decks/abc123` file to serve — the rewrite sends every unmatched path to `index.html` and lets React Router take over).

Required environment variables — set these in the Vercel project's **Settings → Environment Variables** before the first deploy (Vite inlines `VITE_*` vars at _build_ time, so they must exist when Vercel runs the build, not just at runtime):

| Variable                        | Value                                                                                                            |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `VITE_SUPABASE_URL`             | Your Supabase project URL                                                                                        |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | The **Publishable key** from Project Settings → API — never the Secret key, which must never reach frontend code |

See [`.env.example`](.env.example) for local development and ADR-0001 / ADR-0011 for why Supabase and Vercel were chosen.

## Status

Early build — see [`docs/13-roadmap.md`](docs/13-roadmap.md) for what's built vs. planned. Deck and card management (create/edit/delete/search) work end to end against local storage, with a sidebar/drawer navigation shell and a fully internationalized UI (English, Portuguese, Russian, German, Japanese). Sign-in is simulated; studying and real Supabase/auth integration are not implemented yet.
