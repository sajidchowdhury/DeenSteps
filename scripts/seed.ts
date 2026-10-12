/**
 * DeenSteps seed script — minimal version
 * Creates a demo family with 2 children, rewards, and achievements.
 * NO default tasks/challenges — user adds them from the suggestion button.
 *
 * Run with: bun run db:seed
 * Login: parent@deensteps.demo / Password123!
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding DeenSteps demo data...')

  // ── Parent user ────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('Password123!', 10)
  const parent = await prisma.user.upsert({
    where: { email: 'parent@deensteps.demo' },
    update: {},
    create: {
      email: 'parent@deensteps.demo',
      name: 'Aisha Rahman',
      passwordHash,
    },
  })
  console.log(`  ✓ Parent: ${parent.email}`)

  // ── Family ─────────────────────────────────────────────────────────────
  const family = await prisma.family.upsert({
    where: { id: 'demo-family-id' },
    update: {},
    create: {
      id: 'demo-family-id',
      name: 'The Rahman Family',
      timezone: 'Asia/Dhaka',
      locale: 'bn',
      createdBy: parent.id,
    },
  })
  await prisma.familyMembership.upsert({
    where: { id: 'demo-membership-id' },
    update: {},
    create: {
      id: 'demo-membership-id',
      familyId: family.id,
      userId: parent.id,
      role: 'PARENT',
    },
  })

  await prisma.familySettings.upsert({
    where: { familyId: family.id },
    update: {},
    create: {
      familyId: family.id,
      defaultApprovalPolicy: 'MANUAL',
      pointsName: 'তারা',
      weeklyStartDay: 'SUNDAY',
      monthlyPlanType: 'FOUR_WEEK',
      monthlyQualifyingWeeks: 3,
    },
  })
  console.log(`  ✓ Family: ${family.name}`)

  // ── Children ───────────────────────────────────────────────────────────
  const zayd = await prisma.childProfile.upsert({
    where: { id: 'demo-child-zayd' },
    update: {},
    create: {
      id: 'demo-child-zayd',
      familyId: family.id,
      displayName: 'Zayd',
      avatarColor: 'emerald',
      ageRange: '6-8',
      preferredLanguage: 'bn',
      status: 'ACTIVE',
    },
  })

  const maryam = await prisma.childProfile.upsert({
    where: { id: 'demo-child-maryam' },
    update: {},
    create: {
      id: 'demo-child-maryam',
      familyId: family.id,
      displayName: 'Maryam',
      avatarColor: 'amber',
      ageRange: '9-12',
      preferredLanguage: 'bn',
      status: 'ACTIVE',
    },
  })
  console.log(`  ✓ Children: ${zayd.displayName}, ${maryam.displayName}`)

  // ── Rewards (পুরস্কার — সহজ বাংলা) ────────────────────────────────────
  const rewards = [
    { id: 'demo-reward-0', title: 'বাসায় পিৎজা', iconKey: 'utensils', requiredPoints: 40, description: 'বাসায় পিৎজা অর্ডার করা হবে।', category: 'FOOD', maxPerWeek: 1, maxPerMonth: 2, cooldownDays: 5, estimatedCost: 400 },
    { id: 'demo-reward-1', title: 'বাসায় বার্গার', iconKey: 'utensils', requiredPoints: 30, description: 'বাসায় বার্গার বানানো হবে।', category: 'FOOD', maxPerWeek: 1, maxPerMonth: 2, cooldownDays: 5, estimatedCost: 200 },
    { id: 'demo-reward-2', title: 'বিকেলের নাস্তা রেস্টুরেন্টে', iconKey: 'utensils', requiredPoints: 60, description: 'বিকেলে রেস্টুরেন্টে নাস্তা।', category: 'FOOD', maxPerWeek: null, maxPerMonth: 1, cooldownDays: 14, estimatedCost: 300 },
    { id: 'demo-reward-3', title: 'আইসক্রিম', iconKey: 'gift', requiredPoints: 20, description: 'পছন্দের আইসক্রিম।', category: 'FOOD', maxPerWeek: 1, maxPerMonth: 2, cooldownDays: 4, estimatedCost: 100 },
    { id: 'demo-reward-4', title: 'ফ্যামিলি গেম নাইট', iconKey: 'dice', requiredPoints: 50, description: 'পরিবার মিলে গেম খেলা।', category: 'EXPERIENCE', maxPerWeek: 2, maxPerMonth: null, cooldownDays: 2, estimatedCost: 0 },
    { id: 'demo-reward-5', title: 'পার্কে খেলতে যাওয়া', iconKey: 'map', requiredPoints: 35, description: 'পার্কে খেলতে যাওয়া।', category: 'EXPERIENCE', maxPerWeek: 3, maxPerMonth: null, cooldownDays: 1, estimatedCost: 0 },
    { id: 'demo-reward-6', title: 'নতুন একটি বই', iconKey: 'book', requiredPoints: 70, description: 'নতুন একটি বই।', category: 'LEARNING', maxPerWeek: null, maxPerMonth: 2, cooldownDays: 7, estimatedCost: 300 },
    { id: 'demo-reward-7', title: 'সিনেমা/কার্টুন দেখা', iconKey: 'star', requiredPoints: 45, description: 'পছন্দের সিনেমা বা কার্টুন।', category: 'EXPERIENCE', maxPerWeek: 1, maxPerMonth: 4, cooldownDays: 3, estimatedCost: 0 },
  ]
  for (const r of rewards) {
    await prisma.reward.upsert({
      where: { id: r.id },
      update: {},
      create: { familyId: family.id, status: 'ACTIVE', rewardType: 'POINTS', requiresApproval: true, ...r },
    })
  }
  console.log(`  ✓ ${rewards.length} rewards`)

  // ── Achievements ───────────────────────────────────────────────────────
  const achievements = [
    { key: 'first_steps', name: 'প্রথম পদক্ষেপ', description: 'তোমার প্রথম কাজ সম্পন্ন!', iconKey: 'footprints' },
    { key: 'consistency_champion', name: 'ধারাবাহিকতার চ্যাম্পিয়ন', description: '৫ দিন ধরে কাজ সম্পন্ন করেছ।', iconKey: 'flame' },
    { key: 'quran_milestone', name: 'কুরআন মাইলস্টোন', description: '৭ দিন কুরআন পড়েছ।', iconKey: 'book-open' },
    { key: 'kindness_in_action', name: 'দয়ার অভ্যাস', description: '১০টি দয়ার কাজ করেছ।', iconKey: 'heart' },
    { key: 'responsibility_star', name: 'দায়িত্বের তারকা', description: '২০টি দায়িত্বের কাজ করেছ।', iconKey: 'star' },
    { key: 'weekly_goal', name: 'সাপ্তাহিক লক্ষ্য অর্জন', description: 'সাপ্তাহিক লক্ষ্য পূরণ করেছ।', iconKey: 'target' },
  ]
  for (const a of achievements) {
    await prisma.achievement.upsert({
      where: { familyId_key: { familyId: family.id, key: a.key } },
      update: {},
      create: { familyId: family.id, ...a },
    })
  }
  console.log(`  ✓ ${achievements.length} achievement definitions`)

  // NOTE: কোনো ডিফল্ট চ্যালেঞ্জ/কাজ নেই। ব্যবহারকারী সাজেশন থেকে বাছাই করবেন।

  console.log('\n✅ Seed complete!')
  console.log('────────────────────────────────────────')
  console.log('Login:  parent@deensteps.demo')
  console.log('Pass:   Password123!')
  console.log('────────────────────────────────────────')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
