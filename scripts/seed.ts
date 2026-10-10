/**
 * DeenSteps seed script
 * Creates a demo family with 2 children, tasks, submissions, points, rewards, and a weekly challenge.
 *
 * Run with: bun run db:seed
 * Login: parent@deensteps.demo / Password123!
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

function daysFromNow(days: number, hour = 0, minute = 0): Date {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(hour, minute, 0, 0)
  return d
}

function startOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

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
      locale: 'en',
      createdBy: parent.id,
    },
  })
  await prisma.familyMembership.upsert({
    where: {
      id: 'demo-membership-id',
    },
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
      pointsName: 'Stars',
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
      birthDate: daysFromNow(-7 * 365), // ~7 years
      preferredLanguage: 'en',
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
      birthDate: daysFromNow(-10 * 365), // ~10 years
      preferredLanguage: 'en',
      status: 'ACTIVE',
    },
  })
  console.log(`  ✓ Children: ${zayd.displayName}, ${maryam.displayName}`)

  // ── Task templates (Islamic, Character, Responsibility, Learning) ──────
  const taskDefs = [
    {
      title: 'Morning Prayer (Fajr)',
      description: 'Practice waking up and praying Fajr on time.',
      category: 'Islamic Practices',
      subcategory: 'Daily Prayer',
      iconKey: 'sunrise',
      pointsValue: 3,
      frequency: 'DAILY',
      dueTime: '05:30',
      approvalPolicy: 'MANUAL',
    },
    {
      title: 'Quran Reading (Morning)',
      description: 'Read a small portion of the Quran after Fajr.',
      category: 'Islamic Practices',
      subcategory: 'Quran Reading',
      iconKey: 'book-open',
      pointsValue: 2,
      frequency: 'DAILY',
      dueTime: '06:30',
      approvalPolicy: 'MANUAL',
    },
    {
      title: 'Daily Dua Practice',
      description: 'Learn and recite one short dua today.',
      category: 'Islamic Practices',
      subcategory: 'Dua',
      iconKey: 'sparkles',
      pointsValue: 1,
      frequency: 'DAILY',
      dueTime: '19:00',
      approvalPolicy: 'MANUAL',
    },
    {
      title: 'Speak Kindly Today',
      description: 'Use kind words with family members all day.',
      category: 'Character & Manners',
      subcategory: 'Kindness',
      iconKey: 'heart',
      pointsValue: 2,
      frequency: 'DAILY',
      approvalPolicy: 'MANUAL',
    },
    {
      title: 'Make My Bed',
      description: 'Make the bed neatly after waking up.',
      category: 'Personal Responsibility',
      subcategory: 'Morning Routine',
      iconKey: 'bed',
      pointsValue: 1,
      frequency: 'DAILY',
      dueTime: '07:30',
      approvalPolicy: 'AUTO',
    },
    {
      title: 'Tidy Up Toys',
      description: 'Put away toys and books before bed.',
      category: 'Personal Responsibility',
      subcategory: 'Evening Routine',
      iconKey: 'package',
      pointsValue: 1,
      frequency: 'DAILY',
      dueTime: '20:00',
      approvalPolicy: 'AUTO',
    },
    {
      title: 'Reading Practice',
      description: 'Read a book for at least 20 minutes.',
      category: 'Learning & Development',
      subcategory: 'Reading',
      iconKey: 'book',
      pointsValue: 2,
      frequency: 'DAILY',
      dueTime: '18:00',
      approvalPolicy: 'MANUAL',
    },
    {
      title: 'Homework Time',
      description: 'Complete today\u2019s homework assignments.',
      category: 'Learning & Development',
      subcategory: 'Homework',
      iconKey: 'pencil',
      pointsValue: 3,
      frequency: 'WEEKDAYS',
      dueTime: '17:00',
      approvalPolicy: 'MANUAL',
    },
    {
      title: 'Help a Family Member',
      description: 'Find one way to help someone in the family today.',
      category: 'Character & Manners',
      subcategory: 'Helpfulness',
      iconKey: 'hand-heart',
      pointsValue: 2,
      frequency: 'DAILY',
      approvalPolicy: 'MANUAL',
    },
    {
      title: 'Practice Gratitude',
      description: 'Share three things you are grateful for today.',
      category: 'Character & Manners',
      subcategory: 'Gratitude',
      iconKey: 'smile',
      pointsValue: 1,
      frequency: 'DAILY',
      dueTime: '19:30',
      approvalPolicy: 'MANUAL',
    },
  ]

  const tasks: { id: string; title: string; category: string; pointsValue: number; approvalPolicy: string }[] = []
  for (let i = 0; i < taskDefs.length; i++) {
    const def = taskDefs[i]
    const id = `demo-task-${i}`
    const t = await prisma.taskTemplate.upsert({
      where: { id },
      update: {},
      create: {
        id,
        familyId: family.id,
        title: def.title,
        description: def.description,
        category: def.category,
        subcategory: def.subcategory,
        iconKey: def.iconKey,
        pointsValue: def.pointsValue,
        frequency: def.frequency,
        dueTime: def.dueTime,
        approvalPolicy: def.approvalPolicy as 'MANUAL' | 'AUTO',
        status: 'ACTIVE',
      },
    })
    tasks.push({ id: t.id, title: t.title, category: t.category, pointsValue: t.pointsValue, approvalPolicy: t.approvalPolicy })
  }
  console.log(`  ✓ ${tasks.length} task templates`)

  // ── Assign tasks to both children ──────────────────────────────────────
  // Skip "Homework" for the younger child (Zayd)
  for (const task of tasks) {
    if (task.title === 'Homework Time') {
      await prisma.taskAssignment.upsert({
        where: { id: `assign-${task.id}-maryam` },
        update: {},
        create: { id: `assign-${task.id}-maryam`, taskId: task.id, childId: maryam.id },
      })
    } else {
      await prisma.taskAssignment.upsert({
        where: { id: `assign-${task.id}-zayd` },
        update: {},
        create: { id: `assign-${task.id}-zayd`, taskId: task.id, childId: zayd.id },
      })
      await prisma.taskAssignment.upsert({
        where: { id: `assign-${task.id}-maryam` },
        update: {},
        create: { id: `assign-${task.id}-maryam`, taskId: task.id, childId: maryam.id },
      })
    }
  }
  console.log(`  ✓ Task assignments created`)

  // ── Generate task occurrences for the last 7 days + today ──────────────
  const today = startOfDay(new Date())
  const occurrenceIds: { [key: string]: string } = {}
  for (let dayOffset = -6; dayOffset <= 0; dayOffset++) {
    const date = startOfDay(new Date(today))
    date.setDate(date.getDate() + dayOffset)
    const weekday = date.toLocaleDateString('en', { weekday: 'short' }).toUpperCase() // SUN, MON, ...
    const isWeekday = ['MON', 'TUE', 'WED', 'THU', 'FRI'].includes(weekday)

    for (const task of tasks) {
      // Skip weekday-only tasks on weekends
      if (task.title === 'Homework Time' && !isWeekday) continue

      const occId = `occ-${task.id}-${dayOffset}`
      const existing = await prisma.taskOccurrence.findUnique({ where: { id: occId } })
      if (existing) continue

      await prisma.taskOccurrence.create({
        data: {
          id: occId,
          taskId: task.id,
          scheduledDate: date,
          dueTime: taskDefs.find((d) => d.title === task.title)?.dueTime ?? null,
          status: 'ASSIGNED',
        },
      })
    }
  }

  // ── Simulate submissions + approvals for the past 6 days (history) ─────
  // For Zayd: ~80% completion, all approved
  // For Maryam: ~70% completion, mix of approved
  const seedRandom = (seed: number) => () => {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }
  const rng = seedRandom(42)

  async function processHistory(childId: string, completionRate: number, childName: string) {
    let runningBalance = 0
    for (let dayOffset = -6; dayOffset <= -1; dayOffset++) {
      const date = startOfDay(new Date(today))
      date.setDate(date.getDate() + dayOffset)

      // Get all occurrences for this child on this date
      const childAssignments = await prisma.taskAssignment.findMany({
        where: { childId },
        select: { taskId: true },
      })
      const taskIds = childAssignments.map((a) => a.taskId)

      for (const taskId of taskIds) {
        const occId = `occ-${taskId}-${dayOffset}`
        const occ = await prisma.taskOccurrence.findUnique({ where: { id: occId } })
        if (!occ || occ.status !== 'ASSIGNED') continue

        const task = tasks.find((t) => t.id === taskId)!
        // Skip weekday-only on weekends
        const weekday = date.toLocaleDateString('en', { weekday: 'short' }).toUpperCase()
        const isWeekday = ['MON', 'TUE', 'WED', 'THU', 'FRI'].includes(weekday)
        if (task.title === 'Homework Time' && !isWeekday) continue

        if (rng() < completionRate) {
          // Submitted
          const submittedAt = new Date(date)
          submittedAt.setHours(Math.floor(rng() * 12) + 8, Math.floor(rng() * 60))

          // Auto-approve for AUTO tasks; for MANUAL, approve after a delay
          const isAuto = task.approvalPolicy === 'AUTO'
          const reviewedAt = isAuto
            ? submittedAt
            : new Date(submittedAt.getTime() + (1 + rng() * 4) * 60 * 60 * 1000)

          const pointsAwarded = task.pointsValue
          runningBalance += pointsAwarded

          const txn = await prisma.pointsTransaction.create({
            data: {
              childId,
              familyId: family.id,
              amount: pointsAwarded,
              type: 'EARNED',
              reference: occId,
              description: `Earned ${pointsAwarded} ${'Stars'} — ${task.title}`,
              balanceAfter: runningBalance,
              createdAt: reviewedAt,
            },
          })

          const submission = await prisma.taskSubmission.create({
            data: {
              id: `sub-${occId}`,
              occurrenceId: occId,
              childId,
              submittedAt,
              reviewedAt,
              reviewedById: parent.id,
              decision: 'APPROVED',
              pointsAwarded,
              pointsTxnId: txn.id,
            },
          })

          await prisma.taskOccurrence.update({
            where: { id: occId },
            data: { status: 'APPROVED', updatedAt: reviewedAt },
          })

          await prisma.taskReview.create({
            data: {
              id: `review-${occId}`,
              submissionId: submission.id,
              reviewerId: parent.id,
              decision: 'APPROVED',
              pointsAwarded,
              createdAt: reviewedAt,
            },
          })
        }
      }
    }
    console.log(`  ✓ History for ${childName}: balance = ${runningBalance} stars`)
    return runningBalance
  }

  const zaydBalance = await processHistory(zayd.id, 0.85, 'Zayd')
  const maryamBalance = await processHistory(maryam.id, 0.72, 'Maryam')

  // ── Today's submissions: 2 pending review (1 per child) ────────────────
  async function submitToday(childId: string, taskId: string) {
    const occId = `occ-${taskId}-0`
    const occ = await prisma.taskOccurrence.findUnique({ where: { id: occId } })
    if (!occ || occ.status !== 'ASSIGNED') return
    await prisma.taskSubmission.create({
      data: {
        id: `sub-${occId}`,
        occurrenceId: occId,
        childId,
        submittedAt: new Date(),
      },
    })
    await prisma.taskOccurrence.update({
      where: { id: occId },
      data: { status: 'SUBMITTED' },
    })
    await prisma.notification.create({
      data: {
        userId: parent.id,
        familyId: family.id,
        type: 'TASK_SUBMITTED',
        title: 'New submission to review',
        message: `${childId === zayd.id ? 'Zayd' : 'Maryam'} submitted a task for review.`,
      },
    })
  }
  await submitToday(zayd.id, 'demo-task-0') // Fajr
  await submitToday(maryam.id, 'demo-task-1') // Quran
  console.log(`  ✓ Today's pending submissions created`)

  // ── Rewards ────────────────────────────────────────────────────────────
  const rewards = [
    {
      id: 'demo-reward-0',
      title: 'Choose a Family Outing',
      description: 'Pick a place to visit together this weekend.',
      iconKey: 'map',
      requiredPoints: 100,
      rewardType: 'POINTS',
      requiresApproval: true,
    },
    {
      id: 'demo-reward-1',
      title: 'Family Game Night',
      description: 'Choose the board game for family game night.',
      iconKey: 'dice',
      requiredPoints: 50,
      rewardType: 'POINTS',
      requiresApproval: true,
    },
    {
      id: 'demo-reward-2',
      title: 'New Book of Choice',
      description: 'Pick a new book to add to your library.',
      iconKey: 'book',
      requiredPoints: 80,
      rewardType: 'POINTS',
      requiresApproval: true,
    },
    {
      id: 'demo-reward-3',
      title: 'Special Family Experience',
      description: 'A special day trip planned with parents.',
      iconKey: 'star',
      requiredPoints: 200,
      rewardType: 'POINTS',
      requiresApproval: true,
    },
    {
      id: 'demo-reward-4',
      title: 'Weekly Challenge Reward',
      description: 'Awarded when you complete the weekly challenge.',
      iconKey: 'trophy',
      requiredPoints: 0,
      rewardType: 'ACHIEVEMENT',
      requiresApproval: false,
    },
  ]
  for (const r of rewards) {
    await prisma.reward.upsert({
      where: { id: r.id },
      update: {},
      create: { familyId: family.id, status: 'ACTIVE', ...r },
    })
  }
  console.log(`  ✓ ${rewards.length} rewards`)

  // ── Weekly challenge (current week) ────────────────────────────────────
  const weekStart = startOfDay(new Date(today))
  weekStart.setDate(weekStart.getDate() - weekStart.getDay()) // Sunday
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)
  weekEnd.setHours(23, 59, 59)

  await prisma.weeklyChallenge.upsert({
    where: { id: 'demo-challenge-0' },
    update: {},
    create: {
      id: 'demo-challenge-0',
      familyId: family.id,
      name: 'Build a Consistent Morning Routine',
      description: 'Complete at least 80% of morning tasks (Fajr, Quran, Make My Bed) every day this week.',
      startDate: weekStart,
      endDate: weekEnd,
      targetPercent: 80,
      eligibleCategories: JSON.stringify(['Islamic Practices', 'Personal Responsibility']),
      rewardId: 'demo-reward-4',
      rewardTitle: 'Weekly Challenge Reward',
      status: 'ACTIVE',
    },
  })
  await prisma.challengeParticipant.upsert({
    where: { id: 'cp-zayd-0' },
    update: {},
    create: { id: 'cp-zayd-0', challengeId: 'demo-challenge-0', childId: zayd.id, targetPercent: 80 },
  })
  await prisma.challengeParticipant.upsert({
    where: { id: 'cp-maryam-0' },
    update: {},
    create: { id: 'cp-maryam-0', challengeId: 'demo-challenge-0', childId: maryam.id, targetPercent: 80 },
  })
  console.log(`  ✓ Weekly challenge created`)

  // ── Achievements ───────────────────────────────────────────────────────
  const achievements = [
    { key: 'first_steps', name: 'First Steps', description: 'Completed your very first task.', iconKey: 'footprints' },
    { key: 'consistency_champion', name: 'Consistency Champion', description: 'Completed tasks 5 days in a row.', iconKey: 'flame' },
    { key: 'quran_milestone', name: 'Quran Learning Milestone', description: 'Practiced Quran reading for 7 days.', iconKey: 'book-open' },
    { key: 'kindness_in_action', name: 'Kindness in Action', description: 'Completed 10 kindness tasks.', iconKey: 'heart' },
    { key: 'responsibility_star', name: 'Responsibility Star', description: 'Completed 20 personal responsibility tasks.', iconKey: 'star' },
    { key: 'weekly_goal', name: 'Weekly Goal Achieved', description: 'Met your weekly challenge target.', iconKey: 'target' },
    { key: 'monthly_milestone', name: 'Monthly Milestone', description: 'Qualified for a monthly milestone.', iconKey: 'trophy' },
  ]
  for (const a of achievements) {
    await prisma.achievement.upsert({
      where: { familyId_key: { familyId: family.id, key: a.key } },
      update: {},
      create: { familyId: family.id, ...a },
    })
  }
  // Award a few achievements
  await prisma.childAchievement.upsert({
    where: { achievementId_childId: { achievementId: await prisma.achievement.findFirst({ where: { familyId: family.id, key: 'first_steps' } }).then((a) => a!.id), childId: zayd.id } },
    update: {},
    create: { achievementId: (await prisma.achievement.findFirst({ where: { familyId: family.id, key: 'first_steps' } }))!.id, childId: zayd.id },
  }).catch(() => {})
  console.log(`  ✓ ${achievements.length} achievement definitions`)

  console.log('\n✅ Seed complete!')
  console.log('────────────────────────────────────────')
  console.log('Login:  parent@deensteps.demo')
  console.log('Pass:   Password123!')
  console.log(`Zayd balance:   ${zaydBalance} stars`)
  console.log(`Maryam balance: ${maryamBalance} stars`)
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
