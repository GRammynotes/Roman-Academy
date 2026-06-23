# Roman Academy — Login Credentials

> **Keep this file private. Do not commit to public repositories.**

---

## Teacher Accounts

| Role | Username | Password | Notes |
|------|----------|----------|-------|
| Main Teacher | `roman_sir` | `Roman@123` | Full teacher dashboard access |
| Super Admin | `super_admin` | `RomanAdmin@2026!` | Recovery account — emergency use only |

---

## Student Accounts

All students log in with the same default password: **`student@123`**

On first login, students are redirected to change their password.

### 12th Science 2026

| # | Student Name | Username | Default Password |
|---|-------------|----------|-----------------|
| 1 | Kunal Datkhile | `kunal.datkhile.2026` | `student@123` *(Demo — read-only)* |
| 2 | Rujula Khamkar | `rujula.khamkar.2026` | `student@123` |
| 3 | Shraddha Kamble | `shraddha.kamble.2026` | `student@123` |
| 4 | Tanashree Gaikwad | `tanashree.gaikwad.2026` | `student@123` |
| 5 | Prachi Kamble | `prachi.kamble.2026` | `student@123` |
| 6 | Sayali Gupta | `sayali.gupta.2026` | `student@123` |
| 7 | Harshala Rajiwade | `harshala.rajiwade.2026` | `student@123` |
| 8 | Aditya Dhurve | `aditya.dhurve.2026` | `student@123` |
| 9 | Suraj Mote | `suraj.mote.2026` | `student@123` |
| 10 | Manasvi Nehe | `manasvi.nehe.2026` | `student@123` |
| 11 | Ankit Pal | `ankit.pal.2026` | `student@123` |
| 12 | Sonal Shingare | `sonal.shingare.2026` | `student@123` |
| 13 | Ritik Mishra | `ritik.mishra.2026` | `student@123` |

### 11th Science 2026

| # | Student Name | Username | Default Password |
|---|-------------|----------|-----------------|
| 1 | Manasvi Mankar | `manasvi.mankar.2026` | `student@123` |
| 2 | Vedika Talekar | `vedika.talekar.2026` | `student@123` |
| 3 | Samruddhi Ghodekar | `samruddhi.ghodekar.2026` | `student@123` |
| 4 | Shravani Shinde | `shravani.shinde.2026` | `student@123` |
| 5 | Harshad Kadam | `harshad.kadam.2026` | `student@123` |
| 6 | Nisa Bankar | `nisa.bankar.2026` | `student@123` |

---

## How Usernames Are Generated

`firstname.lastname.2026` (all lowercase, spaces replaced with dots)

---

## Security Notes

- Students **must change** their password on first login
- Kunal Datkhile's account is a demo account — students can explore but cannot change data
- The `super_admin` account should only be used for emergency recovery
- After going live, change `roman_sir` password via the Settings page
- Rate limit: 5 failed login attempts per IP per 15 minutes

---

## Deployment Environment Variables Required

### API Server (Railway)
```
DATABASE_URL=<your Neon PostgreSQL connection string>
SESSION_SECRET=<random 64-char string — generate with: openssl rand -hex 32>
NODE_ENV=production
PORT=8080
TEACHER_MAGIC_TOKEN=<optional magic link token for teacher quick login>
OPENAI_API_KEY=<optional for AI WhatsApp summaries>
GEMINI_API_KEY=<optional for AI WhatsApp summaries>
```

### Frontend (Vercel)
```
# No env vars needed — API URL is configured in vercel.json rewrites
```
