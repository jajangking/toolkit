# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev       # Start dev server (localhost:3000)
npm run build     # Production build
npm run start     # Start production server
npm run lint      # ESLint
```

No test framework installed.

## Architecture

### Next.js 16 App Router (React 19)

Indonesia-language toolkit site at `toolkit-tau-topaz.vercel.app`. Neo-brutalism design with liquid-glass components, dark mode via `prefers-color-scheme: media`.

### Routes (App Router — `/app/`)

| Path | Type | Purpose |
|------|------|---------|
| `/barcode` | page | QR + barcode generator (react-qr-code, react-barcode) |
| `/scanner` | page | Camera-based QR/barcode scanner (html5-qrcode) |
| `/notepad` | page | Smart notepad with auto-calc & Google Sheets sync |
| `/tips` | page | Blog article listing |
| `/tips/[slug]` | page | Article detail (reactions, threaded comments) |
| `/tips/writer` | page | Rich-text article submission (TipTap editor) |
| `/tips/admin` | page | Admin approve/reject pending articles |
| `/receipt-generator` | page | Pertamina fuel receipt generator |
| `/login` | page | Google OAuth login |

### API Routes (`/app/api/`)

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/auth/[...nextauth]` | GET, POST | NextAuth Google OAuth |
| `/api/sheets` | POST | Sync notepad notes to Google Sheets (user's Drive) |
| `/api/tips` | POST | Create article (admin → auto-approve, user → pending) |
| `/api/tips/public` | GET | Fetch published articles (CSV export from Google Sheets) |
| `/api/tips/pending` | GET | List pending articles (admin only) |
| `/api/tips/approve` | POST | Approve/reject article (admin only) |
| `/api/tips/comments` | GET, POST, PATCH | Threaded comments with upvote/downvote |
| `/api/tips/reactions` | PATCH | Emoji reactions (like, love, haha, etc.) |
| `/api/tips/migrate` | POST | Spreadsheet schema migration tool |
| `/api/tips/debug` | GET | Debug spreadsheet data |

### Data Layer

- **Google Sheets** — primary store for blog articles (`TIPS_SPREADSHEET_ID` env var). Schema: 17 columns (ID, Slug, Title, Excerpt, Content, Problem, Solution, Result, Date, Author, AuthorEmail, SolvesId, Status, ApprovedBy, ApprovedAt, RejectionReason, Reactions JSON). Comments stored in a "Comments" sheet.
- **Google Drive** — Smart Notes sync creates/updates a "Toolkit Smart Notes" spreadsheet in the user's Drive.
- **localStorage** — barcode preferences (`last_barcode_text`, `last_barcode_format`), notes (`smart_notes`).
- **Client-side processing** — barcode generation, QR decoding, math calculations all happen in browser. Server stores minimal data.

### Auth

- **next-auth** v4 with GoogleProvider
- Admin defined by `NEXT_PUBLIC_ADMIN_EMAIL` (jajangnurdiana123@gmail.com)
- OAuth scopes include `spreadsheets` and `drive.file` for Google Sheets/Drive API access
- Access/refresh tokens stored in JWT session

### Key Libraries

- **@tiptap/react** (starter-kit, image, link) — rich text editor for blog
- **googleapis** — Sheets v4 & Drive v3 API
- **html5-qrcode** — camera QR/barcode scanner
- **react-qr-code** — QR code render
- **react-barcode** — barcode render (CODE128, CODE39, EAN13, EAN8, UPC, ITF14, pharmacode)
- **next-auth** v4 — Google OAuth
- **tailwindcss** v4 + @tailwindcss/postcss — styling

### Design System (globals.css)

- `.neo-shadow` / `.neo-shadow-lg` — box-shadow based on `--neo-shadow` CSS var
- `.neo-border` — 3px solid `--neo-border` CSS var
- `.liquid-glass` — glassmorphism with backdrop-blur
- `.bg-mesh` — fixed gradient mesh background
- `.animate-slide-up` / `.animate-scale-in` — entrance animations

### Env Vars Required

- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — Google OAuth
- `NEXTAUTH_SECRET` — NextAuth encryption
- `NEXTAUTH_URL` — Site URL for auth callbacks
- `TIPS_SPREADSHEET_ID` — Google Sheets ID for blog articles
- `NEXT_PUBLIC_ADMIN_EMAIL` — Admin email (used for admin gating on client side too)
