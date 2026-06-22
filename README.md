# Roman Academy — Academic Coaching Portal

A full-stack digital coaching portal for Roman Academy, a premier 11th & 12th Science coaching institute in Navi Mumbai (Turbhe) focused on Board exams (HSC) and CET preparation.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite, TypeScript, Tailwind v4 |
| Animations | Framer Motion, React-Bits custom components |
| Backend | Express 5, Node.js |
| Database | PostgreSQL (Neon serverless) + Drizzle ORM |
| Auth | Express-session + bcryptjs, rate-limited |
| Routing | Wouter (client-side SPA) |
| Monorepo | pnpm workspaces |

---

## Project Structure

```
workspace/
├── artifacts/
│   ├── roman-academy/        # React frontend (Vite)
│   │   └── src/
│   │       ├── components/
│   │       │   ├── react-bits/   # Animation components (GradientText, ShapeGrid, PixelCard, etc.)
│   │       │   └── ui/           # Radix-based UI system
│   │       └── pages/
│   │           ├── landing.tsx   # Public landing page
│   │           ├── login.tsx     # Login (with Ferrofluid bg)
│   │           ├── contact.tsx   # Contact (with Noise bg)
│   │           ├── change-password.tsx  # First-login password change
│   │           ├── teacher/      # Teacher portal pages
│   │           └── student/      # Student portal pages
│   └── api-server/           # Express API server
│       └── src/routes/       # auth, teacher, student, admin routes
├── lib/
│   └── db/                   # Drizzle schema, migrations, seed
└── scripts/
    ├── backup-db.ts          # pg_dump the database
    ├── restore-db.ts         # Restore from SQL dump
    └── prelaunch-reset.ts    # Clear test data before launch
```

---

## Accounts & Roles

| Username | Password | Role | Notes |
|----------|----------|------|-------|
| `super_admin` | `RomanAdmin@2026!` | Teacher | Hidden recovery account — **keep secret** |
| `roman_sir` | `Roman@123` | Teacher | Main teacher account |
| `kunal.datkhile.2026` | `student@123` | Student | Demo (read-only) |
| All other students | `student@123` | Student | Forced to change on first login |

> **First Login Flow**: When `firstLogin = true`, the user is redirected to `/change-password` after login. This sets `firstLogin = false` in the database.

---

## React-Bits Animation Components

All located in `artifacts/roman-academy/src/components/react-bits/`:

| Component | Used On | Description |
|-----------|---------|-------------|
| `GradientText` | Landing hero | Animated gold gradient on "ROMAN" title |
| `ShapeGrid` | Landing hero bg | Animated gold grid canvas |
| `ScrollFloat` | Landing sections | Fade-in from below on scroll |
| `PixelCard` | Faculty cards | Gold pixel particle hover effect |
| `Ferrofluid` | Login page bg | WebGL fluid simulation (ogl) |
| `Noise` | Contact page bg | Film-grain canvas texture |
| `AnimatedList` | Teacher students | Animated list with keyboard nav |
| `Dock` | Available | macOS-style hover dock |
| `StarBorder` | Available | Animated star border button |

---

## Color System

```css
--gold-300: #F3D27A
--gold-400: #D4AF37  (primary brand)
--gold-500: #B8962E
--navy-900: #0A1628
--navy-950: #050B1A  (background)
--ivory-100: #FAFAF0
```

---

## Development Setup

```bash
# Install all dependencies
pnpm install

# Start frontend (auto-assigns PORT)
pnpm --filter @workspace/roman-academy run dev

# Start API server
pnpm --filter @workspace/api-server run dev

# Seed the database (run once)
pnpm --filter @workspace/db run seed
```

---

## Environment Variables

Set in `.env` (never commit secrets):

```env
DATABASE_URL=postgresql://...
SESSION_SECRET=your-secret-here-min-32-chars
TEACHER_MAGIC_TOKEN=your-teacher-magic-link-token
NODE_ENV=development
```

---

## Scripts

```bash
# Backup database
npx tsx scripts/backup-db.ts [./backups]

# Restore from backup
npx tsx scripts/restore-db.ts ./backups/roman-academy-2026-01-01-12-00-00.sql

# Pre-launch reset (clears test data, resets firstLogin flags)
npx tsx scripts/prelaunch-reset.ts
```

---

## Features

### Teacher Portal (`/teacher`)
- **Dashboard** — Batch overview, scheduled tests, upcoming actions
- **Students** (`/teacher/students`) — Manage students, view analytics, edit profiles, reset passwords
- **Upload Marks** (`/teacher/upload-marks`) — Upload test results by batch
- **WhatsApp** (`/teacher/whatsapp`) — Bulk send/review result drafts to parents
- **Schedule** (`/teacher/schedule`) — Manage upcoming test calendar
- **Settings** (`/teacher/settings`) — Password change, account config

### Student Portal (`/student`)
- **Dashboard** — Rank, percentage trend, upcoming tests
- **Tests** (`/student/tests`) — View all test results with AI feedback
- **Progress** (`/student/progress`) — Syllabus coverage + chapter status
- **Leaderboard** (`/leaderboard`) — Weekly/monthly/quarterly/overall rankings
- **Profile** (`/student/profile`) — Account info
- **Support** (`/student/support`) — Contact teacher

### Public Pages
- **Landing** (`/`) — Hero, batches, results, faculty, gallery
- **Contact** (`/contact`) — Enquiry form (WhatsApp integration)
- **Login** (`/login`) — Ferrofluid WebGL background

---

## Data Model (Key Tables)

- `users` — Auth accounts (TEACHER / STUDENT roles, firstLogin flag)
- `students` — Student profiles linked to users
- `batches` — 11th/12th Science batches
- `tests` — Test records per batch
- `student_test_results` — Per-student test scores with AI + teacher notes
- `rank_history` — Computed leaderboard ranks (weekly/monthly/quarterly/overall)
- `whatsapp_drafts` — Parent notification drafts per test result
- `chapters` — Syllabus chapters per batch
- `student_chapters` — Per-student chapter completion status
- `scheduled_tests` — Upcoming test calendar

---

## Deployment

1. Set all environment variables in the Replit secrets panel
2. Run `pnpm --filter @workspace/db run seed` to populate the database
3. Click **Deploy** in the Replit interface
4. Share the teacher magic link with Roman sir: `https://your-domain/teacher-access?token=<TEACHER_MAGIC_TOKEN>`

---

## Pre-Launch Checklist

- [ ] Run `npx tsx scripts/prelaunch-reset.ts` to clear all demo data
- [ ] Verify `SESSION_SECRET` is set to a strong random string
- [ ] Set `NODE_ENV=production`
- [ ] Change `super_admin` password if desired
- [ ] Test first-login flow with one student account
- [ ] Take a database backup: `npx tsx scripts/backup-db.ts`

---

## Developed By

Kunal Datkhile — for Roman Academy, Turbhe, Navi Mumbai  
Contact: [Datkhilekunalvijay@gmail.com](mailto:Datkhilekunalvijay@gmail.com)
