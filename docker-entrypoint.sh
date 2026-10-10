#!/bin/sh
set -e

echo "🚀 Starting DeenSteps..."

# Call the Prisma CLI directly via node (avoids npx/.bin symlink issues)
PRISMA="node /app/node_modules/prisma/build/index.js"

echo "📦 Generating Prisma client..."
$PRISMA generate

echo "🗄️  Pushing schema to database..."
$PRISMA db push --accept-data-loss

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
