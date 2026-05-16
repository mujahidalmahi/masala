# StudySprint OS - Database

PostgreSQL (Supabase) database schema for the StudySprint OS student platform.

## Architecture Layers

| Layer | Description | Tables |
|-------|-------------|--------|
| **Layer 1: Study Data** | What the student studied, when, and for how long | `study_sessions`, `daily_logs`, `textbooks`, `uploaded_files` |
| **Layer 2: Learning Intelligence** | What topics they mastered, what they missed, and what to study next | `questions`, `quizzes`, `quiz_attempts`, `weak_areas`, `mastery_snapshots` |
| **Layer 3: Motivation Engine** | Streaks, XP, levels, badges, rooms, and competition | `xp_transactions`, `levels`, `badges`, `focus_rooms`, `leaderboard_snapshots` |
| **Layer 4: Academic Outcome** | Practice scores, predictions, routines, and reports | `prediction_results`, `user_routines`, `report_history` |

## File Structure

```
database/
├── README.md
├── migrations/
│   ├── 001_schema_core.sql          Countries, boards, grades, subjects, chapters, topics, profiles
│   ├── 002_schema_tracking.sql       Study sessions, daily logs, textbooks, uploads
│   ├── 003_schema_gamification.sql   XP, levels, badges, skills, streaks, challenges
│   ├── 004_schema_questions.sql      Questions, quizzes, attempts, answers
│   ├── 005_schema_rooms.sql          Focus rooms, participants, messages
│   ├── 006_schema_predictions.sql    Predictions, mastery, reports, routines
│   └── 009_indexes.sql               Performance indexes
├── functions/
│   ├── 001_xp_functions.sql          XP calculation, add_xp(), level-up logic
│   ├── 002_streak_functions.sql      Streak updates, session-end processing
│   ├── 003_mastery_functions.sql     Mastery calculation, weak areas, routine generation
│   ├── 004_quiz_functions.sql        Quiz generation, submission, scoring
│   └── 005_leaderboard_functions.sql Leaderboard, ranking, predictions
├── policies/
│   └── 001_rls_policies.sql          Row Level Security for all tables
└── seed/
    └── 010_seed_data.sql             Levels, badges, countries, boards, sample curriculum
```

## Setup Instructions

### 1. Run Migrations in Order

Execute the migration files in numeric order in the Supabase SQL Editor:

```sql
-- 1. Core schema (enables extensions, creates curriculum + profiles)
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

### 2. Deploy Functions

```sql
\i database/functions/001_xp_functions.sql
\i database/functions/002_streak_functions.sql
\i database/functions/003_mastery_functions.sql
\i database/functions/004_quiz_functions.sql
\i database/functions/005_leaderboard_functions.sql
```

### 3. Enable RLS

```sql
\i database/policies/001_rls_policies.sql
```

### 4. Seed Data (Optional)

```sql
\i database/seed/010_seed_data.sql
```

## Key Tables

### Curriculum (Read-only for most users)
- `countries` → `boards` → `grades` → `grade_subjects` → `subjects`
- `subjects` → `chapters` → `topics` → `learning_outcomes`

### User Data (User-owned)
- `profiles` - Extends `auth.users` with XP, level, streak, curriculum link
- `study_sessions` - Every focus/study session logged
- `daily_logs` - Auto-aggregated daily summary
- `textbooks` / `uploaded_files` / `extracted_content` - Study materials

### Gamification
- `xp_transactions` - Audit log for all XP changes
- `levels` - Level definitions (1-10)
- `badges` / `user_badges` - Achievement system
- `user_skills` - Per-subject mastery tracking (0-100)
- `streak_records` - Daily streak data
- `daily_challenges` / `user_challenges` - Optional daily tasks

### Assessment
- `questions` - Reusable question bank linked to topics
- `question_options` - MCQ options
- `quizzes` - Grouped question sets
- `quiz_attempts` / `user_answers` - Student responses and scoring

### Social
- `focus_rooms` - Live virtual study rooms
- `room_participants` - Who is in which room
- `room_messages` - Chat messages
- `room_focus_sessions` - Individual focus timer sessions

### Analytics
- `prediction_results` - AI-driven performance predictions
- `mastery_snapshots` - Topic mastery over time
- `weak_areas` - Identified weak topics
- `user_routines` / `routine_slots` - Dynamic daily plans
- `report_history` - Generated PDF reports

## Key Functions

| Function | Purpose |
|----------|---------|
| `add_xp()` | Add XP to user, auto level-up, create transaction log |
| `update_streak()` | Check and update daily streak, return bonus XP |
| `process_study_session_end()` | Trigger: auto-calculate XP, update streak, create daily log |
| `calculate_topic_mastery()` | Compute mastery % from study time + quiz scores |
| `generate_topic_quiz()` | Auto-create a quiz from the question bank |
| `submit_quiz_attempt()` | Score quiz, update weak areas, award XP |
| `generate_daily_routine()` | Build a study plan from weak areas + recent topics |
| `generate_performance_prediction()` | Predict future scores from consistency + quiz data |
| `get_leaderboard()` | Rank users by XP or streak |
| `get_weak_topics()` | Return unresolved weak topics sorted by severity |

## RLS Strategy

- **Public read**: Countries, boards, grades, subjects, chapters, topics, levels, badges
- **Owner only**: Study sessions, daily logs, textbooks, XP transactions, quizzes, attempts, predictions, routines, reports
- **Room access**: Active rooms are viewable by all authenticated users
- **Admin functions**: XP updates, streak management run with `SECURITY DEFINER`
