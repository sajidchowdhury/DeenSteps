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



