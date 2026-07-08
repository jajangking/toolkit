<!-- BEGIN:nextjs-agent-rules -->

# Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is outdated — the docs are the source of truth.

<!-- END:nextjs-agent-rules -->

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server (localhost:3000) |
| `npm run build` | Production build |
| `npm run lint` | ESLint (flat config in `eslint.config.mjs`) |

No test framework installed. No typecheck script.

## Stack & quirks

- **Next.js 16** App Router (React 19). Use bundled docs in `node_modules/next/dist/docs/`.
- **Tailwind v4** with `@tailwindcss/postcss` — no `tailwind.config` needed; all config in `globals.css` via `@import "tailwindcss"`.
- **Dark mode** via `prefers-color-scheme: media` only — no toggle.
- Path alias `@/*` maps to project root.

## Project structure

- `app/` — App Router pages + API routes
- `components/` — React components (client components use `"use client"`)
- `lib/` — shared logic (auth, sheets, api clients)
- `data/` — local JSON fallbacks (`tips.json`, `comments.json`)

## Routes

| Path | File | Notes |
|------|------|-------|
| `/` | `app/page.tsx` | Homepage (server component) |
| `/barcode` | `app/barcode/page.tsx` | Separate `layout.tsx` |
| `/scanner` | `app/scanner/page.tsx` | |
| `/notepad` | `app/notepad/page.tsx` | "use client"; localStorage |
| `/tips` | `app/tips/page.tsx` | Blog listing |
| `/tips/[slug]` | `app/tips/[slug]/page.tsx` | Article detail |
| `/tips/writer` | `app/tips/writer/page.tsx` | TipTap editor |
| `/tips/admin` | `app/tips/admin/page.tsx` | Admin-only |
| `/login` | `app/login/page.tsx` | Google OAuth |
| `/receipt-generator` | `app/receipt-generator/page.tsx` | |
| `/watchface-generator` | `app/watchface-generator/page.tsx` | |
| `/interactive-camera` | `app/interactive-camera/page.tsx` | Separate `layout.tsx` |
| `/rawat-motor` | `app/rawat-motor/page.tsx` | Separate `layout.tsx` |
| `/about`, `/privacy`, `/terms`, `/contact` | Static pages | |

## API routes (`app/api/`)

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/auth/[...nextauth]` | GET,POST | — | NextAuth Google OAuth |
| `/api/sheets` | POST | User | Sync notepad → Google Sheets (user's Drive) |
| `/api/tips` | POST | User | Create blog article |
| `/api/tips/public` | GET | None | List approved articles (CSV from Google Sheets) |
| `/api/tips/pending` | GET | Admin | List pending articles |
| `/api/tips/approve` | POST | Admin | Approve/reject article |
| `/api/tips/comments` | GET,POST,PATCH | Varies | Threaded comments |
| `/api/tips/reactions` | PATCH | None | Emoji reactions |
| `/api/tips/migrate` | POST | Admin | Spreadsheet schema migration |
| `/api/tips/debug` | GET | — | Debug spreadsheet data |
| `/api/camera-relay` | GET,POST | None | In-memory frame relay (single-instance only) |

## Data layer

- **Google Sheets** — primary store for blog articles (`TIPS_SPREADSHEET_ID` env var). 17 columns: ID, Slug, Title, Excerpt, Content, Problem, Solution, Result, Date, Author, AuthorEmail, SolvesId, Status, ApprovedBy, ApprovedAt, RejectionReason, Reactions. Comments stored in separate "Comments" sheet.
- **Google Drive** — Notepad sync creates/updates "Toolkit Smart Notes" spreadsheet in user's Drive using their OAuth token.
- **localStorage** — Notepad notes (`smart_notes`), barcode prefs (`last_barcode_text`, `last_barcode_format`).
- **data/comments.json** — Local file for article comments (NOT in Google Sheets).
- **data/tips.json** — Local fallback/seed data (NOT the primary store).
- Most processing is client-side (barcode gen, QR decode, math calc).

## Auth

- **next-auth** v4 with GoogleProvider
- Admin = `NEXT_PUBLIC_ADMIN_EMAIL` (jajangnurdiana123@gmail.com)
- OAuth scope includes `spreadsheets` and `drive.file`
- Access/refresh tokens stored in JWT session; API routes extract `(session as any).accessToken`
- Layout has `"use client"` Providers wrapper around SessionProvider

## Env vars required

`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `TIPS_SPREADSHEET_ID`, `NEXT_PUBLIC_ADMIN_EMAIL`

## Gotchas

- **next.config.ts** uses TypeScript (not `.mjs`).
- PostCSS config is `postcss.config.mjs` with `@tailwindcss/postcss` plugin (Tailwind v4 style).
- Bundled docs live at `node_modules/next/dist/docs/` — consult them before writing any Next.js code.
- `/api/camera-relay` uses an in-memory `Map` — won't work across multiple Vercel instances.
- Comments API uses filesystem (`data/comments.json`), not Google Sheets.
- API routes use `@/` path alias for imports.
- AdSense component (`AdSpace.tsx`) uses conditional rendering pattern (ad only after user interaction).
- No `next.config.ts` special options; keep config minimal.
