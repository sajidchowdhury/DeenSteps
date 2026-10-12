# DeenSteps — Deployment Guide

> **This file covers:** (1) pulling the latest code from this dev container to your local PC, (2) running it with Docker locally, (3) deploying the same image to a VPS, and (4) running the database migration that ships with Phase 5 (S5.1–S5.3).

---

## 0. What changed in this batch (S5.1 → S5.3)

Before deploying, here is what's new on `main` since the last sync:

| Commit | Scope |
|--------|-------|
| `8309e99` | S5.1 — `WeeklyReflection` + `FamilyAchievement` schema; weekly reflection section; gentle streak-break message (already on child dashboard from S1.3) |
| `979f4c9` | S5.2 — `MonthlyMilestone` calculation engine; learning prompts for all 41 TASK_LIBRARY entries; `MilestoneProgressSection` on parent dashboard; violet milestone card on child dashboard |
| `83d2acb` | S5.3 — `/planner` consolidated page; `FamilyAchievement` engine (8 achievements) wired into 6 action sites; planner nav link |

**New schema models:** `WeeklyReflection`, `FamilyAchievement`. No existing columns were dropped. Backfills are not needed (new tables start empty).

**New routes:** `/planner` only.

---

## 1. Prerequisites

You need both machines to have:

- **Git** (`git --version`)
- **Docker** + **Docker Compose** (`docker --version`, `docker compose version`)

If you don't yet have Docker on your local PC:
- **macOS / Windows:** install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- **Linux:** `curl -fsSL https://get.docker.com | sh` then `sudo usermod -aG docker $USER` (log out + back in)

For the VPS:
- Ubuntu 22.04+ or Debian 12+ (this guide assumes Ubuntu)
- A non-root user with sudo
- Open ports: 80 (HTTP) and 443 (HTTPS); 3000 only if you skip the reverse proxy
- A domain name pointing at the VPS (for SSL)

---

## 2. Getting the new code out of this dev container

This dev container does **not** have GitHub credentials configured, so `git push` from here fails. You have two ways to move the new commits to your local PC.

### Option A — Generate a patch bundle here, apply on your PC (recommended, no GitHub auth needed)

In this dev container, run:

```bash
cd /home/z/my-project
# Bundle the last 3 commits (S5.1 + S5.2 + S5.3) into a single file
git format-patch -3 HEAD --output-directory=/tmp/patches
# Inspect
ls /tmp/patches
# Should show: 0001-feat-S5.1-*.patch  0002-feat-S5.2-*.patch  0003-feat-S5.3-*.patch
# Pack into one tarball for easy download
tar -czf /tmp/deensteps-s5.patch.tar.gz -C /tmp/patches .
```

Then download `/tmp/deensteps-s5.patch.tar.gz` to your local PC (use whatever file-transfer method your environment provides — VS Code download, scp, web UI, etc.).

On your local PC:

```bash
cd /path/to/your/DeenSteps-clone
# Make sure you're on main and clean
git checkout main
git status

# Extract the patches
mkdir -p /tmp/patches
tar -xzf /path/to/deensteps-s5.patch.tar.gz -C /tmp/patches

# Apply in order
git am /tmp/patches/*.patch

# Verify
git log --oneline -5
# Should show the 3 new commits on top of your previous main
```

### Option B — Push from a machine that has GitHub auth, then pull on your PC

If you have a second machine with `gh` CLI or a configured git credential helper, push from there. Then on your local PC:

```bash
cd /path/to/your/DeenSteps-clone
git pull origin main
```

---

## 3. Local PC — run with Docker (recommended)

This is the simplest path. Docker handles the build, the migration, and the seed for you.

### 3.1 First-time setup (only once)

```bash
cd /path/to/your/DeenSteps-clone

# Copy the example env if you haven't already
cp .env.example .env
# Edit .env and set:
#   NEXTAUTH_SECRET="<run: openssl rand -base64 32>"
#   NEXTAUTH_URL="http://localhost:3000"
#   DATABASE_URL="file:/app/db/deensteps.db"   (already the default in docker-compose)
```

### 3.2 Build + run

```bash
docker compose up --build -d
```

That single command will:

1. Build the multi-stage Docker image (deps → builder → runner).
2. Start the container in the background (`-d`).
3. Run `docker-entrypoint.sh`, which in order:
   - `npx prisma generate` — regenerate the Prisma client from the new schema.
   - `npx prisma db push --accept-data-loss` — **this is the migration step.** It applies every new model (`WeeklyReflection`, `FamilyAchievement`) and every new field added in Phases 1–5 to your existing SQLite database. Existing rows are preserved; new columns get their declared defaults.
   - If `/app/db/.seeded` does not yet exist, run `node ./scripts/seed.js` to populate the demo family.
   - Start the Next.js standalone server on port 3000.

### 3.3 Watch the migration happen live

```bash
docker compose logs -f deensteps
```

You should see, in order:

```
🚀 Starting DeenSteps...
📦 Generating Prisma client...
🗄️  Pushing schema to database...
✨ Starting Next.js server on port 3000...
```

Press `Ctrl+C` to exit the log stream (the container keeps running).

### 3.4 Open the app

Visit **http://localhost:3000** in your browser.

Log in with the demo account:

```
Email:    parent@deensteps.demo
Password: Password123!
```

Then check the new things:

- The sidebar should now show **প্ল্যানার** (Planner). Click it → you'll land on `/planner`.
- Open the parent dashboard → scroll down → you should see **সাপ্তাহিক রিফ্লেকশন** (Weekly Reflection), **এই মাসের অগ্রগতি** (Monthly Milestone progress), and (once you approve a task) the **Family Achievement** section in `/planner` will start unlocking badges.
- Open a child dashboard (`/child/<id>`) → you should see the violet milestone progress card and each task should have a collapsible **শেখার প্রশ্ন** (Learning Prompt) chip.

### 3.5 Stopping / restarting

```bash
docker compose down           # stop, keep the DB volume
docker compose up -d          # restart, no rebuild
docker compose up --build -d  # rebuild after pulling new code
```

### 3.6 If the migration ever needs a clean slate (DESTRUCTIVE)

Only do this if you want to wipe all data and re-seed:

```bash
docker compose down -v        # -v removes the deensteps-db volume too
docker compose up --build -d
```

---

## 4. Local PC — run without Docker (developer mode)

Use this if you're actively editing the code.

```bash
cd /path/to/your/DeenSteps-clone

# Install dependencies
bun install                    # or: npm install

# Run the migration
bun run db:generate            # prisma generate
bun run db:push                # prisma db push --accept-data-loss

# (Optional) re-seed
bun run db:seed

# Start the dev server
bun run dev
```

App is at http://localhost:3000.

---

## 5. VPS deployment

This assumes a fresh Ubuntu 22.04+ VPS. If you already have an older DeenSteps deployment, jump to §5.4.

### 5.1 One-time server setup

SSH into your VPS as root (or a sudo user):

```bash
# Update + install Docker
apt update && apt upgrade -y
curl -fsSL https://get.docker.com | sh
systemctl enable --now docker

# Install Certbot for SSL (we'll use the standalone validator)
apt install -y certbot

# Create a non-root user for the app (optional but recommended)
adduser --disabled-password --gecos "" deensteps
usermod -aG docker deensteps
```

### 5.2 Get the code onto the VPS

Pick one — same choice as §2:

**Patch-bundle route (no GitHub auth):** upload `deensteps-s5.patch.tar.gz` from your PC to the VPS, then on the VPS:

```bash
sudo -u deensteps -i
cd ~
git clone <your-existing-repo-url-or-copy> DeenSteps   # if first time
# OR if DeenSteps already exists:
cd ~/DeenSteps
git checkout main

mkdir -p /tmp/patches
tar -xzf /path/to/deensteps-s5.patch.tar.gz -C /tmp/patches
git am /tmp/patches/*.patch
```

**Git-pull route (if you pushed from another machine):**

```bash
sudo -u deensteps -i
cd ~/DeenSteps
git pull origin main
```

### 5.3 First-time deploy (fresh VPS)

```bash
sudo -u deensteps -i
cd ~/DeenSteps

# Create a production .env (do NOT reuse the dev one)
cp .env.example .env
nano .env
```

Set the production env vars:

```env
NODE_ENV=production
DATABASE_URL=file:/app/db/deensteps.db
NEXTAUTH_SECRET=<run: openssl rand -base64 32>
NEXTAUTH_URL=https://your-domain.com
```

Then update `docker-compose.yml` to expose port 3001 (instead of 3000) so Nginx can reverse-proxy:

```bash
nano docker-compose.yml
```

Change the `ports:` block to:

```yaml
    ports:
      - "127.0.0.1:3001:3000"
```

(The `127.0.0.1:` prefix binds the port to localhost only — the public internet reaches it through Nginx, not directly.)

Now build and start:

```bash
docker compose up --build -d
docker compose logs -f deensteps    # watch the migration + seed complete, then Ctrl+C
```

### 5.4 Updating an existing VPS deploy

This is the routine "I have new code, push it to prod" flow:

```bash
sudo -u deensteps -i
cd ~/DeenSteps

# Get the new commits (use whichever route you chose in §5.2)
git pull origin main
# OR: git am /tmp/patches/*.patch

# Rebuild + restart. The entrypoint will run prisma db push automatically —
# the migration applies on container start.
docker compose up --build -d

# Watch the migration apply
docker compose logs -f deensteps
# Look for "🗄️  Pushing schema to database..." — when it says
# "✨ Starting Next.js server on port 3000..." you're done. Ctrl+C.
```

### 5.5 Nginx reverse proxy + SSL (first time only)

Install Nginx:

```bash
sudo apt install -y nginx
```

Create `/etc/nginx/sites-available/deensteps`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Let's Encrypt challenge handler (keep this during cert issuance)
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # Redirect everything else to HTTPS (after cert issuance)
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate     /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    client_max_body_size 20M;

    location / {
        proxy_pass         http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_set_header   Upgrade           $http_upgrade;
        proxy_set_header   Connection        "upgrade";
    }
}
```

Enable + issue cert:

```bash
sudo ln -s /etc/nginx/sites-available/deensteps /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t                      # test config
sudo systemctl reload nginx

# Issue the SSL cert (standalone mode temporarily stops Nginx)
sudo systemctl stop nginx
sudo certbot certonly --standalone -d your-domain.com --email you@example.com --agree-tos --no-eff-email
sudo systemctl start nginx

# Auto-renew
sudo systemctl enable --now certbot.timer
```

### 5.6 Verify the VPS deploy

Visit `https://your-domain.com`:

1. Log in with `parent@deensteps.demo` / `Password123!` (or your real account).
2. Click **প্ল্যানার** in the sidebar → `/planner` should load.
3. Check the parent dashboard → new sections (Weekly Reflection, Monthly Milestone progress) should appear.
4. Open a child dashboard → milestone progress card should be visible.

If anything looks wrong:

```bash
sudo -u deensteps -i
cd ~/DeenSteps
docker compose logs --tail=200 deensteps
```

---

## 6. Migration safety checklist

Before deploying to a VPS that has real family data:

- [ ] **Backup the SQLite database first:**

  ```bash
  sudo -u deensteps -i
  docker compose exec deensteps cp /app/db/deensteps.db /app/db/deensteps.db.bak.$(date +%Y%m%d)
  ```

- [ ] Test the migration on your local PC first (§3) using a copy of the production DB. The migration in this batch (S5.1 + S5.2 + S5.3) only **adds** new models and **adds** new fields with defaults — it does not drop or rename anything. So it is safe, but always back up.

- [ ] The `docker-entrypoint.sh` uses `prisma db push --accept-data-loss`. This is fine for the additive changes shipped in DeenSteps 2.0. If you ever introduce a destructive schema change in the future, switch to `prisma migrate deploy` with explicit migration files.

- [ ] The `.seeded` marker file in `/app/db/` prevents re-seeding on every restart. If you want a fresh demo seed on the VPS: `docker compose exec deensteps rm /app/db/.seeded && docker compose restart`.

---

## 7. Quick troubleshooting

| Symptom | Fix |
|---------|-----|
| `EADDRINUSE: address already in use :::3000` | Another process is on port 3000. `docker compose down` then `docker compose up -d`. Or change the port mapping in `docker-compose.yml`. |
| Login screen loops / `NEXTAUTH_SECRET` error | You didn't set `NEXTAUTH_SECRET`. Generate one with `openssl rand -base64 32` and put it in `.env` (and in `docker-compose.yml` `environment:` block). |
| Migration stuck / `PrismaClientInitializationError` | The DB volume might be corrupt. Stop the container, backup the file, then either `docker compose down -v` (DESTRUCTIVE) or `docker compose exec deensteps rm /app/db/deensteps.db` and restart. |
| 404 on `/planner` | You built the image before pulling the new code. `docker compose up --build -d` forces a rebuild. |
| FamilyAchievement badges not unlocking | They auto-evaluate on the next qualifying action (approve a task, save a reflection, confirm a sadaqah, resolve an incident). Try approving one task — the `first_week` badge should unlock within seconds. |
| Old data looks weird after migration | The migration is purely additive. Old rows have `null` for new optional fields. This is expected. New actions will populate them going forward. |

---

## 8. Rollback (if something goes wrong)

If the new code misbehaves on the VPS:

```bash
sudo -u deensteps -i
cd ~/DeenSteps

# Stop the new container
docker compose down

# Restore the database backup (if you made one in §6)
cp /app/db/deensteps.db.bak.YYYYMMDD /app/db/deensteps.db   # adjust path
# (Or: docker compose run --rm --entrypoint cp deensteps /app/db/deensteps.db.bak.YYYYMMDD /app/db/deensteps.db)

# Checkout the previous commit
git log --oneline -5
git checkout <previous-commit-hash>

# Rebuild + start
docker compose up --build -d
```

The schema migration does not modify existing rows in a breaking way, so rolling back the code is safe even if the DB has the new tables. They'll just be ignored.

---

**That's the whole deployment story.** If anything in here is unclear, copy the relevant command + its output and we'll debug together.
