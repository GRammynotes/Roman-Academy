# Roman Academy Dashboard

A full-stack academic coaching portal for 11th/12th Science students and their teachers. Includes public landing page, login, student/teacher dashboards, leaderboard, contact page, and admin reports.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000, or $PORT)
- `pnpm --filter @workspace/roman-academy run dev` — run the frontend (port $PORT)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm exec tsx lib/db/seed.ts` — seed demo accounts
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite (wouter routing, Tailwind v4, TanStack Query)
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- Build: esbuild (CJS bundle for API), Vite (frontend)

## Where things live

- `artifacts/roman-academy/` — React/Vite frontend, preview at `/`
- `artifacts/api-server/` — Express API server at port 8080
- `lib/db/src/schema/index.ts` — **DB schema source of truth**
- `artifacts/roman-academy/src/index.css` — Tailwind theme + CSS vars (navy/gold/ivory)
- `artifacts/roman-academy/src/App.tsx` — All wouter routes
- `artifacts/roman-academy/src/components/app-shell.tsx` — Sidebar + mobile nav
- `lib/db/seed.ts` — Seed script for demo accounts

## Architecture decisions

- Vite proxy: `vite.config.ts` proxies `/api/*` → `http://localhost:8080` in dev
- Cookie auth: `ra_role` + `ra_user_id` cookies (no JWT), set by Express login route
- Role enum in DB is uppercase (`TEACHER`, `STUDENT`), but API responses return lowercase
- `Badge` component uses `tone` prop (gold/green/red/blue/neutral) instead of shadcn `variant`
- Tailwind custom colors (`navy-*`, `gold-*`, `ivory-*`) defined in `@theme {}` block in index.css

## Product

- **Landing page**: Academy info, batch listings, faculty section, gallery
- **Login**: Cookie-based auth, demo accounts button
- **Teacher dashboard**: Class stats, recent activity, quick actions
- **Upload Marks**: Paste-based AI text parser to upload test results
- **Manage Students**: Add/view students, auto-generate usernames
- **WhatsApp Queue**: Review and send AI-drafted messages
- **Test Schedule**: Create and view upcoming tests
- **Leaderboard**: Ranked by batch/stream with scope filters
- **Student dashboard**: Personal stats, notifications, quick links
- **Student tests/progress/profile/settings/support**: Full student portal

## User preferences

- Dark navy/gold/ivory theme throughout
- Keep all pages consistent with AppShell (no plain white backgrounds inside dashboards)

## Gotchas

- DB role enum is uppercase (`TEACHER`, `STUDENT`) — don't use lowercase in inserts
- The `usersTable.id` is a text PK (UUID) — must be provided explicitly (no auto-generation)
- `batchesTable.startDate` is NOT NULL — always provide when inserting
- `studentsTable.joinedDate` is NOT NULL — always provide when inserting
- Vite proxy only works in dev; production needs a proper reverse proxy setup
- `sql.join()` must be used for dynamic array params in Drizzle raw SQL (NOT `ANY(${array})`)

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
