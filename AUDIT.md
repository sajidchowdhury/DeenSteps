# DeenSteps — Codebase Audit (Session S0.1)

> **Purpose:** Document the current state of every model, server action, and critical workflow. Identify gaps against the DeenSteps 2.0 specification. This file is the foundation for all subsequent sessions.

---

## 1. Schema Audit (prisma/schema.prisma)

### 1.1 Models — 22 total

| Model | Purpose | Status | Notes |
|-------|---------|--------|-------|
| `User` | Parent account | ✅ Solid | passwordHash, email unique |
| `Account` | OAuth (future) | ✅ Schema only | Unused, no OAuth provider configured |
| `Session` | JWT sessions | ✅ Solid | |
| `VerificationToken` | Email verify | ✅ Schema only | No email service configured |
| `Family` | Family workspace | ✅ Solid | timezone, locale, createdBy |
| `FamilyMembership` | User-Family link | ✅ Solid | Unique [familyId, userId], role PARENT/CAREGIVER |
| `ChildProfile` | Child profile | ✅ Solid | ageRange, avatarColor, status ACTIVE/ARCHIVED |
| `FamilySettings` | Family config | ✅ Solid | pointsName, approval policy, notify flags |
| `TaskTemplate` | Task definition | ⚠️ Partial | Missing: tier, minAge, maxAge, learningPrompt |
| `TaskAssignment` | Task-Child link | ✅ Solid | Unique [taskId, childId] |
| `TaskOccurrence` | Date-specific instance | ✅ Solid | Unique [taskId, scheduledDate], status enum |
| `TaskSubmission` | Child's submission | ✅ Solid | Unique occurrenceId, pointsTxnId unique |
| `TaskReview` | Parent review record | ✅ Solid | |
| `TaskExcusal` | Excused task | ⚠️ Schema only | No UI, no action to create |
| `PointsTransaction` | Ledger entry | ✅ Solid | balanceAfter, type EARNED/REDEMPTION/ADJUSTMENT/REFUND |
| `Reward` | Reward definition | ⚠️ Partial | Missing: category, maxPerWeek, maxPerMonth, cooldownDays, estimatedCost |
| `RewardEligibility` | Per-child eligibility | ✅ Schema only | No UI to manage |
| `RewardRedemption` | Redemption record | ✅ Solid | status enum, pointsTxnId unique |
| `WeeklyChallenge` | Weekly challenge | ⚠️ Orphaned | UI removed, model remains (harmless) |
| `ChallengeParticipant` | Challenge participant | ⚠️ Orphaned | Same as above |
| `MonthlyMilestone` | Monthly milestone | ⚠️ Schema only | No calculation engine |
| `Achievement` | Achievement definition | ✅ Schema only | No auto-award logic |
| `ChildAchievement` | Child's achievement | ✅ Schema only | |
| `Notification` | In-app notification | ✅ Solid | |
| `AuditLog` | Audit trail | ⚠️ Schema only | Model exists but NO action writes to it |

### 1.2 Critical Constraints

| Constraint | Present | Verdict |
|-----------|---------|---------|
| `TaskOccurrence @@unique([taskId, scheduledDate])` | ✅ | Prevents duplicate occurrences |
| `TaskSubmission occurrenceId @unique` | ✅ | One submission per occurrence |
| `TaskSubmission pointsTxnId @unique` | ✅ | One points txn per submission |
| `RewardRedemption pointsTxnId @unique` | ✅ | One points txn per redemption |
| `TaskAssignment @@unique([taskId, childId])` | ✅ | No duplicate assignments |
| `ChildAchievement @@unique([achievementId, childId])` | ✅ | No duplicate achievements |
| `PointsTransaction.balanceAfter` | ✅ | Ledger integrity field present |

### 1.3 Schema Gaps (vs 2.0 spec)

**Missing models:**
- `Incident` / `IncidentReport` / `IncidentResolution` (Phase 3)
- `SadaqahCause` / `SadaqahPledge` / `SadaqahDonation` (Phase 4)
- `WeeklyReflection` (Phase 5)
- `FamilyAchievement` (Phase 5 — distinct from per-family `Achievement`)

**Missing fields on existing models:**
- `TaskTemplate`: `tier` (1-5), `minAge`, `maxAge`, `learningPrompt`
- `Reward`: `category` (EXPERIENCE/LEARNING/PRIVILEGE/FOOD), `maxPerWeek`, `maxPerMonth`, `cooldownDays`, `estimatedCost`
- `FamilySettings`: `monthlyRewardBudget`, `sadaqahPledgeRate`, `sadaqahCurrency`
- `TaskExcusal`: `followUpType`, `followUpNote` (currently only has `reason`)

---

## 2. Authorization Audit

### 2.1 Session Helpers (src/lib/auth/session.ts)

| Helper | Purpose | Used | Verdict |
|--------|---------|------|---------|
| `getCurrentUser()` | Get session user or null | ✅ | Solid |
| `requireUser()` | Redirect to /login if not authed | ✅ | Solid |
| `getUserFamily(userId)` | Get first family membership | ✅ | Solid |
| `requireFamily()` | Get {user, family} or redirect | ✅ | Used in ALL server actions |
| `assertFamilyAccess(familyId, userId)` | Verify membership | ⚠️ | Defined but rarely used directly |
| `assertChildAccess(childId, userId)` | Verify child belongs to family | ⚠️ | Defined but rarely used directly |

### 2.2 Authorization Pattern in Actions

**Good pattern (used in most actions):**
```typescript
const { family } = await requireFamily()
const child = await db.childProfile.findFirst({ where: { id: childId, familyId: family.id } })
if (!child) return { ok: false, error: 'Not found' }
```

This is **functionally equivalent** to `assertChildAccess` — it filters by `familyId` in the query itself, preventing IDOR.

**Actions verified:**
- ✅ `createChildProfile` — uses `family.id`
- ✅ `updateChildProfile` — `findFirst` with `familyId`
- ✅ `archiveChild` / `restoreChild` — `findFirst` with `familyId`
- ✅ `createTask` — validates assignedChildIds against family
- ✅ `updateTask` / `archiveTask` — `findFirst` with `familyId`
- ✅ `submitTaskOccurrence` — verifies child.familyId + task.assignments
- ✅ `reviewSubmission` — checks `submission.child.familyId !== family.id` inside transaction
- ✅ `createReward` / `updateReward` / `archiveReward` — uses `family.id`
- ✅ `requestRedemption` — verifies child + reward belong to family
- ✅ `approveRedemption` / `declineRedemption` / `fulfillRedemption` — checks `redemption.child.familyId`
- ✅ `exportFamilyData` / `deleteFamilyData` — uses `family.id`

**Verdict:** Authorization is **solid**. Every mutation filters by `familyId`. No IDOR vulnerabilities found.

### 2.3 Child-to-Child Access

- ✅ Children cannot approve their own submissions (only parent `reviewSubmission` awards points)
- ✅ Children cannot approve their own redemptions (only parent `approveRedemption`)
- ⚠️ Child dashboard access is via parent session — no separate child auth (acceptable for now, parent manages access)

---

## 3. Points Ledger Audit

### 3.1 Ledger Structure

**Model:** `PointsTransaction`
- `id`, `childId`, `familyId`
- `amount` (positive = credit, negative = debit)
- `type` (EARNED | REDEMPTION | ADJUSTMENT | REFUND)
- `reference` (submissionId | redemptionId)
- `description`
- `balanceAfter` ✅
- `createdAt`

### 3.2 Balance Computation

**Pattern used in all actions:**
```typescript
const last = await tx.pointsTransaction.findFirst({
  where: { childId },
  orderBy: { createdAt: 'desc' },
  select: { balanceAfter: true },
})
const balanceAfter = (last?.balanceAfter ?? 0) + points
```

**Verdict:** ✅ Correct. Balance is always derived from the last transaction's `balanceAfter`. No separate `balance` field that could drift.

### 3.3 Atomicity

| Operation | Transaction | Idempotent | Verdict |
|-----------|-------------|------------|---------|
| Award points (on approval) | ✅ `db.$transaction` | ✅ Checks `submission.decision === null` | Solid |
| Deduct points (on redemption) | ✅ `db.$transaction` | ✅ Checks reward status, balance | Solid |
| Refund points (on decline) | ✅ `db.$transaction` | ⚠️ No idempotency check on decline | See note |
| Adjust points | ❌ Not implemented | N/A | Gap — Phase 3 |

**Note on decline idempotency:** `declineRedemption` checks `redemption.status !== 'REQUESTED'` before refunding, which prevents double-refund. ✅ Effectively idempotent.

### 3.4 Ledger Gaps

- ❌ **No ADJUSTMENT type used** — the `type` field supports `ADJUSTMENT` but no action creates one. Phase 3 (incident resolution) needs this.
- ❌ **No audit log** — `AuditLog` model exists but no action writes to it. Every adjustment should have an audit entry.
- ❌ **No child-facing ledger view** — only "recent stars" list on child dashboard. Spec requires full "আমার তারার হিসাব" with filters.

---

## 4. Task Lifecycle Audit

### 4.1 Occurrence Generation

**Function:** `generateOccurrencesForTask(taskId, daysAhead = 7)`

- ✅ Idempotent (unique constraint, try/catch on create)
- ✅ Respects frequency (DAILY, WEEKDAYS, WEEKLY, CUSTOM, ONCE)
- ✅ Respects start/end dates
- ⚠️ Uses `new Date()` (server timezone) not family timezone — minor gap
- ❌ Only generates 7 days ahead — no background job for long-term generation
- ❌ No "mark as missed" logic — occurrences stay ASSIGNED forever if not submitted

### 4.2 Status Flow

```
ASSIGNED → SUBMITTED → APPROVED (points awarded)
                     → NEEDS_ATTENTION (revision requested, can re-submit)
                     → REJECTED (back to ASSIGNED, can re-submit)
ASSIGNED → (never transitions to MISSED automatically)
```

**Gap:** The `MISSED` status exists in the schema but **no action sets it**. Per spec §3.3, missed tasks should:
1. Be marked missed after the scheduled period ends
2. NOT deduct previously earned points
3. Show encouraging message
4. Allow parent follow-up record

Currently: if a child doesn't submit, the occurrence just stays `ASSIGNED` indefinitely. This is not harmful (no points awarded) but doesn't match the spec's restorative approach.

### 4.3 Task Library

**Current:** 4 categories, 25 tasks
- Islamic Practices (9 tasks)
- Character & Manners (6 tasks)
- Personal Responsibility (5 tasks)
- Learning & Development (5 tasks)

**Spec requires:** 6 categories (add Health & Self-Discipline, Generosity & Community), Tier 1-5 priority, age-appropriate filtering, spec-compliant point values.

**Point value discrepancies:**
| Activity | Current | Spec |
|----------|---------|------|
| Salah practice | 3 | 10 |
| Wudu | (none) | 3 |
| Quran recitation | 2 | 5 |
| Dua | 1 | 3 |
| Truthfulness | 2 | 4 |
| Kindness | 2 | 4 |
| Apologize | 1 | 4 |
| Household responsibility | 2 | 3 |
| School preparation | 1 | 2 |
| Homework | 3 | 3 ✅ |
| Bedtime routine | (none) | 2 |
| Help without being asked | 2 | 4 |

---

## 5. Reward System Audit

### 5.1 Current State

- ✅ Reward catalog (create/edit/archive)
- ✅ Suggestion library (15 Bengali rewards)
- ✅ Redemption workflow (REQUESTED → APPROVED → FULFILLED)
- ✅ Atomic point deduction on request
- ✅ Atomic point refund on decline
- ✅ Balance check prevents overspend

### 5.2 Reward Gaps (vs spec)

- ❌ **No reward categories** — all rewards are flat list, no EXPERIENCE/LEARNING/PRIVILEGE/FOOD classification
- ❌ **No frequency limits** — `maxPerWeek`, `maxPerMonth`, `cooldownDays` fields don't exist
- ❌ **No family budget** — no `monthlyRewardBudget` in FamilySettings
- ❌ **No estimated cost** — no way to track real financial cost
- ❌ **Current `redemptionLimit`** is lifetime per child, not per-week/month
- ⚠️ **Food-heavy library** — 4 of 15 suggestions are food (pizza, burger, ice cream, chocolate). Spec wants non-food promotion.

### 5.3 Redemption Idempotency

- ✅ Balance check inside transaction
- ✅ `redemptionLimit` checked (but it's lifetime, not periodic)
- ❌ No cooldown check (can redeem same reward immediately after approval)
- ❌ No budget check (can exceed family budget)

---

## 6. Missing Features (vs 2.0 spec)

### Phase 1 gaps
- ❌ 6-category Amal Library with Tier 1-5
- ❌ Age-appropriate filtering
- ❌ Spec-compliant point values
- ❌ "Mark as missed" workflow
- ❌ Parent follow-up records (TaskExcusal expansion)
- ❌ Child-facing full ledger view ("আমার তারার হিসাব")
- ❌ Per-child task customization (separate from assignment)

### Phase 2 gaps
- ❌ Reward categories
- ❌ Frequency limits (maxPerWeek, maxPerMonth, cooldownDays)
- ❌ Family monthly budget
- ❌ Non-food reward promotion
- ❌ Low-cost alternative suggestions

### Phase 3 gaps
- ❌ Incident model + child-to-parent reporting
- ❌ Parent mediation workflow
- ❌ Restorative follow-up records
- ❌ Point adjustment with reason + audit

### Phase 4 gaps
- ❌ SadaqahCause / SadaqahDonation models
- ❌ Child sadaqah flow
- ❌ Parent pledge configuration
- ❌ Real-world donation confirmation
- ❌ Donation history

### Phase 5 gaps
- ❌ Weekly reflection model + UI
- ❌ Monthly milestone calculation engine
- ❌ Learning prompts on tasks
- ❌ Parent weekly planner
- ❌ Family achievements (distinct from per-child)
- ❌ Streak break "no problem" message

### Cross-cutting gaps
- ❌ **No automated tests** — zero test files
- ❌ **No AuditLog writes** — model exists, never used
- ❌ **No background job** for occurrence generation / missed marking
- ❌ **Family timezone not used** in occurrence generation (uses server time)

---

## 7. Risk Assessment

| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| Ledger drift from concurrent transactions | High | Low (SQLite serializes) | Use `db.$transaction` everywhere (already done) |
| Duplicate point awards | High | Low | Unique constraints + decision check (solid) |
| IDOR / cross-family access | High | Very Low | All queries filter by familyId (verified) |
| Missed tasks never marked | Medium | High (always happens) | Add Phase 1 S1.3 missed task workflow |
| No audit trail for adjustments | Medium | Medium | Wire AuditLog in Phase 3 |
| Food reward over-promotion | Low | Medium | Phase 2 reward categories |
| No tests | Medium | High | Add tests incrementally per phase |
| SQLite concurrency limits | Medium | Low (dev only) | Switch to PostgreSQL for production |
| Timezone mismatch | Low | Medium | Use family timezone in Phase 1 |

---

## 8. What's Working Well (Don't Break These)

1. **Points ledger integrity** — `balanceAfter` on every transaction, atomic operations, idempotent approvals
2. **Family isolation** — every query filters by `familyId`, no IDOR
3. **Occurrence idempotency** — unique `[taskId, scheduledDate]` prevents duplicates
4. **Submission uniqueness** — `occurrenceId @unique` prevents double-submission
5. **Redemption atomicity** — balance check + deduction + redemption creation in one transaction
6. **Refund safety** — decline checks status before refunding
7. **Bengali localization** — complete, Hind Siliguri font, all UI text
8. **Docker deployment** — multi-stage build, entrypoint with auto-migrate + seed
9. **Setup progress bar** — 3-step, hides when complete
10. **Inline review on dashboard** — no separate review page, reduces friction

---

## 9. Recommendations for Session S0.2 (Schema Plan)

Based on this audit, the next session (S0.2) should produce `SCHEMA_PLAN.md` with:

1. **Exact field additions** per model, per phase (with types, defaults)
2. **New model definitions** (Incident, SadaqahCause, etc.)
3. **Migration order** — which fields are safe to add without breaking existing data
4. **Index strategy** for new query patterns (e.g., `Reward.category`, `TaskTemplate.tier`)
5. **Backfill plan** — how to set `tier` and `category` for existing records

---

## 10. Summary

**Overall verdict:** The codebase is **architecturally sound** for the 2.0 expansion. The core integrity (ledger, authorization, idempotency) is solid. The gaps are **additive** — new fields, new models, new workflows — not rewrites. No breaking changes needed.

**Ready for Phase 1 after S0.2 schema plan.**

---

*Audit completed: Session S0.1*
