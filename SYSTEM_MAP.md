# Roman Academy - System Map

## High-level folders

- app/
  - page.tsx (landing)
  - login/page.tsx
  - contact/page.tsx
  - leaderboard/page.tsx
  - student/
    - page.tsx
    - profile/page.tsx
    - progress/page.tsx
    - tests/page.tsx
    - settings/page.tsx
    - support/page.tsx
  - teacher/
    - page.tsx
    - settings/page.tsx
    - upload-marks/page.tsx
    - students/page.tsx
    - syllabus/page.tsx
    - schedule/page.tsx
    - whatsapp/page.tsx
    - leaderboard/page.tsx
  - admin/
    - students/page.tsx

- components/
  - admin-command-box.tsx
  - app-shell.tsx
  - compact-page.tsx
  - metric-card.tsx
  - performance-graphs.tsx
  - premium-profile-card.tsx
  - profile-chart.tsx
  - roman-wordmark.tsx
  - student-profile-card.tsx
  - walkthrough-popup.tsx
  - students/
    - add-student-modal.tsx
    - student-profile-drawer.tsx
  - ui/
    - badge.tsx
    - button.tsx
    - card.tsx
    - progress.tsx

- lib/
  - academy.ts
  - admin-parser.ts
  - ai-provider.ts
  - auth.ts
  - batch.ts
  - mock-data.ts
  - prisma.ts
  - types.ts
  - utils.ts
  - whatsapp-provider.ts

- prisma/
  - schema.prisma
  - dev.db

- public/
  - roman-academy-cover.png
  - other images

- middleware.ts
- next.config.ts
- tailwind.config.ts
- tsconfig.json
- package.json

## API routes (app/api)
(Selected list discovered in the codebase)

- /api/auth/demo
- /api/ai/analyze
- /api/ai/status
- /api/student/profile
- /api/student/progress
- /api/student/tests
- /api/students
- /api/tests/upload
- /api/teacher/dashboard
- /api/teacher/settings
- /api/teacher/settings/test
- /api/teacher/students
- /api/teacher/leaderboard
- /api/teacher/syllabus
- /api/teacher/syllabus/complete
- /api/teacher/whatsapp
- /api/teacher/whatsapp/send
- /api/teacher/schedule
- /api/teacher/batches
- /api/teacher/whatsapp/send
- /api/admin/students
- /api/admin/students/search
- /api/admin/students/[id]/report

(There are additional route files under app/api; refer to the folder for full list.)

## Providers / Auth
- `middleware.ts` implements role-based redirects between `/student`, `/teacher`, `/admin`.
- `lib/auth.ts` contains `getRoleFromRequest` and `assertRole` used by API routes.
- `lib/ai-provider.ts` and `lib/whatsapp-provider.ts` manage external integrations.

## Database
- `prisma/schema.prisma` contains models: User, Student, Batch, Test, StudentTestResult, Chapter, StudentChapter, Attendance, RankHistory, Notification, AppSetting, WhatsAppDraft, etc.

## Notes / Next steps
- Many API routes call `assertRole()`; `lib/auth.ts` now throws `NextResponse.json(...)` for unauthorized access to avoid 500s (so routes return proper 403 JSON).
- Next: run a targeted edit pass to wrap any additional server handlers that depend on `assertRole` if they expect a returned role rather than a thrown Response.
- Phase 2: route-by-route audit to confirm rendering and runtime behavior.
