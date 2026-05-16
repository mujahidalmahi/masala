# StudySprint OS

A curriculum-aware, gamified student study platform. Track what you study, generate practice, build routines, predict performance, and turn learning into a progress-based game.

**Stack:** Next.js 16 + NestJS 11 + PostgreSQL (Supabase) + Socket.IO

---

## Architecture

```
studysprint-os/
├── frontend/          Next.js 16 app (Vercel)
├── backend/           NestJS 11 API (Render)
└── database/          PostgreSQL migrations (Supabase)
```

### Layers

| Layer | Tech | Responsibility |
|-------|------|---------------|
| **Frontend** | Next.js 16, React 19, Tailwind CSS, Zustand, TanStack Query | UI, state, routing, Socket.IO client |
| **Backend** | NestJS 11, Socket.IO, Passport JWT, Puppeteer | REST API, real-time rooms, PDF reports, auth |
| **Database** | Supabase PostgreSQL, RLS, SQL functions | Data, migrations, row-level security, triggers |
| **Storage** | Supabase Storage | Textbook PDFs, uploaded files, avatars |
| **Realtime** | Supabase Realtime + Socket.IO | Focus room presence, leaderboard updates |

---

## Quick Start

### Prerequisites

- Node.js 22+
- npm 10+
- Supabase account (free tier works)
- (Optional) Vercel + Render accounts for deployment

### 1. Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to **Project Settings → API** and copy:
   - `Project URL` → `SUPABASE_URL`
   - `anon public key` → `SUPABASE_ANON_KEY`
   - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY`
3. Open **SQL Editor** and run migrations **in order**:

```sql
-- 1. Core schema
\i database/migrations/001_schema_core.sql

-- 2. Study tracking
\i database/migrations/002_schema_tracking.sql

-- 3. Gamification
\i database/migrations/003_schema_gamification.sql

-- 4. Questions and quizzes
\i database/migrations/004_schema_questions.sql

-- 5. Focus rooms
\i database/migrations/005_schema_rooms.sql

-- 6. Predictions and reports
\i database/migrations/006_schema_predictions.sql

-- 7. Performance indexes
\i database/migrations/009_indexes.sql
```

4. Deploy SQL functions:

```sql
\i database/functions/001_xp_functions.sql
\i database/functions/002_streak_functions.sql
\i database/functions/003_mastery_functions.sql
\i database/functions/004_quiz_functions.sql
\i database/functions/005_leaderboard_functions.sql
```

5. Enable Row Level Security:

```sql
\i database/policies/001_rls_policies.sql
```

6. (Optional) Seed initial data:

```sql
\i database/seed/010_seed_data.sql
```

7. In Supabase **Authentication → Settings**, enable email/password sign-in.
8. In Supabase **Storage**, create a bucket named `study-sprint-files` (public).

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=openssl rand -base64 32   # generate a random one
```

Install and start:

```bash
npm install
npm run start:dev
```

The API starts at **http://localhost:4000**. Health check: `GET /api/health`

### 3. Frontend Setup

```bash
cd frontend
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=http://localhost:4000
```

Install and start:

```bash
npm install
npm run dev
```

The app starts at **http://localhost:3000**.

---

## Default Users

After running the seed script:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@studysprint.io | admin123456 |
| Student | student@example.com | student123456 |

---

## Deployment

### Deploy Frontend → Vercel

1. Push your repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project**
3. Import your repo, set **Root Directory** to `frontend`
4. Vercel auto-detects Next.js — no config needed
5. Add these **Environment Variables**:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend.onrender.com` |
| `NEXT_PUBLIC_WS_URL` | `https://your-backend.onrender.com` |

6. Deploy

The `vercel.json` in `frontend/` is pre-configured. No changes needed.

### Deploy Backend → Render

**Option A: Docker (recommended)**

1. Push your repo to GitHub
2. Go to [render.com](https://render.com) → **New Web Service**
3. Connect your repo, choose **Docker**
4. Set **Root Directory** to `backend`
5. Add these **Environment Variables** (all marked as secret):

| Name | Value |
|------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `4000` |
| `HOST` | `0.0.0.0` |
| `SUPABASE_URL` | your Supabase project URL |
| `SUPABASE_ANON_KEY` | your anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | your service role key |
| `JWT_SECRET` | a random base64 string |
| `JWT_EXPIRATION` | `7d` |
| `CORS_ORIGIN` | `https://your-frontend.vercel.app` |
| `PUPPETEER_EXECUTABLE_PATH` | `/usr/bin/chromium` |

6. Deploy

**Option B: Render Blueprint (render.yaml)**

The `render.yaml` in `backend/` is pre-configured. You can connect it via Render Blueprints.

### Supabase Production Checklist

- [ ] Enable email/password auth in **Authentication → Settings**
- [ ] Set **Site URL** to your Vercel frontend URL
- [ ] Add Vercel URL to **Redirect URLs**
- [ ] Create storage bucket `study-sprint-files` (public)
- [ ] Run all migrations, functions, and RLS policies
- [ ] Verify RLS: unauthenticated requests should return empty results

#### Environment Variables Summary

| Component | Variable | Source |
|-----------|----------|--------|
| Backend | `SUPABASE_URL` | Supabase Project Settings → API |
| Backend | `SUPABASE_ANON_KEY` | Supabase Project Settings → API |
| Backend | `SUPABASE_SERVICE_ROLE_KEY` | Supabase Project Settings → API |
| Backend | `JWT_SECRET` | Generate with `openssl rand -base64 32` |
| Backend | `CORS_ORIGIN` | Your Vercel frontend URL |
| Frontend | `NEXT_PUBLIC_API_URL` | Your Render backend URL |
| Frontend | `NEXT_PUBLIC_WS_URL` | Your Render backend URL |

---

## Project Structure

### Frontend (`frontend/`)

```
src/
├── app/
│   ├── layout.tsx              Root layout (ThemeProvider + QueryProvider + Toaster)
│   ├── page.tsx                Landing page
│   ├── (auth)/                 Auth pages (no sidebar)
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── admin/login/page.tsx
│   ├── (user)/                 User dashboard (sidebar layout)
│   │   ├── dashboard/
│   │   ├── study-sessions/
│   │   ├── quizzes/
│   │   ├── rooms/
│   │   ├── gamification/
│   │   ├── reports/
│   │   ├── routine/
│   │   ├── textbooks/
│   │   └── settings/
│   └── (admin)/                Admin dashboard (sidebar layout, /admin/* paths)
│       └── admin/
│           ├── dashboard/
│           ├── users/
│           ├── curriculum/
│           ├── questions/
│           ├── badges/
│           ├── rooms/
│           └── settings/
├── components/
│   ├── ui/                     shadcn-style UI primitives
│   ├── shared/                 ThemeProvider, QueryProvider, Sidebar, Navbar
│   └── landing/                Landing page sections
├── hooks/                      useAuth, useMediaQuery
├── lib/                        API client (axios), utilities
├── store/                      Zustand stores (auth, UI)
├── types/                      TypeScript interfaces
└── middleware.ts               Route protection (proxy)
```

### Backend (`backend/`)

```
src/
├── auth/               JWT auth, signup/login, Passport strategies, guards
├── users/              Profile CRUD, dashboard aggregation
├── curriculum/         Countries, boards, grades, subjects, chapters, topics
├── study-sessions/     Focus sessions, XP/streak triggers
├── textbooks/          File upload to Supabase Storage
├── gamification/       XP, streaks, badges, leaderboard, skills, challenges
├── quiz/               CRUD, auto-generate, attempts, scoring
├── rooms/              CRUD, Socket.IO realtime gateway
├── prediction/         Performance, mastery, weak areas
├── reports/            Weekly/monthly/custom summaries
├── routine/            Daily plan generation
├── supabase/           Supabase client service
├── common/             Guards, interceptors, filters, pipes, decorators
└── config/             Typed configuration
```

### Database (`database/`)

```
migrations/     SQL migration files (001–009)
functions/      PostgreSQL functions (XP, streaks, mastery, quizzes, leaderboard)
policies/       Row Level Security policies
seed/           Initial seed data (levels, badges, sample curriculum)
```

---

## API Overview

Base URL: `http://localhost:4000/api` (dev) or `https://your-backend.onrender.com/api` (prod)

All endpoints except `/api/auth/signup` and `/api/auth/login` require a Bearer token.

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/login` | Sign in |

### Users
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/users/me` | Get profile |
| PATCH | `/api/users/me` | Update profile |
| GET | `/api/users/dashboard` | Dashboard aggregation |

### Curriculum
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/curriculum/countries` | List countries |
| GET | `/api/curriculum/boards` | List boards |
| GET | `/api/curriculum/grades` | List grades |
| GET | `/api/curriculum/subjects` | List subjects |
| GET | `/api/curriculum/chapters` | List chapters |
| GET | `/api/curriculum/topics/:id` | List topics |
| GET | `/api/curriculum/tree/:subjectId/:gradeId` | Full tree |

### Study Sessions
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/study-sessions` | Session history |
| POST | `/api/study-sessions` | Start session |
| PATCH | `/api/study-sessions/:id/end` | End session |
| GET | `/api/study-sessions/stats` | Session stats |

### Quizzes
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/quizzes` | List quizzes |
| POST | `/api/quizzes` | Create quiz |
| POST | `/api/quizzes/generate` | Auto-generate quiz |
| GET | `/api/quizzes/:id` | Get quiz detail |
| POST | `/api/quizzes/attempts` | Start attempt |
| POST | `/api/quizzes/attempts/:id/answer` | Submit answer |
| POST | `/api/quizzes/attempts/:id/submit` | Submit attempt |
| GET | `/api/quizzes/attempts` | My attempts |

### Gamification
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/gamification/profile` | XP, level, streak |
| GET | `/api/gamification/streak` | Streak details |
| GET | `/api/gamification/badges` | My badges |
| GET | `/api/gamification/badges/all` | All badges |
| GET | `/api/gamification/skills` | Skill levels |
| GET | `/api/gamification/leaderboard` | Rankings |
| GET | `/api/gamification/leaderboard/rank` | My rank |
| GET | `/api/gamification/challenges` | Daily challenges |
| GET | `/api/gamification/levels` | Level definitions |

### Rooms (with Socket.IO)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/rooms` | Active rooms |
| POST | `/api/rooms` | Create room |
| GET | `/api/rooms/:id` | Room detail |
| POST | `/api/rooms/:id/join` | Join room |
| POST | `/api/rooms/:id/leave` | Leave room |
| GET | `/api/rooms/:id/participants` | Participants |
| GET | `/api/rooms/:id/messages` | Messages |

### Routines
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/routines/today` | Today's plan |
| POST | `/api/routines/generate` | Generate plan |
| POST | `/api/routines/slots/:id/complete` | Mark slot done |
| GET | `/api/routines/history` | Past routines |

### Reports
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/reports/weekly` | Weekly summary |
| GET | `/api/reports/monthly` | Monthly summary |
| GET | `/api/reports/custom` | Custom date range |

### Admin
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/stats` | Platform stats |
| GET | `/api/admin/users` | List users |
| PATCH | `/api/admin/users/:id` | Update user |
| DELETE | `/api/admin/users/:id` | Delete user |
| POST | `/api/admin/curriculum/subjects` | Create subject |
| PATCH | `/api/admin/curriculum/subjects/:id` | Update subject |
| POST | `/api/admin/curriculum/chapters` | Create chapter |
| POST | `/api/admin/curriculum/topics` | Create topic |
| GET/POST/PATCH/DELETE | `/api/admin/questions` | Question bank CRUD |
| POST/PATCH/DELETE | `/api/admin/badges` | Badge management |

Full API documentation is available at `/api/docs` when the backend is running (Swagger UI).

---

## Tech Stack

### Frontend
- **Framework:** Next.js 16.2.6 (Turbopack)
- **UI:** React 19.2, Tailwind CSS 3.4, shadcn/ui, Framer Motion 12
- **State:** Zustand 5, TanStack Query 5
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts
- **Icons:** Lucide React

### Backend
- **Framework:** NestJS 11
- **Auth:** Passport JWT + Supabase Auth
- **Realtime:** Socket.IO
- **Validation:** Zod
- **Security:** Helmet, CORS
- **PDF:** Puppeteer

### Database
- **Provider:** Supabase PostgreSQL
- **Extensions:** pg_stat_statements, uuid-ossp, pgcrypto
- **Features:** Row Level Security, SQL functions, triggers, materialized views

---

## License

MIT — see [LICENSE](./LICENSE)
