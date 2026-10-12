# DeenSteps 2.0 — Schema Migration Plan (Session S0.2)

> **Purpose:** Exact field additions, new model definitions, migration order, index strategy, and backfill plan for all 5 phases. This file is the blueprint — each phase's first session applies its schema changes with `prisma db push`.

---

## Design Principles

1. **Additive only** — no field removals, no type changes on existing fields
2. **Safe defaults** — every new field has a default so existing rows don't break
3. **No nullable-where-avoidable** — prefer defaults over nulls
4. **Index what we query** — add indexes for new filter patterns
5. **Unique constraints for idempotency** — new ledger-affecting models get unique guards
6. **SQLite-compatible now, PostgreSQL-ready later** — use `String` for enums (Prisma enum not supported on SQLite)

---

## Phase 1 — Core Integrity

### 1.1 TaskTemplate — add tier, age range, learning prompt

```prisma
model TaskTemplate {
  // ... existing fields ...

  tier            Int      @default(3)    // 1-5 priority (1 = core worship, 5 = optional growth)
  minAge          Int?                    // 3, 6, 9, 13 (null = all ages)
  maxAge          Int?                    // 5, 8, 12, 99
  learningPrompt  String?                // optional short Islamic learning question (Phase 5)

  // ... existing relations ...

  @@index([tier])                        // NEW — filter by priority
  @@index([category, tier])              // NEW — grouped priority view
}
```

**Backfill:** All existing tasks get `tier = 3` (Tier 3: Essential daily responsibilities). This is a safe default — parents can adjust.

**Migration:**
```bash
# Add fields with defaults, then push
bun run db:push
# No data loss — all existing rows get tier=3, minAge=null, maxAge=null, learningPrompt=null
```

### 1.2 TaskExcusal — expand for follow-up records

**Current state:**
```prisma
model TaskExcusal {
  id           String   @id @default(cuid())
  occurrenceId String   @unique
  reason       String
  createdAt    DateTime @default(now())
}
```

**Expanded:**
```prisma
model TaskExcusal {
  id             String   @id @default(cuid())
  occurrenceId   String   @unique
  reason         String
  excusedById    String?                  // NEW — who excused
  followUpType   String?                  // NEW — practice_wudu | learn_about_salah | plan_routine | other
  followUpNote   String?                  // NEW — parent's follow-up note
  createdAt      DateTime @default(now())
}
```

**Backfill:** Existing excusals get nulls for new fields. No data loss.

### 1.3 TaskOccurrence — add missedAt timestamp

```prisma
model TaskOccurrence {
  // ... existing fields ...
  missedAt       DateTime?                // NEW — when the system marked it missed (null = not missed)

  // ... existing relations, indexes ...
}
```

**Purpose:** Distinguish "never submitted" from "explicitly marked missed" — the `status = MISSED` + `missedAt` combo gives a clear audit trail.

**Backfill:** All existing occurrences get `missedAt = null`. No data loss.

### 1.4 PointsTransaction — add reason field for adjustments

```prisma
model PointsTransaction {
  // ... existing fields ...
  reason         String?                  // NEW — for ADJUSTMENT type: parent's reason
  adjustedById   String?                  // NEW — who made the adjustment

  // ... existing relations, indexes ...
}
```

**Purpose:** When Phase 3 adds point adjustments (incident resolution), every adjustment must have a reason and an actor. This field is also used by Phase 4 (sadaqah cancellations/refunds).

**Backfill:** All existing transactions get nulls. No data loss.

### 1.5 No new models in Phase 1

Phase 1 is about expanding existing models and adding the missed-task workflow. The child ledger (S1.4) is a read-only view — no new model needed, it queries `PointsTransaction` with filters.

---

## Phase 2 — Responsible Rewards

### 2.1 Reward — add category, frequency limits, estimated cost

```prisma
model Reward {
  // ... existing fields ...

  category        String   @default("EXPERIENCE")  // EXPERIENCE | LEARNING | PRIVILEGE | FOOD
  maxPerWeek      Int?                               // null = unlimited
  maxPerMonth     Int?                               // null = unlimited
  cooldownDays    Int      @default(0)               // min days between redemptions (0 = no cooldown)
  estimatedCost   Decimal? @db.Decimal(10, 2)        // optional real-money cost for budget tracking

  // ... existing relations, indexes ...

  @@index([familyId, category])                      // NEW — filter by category
}
```

**Note on `Decimal`:** SQLite doesn't enforce `@db.Decimal` but stores it as `REAL`. On PostgreSQL migration, this becomes a proper `DECIMAL(10,2)`. For SQLite dev, we could also use `Float?` — but `Decimal?` is more correct for production. Let me use `Float?` for SQLite compatibility now:

```prisma
  estimatedCost   Float?                             // optional real-money cost for budget tracking
```

**Backfill:** All existing rewards get `category = "EXPERIENCE"` (safe default — experiences are the healthiest category). `maxPerWeek = null`, `maxPerMonth = null`, `cooldownDays = 0`, `estimatedCost = null`.

**Migration note:** The existing `redemptionLimit` field (lifetime per child) remains. New `maxPerWeek`/`maxPerMonth` are periodic limits. Both are checked at redemption time.

### 2.2 FamilySettings — add monthly reward budget

```prisma
model FamilySettings {
  // ... existing fields ...

  monthlyRewardBudget  Float?    // NEW — optional monthly spending limit (null = no budget)

  // ... existing relations ...
}
```

**Backfill:** All existing families get `monthlyRewardBudget = null` (no budget). No data loss.

### 2.3 RewardRedemption — add redemptionDate for cooldown tracking

The existing `requestedAt` serves as the redemption timestamp for cooldown checks. No new field needed — `requestedAt` is already indexed via `@@index([childId])`.

**Cooldown check logic (Phase 2 S2.2):**
```typescript
// Find last fulfilled/approved redemption for this reward by this child
const lastRedemption = await db.rewardRedemption.findFirst({
  where: {
    rewardId,
    childId,
    status: { in: ['APPROVED', 'FULFILLED'] },
  },
  orderBy: { requestedAt: 'desc' },
})
if (lastRedemption && reward.cooldownDays > 0) {
  const daysSince = differenceInDays(new Date(), lastRedemption.requestedAt)
  if (daysSince < reward.cooldownDays) {
    throw new Error(`Cooldown active. ${reward.cooldownDays - daysSince} days remaining.`)
  }
}
```

### 2.4 No new models in Phase 2

All Phase 2 changes are field additions to `Reward` and `FamilySettings`.

---

## Phase 3 — Character & Reconciliation

### 3.1 New model: Incident

```prisma
model Incident {
  id          String    @id @default(cuid())
  familyId    String
  status      String    @default("OPEN")  // OPEN | IN_MEDIATION | RESOLVED
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  resolvedAt  DateTime?

  family      Family    @relation(fields: [familyId], references: [id], onDelete: Cascade)
  reports     IncidentReport[]
  resolution  IncidentResolution?

  @@index([familyId])
  @@index([status])
}
```

### 3.2 New model: IncidentReport

```prisma
model IncidentReport {
  id          String   @id @default(cuid())
  incidentId  String
  childId     String
  whatHappened String
  whoInvolved  String?                    // free text — sibling name, etc.
  howFelt      String?
  helpNeeded   String?
  createdAt    DateTime @default(now())

  incident    Incident     @relation(fields: [incidentId], references: [id], onDelete: Cascade)
  child       ChildProfile @relation(fields: [childId], references: [id], onDelete: Cascade)

  @@index([incidentId])
  @@index([childId])
}
```

### 3.3 New model: IncidentResolution

```prisma
model IncidentResolution {
  id            String   @id @default(cuid())
  incidentId    String   @unique
  outcomeType   String   // NO_ACTION | APOLOGY | RETURN_ITEM | REPAIR | HELPFUL_ACTION | CONSEQUENCE
  description   String
  pointsAdjusted Int     @default(0)      // 0 = no point change; negative = deduction; positive = restoration
  pointsTxnId   String?  @unique          // link to PointsTransaction if pointsAdjusted != 0
  reason        String?                    // parent's reason (required if pointsAdjusted != 0)
  resolvedById  String
  createdAt     DateTime @default(now())

  incident      Incident          @relation(fields: [incidentId], references: [id], onDelete: Cascade)
  pointsTxn     PointsTransaction? @relation(fields: [pointsTxnId], references: [id])

  @@index([incidentId])
}
```

### 3.4 ChildProfile — add incident relations

```prisma
model ChildProfile {
  // ... existing fields ...

  incidentReports  IncidentReport[]      // NEW relation

  // ... existing relations ...
}
```

### 3.5 PointsTransaction — add incident relation

```prisma
model PointsTransaction {
  // ... existing fields ...

  incidentResolution  IncidentResolution?  // NEW relation (back-relation)

  // ... existing relations ...
}
```

### 3.6 Backfill

No backfill needed — all new models start empty. Existing data is untouched.

### 3.7 Authorization note

- Incident reports are **private** — only parents in the same family can see them
- Children can only see their **own** reports (not siblings')
- The `familyId` on `Incident` enforces isolation
- Point adjustments via `IncidentResolution` are atomic (linked to `PointsTransaction`)

---

## Phase 4 — Sadaqah & Charitable Giving

### 4.1 New model: SadaqahCause

```prisma
model SadaqahCause {
  id          String   @id @default(cuid())
  familyId    String
  title       String
  description String?
  iconKey     String   @default("heart")
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())

  family      Family    @relation(fields: [familyId], references: [id], onDelete: Cascade)
  donations   SadaqahDonation[]

  @@index([familyId, active])
}
```

### 4.2 New model: SadaqahDonation

```prisma
model SadaqahDonation {
  id              String    @id @default(cuid())
  familyId        String
  childId         String
  causeId         String
  starsDedicated  Int                          // points the child dedicated
  pointsTxnId     String?    @unique           // link to debit PointsTransaction
  status          String    @default("PENDING") // PENDING | CONFIRMED | CANCELLED
  parentConfirmedAt DateTime?
  realAmount      Float?                       // actual money donated (parent records)
  realDate        DateTime?
  confirmationNote String?
  createdAt       DateTime  @default(now())

  family          Family       @relation(fields: [familyId], references: [id], onDelete: Cascade)
  child           ChildProfile @relation(fields: [childId], references: [id], onDelete: Cascade)
  cause           SadaqahCause @relation(fields: [causeId], references: [id], onDelete: Cascade)
  pointsTxn       PointsTransaction? @relation(fields: [pointsTxnId], references: [id])

  @@index([familyId])
  @@index([childId])
  @@index([causeId])
  @@index([status])
}
```

### 4.3 FamilySettings — add sadaqah pledge config

```prisma
model FamilySettings {
  // ... existing fields ...

  sadaqahPledgeEnabled  Boolean  @default(false)  // NEW — is the pledge active?
  sadaqahStarsPerUnit   Int      @default(100)    // NEW — e.g., 100 stars
  sadaqahCurrency       String   @default("BDT")  // NEW — currency code
  sadaqahAmountPerUnit  Float    @default(100)    // NEW — e.g., 100 BDT per 100 stars

  // ... existing relations ...
}
```

### 4.4 ChildProfile — add sadaqah donation relation

```prisma
model ChildProfile {
  // ... existing fields ...

  sadaqahDonations  SadaqahDonation[]      // NEW relation

  // ... existing relations ...
}
```

### 4.5 PointsTransaction — add sadaqah relation

```prisma
model PointsTransaction {
  // ... existing fields ...

  sadaqahDonation  SadaqahDonation?  // NEW relation (back-relation)

  // ... existing relations ...
}
```

### 4.6 Backfill

- `FamilySettings`: all existing families get `sadaqahPledgeEnabled = false`, `sadaqahStarsPerUnit = 100`, `sadaqahCurrency = "BDT"`, `sadaqahAmountPerUnit = 100`. No data loss.
- New models start empty.

### 4.7 Workflow note

1. Child selects a cause + stars to dedicate
2. `requestSadaqah` action: atomically creates `SadaqahDonation` (status=PENDING) + `PointsTransaction` (type=ADJUSTMENT, negative amount, reason="সাদাকাহ")
3. Parent reviews → `confirmSadaqahDonation`: records `realAmount`, `realDate`, `confirmationNote`, sets `parentConfirmedAt`, status=CONFIRMED
4. If cancelled: `cancelSadaqahDonation` creates a refund `PointsTransaction` (type=REFUND), sets status=CANCELLED

---

## Phase 5 — Family Growth

### 5.1 New model: WeeklyReflection

```prisma
model WeeklyReflection {
  id              String   @id @default(cuid())
  familyId        String
  childId         String?
  weekStart       DateTime
  weekEnd         DateTime
  whatWentWell    String?
  whatWasHard     String?
  whatEasier      String?
  nextWeekPlan    String?
  createdAt       DateTime @default(now())

  family          Family        @relation(fields: [familyId], references: [id], onDelete: Cascade)
  child           ChildProfile?  @relation(fields: [childId], references: [id], onDelete: Cascade)

  @@unique([familyId, childId, weekStart])
  @@index([familyId, weekStart])
}
```

**Note:** `childId` is nullable to allow family-level reflections (not just per-child).

### 5.2 New model: FamilyAchievement

**Distinct from existing `Achievement` model.** The existing `Achievement` is per-family definitions + `ChildAchievement` junction. The new `FamilyAchievement` is for **family-wide** achievements (e.g., "completed a week of agreed practice together").

```prisma
model FamilyAchievement {
  id          String   @id @default(cuid())
  familyId    String
  key         String   // "week_of_practice" | "family_service" | etc.
  name        String
  description String
  iconKey     String   @default("award")
  awardedAt   DateTime @default(now())

  family      Family   @relation(fields: [familyId], references: [id], onDelete: Cascade)

  @@unique([familyId, key])
  @@index([familyId])
}
```

### 5.3 TaskTemplate — learningPrompt (already added in Phase 1)

The `learningPrompt` field was added in Phase 1.1. Phase 5 S5.2 populates it with content and adds the UI.

### 5.4 Family — add reflection + family achievement relations

```prisma
model Family {
  // ... existing fields ...

  reflections       WeeklyReflection[]      // NEW relation
  familyAchievements FamilyAchievement[]    // NEW relation

  // ... existing relations ...
}
```

### 5.5 ChildProfile — add reflection relation

```prisma
model ChildProfile {
  // ... existing fields ...

  reflections  WeeklyReflection[]      // NEW relation

  // ... existing relations ...
}
```

### 5.6 Backfill

No backfill needed — new models start empty.

---

## Migration Order (Critical)

**Rule:** Always run `bun run db:push` (dev) after each phase's schema changes. For production, use `prisma migrate dev --name <descriptive>`.

### Order:

1. **Phase 1 (S1.1 start):**
   - Add `tier`, `minAge`, `maxAge`, `learningPrompt` to `TaskTemplate`
   - Add indexes `@@index([tier])`, `@@index([category, tier])`
   - Add `missedAt` to `TaskOccurrence`
   - Expand `TaskExcusal` with `excusedById`, `followUpType`, `followUpNote`
   - Add `reason`, `adjustedById` to `PointsTransaction`
   - Run: `bun run db:push`

2. **Phase 2 (S2.1 start):**
   - Add `category`, `maxPerWeek`, `maxPerMonth`, `cooldownDays`, `estimatedCost` to `Reward`
   - Add index `@@index([familyId, category])`
   - Add `monthlyRewardBudget` to `FamilySettings`
   - Run: `bun run db:push`

3. **Phase 3 (S3.1 start):**
   - Create `Incident`, `IncidentReport`, `IncidentResolution` models
   - Add `incidentReports` relation to `ChildProfile`
   - Add `incidentResolution` relation to `PointsTransaction`
   - Run: `bun run db:push`

4. **Phase 4 (S4.1 start):**
   - Create `SadaqahCause`, `SadaqahDonation` models
   - Add `sadaqahPledgeEnabled`, `sadaqahStarsPerUnit`, `sadaqahCurrency`, `sadaqahAmountPerUnit` to `FamilySettings`
   - Add `sadaqahDonations` relation to `ChildProfile`
   - Add `sadaqahDonation` relation to `PointsTransaction`
   - Run: `bun run db:push`

5. **Phase 5 (S5.1 start):**
   - Create `WeeklyReflection`, `FamilyAchievement` models
   - Add `reflections`, `familyAchievements` relations to `Family`
   - Add `reflections` relation to `ChildProfile`
   - Run: `bun run db:push`

---

## Index Strategy Summary

| Model | New Index | Purpose |
|-------|-----------|---------|
| `TaskTemplate` | `@@index([tier])` | Filter by priority tier |
| `TaskTemplate` | `@@index([category, tier])` | Grouped priority view |
| `Reward` | `@@index([familyId, category])` | Filter rewards by category |
| `Incident` | `@@index([familyId])`, `@@index([status])` | Family isolation + status filter |
| `IncidentReport` | `@@index([incidentId])`, `@@index([childId])` | Report lookup |
| `IncidentResolution` | `@@index([incidentId])` | Resolution lookup |
| `SadaqahCause` | `@@index([familyId, active])` | Active causes per family |
| `SadaqahDonation` | `@@index([familyId])`, `@@index([childId])`, `@@index([causeId])`, `@@index([status])` | Multiple query patterns |
| `WeeklyReflection` | `@@unique([familyId, childId, weekStart])`, `@@index([familyId, weekStart])` | One reflection per week per child |
| `FamilyAchievement` | `@@unique([familyId, key])`, `@@index([familyId])` | No duplicate achievements |

---

## Backfill Summary

| Model | Field | Default | Rationale |
|-------|-------|---------|-----------|
| `TaskTemplate` | `tier` | `3` | Tier 3 = Essential daily responsibilities (safe middle) |
| `TaskTemplate` | `minAge`, `maxAge`, `learningPrompt` | `null` | No age restriction, no prompt (added later) |
| `TaskOccurrence` | `missedAt` | `null` | Not missed yet |
| `TaskExcusal` | `excusedById`, `followUpType`, `followUpNote` | `null` | Existing excusals have no follow-up |
| `PointsTransaction` | `reason`, `adjustedById` | `null` | Existing transactions have no reason |
| `Reward` | `category` | `"EXPERIENCE"` | Experiences are the healthiest default |
| `Reward` | `maxPerWeek`, `maxPerMonth`, `estimatedCost` | `null` | No limit by default |
| `Reward` | `cooldownDays` | `0` | No cooldown by default |
| `FamilySettings` | `monthlyRewardBudget` | `null` | No budget by default |
| `FamilySettings` | `sadaqahPledgeEnabled` | `false` | Disabled by default |
| `FamilySettings` | `sadaqahStarsPerUnit` | `100` | Sensible default |
| `FamilySettings` | `sadaqahCurrency` | `"BDT"` | Bangladesh Taka |
| `FamilySettings` | `sadaqahAmountPerUnit` | `100` | 100 BDT per 100 stars (1:1 example) |

---

## Constraints Summary

| Constraint | Model | Purpose |
|-----------|-------|---------|
| `@@unique([familyId, childId, weekStart])` | `WeeklyReflection` | One reflection per child per week |
| `@@unique([familyId, key])` | `FamilyAchievement` | No duplicate family achievements |
| `incidentId @unique` | `IncidentResolution` | One resolution per incident |
| `pointsTxnId @unique` | `IncidentResolution` | One txn per resolution |
| `pointsTxnId @unique` | `SadaqahDonation` | One txn per donation |

---

## SQLite → PostgreSQL Notes

When switching to PostgreSQL in production:

1. **Enum fields:** Currently `String` with comments. Optionally convert to Prisma `enum` types for stricter validation. Not required — string validation in Zod schemas is sufficient.

2. **`Float?` for money:** `estimatedCost` and `sadaqahAmountPerUnit` use `Float?` for SQLite compatibility. On PostgreSQL, consider migrating to `Decimal @db.Decimal(10, 2)` for precision. For now, `Float?` is acceptable (values are small).

3. **`DateTime` precision:** SQLite stores as ISO strings. PostgreSQL has native `timestamp`. No action needed — Prisma handles the abstraction.

4. **Transaction isolation:** SQLite serializes writes. PostgreSQL has row-level locking. The `db.$transaction` pattern works on both. For PostgreSQL, consider adding `SELECT ... FOR UPDATE` on balance queries in Phase 3+ when concurrent incidents might adjust the same child's balance.

---

## What This Plan Does NOT Do

- ❌ Does not remove any existing field
- ❌ Does not change any existing field type
- ❌ Does not rename any existing model or field
- ❌ Does not break any existing query or action
- ❌ Does not require data migration scripts (all new fields have defaults)

---

## Verification Checklist (per phase)

Before marking a phase's schema as done:

- [ ] All new fields have defaults (or are nullable)
- [ ] All new models have `familyId` for isolation
- [ ] All new models have appropriate indexes
- [ ] All new unique constraints identified
- [ ] `bun run db:push` succeeds without data loss
- [ ] Existing actions still work (no type errors)
- [ ] `bun run lint` passes
- [ ] Dev server starts and dashboard loads

---

*Schema plan completed: Session S0.2*
