# DeenSteps

**Small Good Habits. Meaningful Growth.**

A joyful family habit-building platform that helps parents nurture Islamic practices, good character, daily responsibility, and consistency through personalized tasks and meaningful rewards.

---

## ✨ Features

- **Family workspace** — one parent account manages multiple child profiles
- **Task management** — daily, weekday, weekly, and custom recurring tasks with categories (Islamic Practices, Character & Manners, Personal Responsibility, Learning & Development)
- **Parent approval workflow** — review submissions, approve, request revisions, or reject with constructive notes
- **Points ledger** — every point earned/spent/refunded is an immutable transaction record with a running balance
- **Rewards catalog** — point-based and achievement-based rewards with atomic redemption (overspend-proof)
- **Weekly challenges** — configurable target completion % with per-child progress
- **Monthly milestones** — aggregate weekly results (configurable qualifying weeks)
- **Achievement badges** — celebrate consistency, kindness, responsibility, and milestones
- **Child dashboard** — colorful, age-appropriate, celebrates personal progress (never sibling comparison)
- **Reports** — daily, weekly, and monthly views with charts
- **Family isolation** — every query is scoped to the authenticated family; IDOR-protected
- **Islamic habit library** — optional, configurable templates (prayer, Quran, dua, honesty, kindness, gratitude)
- **Responsive + dark mode** — works on phones, tablets, laptops, desktops

> **Note on values:** Points never measure a child's faith, piety, or spiritual worth. Rewards are tools for encouragement and habit development — not a replacement for sincere intention, parental guidance, or Islamic education.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS 4 + shadcn/ui + Lucide icons |
| Database | Prisma ORM (SQLite for dev; designed for PostgreSQL) |
| Auth | NextAuth.js v4 (credentials provider) |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Runtime | Node.js 20+ or Bun |

---

## 🚀 Quick Start with Docker (recommended)

You need **Docker** and **Docker Compose** installed. That's it — no Node.js, no database setup required.

### 1. Clone the repository

```bash
git clone https://github.com/sajidchowdhury/DeenSteps.git
cd DeenSteps
```

### 2. (Optional) Customize environment

The defaults in `docker-compose.yml` work out of the box, but you should change the `NEXTAUTH_SECRET` for any non-local use:

```bash
# Generate a strong secret
openssl rand -base64 32
```

Edit `docker-compose.yml` and replace `change-me-to-a-long-random-string-please` with your generated secret.

### 3. Build and run

```bash
docker compose up --build
```

The first build takes ~2–3 minutes. Subsequent starts are instant.

### 4. Open the app

Visit **http://localhost:3000**

### 5. Sign in with the demo account

```
Email:    parent@deensteps.demo
Password: Password123!
```

This loads **The Rahman Family** with two children (Zayd, Maryam), 10 task templates, 6 days of history, 5 rewards, and an active weekly challenge.

---

## 🐳 Docker Commands

```bash
# Build and start (foreground, see logs)
docker compose up --build

# Start in background (detached)
docker compose up -d --build

# View logs
docker compose logs -f deensteps

# Stop the app
docker compose down

# Stop and delete the database (fresh start)
docker compose down -v
```

The SQLite database is persisted in a Docker volume (`deensteps-db`), so your data survives container restarts and rebuilds.

---

## 💻 Local Development (without Docker)

Requires **Node.js 20+** and **Bun** (or npm).

### 1. Clone and install

```bash
git clone https://github.com/sajidchowdhury/DeenSteps.git
cd DeenSteps
bun install   # or: npm install
```

### 2. Set up environment

```bash
cp .env.example .env
```

Edit `.env`:
```
DATABASE_URL="file:./db/deensteps.db"
NEXTAUTH_SECRET="any-random-string-for-dev"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Initialize the database and seed

```bash
bun run db:push    # Create tables
bun run db:seed    # Load demo data
```

### 4. Start the dev server

```bash
bun run dev
```

Visit **http://localhost:3000** and sign in with `parent@deensteps.demo` / `Password123!`.

---

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start the dev server on port 3000 |
| `bun run build` | Production build (standalone output) |
| `bun run start` | Start the production server |
| `bun run lint` | Run ESLint |
| `bun run db:push` | Push schema to database (creates/updates tables) |
| `bun run db:generate` | Regenerate Prisma client |
| `bun run db:seed` | Seed demo data |
| `bun run db:reset` | Reset database (⚠️ destructive) |

---

## 🗺 Project Structure

```
DeenSteps/
├── prisma/
│   └── schema.prisma           # Database schema (22 models)
├── scripts/
│   ├── seed.ts                 # Seed script (TypeScript, run with bun)
│   └── seed.js                 # Compiled seed (for Docker/node)
├── src/
│   ├── app/
│   │   ├── page.tsx            # Marketing landing page (/)
│   │   ├── layout.tsx          # Root layout (providers, fonts)
│   │   ├── login/              # Sign-in page
│   │   ├── register/           # Sign-up page (creates family)
│   │   ├── onboarding/         # 7-step family setup wizard
│   │   ├── child/[id]/         # Child dashboard
│   │   ├── (app)/              # Authenticated parent area
│   │   │   ├── dashboard/      # Family control center
│   │   │   ├── children/       # Child profile management
│   │   │   ├── tasks/          # Task template management
│   │   │   ├── review/         # Parent review center
│   │   │   ├── rewards/        # Reward catalog + redemptions
│   │   │   ├── challenges/     # Weekly challenges
│   │   │   ├── reports/        # Daily/weekly/monthly reports
│   │   │   └── settings/       # Family settings
│   │   └── api/auth/[...nextauth]/  # NextAuth handler
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── deensteps/          # App-specific components
│   │   ├── marketing/          # Landing page sections
│   │   └── providers/          # Theme, session, query providers
│   ├── lib/
│   │   ├── auth/               # NextAuth config + session helpers
│   │   ├── constants.ts        # Task library, categories, config
│   │   ├── db.ts               # Prisma client
│   │   └── utils.ts            # Shared utilities
│   └── server/
│       └── actions/            # Server actions (mutations)
│           ├── auth-actions.ts
│           ├── child-actions.ts
│           ├── task-actions.ts
│           ├── review-actions.ts
│           ├── reward-actions.ts
│           ├── dashboard-actions.ts
│           ├── challenge-actions.ts
│           └── settings-actions.ts
├── Dockerfile                  # Multi-stage production build
├── docker-compose.yml          # App + volume for SQLite
├── docker-entrypoint.sh        # Migrate + seed + start
├── .env.example                # Environment template
└── package.json
```

---

## 🔐 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | SQLite file path, e.g. `file:./db/deensteps.db` |
| `NEXTAUTH_SECRET` | Yes | Random string for signing JWTs (use `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Yes | Public URL of the deployment (e.g. `http://localhost:3000`) |

---

## 🧪 Try the Key User Journeys

After signing in as `parent@deensteps.demo`:

1. **Approve a task** → Review Center → click **Approve** on a pending submission → watch the child's star balance update atomically.
2. **Submit a task as a child** → Click a child's avatar in the sidebar → on their dashboard, click **Mark as done** on a task → return to Review Center to see the new submission.
3. **Redeem a reward** → On the child dashboard, click **Redeem reward** on an eligible reward → return to Rewards → approve the redemption.
4. **Create a new task** → Tasks → **New task** or **Import from library**.
5. **View reports** → Reports tab → switch between Daily / Weekly / Monthly views.

---

## 🔄 Switching to PostgreSQL (for production)

The schema is designed for PostgreSQL. To switch:

1. Edit `prisma/schema.prisma` — change the datasource provider:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Set `DATABASE_URL` to your Postgres connection string.
3. Run `bun run db:push` to create tables in Postgres.
4. Run `bun run db:seed` to load demo data.

---

## 📐 Design System

- **Primary**: Deep emerald green
- **Secondary**: Soft sage
- **Accent**: Warm amber / muted gold
- **Background**: Warm off-white
- **Typography**: Plus Jakarta Sans (display), Geist Sans (body)
- **Patterns**: Subtle Islamic-inspired geometric patterns in hero/sections
- **Dark mode**: Full support via `next-themes`

---

## ⚠️ Important Notes

- **Child safety**: Children access their dashboard through the parent-managed family workspace — no email or separate account required for kids.
- **Privacy**: All family data is isolated. No third-party advertising, no behavioral tracking.
- **Islamic content**: All habit templates are optional suggestions. Review any Quranic/hadith references with a qualified person before publishing.
- **Payments**: Pricing is shown as sample only. No payment integration is configured — the app never simulates successful payments.

---

## 📄 License

This project is provided as-is for the DeenSteps family. Customize freely for your family's use.

---

**Built with care for families. Made for parents, loved by children.** 🌙
