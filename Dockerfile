# ──────────────────────────────────────────────────────────────────────────
# DeenSteps — Dockerfile (multi-stage, standalone Next.js build)
# ──────────────────────────────────────────────────────────────────────────

# Stage 1: Install dependencies
FROM node:20-slim AS deps
WORKDIR /app

# Install bun for fast installs
RUN npm install -g bun

# Copy lockfile and package.json
COPY package.json bun.lock* package-lock.json* ./
COPY prisma ./prisma

# Install dependencies
RUN bun install --frozen-lockfile || npm install

# ──────────────────────────────────────────────────────────────────────────

# Stage 2: Build the application
FROM node:20-slim AS builder
WORKDIR /app

RUN npm install -g bun

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN bun run db:generate || npx prisma generate

# Build Next.js (standalone output)
RUN bun run build || npm run build

# ──────────────────────────────────────────────────────────────────────────

# Stage 3: Production runner
FROM node:20-slim AS runner
WORKDIR /app

# Install openssl (needed by Prisma) and create db directory
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && \
    rm -rf /var/lib/apt/lists/* && \
    mkdir -p /app/db

# Set environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="file:/app/db/deensteps.db"
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Copy standalone build + static + public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy Prisma schema + seed script so we can run migrations on startup
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/bcryptjs ./node_modules/bcryptjs
COPY --from=builder /app/package.json ./package.json

# Copy entrypoint
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Expose port
EXPOSE 3000

# Volume for persistent SQLite database
VOLUME ["/app/db"]

# Entrypoint: run migrations + seed, then start the server
ENTRYPOINT ["/app/docker-entrypoint.sh"]
