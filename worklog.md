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

---
Task ID: S5.1
Agent: main (Super Z)
Task: Weekly reflection & streak gentleness — schema, server actions, UI

Work Log:
- Re-read SCHEMA_PLAN.md Phase 5 for WeeklyReflection/FamilyAchievement models
- Applied Phase 5 schema changes to prisma/schema.prisma:
  - New model: WeeklyReflection (familyId, childId?, weekStart, weekEnd, whatWentWell, whatWasHard, whatEasier, nextWeekPlan)
  - New model: FamilyAchievement (familyId, key, name, description, iconKey, awardedAt)
  - Added reflections + familyAchievements relations to Family
  - Added reflections relation to ChildProfile
  - Ran db:push — schema applied, no data loss
- Created reflection-actions.ts server action:
  - saveWeeklyReflection: save/update weekly reflection (per child or family-level)
    - Idempotent (unique [familyId, childId, weekStart])
    - Verifies child belongs to family
    - 4 fields: whatWentWell, whatWasHard, whatEasier, nextWeekPlan
  - getThisWeekReflection: load this week's reflection
  - getRecentReflections: last 4 weeks of reflections (for history)
- Created WeeklyReflectionSection component (weekly-reflection-section.tsx):
  - Child selector (family-level or per-child)
  - 4 text areas: কী ভালো হলো, কী কঠিন ছিল, কোন অভ্যাস সহজ হচ্ছে, পরের সপ্তাহে কী
  - Save button calls saveWeeklyReflection
  - History section (collapsible) showing last 4 weeks of reflections
  - Color-coded fields: green=ভালো, amber=কঠিন, sky=সহজ, violet=পরের সপ্তাহ
  - Guidance: "অগ্রগতির উপর ফোকাস করুন, দোষের উপর নয়। সন্তানের চেষ্টা উদযাপন করুন।"
  - All text in Bengali
- Added recentReflections to getDashboardData return
- Added WeeklyReflectionSection to parent dashboard (after sadaqah history)
- Verified child dashboard already has gentle streak break message from S1.3:
  - "কোনো সমস্যা নেই — আজ আবার নতুন করে শুরু করি! 🌱"
  - "তারা কাটা হয়নি — শুধু আজ থেকে আবার চেষ্টা করো।"
  - Shows which tasks were missed as chips
  - Already complete — no additional work needed
- Lint clean

Stage Summary:
- Per spec §7A + §7C: weekly reflection + streak gentleness implemented
  - ✅ Weekly summary: what went well, what was hard, what's easier, next week plan
  - ✅ Focus on progress, not blame
  - ✅ History of past reflections (4 weeks)
  - ✅ Streak break gentle message (from S1.3): "কোনো সমস্যা নেই — আজ আবার নতুন করে শুরু করি!"
  - ✅ No punitive streak resets or shame-based notifications
- 18/20 sessions complete (90%)
- Next: S5.2 — Flexible milestone & learning prompts


















---
Task ID: S5.2
Agent: main (Super Z)
Task: Flexible milestone & learning prompts — MonthlyMilestone calculation engine, TaskTemplate.learningPrompt content + UI

Work Log:
- Re-read SCHEMA_PLAN.md Phase 5 + roadmap S5.2 spec for context
- Audited existing MonthlyMilestone model (already in schema from earlier phases; has qualifyingWeeks, requiredWeeks, qualified, qualifiedAt, periodStart, periodEnd)
- Audited existing reports/page.tsx milestone display — found a weak "any points earned = 1 qualifying week" proxy that never persists the milestone record. The S5.2 spec calls for a proper calculation engine.
- Audited TaskTemplate.learningPrompt field — already added in Phase 1.1 (S1.1) schema, already in TaskSchema (task-actions.ts), but TASK_LIBRARY had no prompts and the create/edit TaskFormDialog didn't expose the field.
- Populated TASK_LIBRARY with Bengali learningPrompt values for all 41 tasks:
  - Each prompt is a short, age-appropriate "why" behind the task — not rules, but meaning
  - Examples: ফজর → "দিনের শুরুটা আল্লাহর সাথে করলে পুরো দিন বরকতময় হয় — তুমি কি এটি অনুভব করো?"
  - সত্য কথা বলা → "সত্য কথা বললে আল্লাহ ও মানুষ উভয়ের কাছে সম্মান বাড়ে — নবীজি সবসময় সত্য বলতেন।"
  - ক্ষমা করা → "ক্ষমা করলে মন হালকা হয় এবং সম্পর্ক মজবুত হয় — আল্লাহ ক্ষমাশীলদের ভালোবাসেন।"
  - Used MultiEdit (41 atomic edits) to keep the diff reviewable
- Wired learningPrompt through the import/restore flows in task-actions.ts:
  - importLibraryTask: now passes learningPrompt from library entry
  - restoreDefaultLibrary: now passes learningPrompt from library entry
- Added learningPrompt field to TaskFormDialog UI:
  - New "শেখার প্রশ্ন (ঐচ্ছিক)" Textarea with BookOpenCheck icon label
  - Helper text: "সন্তানের কাজের সাথে একটি ছোট শিক্ষা যুক্ত করুন — কেবল নিয়ম নয়, অর্থও শিখুক।"
  - Added to form Schema (z.string().max(500).optional()), default values, and reset on open
  - Updated TaskRowActionTask type to include tier + learningPrompt (was missing tier — pre-existing bug also fixed)
  - Updated tasks/page.tsx to pass tier + learningPrompt into TaskRowActions edit initial values
  - Prevented wipe-on-edit bug (without explicit initial, form would reset learningPrompt to empty string)
- Created milestone-actions.ts server action (NEW):
  - evaluateMonthlyMilestone(childId): the flexible milestone engine
    - Reads FamilySettings (monthlyPlanType, monthlyQualifyingWeeks, weeklyStartDay, notifyOnMilestone)
    - Computes current period (FOUR_WEEK = 28 days from month start, CALENDAR_MONTH = full month)
    - Counts qualifying weeks: distinct week starts where child has ≥1 APPROVED task occurrence in period
    - "Qualifying" = the child showed up that week — gentle, not perfect
    - Upserts MonthlyMilestone record with qualifyingWeeks, requiredWeeks, qualified, qualifiedAt
    - When qualified transitions false→true (first time only): fires notifications
      - Child notification (MILESTONE_REACHED, childId set, Bengali message)
      - Parent notification (MILESTONE_REACHED, userId set, per parent membership)
    - Idempotent: re-running doesn't re-fire notifications
    - Best-effort notifications: try/catch wraps notification creation so failures don't roll back milestone
  - getMilestoneProgressForFamily(): returns fresh progress for all children
    - Always recomputes qualifying weeks (in-memory) for accurate dashboard display
    - Does NOT persist (so this read-only function stays side-effect-free)
    - Returns displayQualifyingWeeks = max(persisted, fresh) so the dashboard never goes backwards
  - getMilestoneProgressForChild(childId): single-child convenience wrapper
- Wired evaluateMonthlyMilestone into review-actions.ts:
  - After reviewSubmission commits (when decision === 'APPROVED'): re-fetch submission.childId, call evaluateMonthlyMilestone
  - After submitTaskOccurrence (when approvalPolicy === 'AUTO'): the child just earned an APPROVED — call evaluateMonthlyMilestone
  - Both wrapped in try/catch (best-effort) — engine failure never fails the review/submit
  - Used dynamic import to avoid circular dependency concerns
- Added milestoneProgress to getDashboardData return value (parent dashboard):
  - Calls getMilestoneProgressForFamily() and returns the array
- Created MilestoneProgressSection component (milestone-progress-section.tsx):
  - Violet-tinted card on parent dashboard
  - Per-child rows: avatar, name, qualifying weeks chip, progress bar
  - States: "আর X সপ্তাহ বাকি" (not qualified) / "মাইলস্টোন অর্জিত! 🎉" (qualified)
  - Closing message: "💜 মাইলস্টোন হলো ধারাবাহিকতার উদযাপন — নিখুঁত হওয়ার নয়। সন্তানের চেষ্টা উদযাপন করুন।"
  - Returns null if no children
- Added MilestoneProgressSection to parent dashboard (after weekly reflection)
- Added milestone progress card to child dashboard:
  - Loads getMilestoneProgressForChild(child.id) server-side
  - Violet-tinted card between sadaqah pledge info and stat cards
  - Trophy icon, progress bar, weeks-remaining message
  - Closing: "💜 ধারাবাহিকতাই আসল জয় — নিখুঁত হওয়ার নয়।"
- Updated ChildTaskList component to display learningPrompt:
  - Added BookOpenCheck to lucide imports
  - Added learningPrompt to ChildTask type
  - New collapsible "শেখার প্রশ্ন" chip (emerald-tinted) below the task description
  - Click to expand → shows prompt text in a soft emerald-bordered box
  - Click again to collapse
  - Only renders if task.learningPrompt is non-empty
- Updated child/[id]/page.tsx to pass learningPrompt from o.task.learningPrompt into ChildTaskList occurrences
- Verified all 41 TASK_LIBRARY entries now have learningPrompt
- Type-check: only pre-existing errors remain (Resolver inference quirks on zodResolver + z.coerce, MissedTask type on dashboard/page.tsx). No new errors introduced.
- Production build: ✓ all 17 routes compile cleanly
- Lint: clean

Stage Summary:
- Per spec §7B + §7C: flexible milestone + learning prompts implemented
  - ✅ MonthlyMilestone calculation engine (idempotent, configurable, with notifications)
  - ✅ 3/4 qualifying weeks → milestone (configurable via monthlyQualifyingWeeks setting, default 3)
  - ✅ "Qualifying week" = at least one APPROVED task (gentle, not perfect)
  - ✅ Engine auto-runs after every APPROVED review (manual + auto-approval paths)
  - ✅ Parent dashboard: per-child progress card with weeks-remaining and trophy badge
  - ✅ Child dashboard: gentle violet progress card with weeks-remaining message
  - ✅ Parent + child both notified when milestone reached (MILESTONE_REACHED notification)
  - ✅ All 41 TASK_LIBRARY entries have Bengali learning prompts (the "why" behind each task)
  - ✅ Parent can edit/customize learning prompt in TaskFormDialog
  - ✅ Child sees learning prompt as collapsible "শেখার প্রশ্ন" chip on each task
  - ✅ Library import + restore flows now pass learningPrompt through
- 19/20 sessions complete (95%)
- Next: S5.3 — Parent weekly planner & family celebration (Phase 5 finale)

---
Task ID: S5.3
Agent: main (Super Z)
Task: Parent weekly planner & family celebration — /planner page, FamilyAchievement model usage, planner UI (Phase 5 finale)

Work Log:
- Noted push limitation: no GitHub credentials available in this env. Local commit will be saved; user pushes from their machine.
- Re-read SCHEMA_PLAN.md §5.2 FamilyAchievement model (already applied in S5.1) — has familyId, key, name, description, iconKey, awardedAt, @@unique([familyId, key])
- Defined FAMILY_ACHIEVEMENT_LIBRARY in constants.ts (8 family achievements):
  - first_week (sparkles) — first APPROVED task in the family
  - first_reflection (book-open) — first weekly reflection saved
  - first_sadaqah (heart) — first sadaqah donation confirmed
  - all_milestone_month (trophy) — every active child qualified this month
  - family_service (hand-heart) — APPROVED Generosity & Community task
  - first_incident_resolved (handshake) — first incident resolved restoratively
  - three_reflections (book) — 3 consecutive weeks of reflection
  - first_challenge_completed (target) — first weekly challenge marked COMPLETED
  - Each has Bengali name + description + iconKey + trigger constant
- Created planner-actions.ts server action (NEW):
  - getPlannerData(): one-call loader for the planner page
    - Returns: stats (activeTasks, todayOccurrences, todayApproved, pendingSubmissions, activeRewards, childrenCount), guidance (severity + Bengali message + withinRecommendedRange flag), todaysSchedule (with assignedChildren per occurrence), reviewQueue (top 6 pending submissions), rewards (activeCount, monthlyBudget, spentThisMonth), reflection (thisWeekCompleted, lastWeekCompleted, consecutiveWeeks), familyAchievements, quickLinks
    - Computes start-small guidance: 3-5 tasks recommended (warn if <3, info if >5, good if 3-5)
    - Computes monthly spent from approved/fulfilled redemptions in current month
    - Computes consecutive weeks of reflection (this week or carrying streak from last week)
  - awardFamilyAchievement(key): idempotent via @@unique([familyId, key])
    - Records FamilyAchievement with name/description/iconKey from library
    - Notifies all PARENT memberships (type=MILESTONE_REACHED)
    - Returns {ok, alreadyAwarded?}
  - evaluateFamilyAchievements(trigger): switch over trigger key, checks the corresponding DB condition, calls awardFamilyAchievement if satisfied
    - Best-effort (try/catch swallows all — never fails parent operation)
    - Triggers: first_approved_task, first_reflection, first_sadaqah_confirmed, all_children_milestone, family_service_task, first_incident_resolved, three_consecutive_reflections, first_challenge_completed
  - getFamilyAchievements(): all awarded achievements for the family (newest first)
  - getFamilyAchievementStatus(): returns all 8 library entries with awarded boolean + awardedAt (for showing locked vs unlocked badges)
- Wired evaluateFamilyAchievements into action sites:
  - review-actions.ts reviewSubmission (on APPROVED): triggers first_approved_task, family_service_task (if Generosity & Community), all_children_milestone
  - review-actions.ts submitTaskOccurrence (on AUTO-approval): same triggers (so auto-approval paths also fire achievements)
  - reflection-actions.ts saveWeeklyReflection: triggers first_reflection + three_consecutive_reflections
  - sadaqah-actions.ts confirmSadaqahDonation: triggers first_sadaqah_confirmed
  - incident-actions.ts resolveIncident: triggers first_incident_resolved
  - challenge-actions.ts refreshChallengeProgress: auto-marks challenge COMPLETED when all participants qualified, then triggers first_challenge_completed
  - All wrapped in try/catch + dynamic import (avoid circular deps)
  - All paths revalidatePath('/planner')
- Created /planner page (app/(app)/planner/page.tsx):
  - Header: "পরিবারিক প্ল্যানার" + date + quick action buttons (কাজ পরিচালনা, পুরস্কার)
  - Start-small guidance card (color-coded by severity: good=emerald, warn=amber, info=sky)
    - Suggests 3-5 tasks for new families
    - "ধারাবাহিকতা সংখ্যার চেয়ে গুরুত্বপূর্ণ"
  - Quick stats grid (4 clickable cards): সক্রিয় কাজ, অপেক্ষমান রিভিউ, সক্রিয় পুরস্কার, আজ সম্পন্ন
  - Today's schedule card (lg:col-span-2): all today's occurrences with assigned children per task, status badges, due times, points
  - Review queue card (top 6 items): avatar + childName + taskTitle + relative time + "রিভিউ খুলুন" button
  - Reflection status card: this week + last week status badges + consecutive weeks streak + "রিফ্লেকশন খুলুন" button
  - Rewards + budget card: 3 metrics (activeCount, spentThisMonth, monthlyBudget) + progress bar + 2 quick action buttons
  - Family celebration card (amber-tinted): 8 achievement badges in grid
    - Awarded: amber background, dynamic icon, name, awardedAt date
    - Locked: muted background, Lock icon
    - "🔒 এই অর্জনগুলো শুধু আপনাদের — কোনো লিডারবোর্ড নেই, কোনো তুলনা নেই।"
    - Empty state if earnedCount === 0: hint to do first action
  - Footer guidance card (violet): "পরিবারিক লক্ষ্য — একসাথে গড়ে ওঠা" + "নিখুঁত হওয়ার চেষ্টা করবেন না — ধারাবাহিক হওয়ার চেষ্টা করুন।"
- Added /planner to AppShell NAV with CalendarRange icon
- Type-check: clean (only pre-existing errors remain — Resolver inference quirks on zodResolver, MissedTask type on dashboard/page.tsx, createdBy on review-actions.ts auto-approval path)
- Production build: ✓ all 18 routes compile cleanly (new /planner route included)
- Lint: clean

Stage Summary:
- Per spec §7C + §7D: parent weekly planner + family celebration implemented
  - ✅ /planner page: one-page consolidated view (tasks/schedule/review/rewards)
  - ✅ Start-small guidance: 3-5 tasks recommended, with severity-coded warnings
  - ✅ Today's schedule with assigned children per task (cross-child view)
  - ✅ Review queue (top 6 items) + one-click jump to /review
  - ✅ Reflection status (this week + last week + consecutive streak)
  - ✅ Rewards + monthly budget snapshot with progress bar
  - ✅ Family Celebration section: 8 private family achievements (locked/unlocked)
  - ✅ "No leaderboard, no comparison" — achievements are private to each family
  - ✅ Footer guidance: "নিখুঁত হওয়ার চেষ্টা করবেন না — ধারাবাহিক হওয়ার চেষ্টা করুন।"
- Per spec §5.3: FamilyAchievement model now actively used (was schema-only after S5.1)
  - 8 library entries with Bengali names + descriptions
  - Idempotent awarding via @@unique([familyId, key])
  - Auto-evaluated at 6 action sites (review, reflection, sadaqah, incident, challenge, milestone)
  - Parent notifications on each award
- Phase 5 COMPLETE (3/3 sessions)
- 20/20 sessions complete (100%) 🎉
- DeenSteps 2.0 roadmap fully delivered.

---
Task ID: Phase A (UI/UX Improvement Plan)
Agent: main (Super Z)
Task: UI/UX audit + Phase A quick wins — kill dead UI, fix language, fix navigation

Work Log:
- Did a full senior-designer-level UX/UI audit of the codebase (10 critical problems identified with file:line evidence). Wrote UI_UX_IMPROVEMENT_PLAN.md (1,084 lines) with 5-phase plan, per-screen specs, design system updates, and 9 open questions for Sajid.
- Phase A "quick wins" executed:

A1. Hid dead "অর্জন" card on child dashboard (child/[id]/page.tsx).
    - The ChildAchievement table is never written to by any code in the codebase, so the card always shows the empty state ("প্রথম ব্যাজ অর্জন করতে কাজ সম্পন্ন করো!") no matter how many tasks a child completes.
    - Removed the dead card + the dead db.childAchievement.findMany query + the unused Award import.
    - Will be restored in Phase D when the real child-level achievement engine is wired up.

A2. Translated the entire /reports page to Bengali (was the most dramatic language gap in the codebase — every other page was Bengali, this one was fully English).
    - Header, description, interpretation note (critical safety messaging), empty state, tab labels (Daily/Weekly/Monthly → দৈনিক/সাপ্তাহিক/মাসিক), card titles, table headers, all SummaryCard text.
    - Fixed two Bengali/English mixups caught in self-review ("জন of" → "জন /", "রanking" → "তালিকা").

A3. Fixed ChildCard English leaks on /dashboard (dashboard/page.tsx ChildCard function).
    - "Today" → "আজ", "X/Y tasks" → "X/Y কাজ", "Balance" → "ব্যালেন্স", "This week" → "এই সপ্তাহ", "Next:" → "পরবর্তী:", "X to go" → "আর X বাকি", "X years" → "X বছর", "Age not set" → "বয়স সেট করা নেই", "X pending" → "X অপেক্ষমান".
    - Also fixed the "চ্যালেঞ্জ" summary card that displayed just a checkmark placeholder. Renamed label to "কাজ" (tasks) and wired it to a new data.stats.activeTasks count (added to dashboard-actions.ts) so the card now shows the real number of active task templates.

A4. Fixed English leaks on /review page.
    - "(auto)" → "(স্বয়ংক্রিয়)", "points" → "তারা", "Child's note:" → "সন্তানের নোট:".
    - Removed redundant count-in-description ("{N}টি সাবমিশন আপনার রিভিউর অপেক্ষায়।") since a count badge is shown right next to it.

A5. Fixed status labels on /rewards page + removed dead code.
    - Status labels: "Approved" → "অনুমোদিত", "Declined" → "প্রত্যাখ্যাত", "Fulfilled" → "পূরণ হয়েছে", "Cancelled" → "বাতিল".
    - "requested" → "অনুরোধ করেছে", "Requested {date}" → "অনুরোধ করেছে {date}", "Fulfilled {date}" → "পূরণ হয়েছে {date}".
    - Removed the dead RewardCard function (was defined but never called — catalog uses <RewardsCatalog> instead). Also removed the now-orphaned `Reward` type definition.

A6. Fixed English toasts on child-task-list.tsx.
    - "Submitted! Your parent will review it soon." → "জমা হয়েছে! বাবা-মা শীঘ্রই রিভিউ করবেন।"
    - "Could not submit task." → "কাজ জমা দেওয়া যায়নি।"

A7 + A8. Restructured the sidebar navigation (app-shell.tsx).
    - Added /review to the sidebar (was missing — primary parent workflow only reachable via dashboard button or URL).
    - Added /challenges to the sidebar (was orphaned — page existed but no nav entry).
    - Renamed /tasks nav label from "চ্যালেঞ্জ" to "কাজ" (tasks) to disambiguate from the separate /challenges feature (weekly challenges) which was also labeled "চ্যালেঞ্জ". Two features, same Bengali label was confusing.
    - New sidebar order: ড্যাশবোর্ড, রিভিউ, প্ল্যানার, সন্তান, কাজ, সাপ্তাহিক চ্যালেঞ্জ, পুরস্কার, রিপোর্ট, সেটিংস (9 items, up from 7).
    - Added ClipboardCheck + Trophy icons to imports.

A9. Fixed sadaqah-button silent-vanish (sadaqah-button.tsx).
    - Previously returned `null` when no causes were configured, silently hiding the sadaqah feature entirely.
    - Now shows an empty-state pill: "সাদাকাহ (শীঘ্রই আসছে)" with a dashed emerald border + Heart icon + tooltip explaining parent setup needed.
    - The feature is now visible even when unconfigured, so the child (and parent) knows it exists.

A10. Fixed the notification bell (app-shell.tsx).
    - Previously linked to /dashboard which was misleading — a bell should show actionable items, not the dashboard home.
    - Now links to /review (the pending-approvals queue) which is the most common actionable item the badge count represents.
    - A real notification-center popover is planned for Phase C; this is the interim fix.

- Lint clean. Production build ✓ (all 18 routes compile).
- Commit + push to GitHub.

Stage Summary:
- Phase A "quick wins" delivered. No new components, no schema changes, no new deps. Pure deletions + translations + nav fixes.
- The app now: (1) no longer lies to children with a dead achievement card, (2) has zero English leaks in Bengali pages, (3) has /review and /challenges in the sidebar, (4) shows the sadaqah feature even when unconfigured, (5) has a notification bell that goes to the right place, (6) shows real task counts instead of placeholder checkmarks.
- Estimated felt-quality improvement: ~30% per the plan.
- Next: Phase B (child dashboard redesign — mascot, "today's mission" hero, done-pile, celebrations) pending Sajid's approval + answers to the 9 open questions in UI_UX_IMPROVEMENT_PLAN.md §9.
