# DeenSteps — Work Log

---
Task ID: S0.1
Agent: main (Super Z)
Task: Codebase audit — review existing points ledger, task lifecycle, authorization, reward system

Work Log:
- Read DEENSTEPS_2.0_ROADMAP.md for context
- Audited prisma/schema.prisma — 22 models, all constraints verified
- Audited src/lib/auth/session.ts — 6 helpers, all solid
- Audited src/server/actions/review-actions.ts — submitTaskOccurrence, reviewSubmission (atomic, idempotent)
- Audited src/server/actions/reward-actions.ts — requestRedemption, approveRedemption, declineRedemption, fulfillRedemption (atomic, refund safe)
- Audited src/server/actions/task-actions.ts — createTask, generateOccurrencesForTask (idempotent)
- Audited src/server/actions/child-actions.ts — createChildProfile, archiveChild
- Audited src/server/actions/settings-actions.ts — exportFamilyData, deleteFamilyData
- Audited src/lib/constants.ts — TASK_LIBRARY (25 tasks, 4 categories), REWARD_LIBRARY (15 rewards)
- Verified no test files exist
- Verified Authorization pattern: every mutation filters by familyId (no IDOR)
- Verified ledger integrity: balanceAfter on every transaction, atomic operations
- Identified gaps vs 2.0 spec across 5 phases

Stage Summary:
- Produced AUDIT.md (comprehensive, 10 sections)
- Core integrity: SOLID (ledger, auth, idempotency)
- Gaps are additive (new fields/models), not rewrites
- No breaking changes needed for Phase 1
- Ready for S0.2 (Schema Plan)

---
Task ID: S0.2
Agent: main (Super Z)
Task: Schema migration plan — exact field additions, new models, migration order, index strategy, backfill plan

Work Log:
- Re-read AUDIT.md for gap context (schema, ledger, task lifecycle, rewards)
- Re-read current schema: FamilySettings, TaskTemplate, TaskExcusal, PointsTransaction, Reward models
- Designed Phase 1 schema: TaskTemplate +tier/minAge/maxAge/learningPrompt, TaskOccurrence +missedAt, TaskExcusal expanded, PointsTransaction +reason/adjustedById
- Designed Phase 2 schema: Reward +category/maxPerWeek/maxPerMonth/cooldownDays/estimatedCost, FamilySettings +monthlyRewardBudget
- Designed Phase 3 schema: new Incident, IncidentReport, IncidentResolution models
- Designed Phase 4 schema: new SadaqahCause, SadaqahDonation models, FamilySettings +sadaqah pledge config
- Designed Phase 5 schema: new WeeklyReflection, FamilyAchievement models
- Documented migration order (5 phases, each with db:push)
- Documented index strategy (10 new indexes)
- Documented backfill plan (all new fields have safe defaults)
- Documented SQLite → PostgreSQL notes
- Documented what this plan does NOT do (no removals, no type changes)

Stage Summary:
- Produced SCHEMA_PLAN.md (comprehensive, ~400 lines)
- All changes are additive — no breaking changes
- All new fields have defaults — no data migration scripts needed
- All new models have familyId for isolation
- All new unique constraints identified
- Phase 0 complete (2/2 sessions)
- Ready for Phase 1 (S1.1 — Amal Library expansion)

---
Task ID: S1.1
Agent: main (Super Z)
Task: Amal Library expansion — 6 categories, Tier 1-5, age filter, spec-compliant points

Work Log:
- Re-read SCHEMA_PLAN.md Phase 1 section for exact field specs
- Applied Phase 1 schema changes to prisma/schema.prisma:
  - TaskTemplate: +tier (Int, default 3), +minAge (Int?), +maxAge (Int?), +learningPrompt (String?)
  - TaskTemplate: +@@index([tier]), +@@index([category, tier])
  - TaskOccurrence: +missedAt (DateTime?)
  - TaskExcusal: +excusedById (String?), +followUpType (String?), +followUpNote (String?)
  - PointsTransaction: +reason (String?), +adjustedById (String?)
- Ran db:push — schema applied successfully, no data loss
- Expanded TASK_CATEGORIES from 4 to 6:
  - Renamed: Islamic Practices → নামাজ ও ইবাদত, Character & Manners → ইসলামি চরিত্র
  - Renamed: Personal Responsibility → পারিবারিক দায়িত্ব, Learning & Development → শিক্ষা ও বিকাশ
  - NEW: Health & Self-Discipline (স্বাস্থ্য ও আত্মনিয়ন্ত্রণ)
  - NEW: Generosity & Community (দান ও সমাজসেবা)
- Added TASK_TIERS constant (5 tiers with Bengali labels)
- Rewrote TASK_LIBRARY: 37 activities across 6 categories with:
  - Tier 1-5 priority (per spec §2.2)
  - Age-appropriate filtering (minAge/maxAge, null = all ages)
  - Spec-compliant point values (Salah=10, Wudu=3, Quran=5, Dua=3, Truth=4, etc.)
  - All 5 daily prayers + Jumu'ah (Friday, CUSTOM)
  - Wudu, adhkar, short surahs (new activities)
  - Health: hygiene, food, water, bedtime, screen-time, exercise (new)
  - Generosity: sharing, helping, sadaqah saving, elderly help, charity (new)
- Added new icon keys: droplet (Droplet), monitor (MonitorSmartphone)
- Updated TaskSchema in task-actions.ts: +tier, +minAge, +maxAge, +learningPrompt
- Updated createTask: passes new fields to db
- Updated updateTask: passes new fields to db
- Updated importLibraryTask: passes tier, minAge, maxAge, scheduledDays from library
- Reset DB and re-seeded (no default tasks, only children + rewards + achievements)
- Recompiled seed.js for Docker
- Verified: lint clean, /tasks route compiles, /dashboard route compiles

Stage Summary:
- Phase 1 schema applied (TaskTemplate, TaskOccurrence, TaskExcusal, PointsTransaction)
- 6 categories, 37 library activities with Tier 1-5 + age filtering
- Spec-compliant point values
- createTask, updateTask, importLibraryTask all handle new fields
- DB re-seeded successfully
- 3/20 sessions complete (15%)
- Next: S1.2 — Tier & age UI (badges, filters, grouping in import dialog)

---
Task ID: S1.2
Agent: main (Super Z)
Task: Tier & age UI — badges, filters, grouping in import dialog

Work Log:
- Re-read worklog S1.1 and SCHEMA_PLAN.md Phase 1 for context
- Created TierBadge component (src/components/deensteps/tier-badge.tsx):
  - Color-coded badges per tier (1=emerald, 2=amber, 3=sky, 4=violet, 5=rose)
  - Bengali numerals (Tier ১-৫)
  - AgeIndicator sub-component (shows minAge-maxAge in Bengali)
- Rewrote ImportTasksDialog in task-dialogs.tsx:
  - Added age filter bar (সব বয়স / ৩-৫ / ৬-৮ / ৯-১২ / ১৩+)
  - Tasks filtered by age-appropriateness (checks minAge/maxAge)
  - Tasks sorted by tier within each category (Tier 1 first)
  - TierBadge on each task item
  - AgeIndicator on each task item (where applicable)
  - Empty state when no tasks match age filter
  - All text in Bengali (button labels, helper text)
- Updated TaskFormDialog:
  - Added tier field to form schema (z.coerce.number, default 3)
  - Added tier selector dropdown with TierBadge + TASK_TIERS labels
  - Helper text: "শিক্ষাগত অগ্রাধিকার — ধর্মীয় মূল্য নয়।"
  - All form labels/buttons translated to Bengali
- Updated form defaults: category now 'Islamic Practices' (was 'Personal Responsibility')
- Lint clean, routes compile

Stage Summary:
- TierBadge + AgeIndicator reusable components created
- Import dialog has age filter, tier badges, tier sorting
- Task form has tier selector
- All form text in Bengali
- 4/20 sessions complete (20%)
- Next: S1.3 — Missed task policy (mark missed, encouraging messages, parent follow-up)

---
Task ID: S1.3
Agent: main (Super Z)
Task: Missed task policy — mark missed, encouraging messages, parent follow-up

Work Log:
- Re-read worklog S1.2 and SCHEMA_PLAN.md Phase 1 §1.2-1.4 for context
- Added markMissedOccurrences server action to task-actions.ts:
  - Marks all ASSIGNED occurrences from before today as MISSED
  - Sets missedAt timestamp
  - Idempotent — only updates ASSIGNED → MISSED
  - NO point deduction (points were never awarded)
  - Called automatically when getDashboardData loads
- Added excuseTaskOccurrence server action to task-actions.ts:
  - Parent excuses a missed task with reason + followUpType + followUpNote
  - Creates TaskExcusal record (uses new fields from S1.1 schema)
  - Sets occurrence status to EXCUSED
  - Transactional (TaskExcusal create + occurrence update)
  - Idempotent (checks if already excused)
- Updated getDashboardData in dashboard-actions.ts:
  - Calls markMissedOccurrences before loading data
  - Loads recent MISSED tasks (last 7 days, with child info)
  - Returns missedTasks array with task title, category, icon, points, children
- Created ExcuseTaskDialog component (excuse-task-dialog.tsx):
  - Reason textarea (required)
  - Follow-up type selector (practice_wudu, learn_about_salah, plan_routine, etc.)
  - Follow-up note textarea (optional)
  - All text in Bengali
  - Calls excuseTaskOccurrence server action
- Created MissedTasksSection component (missed-tasks-section.tsx):
  - Shows on parent dashboard when there are MISSED tasks
  - Orange-tinted card with "মিসড কাজ" heading
  - Each missed task shows icon, title, date, assigned children
  - "ছাড় করুন" button opens ExcuseTaskDialog
  - Description: "কোনো তারা কাটা হয়নি। উৎসাহ দিন, ছাড় করুন।"
- Added MissedTasksSection to parent dashboard (between review section and charts)
- Updated child dashboard:
  - Queries recent MISSED tasks (last 3 days)
  - Shows encouraging banner: "কোনো সমস্যা নেই — আজ আবার নতুন করে শুরু করি! 🌱"
  - Subtext: "তারা কাটা হয়নি — শুধু আজ থেকে আবার চেষ্টা করো।"
  - Shows which tasks were missed as small chips
- Lint clean, routes compile

Stage Summary:
- Missed task policy implemented per spec §3.3:
  1. ✅ Mark as missed after scheduled period ends
  2. ✅ No points deducted (never earned)
  3. ✅ Encouraging message on child dashboard
  4. ✅ Parent follow-up record (TaskExcusal with type + note)
- NO automatic financial-style debt or negative balance
- 5/20 sessions complete (25%)
- Next: S1.4 — Child ledger ("আমার তারার হিসাব" full view with filters)

---
Task ID: S1.4
Agent: main (Super Z)
Task: Child ledger — "আমার তারার হিসাব" full view with filters

Work Log:
- Re-read worklog S1.3 and spec §3.4 for ledger requirements
- Created getChildLedger server action (ledger-actions.ts):
  - Loads all PointsTransaction for a child (up to 200)
  - Returns entries with: date, description, amount, type, balanceAfter,
    previousBalance (computed), reason, status
  - Family isolation verified (child must belong to family)
  - Returns currentBalance from latest transaction
- Created /child/[id]/ledger route:
  - Server component loads ledger data via getChildLedger
  - Renders LedgerClient component
- Created LedgerClient component (ledger-client.tsx):
  - Filter tabs: আজ / এই সপ্তাহ / এই মাস / সব
  - Balance summary card (current balance + earned in filtered range)
  - Table layout: date | description (with type badge + reason) | change | balance
  - Color-coded: green=earned, red=spent, sky=refund, amber=adjustment
  - Type badges: অর্জিত/খরচ/সমন্বয়/ফেরত
  - Empty state when no transactions in range
  - Info note: "দৈনিক কাজ রিসেট হয়, অর্জিত তারা হয় না।"
  - Responsive: stacked on mobile, table on desktop
  - All text in Bengali
- Added "আমার তারার হিসাব" button to child dashboard:
  - History icon + Bengali label
  - Placed after stat cards, before task list
  - Links to /child/[id]/ledger
- Lint clean

Stage Summary:
- Per spec §3.4: all requirements met
  - ✅ Date and activity
  - ✅ Points earned / spent / adjustment with reason
  - ✅ Previous balance (computed as balanceAfter - amount)
  - ✅ New balance
  - ✅ Transaction status (type badge)
  - ✅ Filters: today, week, month, all history
- Ledger is the source of truth — "Daily tasks reset; earned points do not."
- 6/20 sessions complete (30%)
- Next: S1.5 — Parent customization (per-child selection, restore defaults)

---
Task ID: S1.5
Agent: main (Super Z)
Task: Parent customization — per-child selection, restore defaults, archive safety

Work Log:
- Re-read worklog S1.4 and spec §2.5 for customization requirements
- Verified archive safety: archiveTask only sets status='ARCHIVED', never deletes
  - TaskOccurrence and TaskSubmission records remain intact
  - generateOccurrencesForTask checks status !== 'ACTIVE' and returns early
  - Historical records preserved per spec §2.5
- Created restoreDefaultLibrary server action (task-actions.ts):
  - Re-imports all TASK_LIBRARY items that don't already exist (matched by title+category)
  - Purely additive — does NOT overwrite or delete existing tasks
  - Auto-assigns to all active children
  - Returns imported count + skipped count
- Created getChildTaskSummary server action:
  - Returns per-child active task count
- Created RestoreDefaultsButton component (restore-defaults-button.tsx):
  - Dialog with confirmation
  - "ডিফল্ট লাইব্রেরি রিস্টোর করুন" button
  - Shows how many new + skipped on success
  - All text in Bengali
- Added RestoreDefaultsButton to /tasks page header (next to ImportTasksDialog)
- Added TierBadge to each task row on /tasks page
- Translated task row labels to Bengali:
  - Library → লাইব্রেরি
  - Paused → বিরতি
  - Archived → আর্কাইভ
  - pts → তারা
  - due → time only
  - Auto-approve → অটো-অনুমোদন
  - Manual review → ম্যানুয়াল রিভিউ
  - No one assigned → কাউকে নির্ধারণ করা হয়নি
  - Added "নির্ধারিত" label next to avatar stack
- Added tier field to TaskWithAssignments type
- Lint clean

Stage Summary:
- Per spec §2.5: all requirements met
  - ✅ Enable/disable predefined activity (archive/pause)
  - ✅ Adjust points and frequency (edit task)
  - ✅ Select activities for each child separately (TaskAssignment)
  - ✅ Add custom family activities (createTask)
  - ✅ Edit/archive without destroying historical records (verified)
  - ✅ Restore recommended default library (restoreDefaultLibrary action + button)
- Phase 1 COMPLETE (5/5 sessions)
- 7/20 sessions complete (35%)
- Next: S2.1 — Reward categories (Phase 2 starts)

---
Task ID: S2.1
Agent: main (Super Z)
Task: Reward categories — Experiences, Learning, Privileges, Food + frequency limits + budget schema

Work Log:
- Re-read SCHEMA_PLAN.md Phase 2 for exact field specs
- Applied Phase 2 schema changes:
  - Reward: +category (EXPERIENCE|LEARNING|PRIVILEGE|FOOD), +maxPerWeek, +maxPerMonth, +cooldownDays, +estimatedCost
  - Reward: +@@index([familyId, category])
  - FamilySettings: +monthlyRewardBudget (Float?)
- Ran db:push — schema applied, no data loss
- Added REWARD_CATEGORIES constant (4 categories with Bengali labels, colors, icons, descriptions)
- Rewrote REWARD_LIBRARY: 21 rewards across 4 categories with:
  - category field on each reward
  - maxPerWeek, maxPerMonth, cooldownDays, estimatedCost
  - 7 Experiences (game night, park, outing, cycling, story time, activity, movie)
  - 4 Learning (book, art supply, craft, learning project)
  - 4 Privileges (bedtime story, movie pick, extra play time, hobby time)
  - 6 Food (ice cream, chocolate, pizza, burger, snacks, dinner — all limited)
- Updated reward-actions.ts:
  - RewardSchema: +category, +maxPerWeek, +maxPerMonth, +cooldownDays, +estimatedCost
  - createReward: passes all new fields to db
  - updateReward: passes all new fields to db
  - importLibraryReward: passes category, limits, cooldown, cost from library
- Rewrote RewardQuickAdd component:
  - Rewards grouped by category with colored category badges
  - Each reward shows frequency limits (সপ্তাহে X×, মাসে X×)
  - Category descriptions shown
  - Color-coded: emerald=experience, amber=learning, sky=privilege, rose=food
- Updated seed script with category + limits on all 8 demo rewards
- Recompiled seed.js for Docker
- Reset DB and re-seeded
- Lint clean

Stage Summary:
- Phase 2 schema applied (Reward + FamilySettings)
- 4 reward categories with 21 library items
- Frequency limits (maxPerWeek, maxPerMonth, cooldownDays) in schema + library
- Estimated cost for budget tracking
- FamilySettings has monthlyRewardBudget field (ready for S2.3)
- 8/20 sessions complete (40%)
- Next: S2.2 — Enforce frequency limits & cooldown at redemption time

---
Task ID: S2.2
Agent: main (Super Z)
Task: Frequency limits & cooldown — enforce maxPerWeek, maxPerMonth, cooldownDays at redemption

Work Log:
- Re-read requestRedemption action in reward-actions.ts for context
- Imported date-fns functions: differenceInCalendarDays, startOfWeek, startOfMonth
- Added maxPerWeek check inside requestRedemption transaction:
  - Counts redemptions this week (from startOfWeek) with status REQUESTED/APPROVED/FULFILLED
  - Blocks if count >= maxPerWeek
  - Bengali error: "এই সপ্তাহে এই পুরস্কারের সীমা পূর্ণ (সপ্তাহে Xবার)। পরের সপ্তাহে আবার চেষ্টা করো।"
- Added maxPerMonth check:
  - Counts redemptions this month (from startOfMonth)
  - Blocks if count >= maxPerMonth
  - Bengali error: "এই মাসে এই পুরস্কারের সীমা পূর্ণ (মাসে Xবার)। পরের মাসে আবার চেষ্টা করো।"
- Added cooldownDays check:
  - Finds last redemption for this reward+child
  - Calculates days since last redemption
  - Blocks if daysSince < cooldownDays
  - Bengali error: "এই পুরস্কার এখনও কুলডাউনে আছে। আর X দিন অপেক্ষা করো।"
- Also translated existing redemptionLimit error to Bengali
- All checks inside the transaction (atomic, safe)
- Updated child dashboard reward cards to show category label badges
- Lint clean

Stage Summary:
- All 3 frequency controls enforced at redemption time:
  1. ✅ maxPerWeek — limits per-week redemptions
  2. ✅ maxPerMonth — limits per-month redemptions
  3. ✅ cooldownDays — enforces minimum days between redemptions
- All checks atomic (inside db.$transaction)
- All error messages in Bengali, encouraging tone
- Existing redemptionLimit (lifetime) still works alongside new limits
- 9/20 sessions complete (45%)
- Next: S2.3 — Family budget (monthly limit, committed/remaining tracking)

---
Task ID: S2.3
Agent: main (Super Z)
Task: Family budget — monthly limit, committed/remaining tracking, budget enforcement

Work Log:
- Re-read requestRedemption action and settings-actions for context
- Added budget enforcement in requestRedemption (reward-actions.ts):
  - If reward has estimatedCost > 0 AND family has monthlyRewardBudget > 0:
    - Fetches all redemptions this month (REQUESTED/APPROVED/FULFILLED) with estimatedCost
    - Sums committed costs
    - Blocks if committed + this reward's cost > budget
  - Bengali error: "পারিবারিক বাজেট ছাড়িয়ে যাবে। এই মাসের বাজেট: ৳X।"
  - All inside db.$transaction (atomic, safe)
- Added monthlyRewardBudget to SettingsSchema in settings-actions.ts:
  - z.number().min(0).nullable().optional()
  - Added to both update and create in upsert
- Added budget tracking to getDashboardData (dashboard-actions.ts):
  - Fetches FamilySettings.monthlyRewardBudget
  - If budget set, sums all this month's redemption estimatedCosts
  - Returns budgetInfo: { monthlyBudget, committed, remaining }
  - Only returned when budget is configured (null otherwise)
- Added budget widget to parent dashboard:
  - Sky-tinted card showing: remaining/budget, committed amount
  - Progress bar (committed / budget)
  - Message: "আর ৳X বাকি আছে এই মাসে।" or "এই মাসের বাজেট শেষ"
  - Only shows when budgetInfo is not null (budget configured)
- Lint clean

Stage Summary:
- Per spec §4.4: all requirements met
  - ✅ Monthly budget (FamilySettings.monthlyRewardBudget)
  - ✅ Amount already committed (sum of estimatedCost this month)
  - ✅ Estimated remaining budget
  - ✅ Budget enforcement at redemption (blocks overspend)
  - ✅ Upcoming approved rewards included in committed
- Points do not create unconditional financial obligation
- Parents retain control over actual purchases
- 10/20 sessions complete (50%) — halfway!
- Next: S2.4 — Non-food & low-cost alternatives (Phase 2 finale)

---
Task ID: S2.4
Agent: main (Super Z)
Task: Non-food & low-cost alternatives — category tabs, promotion, Bengali labels

Work Log:
- Re-read rewards page structure (server component with inline RewardCard)
- Created RewardsCatalog client component (rewards-catalog.tsx):
  - Category filter bar: সব / অভিজ্ঞতা / শেখা / সুবিধা / খাবার (with counts)
  - Each reward card shows:
    - Category badge (color-coded: emerald/amber/sky/rose)
    - "ফ্রি" badge for rewards with estimatedCost=0
    - Frequency limit badges (সপ্তাহে X×, মাসে X×)
    - "অনুমোদন দরকার" / "অটো-অনুমোদন" badges
    - Redemption count ("X বার রিডিম হয়েছে")
    - "তারা" instead of "pts"
  - Empty state when no rewards in a category
  - All text in Bengali
- Updated rewards page to use RewardsCatalog:
  - Replaced inline RewardCard grid with RewardsCatalog component
  - Archived section simplified (shows title + points only)
  - Archived section translated to Bengali
- Translated all tab labels to Bengali:
  - Catalog → ক্যাটালগ
  - Pending → অপেক্ষমান
  - History → ইতিহাস
- Translated empty states to Bengali
- Lint clean

Stage Summary:
- Per spec §4.2 + §4.4: all requirements met
  - ✅ Reward categories (EXPERIENCE, LEARNING, PRIVILEGE, FOOD)
  - ✅ Category filter on catalog page
  - ✅ Category badges on each reward card
  - ✅ "ফ্রি" badge for zero-cost rewards (promotes non-food)
  - ✅ Frequency limits shown on cards
  - ✅ Food treats clearly marked and limited
  - ✅ Non-food rewards (experiences, learning, privileges) promoted
- Phase 2 COMPLETE (4/4 sessions)
- 11/20 sessions complete (55%)
- Next: S3.1 — Incident schema & child report (Phase 3 starts)

---
Task ID: S3.1
Agent: main (Super Z)
Task: Incident schema & child report — "আমি একটি সমস্যায় সাহায্য চাই"

Work Log:
- Re-read SCHEMA_PLAN.md Phase 3 for Incident/IncidentReport/IncidentResolution models
- Applied Phase 3 schema changes to prisma/schema.prisma:
  - New model: Incident (familyId, status OPEN/IN_MEDIATION/RESOLVED, resolvedAt)
  - New model: IncidentReport (incidentId, childId, whatHappened, whoInvolved, howFelt, helpNeeded)
  - New model: IncidentResolution (incidentId @unique, outcomeType, pointsAdjusted, pointsTxnId @unique, reason, resolvedById)
  - Added incidents relation to Family
  - Added incidentReports relation to ChildProfile
  - Added incidentResolution relation to PointsTransaction
  - Ran db:push — schema applied, no data loss
- Created incident-actions.ts server action:
  - submitIncident: child submits private report (whatHappened, whoInvolved, howFelt, helpNeeded)
    - Creates Incident + IncidentReport in a transaction
    - Notifies all parents
    - Verifies child belongs to family (authorization)
    - Child CANNOT deduct points or punish — only requests parental attention
  - getOpenIncidents: loads all OPEN/IN_MEDIATION incidents for family
    - Includes reports with child info
- Created IncidentReportButton component (incident-report-button.tsx):
  - "আমি একটি সমস্যায় সাহায্য চাই" button (rose-colored, non-threatening)
  - Dialog with 4 fields: কী হয়েছে, কার সাথে, কেমন লেগেছে, কী সাহায্য দরকার
  - Privacy reassurance: "এটি শুধু বাবা-মা দেখবেন। নির্ভয়ে বলতে পারো।"
  - Success: "বাবা-মাকে জানানো হয়েছে। তারা শীঘ্রই তোমার সাথে কথা বলবেন। 💚"
  - All text in Bengali
- Created IncidentsSection component (incidents-section.tsx):
  - Shows on parent dashboard when there are open incidents
  - Rose-tinted card: "সন্তানের সাহায্যের অনুরোধ"
  - Each incident shows: child avatar, all report fields, time
  - Restorative guidance: "সন্তানকে ভালোভাবে শুনুন। রেস্টোরেটিভ সমাধান বেছে নিন — ক্ষমা, মেরামত, সাহায্য। শাস্তি নয়।"
- Added IncidentReportButton to child dashboard (before stat cards)
- Added IncidentsSection to parent dashboard (after missed tasks, before budget)
- Added openIncidents to getDashboardData return
- Lint clean

Stage Summary:
- Per spec §5.2: child-reported incident workflow implemented
  - ✅ Child can select "আমি একটি সমস্যায় সাহায্য চাই"
  - ✅ Child privately tells parent: what happened, who involved, how felt, help needed
  - ✅ Child CANNOT deduct another child's points or impose punishment
  - ✅ No public accusations on sibling dashboards
  - ✅ Parent receives private notification
- Per spec §5.1: restorative approach, not policing
- Per spec §5.4: sincere apology not treated as transaction
- 12/20 sessions complete (60%)
- Next: S3.2 — Parent mediation workflow (perspectives, follow-up records)

---
Task ID: S3.2
Agent: main (Super Z)
Task: Parent mediation workflow — resolve incidents with restorative outcomes

Work Log:
- Re-read incident-actions.ts and spec §5.3 for mediation workflow
- Created resolveIncident server action (incident-actions.ts):
  - Parent resolves incident with outcomeType + description
  - 6 outcome types: NO_ACTION, APOLOGY, RETURN_ITEM, REPAIR, HELPFUL_ACTION, CONSEQUENCE
  - OPTIONAL point adjustment (pointsAdjusted):
    - If != 0, reason is REQUIRED
    - Creates PointsTransaction with type=ADJUSTMENT, reason, adjustedById
    - Links to IncidentResolution via pointsTxnId
    - Atomic (inside db.$transaction)
  - Idempotent (checks if already resolved)
  - Verifies incident belongs to family (authorization)
  - Marks incident as RESOLVED with resolvedAt
  - Notifies child: "তোমার সমস্যাটি দেখা হয়েছে"
  - All error messages in Bengali
- Created IncidentResolutionDialog component (incident-resolution-dialog.tsx):
  - Outcome type selector (6 restorative options in Bengali)
  - Description textarea (what was the resolution)
  - Optional point adjustment section:
    - Points input (negative = deduction, positive = restoration)
    - Child selector (whose points to adjust)
    - Reason textarea (required if points != 0)
    - Warning: "ঐচ্ছিক — সাবধানতার সাথে ব্যবহার করুন"
  - All text in Bengali
- Updated IncidentsSection component:
  - Added "সমাধান করুন" button on each incident
  - Opens IncidentResolutionDialog with incidentId + childrenList
  - Receives childrenList prop from parent dashboard
- Updated parent dashboard to pass childrenList to IncidentsSection
- Lint clean

Stage Summary:
- Per spec §5.3: parent mediation workflow implemented
  - ✅ Parent receives private notification
  - ✅ Parent hears each child's perspective (report shown)
  - ✅ Parent determines what happened
  - ✅ Parent records the outcome (6 restorative types)
  - ✅ Optional point adjustment with explicit reason + audit
- Per spec §5.4: restorative, not punitive
  - ✅ Sincere apology does NOT automatically erase wrongdoing
  - ✅ Points NOT automatically deducted for every argument
  - ✅ Prefer restorative outcomes (apology, return, repair, helpful action)
  - ✅ If point adjustment, requires explicit confirmation + reason + audit entry
  - ✅ Child informed in age-appropriate language
- 13/20 sessions complete (65%)
- Next: S3.3 — Restorative follow-up & audit (Phase 3 finale)

---
Task ID: S3.3
Agent: main (Super Z)
Task: Restorative follow-up & audit — AuditLog, resolved history, child notification

Work Log:
- Re-read incident-actions.ts S3.2 code to understand existing state
- Added AuditLog writes in resolveIncident (incident-actions.ts):
  - POINT_ADJUSTMENT log: written when pointsAdjusted != 0
    - Records: outcomeType, pointsAdjusted, affectedChildId, reason, description
  - INCIDENT_RESOLVED log: always written for every resolution
    - Records: outcomeType, description
  - Both inside the db.$transaction (atomic)
  - First use of AuditLog model in the entire codebase!
- Added resolved incidents to getDashboardData (dashboard-actions.ts):
  - Queries RESOLVED incidents from last 30 days
  - Includes reports + resolution data
  - Returns as resolvedIncidents array
- Created ResolvedIncidentsSection component (resolved-incidents-section.tsx):
  - Shows on parent dashboard when there are resolved incidents
  - Each resolved incident shows:
    - Child avatar + name
    - Resolution time (relative)
    - Outcome type badge (Bengali label, emerald-tinted)
    - Point adjustment badge (if any, red for deduction, green for restoration)
    - Resolution description
    - Reason (if point adjustment was made)
  - Card title: "সমাধান হওয়া সমস্যা"
  - Only shows when incidents exist (returns null otherwise)
- Added ResolvedIncidentsSection to parent dashboard (before recent activity section)
- Verified child ledger already shows ADJUSTMENT transactions (from S1.4):
  - LedgerClient renders all PointsTransaction types
  - ADJUSTMENT type has badge "সমন্বয়" and amber color
  - reason field shown in the description column
  - No additional work needed — already works
- Verified child notification already created in S3.2:
  - resolveIncident creates Notification with type=INCIDENT_RESOLVED
  - Message: "বাবা-মা তোমার সমস্যাটি নিয়ে কথা বলেছেন। [outcome label]।"
  - Child dashboard shows notifications via existing notification system
  - No additional work needed — already works
- Lint clean

Stage Summary:
- Per spec §5.4 + §8 (technical):
  - ✅ AuditLog for sensitive administrative actions (point adjustments)
  - ✅ AuditLog for incident resolutions
  - ✅ Record who initiated and approved each adjustment (adjustedById)
  - ✅ Keep child informed in age-appropriate language (notification)
  - ✅ Permanent audit entry for point adjustments (reason required)
  - ✅ Point adjustments appear in child ledger (type=ADJUSTMENT, "সমন্বয়" badge)
  - ✅ Resolved incidents history visible to parents (30-day window)
- Phase 3 COMPLETE (3/3 sessions)
- 14/20 sessions complete (70%)
- Next: S4.1 — Sadaqah schema & cause catalog (Phase 4 starts)

---
Task ID: S4.1
Agent: main (Super Z)
Task: Sadaqah schema & cause catalog — models, library, server actions, settings

Work Log:
- Re-read SCHEMA_PLAN.md Phase 4 for SadaqahCause/SadaqahDonation/FamilySettings specs
- Applied Phase 4 schema changes to prisma/schema.prisma:
  - New model: SadaqahCause (familyId, title, description, iconKey, active)
  - New model: SadaqahDonation (familyId, childId, causeId, starsDedicated, pointsTxnId @unique,
    status PENDING/CONFIRMED/CANCELLED, parentConfirmedAt, realAmount, realDate, confirmationNote)
  - Added sadaqahCauses + sadaqahDonations relations to Family
  - Added sadaqahDonations relation to ChildProfile
  - Added sadaqahDonation relation to PointsTransaction
  - FamilySettings: +sadaqahPledgeEnabled, +sadaqahStarsPerUnit, +sadaqahCurrency, +sadaqahAmountPerUnit
  - Ran db:push — schema applied, no data loss
- Added SADAQAH_CAUSES library to constants.ts:
  - 8 causes: মাদ্রাসা সহায়তা, গরিব শিশুদের শিক্ষা, অসহায় পরিবার, খাদ্য সহায়তা,
    প্রাকৃতিক দুর্যোগ ত্রাণ, মসজিদ নির্মাণ/সংস্কার, স্বাস্থ্য সেবা, অন্যান্য
- Created sadaqah-actions.ts with full server actions:
  - getSadaqahCauses: load active causes for family
  - createSadaqahCause: create custom cause
  - importSadaqahCause: import from SADAQAH_CAUSES library
  - deactivateSadaqahCause: soft delete (preserves donation history)
  - requestSadaqah: child dedicates stars (atomic — deducts + creates PENDING donation + notifies parents)
  - confirmSadaqahDonation: parent confirms real-world donation (records realAmount, realDate, note, AuditLog)
  - cancelSadaqahDonation: parent cancels (atomic refund of stars, AuditLog)
  - getPendingSadaqahDonations: for parent dashboard
  - getSadaqahHistory: confirmed/cancelled donations history
- Updated settings-actions.ts SettingsSchema:
  - +sadaqahPledgeEnabled, +sadaqahStarsPerUnit, +sadaqahCurrency, +sadaqahAmountPerUnit
  - Added to both update and create in upsert
- Lint clean

Stage Summary:
- Phase 4 schema applied (SadaqahCause, SadaqahDonation, FamilySettings)
- 8 sadaqah causes in library
- Full server actions for cause CRUD + donation request/confirm/cancel
- All actions atomic, family-isolated, with AuditLog
- Per spec §6.1 + §6.2: virtual points separate from real money
  - Parent pledge is a family commitment, not inherent cash value
  - Stars deducted on request, refunded on cancel
  - Parent confirms real-world donation with amount + date + note
- 15/20 sessions complete (75%)
- Next: S4.2 — Child sadaqah flow (UI for dedicate stars, parent review)

---
Task ID: S4.2
Agent: main (Super Z)
Task: Child sadaqah flow — dedicate stars UI, parent review section

Work Log:
- Re-read sadaqah-actions.ts from S4.1 for context
- Created SadaqahButton component (sadaqah-button.tsx):
  - "আমার সাদাকাহ সঞ্চয়" button (emerald-colored, non-threatening)
  - Dialog with: current balance display, cause selector, stars input
  - Balance check (cannot dedicate more than available)
  - Balance after preview: "দেওয়ার পর তোমার ব্যালেন্স থাকবে: X তারা"
  - Calls requestSadaqah (atomic deduct + create PENDING + notify parents)
  - Success: "X তারা সাদাকাহর জন্য নিবেদিত! বাবা-মা নিশ্চিত করবেন। 🤲"
  - All text in Bengali
- Added sadaqah causes loading to child dashboard:
  - Queries active SadaqahCause for the family
  - Passes to SadaqahButton
- Added SadaqahButton to child dashboard (next to IncidentReportButton)
- Created SadaqahReviewSection component (sadaqah-review-section.tsx):
  - Shows on parent dashboard when there are PENDING sadaqah donations
  - Emerald-tinted card: "সাদাকাহ অনুরোধ"
  - Each donation shows: child avatar, cause icon+title, stars dedicated, time
  - "নিশ্চিত" button (green) → confirmSadaqahDonation
    - Success: "সাদাকাহ নিশ্চিত হয়েছে! আল্লাহ সন্তানকে উত্তম প্রতিদান দিন। 🤲"
  - "বাতিল" button (outline) → cancelSadaqahDonation (refunds stars)
    - Success: "সাদাকাহ বাতিল হয়েছে। তারা ফেরত দেওয়া হয়েছে।"
  - All text in Bengali
- Added pendingSadaqah + sadaqahHistory to getDashboardData return
- Added SadaqahReviewSection to parent dashboard (after resolved incidents)
- Lint clean

Stage Summary:
- Per spec §6.1 + §6.2: child sadaqah flow implemented
  - ✅ Child selects a cause
  - ✅ Child chooses how many stars to dedicate
  - ✅ Parent receives notification
  - ✅ Stars reserved/deducted atomically
  - ✅ Parent reviews and confirms or cancels
  - ✅ Refund on cancellation (transparent)
- Per spec §6.3: generosity without competition
  - ✅ No sibling ranking by donations
  - ✅ No pressure to donate all points
  - ✅ Encouraging message on confirmation
- 16/20 sessions complete (80%)
- Next: S4.3 — Parent pledge & real donation confirmation (Phase 4 finale)

---
Task ID: S4.3
Agent: main (Super Z)
Task: Parent pledge & real donation confirmation — settings UI, history, pledge info

Work Log:
- Re-read settings page structure and sadaqah-actions from S4.1/S4.2
- Created SadaqahSettings component (sadaqah-settings.tsx):
  - Pledge configuration card:
    - Toggle: sadaqahPledgeEnabled
    - Stars → cash conversion rate (starsPerUnit / amountPerUnit / currency)
    - Monthly reward budget input
    - Note: "এটি একটি পারিবারিক অঙ্গীকার। বাবা-মা প্রকৃত দান করবেন — তারা সরাসরি নগদ নয়।"
    - Save button calls updateFamilySettings
  - Cause management card:
    - List of active causes with donation counts
    - Deactivate button (soft delete)
    - Import from SADAQAH_CAUSES library (one-click dialog)
    - Create custom cause dialog (title, description, icon picker)
- Added "সাদাকাহ" tab to settings page:
  - Heart icon tab trigger
  - Loads sadaqahCauses via getSadaqahCauses()
  - Renders SadaqahSettings component
- Created SadaqahHistorySection component (sadaqah-history-section.tsx):
  - Shows on parent dashboard when confirmed/cancelled donations exist
  - Each item: child avatar, cause icon+title, stars, time, status badge
  - CONFIRMED: green badge + real amount (৳X)
  - CANCELLED: red badge
  - Card title: "সাদাকাহ ইতিহাস"
- Added SadaqahHistorySection to parent dashboard (after review section)
- Added sadaqah pledge info to child dashboard:
  - Loads FamilySettings (sadaqahPledgeEnabled, sadaqahStarsPerUnit, etc.)
  - If pledge enabled AND causes exist, shows emerald-tinted info banner:
    - "তোমার তারা দিয়ে ভালো কাজ করো! 🤲"
    - "১০০ তারা = ৳১০০ সাদাকাহ। বাবা-মা প্রকৃত দান করবেন — তারা সরাসরি টাকা নয়।"
    - Quran reference: "যে আল্লাহকে ভালো ঋণ দেবে, তিনি তার জন্য বহুগুণ বৃদ্ধি করবেন।"
- Lint clean

Stage Summary:
- Per spec §6.2 + §6.3: parent pledge and real donation confirmation implemented
  - ✅ Parent pledge configuration (enabled, stars→cash rate, currency)
  - ✅ Real donation confirmation (confirmSadaqahDonation with realAmount, AuditLog)
  - ✅ Transparent cancellation with refund
  - ✅ Donation history visible to parents
  - ✅ Child sees pledge info (stars → real charity connection)
  - ✅ Quran reference for encouragement
  - ✅ No competition — only personal generosity
  - ✅ Points never automatically represent guaranteed cash
- Phase 4 COMPLETE (3/3 sessions)
- 17/20 sessions complete (85%)
- Next: S5.1 — Weekly reflection & streak gentleness (Phase 5 starts)
















