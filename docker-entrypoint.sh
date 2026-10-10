#!/bin/sh
set -e

echo "🚀 Starting DeenSteps..."

echo "📦 Generating Prisma client..."
npx prisma generate

echo "🗄️  Pushing schema to database..."
npx prisma db push --accept-data-loss

# Seed if the database hasn't been seeded yet (check for a marker file)
if [ ! -f /app/db/.seeded ]; then
  echo "🌱 Seeding demo data..."
  node ./scripts/seed.js && touch /app/db/.seeded
  echo "✅ Seed complete."
else
  echo "✅ Database already seeded — skipping."
fi

echo "✨ Starting Next.js server on port 3000..."
exec node server.js
