# ──────────────────────────────────────────────────────────────────────────
# DeenSteps — Dockerfile (multi-stage, standalone Next.js build)
# ──────────────────────────────────────────────────────────────────────────

# Stage 1: Install dependencies
FROM node:20-slim AS deps
WORKDIR /app

RUN npm install -g bun

COPY package.json bun.lock* package-lock.json* ./
COPY prisma ./prisma

RUN bun install --frozen-lockfile || npm install

# ──────────────────────────────────────────────────────────────────────────

# Stage 2: Build the application
FROM node:20-slim AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

RUN npm install -g bun

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN bun run db:generate || npx prisma generate
RUN bun run build || npm run build

# ──────────────────────────────────────────────────────────────────────────

# Stage 3: Production runner
FROM node:20-slim AS runner
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && \
    rm -rf /var/lib/apt/lists/* && \
    mkdir -p /app/db

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="file:/app/db/deensteps.db"
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Copy standalone Next.js server (includes server.js + trimmed node_modules)
COPY --from=builder /app/.next/standalone ./
# Copy FULL node_modules (overwrites trimmed one — needed for prisma CLI + all transitive deps)
COPY --from=builder /app/node_modules ./node_modules
# Copy static assets
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
# Copy Prisma schema + scripts for runtime migrations/seed
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/package.json ./package.json

# Copy entrypoint
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN sed -i 's/\r$//' /app/docker-entrypoint.sh && chmod +x /app/docker-entrypoint.sh

EXPOSE 3000

VOLUME ["/app/db"]

ENTRYPOINT ["/app/docker-entrypoint.sh"]
