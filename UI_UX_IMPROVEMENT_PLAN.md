# DeenSteps — UI/UX Improvement Plan

> **Document type:** Step-by-step redesign plan, no code.
> **Audience:** Sajid (product owner) + future developer/AI agent who will implement.
> **Written by:** Senior UI/UX designer (10 yrs), after a full audit of the codebase.
> **Status:** Draft v1 — ready for review before any implementation begins.

---

## 0. How to read this document

This is a **diagnosis + prescription** for the DeenSteps UI. It is organized as:

1. **§1 Executive summary** — the 30-second version of what's wrong and what to do.
2. **§2 Design principles** — the rules every future UI decision must follow.
3. **§3 The 10 critical problems** — what's broken, with evidence from the audit.
4. **§4 Phased improvement plan** — 5 phases, ordered by impact-per-effort.
5. **§5 Per-screen specifications** — concrete wireframes-in-text for each major screen.
6. **§6 Design system updates** — palette, typography, motion, mascot system.
7. **§7 Implementation order** — what to build first.
8. **§8 Out-of-scope** — what we are NOT doing and why.

**Each phase is independently shippable.** You can stop after Phase A and the app will already feel 50% better.

---

## 1. Executive summary

### The diagnosis in one sentence

> DeenSteps has a **playful, warm, kid-friendly design system** that already exists in the codebase (used on the marketing site and login pages) — but **none of it was ever wired into the actual product**. The product UI runs on a tasteful but adult/corporate emerald-slate palette, with no mascot, no animations, no sounds, no celebration moments, and several dead or hidden features.

### The four biggest problems (in order of user pain)

1. **The child dashboard feels like a bank app, not a game.**
   - Bank-style ledger table for star history.
   - Tiny `text-xs` pill buttons for the two most emotionally important actions ("I need help" and "donate to charity").
   - No mascot, no animations, no sounds, no celebration when a task is approved.
   - Completed tasks stay in the list with `line-through opacity-70` instead of moving to a "done" pile.

2. **The "অর্জন" (Achievement) section on the child dashboard is functionally dead.**
   - It reads from a `ChildAchievement` table that **no code in the entire codebase ever writes to**.
   - A child will see "প্রথম ব্যাজ অর্জন করতে কাজ সম্পন্ন করো!" forever, no matter how many tasks they complete.
   - The *real* achievement system (`FamilyAchievement`, 8 badges, fully wired) is hidden on the parent's planner page only — kids never see it.

3. **Navigation is broken. Two primary parent workflows have no sidebar entry.**
   - `/review` (parent review queue) — not in sidebar. Reachable only by clicking "রিভিউ (N)" on the dashboard (which scrolls to an inline section, not the page) or by typing the URL.
   - `/challenges` (weekly challenges) — not in sidebar. Orphaned page.
   - The parent dashboard has **17 sections on one page** with no in-page nav. Overwhelming.
   - The notification bell just links to `/dashboard` — no notification center.

4. **The sadaqah flow is invisible and the reports page is untranslated.**
   - The sadaqah button **completely vanishes** from the child dashboard if the parent hasn't created any causes (`sadaqah-button.tsx:51` returns `null`). No empty state, no "ask your parents to set this up."
   - When it does show, it's a tiny `text-xs` pill in a `flex-wrap` row alongside the incident button — no visual hierarchy.
   - The donation form uses a native `<select>` dropdown + bare number input — not a kid-friendly card picker or slider.
   - The entire `/reports` page is in English. Every other page is Bengali. This is the most dramatic language gap in the codebase.

### What we will do about it

We will execute **5 phases**, each independently shippable:

| Phase | Theme | Effort | Impact |
|-------|-------|--------|--------|
| **A** | Quick wins — kill dead UI, fix language, fix navigation | Small | High |
| **B** | Child dashboard redesign — game-like, mascot, celebration | Large | Very high |
| **C** | Parent IA cleanup — dashboard de-clutter, nav restructure | Medium | High |
| **D** | Activate the achievement + sadaqah systems for kids | Medium | Very high |
| **E** | Polish — animations, sounds, mascot reactions, micro-interactions | Medium | High |

Total: **~6-8 sessions of focused work**, but you can ship value at every phase.

---

## 2. Design principles

These are the rules. Every UI decision in §3-§5 must satisfy these.

### 2.1 The child is the player, the parent is the dungeon master

The child's UI should feel like a **single-player RPG**:
- A character (mascot) who reacts to everything.
- A clear "today's quest" hero.
- Visible progress (XP bar = stars, level = milestone).
- Rewards that feel like loot.
- A safe "I need help" button that's always one tap away.

The parent's UI should feel like a **calm control panel**:
- A "what needs my attention right now" hero (3 items max).
- Long lists decluttered into tabs and filters.
- No chart unless it answers a question the parent actually has.

### 2.2 Bengali first, Bengali complete

- **Every** user-facing string in the product must be Bengali.
- No English leaks ("auto", "points", "Child's note:", "Approved", "Requested", "Reports").
- Numbers can stay Western (১২৩ vs 123) — but if we have time, Bengali numerals are even better for kids.
- Date format: Bengali month names (বৈশাখ, জ্যৈষ্ঠ, ...) is the dream; "March 15" is unacceptable.

### 2.3 One mascot, everywhere

A single character (working name: **"Nūr"** — Arabic for "light") appears on every child screen. Nūr is:
- A friendly lantern-star hybrid (matches the existing 8-pointed brand mark).
- Has 5 emotional states: happy, proud, thinking, encouraging, concerned.
- Reacts to every action: task approved → Nūr cheers; task missed → Nūr says "no problem, let's try again"; sadaqah donated → Nūr makes dua; achievement unlocked → Nūr celebrates.

Nūr does NOT appear on parent screens (parents get a calm, professional shell).

### 2.4 Celebration is the default, not the exception

Every positive action gets a celebration:
- Task approved → confetti + sound + Nūr cheer.
- Stars earned → star count animates up.
- Reward unlocked → full-screen "You unlocked X!" moment.
- Sadaqah donated → "জাযাকাল্লাহু খাইরান" full-screen moment.
- Achievement unlocked → badge reveal animation.
- Streak extended → flame grows.

Celebrations are **skip-able** (tap to dismiss) and **respect `prefers-reduced-motion`**.

### 2.5 The warm palette ships

The codebase already defines a warm, kid-friendly palette in `globals.css` (`bg-cream`, `bg-sky-soft`, `bg-sunshine`, `bg-emerald-soft`, `bg-mint`, `pattern-dots`, `text-gradient-emerald`). It is used only on marketing/login. **We will use it in the product too.** The emerald-slate corporate palette stays for the parent shell, but the child shell goes warm.

### 2.6 Touch targets are kid-sized

- Minimum 44×44px for any tappable element on the child shell.
- Primary actions get 56×56px minimum.
- No `size="sm"` buttons for primary child actions.

### 2.7 Dead UI is worse than no UI

If a feature doesn't work, **remove it from the screen** until it does. A child who sees "অর্জন" and never earns a badge learns that the app lies. We will either fix or hide — no in-between.

---

## 3. The 10 critical problems (audit evidence)

> Each problem has: **What's wrong** → **Evidence** → **User impact**.

### Problem 1 — The child dashboard has no "today's mission" hero

**What's wrong:** The child's first question — "what do I do today?" — is answered by a 4-stat grid (`আমার তারা / এই সপ্তাহ / ধারাবাহিক দিন / আজ সম্পন্ন`) plus a separate task card with a thin progress bar. There's no single hero saying "here's your mission, here's how you're doing."

**Evidence:** `src/app/child/[id]/page.tsx:303-308` — 4 StatCards in a 2×2 grid. `src/app/child/[id]/page.tsx:341` — `Progress value={todayCompletion} className="mt-2 h-2"` (a 2px-tall bar).

**User impact:** A 6-year-old lands on the dashboard and sees four numbers. They don't know which one matters. They don't know what to do first.

---

### Problem 2 — Completed tasks stay in the list with line-through

**What's wrong:** When a child completes a task and a parent approves it, the task stays in the today list with `line-through opacity-70` styling. The list never shrinks. The child sees a wall of mixed done/pending items.

**Evidence:** `src/components/deensteps/child-task-list.tsx:134` — `<p className={cn('font-semibold text-foreground', isApproved && 'line-through opacity-70')}>{task.taskTitle}</p>`

**User impact:** No dopamine hit from completion. No sense of progress. The visual message is "this is finished, ignore it" rather than "this is done, celebrate."

---

### Problem 3 — The "I need help" button is buried

**What's wrong:** The incident report button — a child's channel to tell their parents about a conflict or worry — is a `text-xs` rose pill (`px-3 py-1.5`, ~12px text, 3.5×3.5px icon) crammed into a `flex flex-wrap gap-2` row alongside the sadaqah button. No visual hierarchy. No "always available" placement.

**Evidence:** `src/app/child/[id]/page.tsx:237-240` — both buttons in a `flex flex-wrap gap-2` row. `src/components/deensteps/incident-report-button.tsx:62-69` — `text-xs` pill.

**User impact:** A child who needs help may not find the button. Or they may not realize it's there until they're already upset. This is the most important emotional feature in the product and it's treated as a footer link.

---

### Problem 4 — The "অর্জন" (Achievement) section on the child dashboard is dead

**What's wrong:** The child dashboard has an "অর্জন" card that queries `db.childAchievement.findMany(...)`. No code in the entire codebase ever writes to `ChildAchievement` or `Achievement`. The card will **always** show the empty state: `"প্রথম ব্যাজ অর্জন করতে কাজ সম্পন্ন করো!"` A kid will wait forever for a badge that never comes.

**Evidence:** `src/app/child/[id]/page.tsx:118-123` (query) + `src/app/child/[id]/page.tsx:419-442` (UI). Grep for `.create` / `.upsert` on `childAchievement` → zero results. AUDIT.md line 34 confirms: "Achievement | ✅ Schema only | No auto-award logic."

The *real* achievement system (`FamilyAchievement`, 8 badges, fully wired) is on the parent's `/planner` page only. Children never see it.

**User impact:** A child learns the app lies. They complete tasks expecting a badge, get nothing, and stop trusting the UI.

---

### Problem 5 — The sadaqah button vanishes silently

**What's wrong:** `SadaqahButton` returns `null` when the parent hasn't created any causes. No empty state, no "ask your parents to set this up," no persistent "sadaqah jar" showing pending/confirmed donations. The feature is invisible.

**Evidence:** `src/components/deensteps/sadaqah-button.tsx:51` — `if (causes.length === 0) return null`.

**User impact:** A parent who hasn't configured sadaqah thinks the feature doesn't exist. A child never learns about the concept of charitable giving from stars. The single most spiritually significant action in the app is opt-in by parent setup, with no onboarding nudge.

When the button does show, it's a tiny `text-xs` pill in a `flex-wrap` row. No celebration when donated. The form uses a native `<select>` dropdown and a bare number input — not kid-friendly.

---

### Problem 6 — The ledger is a bank statement

**What's wrong:** The child's star history page (`/child/[id]/ledger`) is a 12-column grid table with a header row (Date/Description/Change/Balance), running balance column, type badges, and an audit-trail message at the bottom: `"প্রতিটি তারা একটি অডিটযোগ্য লেজারে ট্র্যাক করা হয়। কখনোই মুছে ফেলা হয় না।"`

**Evidence:** `src/components/deensteps/ledger-client.tsx:119-195` (the table) + `:198-202` (audit message).

**User impact:** A 6-year-old sees a spreadsheet. They cannot answer "how am I doing?" without reading rows. There's no graph, no star-jar visualization, no celebration of milestones crossed.

---

### Problem 7 — The parent dashboard has 17 sections and no in-page nav

**What's wrong:** The parent dashboard page (`/dashboard`) is one long scroll containing: greeting → setup bar → 6 summary cards → family overview → inline review → missed tasks → incidents → budget → 2 chart cards → child progress bars → resolved incidents → sadaqah review → sadaqah history → weekly reflection → milestone progress → recent activity + quick actions + recent stars.

**Evidence:** Count sections in `src/app/(app)/dashboard/page.tsx` between lines 60 and 360. There is no in-page nav, no anchor menu, no tabs.

**User impact:** A parent opens the dashboard and is immediately overwhelmed. They cannot find the "what do I do right now" answer. Quick Actions (the most useful card) is buried at the bottom.

---

### Problem 8 — `/review` and `/challenges` have no sidebar entry

**What's wrong:** The sidebar has 7 items: ড্যাশবোর্ড, প্ল্যানার, সন্তান, চ্যালেঞ্জ (actually /tasks), পুরস্কার, রিপোর্ট, সেটিংস. Two primary parent workflows are missing:
- `/review` (parent review queue) — only reachable via dashboard button (which scrolls to an inline section, not the page) or URL.
- `/challenges` (weekly challenges) — orphaned page, only reachable via URL.

Also: the "চ্যালেঞ্জ" label is used for `/tasks` (task CRUD) but there's a separate `/challenges` page for weekly challenges. Two different features, same Bengali label.

**Evidence:** `src/components/deensteps/app-shell.tsx:28-36` (NAV array). `src/app/(app)/review/page.tsx` exists. `src/app/(app)/challenges/page.tsx` exists.

**User impact:** Parents can't find review. They can't find weekly challenges. They may not even know weekly challenges exist.

---

### Problem 9 — The reports page is entirely in English

**What's wrong:** Every other page in the app is Bengali. The `/reports` page is fully English: title ("Reports"), description, interpretation note, tab labels ("Daily"/"Weekly"/"Monthly"), card titles, table headers, empty states — all English.

**Evidence:** `src/app/(app)/reports/page.tsx` lines 230, 233, 243-251, 259-264, 268-276, 283-358, 362-445, 448-532. The audit confirms this is the most dramatic language gap in the codebase.

**User impact:** A Bengali-speaking parent opens Reports and cannot read it. They miss the critical safety messaging ("These reports are not a measure of character, religiosity, or a child's worth").

---

### Problem 10 — No mascot, no animations, no sounds, no celebration

**What's wrong:**
- The mascot/illustration system (`src/components/marketing/illustrations.tsx`) exists but is used only on the marketing site. After login, zero characters.
- Animations are defined in `globals.css` (`animate-pop-in`, `animate-float-soft`) but `animate-pop-in` is never used. `animate-float-soft` is only used in marketing.
- Zero audio assets. No sounds for any action.
- No confetti, no framer-motion, no `whileHover`/`whileTap`, no success animations on any positive event.

**Evidence:** See §14 of the audit. Grep `src/` for `animate-pop-in` → only the definition. Grep for `Audio` or `playSound` → zero results in product code.

**User impact:** The app feels lifeless. Every interaction returns a static UI update. There's no joy, no delight, no reason to come back tomorrow.

---

## 4. Phased improvement plan

### Phase A — Quick wins (1 session, ~2 hours)

> **Goal:** Kill dead UI, fix the worst language leaks, fix the worst navigation gaps. No new components — just deletions and translations.

#### A1. Hide the dead "অর্জন" card on the child dashboard
- **File:** `src/app/child/[id]/page.tsx:419-442`
- **Action:** Wrap the entire অর্জন card in `{false && (...)}` OR delete it entirely. Leave a comment: `// TODO: Phase D — replace with real achievement system`.
- **Reasoning:** Dead UI lying to children is worse than no UI. We'll bring it back properly in Phase D.

#### A2. Fix the reports page translation
- **File:** `src/app/(app)/reports/page.tsx`
- **Action:** Translate every English string to Bengali. Critical strings:
  - "Reports" → "রিপোর্ট"
  - "An overview of how your family is engaging with tasks and rewards." → "আপনার পরিবার কাজ ও পুরস্কারে কীভাবে অংশ নিচ্ছে তার সারসংক্ষেপ।"
  - The safety note (lines 243-251) → translate carefully, this is critical messaging.
  - "Daily" / "Weekly" / "Monthly" → "দৈনিক" / "সাপ্তাহিক" / "মাসিক"
  - All table headers, card titles, empty states.
- **Reasoning:** Most dramatic language gap in the codebase.

#### A3. Fix the language leaks on the parent dashboard
- **File:** `src/app/(app)/dashboard/page.tsx:432-460` (the `ChildCard` function)
- **Action:** Translate "Today" / "This week" / "Balance" / "{ageRange} years" / "Age not set" / "{n} pending" / "to go" to Bengali.
- Also fix `:92` — the "চ্যালেঞ্জ" summary card shows just a checkmark. Replace with actual `data.stats.activeTasks` count (or remove the card if no data).

#### A4. Fix the language leaks on the review page
- **File:** `src/app/(app)/review/page.tsx:115, 120`
- **Action:** "(auto)" → "(স্বয়ংক্রিয়)", "points" → "তারা", "Child's note:" → "সন্তানের নোট:"

#### A5. Fix the language leaks on the rewards page
- **File:** `src/app/(app)/rewards/page.tsx:333-339, 354-358`
- **Action:** Status labels ("Approved" / "Declined" / "Fulfilled" / "Cancelled") → Bengali. "Requested {date}" / "Fulfilled {date}" → Bengali.

#### A6. Fix the language leaks on the child task list
- **File:** `src/components/deensteps/child-task-list.tsx:92, 97`
- **Action:** `'Submitted! Your parent will review it soon.'` → `'জমা হয়েছে! বাবা-মা শীঘ্রই রিভিউ করবেন।'`. `'Could not submit task.'` → `'কাজ জমা দেওয়া যায়নি।'`

#### A7. Add `/review` to the sidebar
- **File:** `src/components/deensteps/app-shell.tsx:28-36`
- **Action:** Add `{ href: '/review', label: 'রিভিউ', icon: CheckSquare }` between `প্ল্যানার` and `সন্তান`. Use the `ClipboardCheck` icon from lucide-react.
- **Reasoning:** Review is a primary parent workflow. It must be in the top-level nav.

#### A8. Add `/challenges` to the sidebar (or merge it into tasks)
- **File:** `src/components/deensteps/app-shell.tsx:28-36` + a decision
- **Action:** Either (a) add `{ href: '/challenges', label: 'সাপ্তাহিক চ্যালেঞ্জ', icon: Trophy }` as a separate item, OR (b) move the weekly-challenges feature into the `/tasks` page as a tab.
- **Recommendation:** Option (b) — merge. Two features with the same Bengali label is confusing. Make `/tasks` have tabs: কাজ (tasks) | সাপ্তাহিক চ্যালেঞ্জ (weekly challenges).

#### A9. Fix the sadaqah-button silent-vanish
- **File:** `src/components/deensteps/sadaqah-button.tsx:51`
- **Action:** Replace `if (causes.length === 0) return null` with an empty-state UI: a small card saying "বাবা-মা এখনো কোনো সাদাকাহ কারণ যোগ করেননি। তাদের বলুন!" with a subtle visual (a dimmed Heart icon).
- **Reasoning:** The feature must be visible even when unconfigured, so the child (and parent) knows it exists.

#### A10. Make the notification bell open a real notification list
- **File:** `src/components/deensteps/app-shell.tsx:120-129` + a new page or popover
- **Action:** Replace the bell-as-link-to-dashboard with a bell that opens a popover (or a `/notifications` page) showing the last 10 notifications. Each item has icon + title + time-ago + link to the relevant page.
- **Reasoning:** A bell that just links to the dashboard is misleading. Users expect a bell to show notifications.

#### A11. Remove the dead `RewardCard` function
- **File:** `src/app/(app)/rewards/page.tsx:236-295`
- **Action:** Delete the function. It's never called.
- **Reasoning:** Dead code confuses future maintainers.

---

### Phase B — Child dashboard redesign (2-3 sessions)

> **Goal:** Make the child dashboard feel like a game, not a bank app. Introduce the mascot, the "today's mission" hero, the done-pile pattern, and celebration moments.

#### B1. Design the mascot (Nūr)

**Visual spec:**
- A friendly lantern-star hybrid. Body is a rounded 8-pointed star (matches the brand mark). Face has two eyes + a smile. A small flame glows inside.
- 5 emotional states, each a separate SVG illustration:
  1. **Happy** (default) — gentle smile, eyes open, flame steady.
  2. **Proud** — bigger smile, eyes closed in joy, flame bright, small sparkles around.
  3. **Thinking** — head tilted, one eye squinting, finger on chin.
  4. **Encouraging** — warm smile, hand extended (like "come on, you can do it").
  5. **Concerned** — soft frown, eyes worried, flame dimmed.
- Colors: warm gold body (`bg-sunshine`), emerald flame (`bg-emerald-soft`), deep slate eyes.
- Size variants: `sm` (48px), `md` (80px), `lg` (140px), `xl` (220px for celebration screens).
- Stickers: PNG/SVG exports for each state, ready to drop into any screen.

**File location:** `src/components/deensteps/mascot.tsx` — exports `<NurMood state="happy" size="md" />` etc.

#### B2. Child shell — a new layout wrapper for all `/child/*` pages

**Visual spec:**

```
┌────────────────────────────────────────────────────────┐
│  [← পরিবার]   DeenSteps (logo)    [Nūr sm] [Salam, Zayd]│  ← sticky header, 64px
├────────────────────────────────────────────────────────┤
│                                                        │
│  ╔════════════════════════════════════════════════╗    │
│  ║  [Nūr lg, proud]                                ║    │  ← "Today's Mission" hero
│  ║                                                ║    │     (replaces 4-stat grid)
│  ║  আসসালামু আলাইকুম, জায়েদ!                    ║    │
│  ║  আজকের মিশন: ৩ / ৫ সম্পন্ন                    ║    │
│  ║                                                ║    │
│  ║  [████████████████░░░░░░] ৩/৫                ║    │
│  ║                                                ║    │
│  ║  ⭐ ১২ তারা আজ  🔥 ৫ দিন ধারাবাহিক          ║    │
│  ╚════════════════════════════════════════════════╝    │
│                                                        │
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │  💝 সাদাকাহ      │  │  🤝 সাহায্য চাই  │              │  ← two big action cards
│  │  জমা: ৫০ তারা   │  │  বাবা-মাকে বলো  │              │     (replaces tiny pills)
│  │  [নিবেদন করো]   │  │  [খুলুন]        │              │
│  └─────────────────┘  └─────────────────┘              │
│                                                        │
│  আজকের কাজ (৩ বাকি)                                   │
│  ┌────────────────────────────────────────────────┐    │
│  │  [🕌]  জোহরের নামাজ     ১৩:০০   +১০ ⭐  [✓]   │    │  ← task card (whole card
│  │       শেখার প্রশ্ন: দুপুরে কাজ থামিয়ে...      │    │     is tappable)
│  └────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────┐    │
│  │  [📖]  কুরআন তিলাওয়াত  ০৬:৩০   +৫ ⭐  [✓]    │    │
│  └────────────────────────────────────────────────┘    │
│  ...                                                  │
│                                                        │
│  ✅ সম্পন্ন (২)                                        │  ← done pile (collapsed)
│  ┌────────────────────────────────────────────────┐    │
│  │  [😊]  ফজরের নামাজ      ০৫:৩০   +১০ ⭐  সম্পন্ন │    │
│  └────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────┐    │
│  │  [🌟]  সকালের আজকার    ০৭:০০   +৩ ⭐   সম্পন্ন  │    │
│  └────────────────────────────────────────────────┘    │
│                                                        │
│  [📚 আমার তারার হিসাব]   [🏆 আমার অর্জন]              │  ← bottom nav (sticky)
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Key changes from current:**
- **"Today's Mission" hero** replaces the 4-stat grid. Nūr is in the proud state if the child has done ≥1 task today, happy otherwise. The progress bar is thick (8px) and prominent. Stars + streak are secondary chips below.
- **Two big action cards** replace the tiny pills. Sadaqah on the left (emerald theme, shows current pending + confirmed totals). "I need help" on the right (rose theme, always visible).
- **Task cards are fully tappable** (whole card = tap target). The button at the right is just a visual affordance.
- **Learning prompt is auto-revealed** for the first task of the day (teaches the kid the feature exists), then collapsed for subsequent tasks.
- **Done pile** is a separate section below the active list, collapsed by default. Tap to expand. Completed tasks move here with a brief animation.
- **Bottom sticky nav** with two big buttons: "আমার তারার হিসাব" (ledger) and "আমার অর্জন" (achievements — re-enabled in Phase D).

#### B3. Task card redesign

**Current:** `border bg-card p-4`, status icon, title, badges, description, collapsed learning prompt, collapsed instructions, small button.

**New:**
```
┌──────────────────────────────────────────────────┐
│  [🕌]  জোহরের নামাজ            ১৩:০₀   +১০ ⭐  │
│  ──────────────────────────────────────────────  │
│  সময়মতো জোহর নামাজ পড়া।                       │
│                                                  │
│  💡 শেখার প্রশ্ন:                                │
│  দুপুরে কাজ থামিয়ে নামাজ পড়া আত্মনিয়ন্ত্রণ   │
│  শেখায় — তুমি কি এই চেষ্টা করো?                │
│                                                  │
│                              [সম্পন্ন করেছি ✓]  │
└──────────────────────────────────────────────────┘
```

- Bigger icon tile (40×40, currently 28×28).
- Bigger title (text-base, currently text-sm).
- Star count has a star icon next to the number.
- Learning prompt is **visible by default** (not collapsed) for the first 3 tasks a child ever sees. After that, collapsed with a "💡 শেখার প্রশ্ন" toggle.
- Primary button is `size="default"` (40px tall), not `size="sm"` (32px).
- Whole card is a `<button>` (tap anywhere on the card opens the submit dialog).

#### B4. Done-pile behavior

When a task transitions ASSIGNED → SUBMITTED:
- Card stays in the active list with a "বাবা-মার অপেক্ষায়" (waiting for parents) state. Clock icon pulses gently.
- Nūr's mood becomes "thinking" (waiting).

When a task transitions SUBMITTED → APPROVED (the parent approved it):
- **Confetti animation** bursts from the card.
- **Sound** plays (a soft "ta-da" chime, ~0.5s).
- **Nūr mood** becomes "proud" for 3 seconds, with a speech bubble: `"আলহামদুলিল্লাহ! +{N} তারা অর্জিত!"`.
- **Card animates** down into the "✅ সম্পন্ন" pile (which auto-expands for 3 seconds to show the new addition, then collapses).
- **Today's Mission hero** updates: progress bar animates, star count animates up.
- **If the approval pushed the child over a milestone threshold** (e.g., 100 stars lifetime), a full-screen celebration card overlays: Nūr xl-size, proud mood, "তুমি ১০০ তারা অর্জন করেছ! 🎉".

When a task transitions SUBMITTED → NEEDS_ATTENTION (parent wants revision):
- Nūr mood becomes "encouraging" with a speech bubble: `"কোনো সমস্যা নেই — আবার চেষ্টা করো!"`.
- Card stays in the active list with an amber border + "আবার চেষ্টা করো" button.

#### B5. Ledger redesign

**Current:** Bank-style 12-column table with audit-trail messaging.

**New:**

```
┌────────────────────────────────────────────────────┐
│  [← পরিবার]   আমার তারার হিসাব         [Nūr sm]   │
├────────────────────────────────────────────────────┤
│                                                    │
│  ╔══════════════════════════════════════════════╗  │
│  ║  ⭐ আমার তারা                                ║  │
│  ║                                              ║  │
│  ║         ১২৩                                  ║  │  ← huge number, animated
│  ║                                              ║  │
│  ║  এই সপ্তাহে +২৩  ·  এই মাসে +৮৭             ║  │
│  ╚══════════════════════════════════════════════╝  │
│                                                    │
│  [আজ] [এই সপ্তাহ] [এই মাস] [সব]                   │
│                                                    │
│  📈 তারার গ্রাফ                                     │
│  ┌────────────────────────────────────────────┐    │
│  │     ·   ·                                    │    │  ← simple line chart
│  │   ·   ·   ·  ·                              │    │     (stars per day)
│  │  · ·       · ·                              │    │
│  │ ──────────────────────────                  │    │
│  │  সো  রো  ম   ব   বি  শু  শ                  │    │
│  └────────────────────────────────────────────┘    │
│                                                    │
│  সাম্প্রতিক তারা                                   │
│  ┌────────────────────────────────────────────┐    │
│  │  [⭐ +১০]  ফজরের নামাজ সম্পন্ন              │    │  ← card per transaction
│  │            ২ ঘন্টা আগে                       │    │
│  └────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────┐    │
│  │  [💝 -৫]   সাদাকাহ নিবেদন                  │    │
│  │            ৩ ঘন্টা আগে                       │    │
│  └────────────────────────────────────────────┘    │
│  ...                                              │
│                                                    │
└────────────────────────────────────────────────────┘
```

- **Huge balance number** (text-6xl, animated count-up when the page loads).
- **Simple line chart** of stars earned per day (last 7 days). Use Recharts (already a dep).
- **Transaction cards** instead of table rows. Each card: type icon + amount + description + time-ago.
- **Remove the audit-trail messaging** ("অডিটযোগ্য লেজার", "কখনোই মুছে ফেলা হয় না"). That's parent-facing compliance language; kids don't need it.

#### B6. Touch target audit

Walk through every child-facing button and ensure 44×44px minimum:
- `child-task-list.tsx:204` — primary action button → bump from `size="sm"` to `size="default"`.
- `incident-report-button.tsx:62-69` — replace pill with full card (Phase B2).
- `sadaqah-button.tsx:87-92` — replace pill with full card (Phase B2).
- `reward-request-button.tsx:50-85` — bump from `size="sm"` to `size="default"`.

---

### Phase C — Parent information architecture cleanup (1-2 sessions)

> **Goal:** Make the parent dashboard scannable. Restructure navigation. Merge duplicate workflows.

#### C1. Parent dashboard de-clutter

**Current:** 17 sections, one long scroll.

**New structure (3 zones):**

```
┌────────────────────────────────────────────────────────┐
│  আসসালামু আলাইকুম, সাজিদ 👋                          │  ← greeting
│  আজকে যা করতে হবে:                                    │
│                                                        │
│  ╔════════════════════════════════════════════════════╗│
│  ║  🔔 ৩ টি রিভিউ বাকি    [রিভিউ খুলুন →]            ║│  ← "what to do now" hero
│  ║  ⚠️ ১ টি ইনসিডেন্ট     [দেখুন →]                  ║│     (only non-zero items)
│  ║  🤲 ২ টি সাদাকাহ       [নিশ্চিত করুন →]           ║│
│  ╚════════════════════════════════════════════════════╝│
│                                                        │
│  [tabs: আজ | এই সপ্তাহ | এই মাস]                       │  ← time scope tabs
│                                                        │
│  ─── পরিবার ───                                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │ [avatar]   │  │ [avatar]   │  │ [avatar]   │        │  ← child cards (3-up)
│  │ জায়েদ      │  │ মরিয়ম     │  │ + সন্তান   │        │
│  │ ৫/৬ আজ     │  │ ৩/৪ আজ    │  │  যোগ করুন  │        │
│  │ ২৩ ⭐      │  │ ১৮ ⭐     │  │            │        │
│  └────────────┘  └────────────┘  └────────────┘        │
│                                                        │
│  ─── চার্ট ───                                         │
│  [7-day trend chart]  [Category donut]                 │  ← charts (only on weekly/monthly tabs)
│                                                        │
│  ─── দ্রুত কাজ ───                                     │
│  [নতুন চ্যালেঞ্জ]  [পুরস্কার যোগ]  [রিপোর্ট]  [সন্তান] │  ← quick actions (always visible)
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Key changes:**
- **"What to do now" hero** at the top. Only shows non-zero items. If everything is zero, shows: `"আলহামদুলিল্লাহ, সব কাজ শেষ! পরিবারের সাথে সময় কাটান। 🌿"`.
- **Time scope tabs** (আজ / এই সপ্তাহ / এই মাস) — controls what the child cards + charts show. Default আজ.
- **Child cards** are 3-up, scannable. Tap a card → go to that child's dashboard.
- **Charts** only render on the weekly/monthly tabs (not today).
- **Quick actions** are always visible at the bottom of the hero zone (not buried at the bottom of the page).
- **Move to other pages:** missed tasks, incidents, sadaqah review, sadaqah history, weekly reflection, milestone progress, resolved incidents — all move OFF the dashboard. They have their own pages (or sections within `/planner`). The dashboard becomes a launchpad, not a kitchen sink.

#### C2. Where do the removed sections go?

| Current dashboard section | New home |
|---------------------------|----------|
| Inline review | Becomes the "রিভিউ বাকি" hero item → links to `/review` |
| MissedTasksSection | Move to `/planner` (it's about planning) |
| IncidentsSection | New page `/incidents` (or under `/children`) |
| Budget card | Move to `/rewards` (it's about rewards) |
| 7-day trend chart | Stays (on weekly tab) |
| Category donut | Stays (on monthly tab) |
| ChildProgressBars | Becomes the 3-up child cards |
| ResolvedIncidentsSection | Move to `/incidents` |
| SadaqahReviewSection | Move to `/sadaqah` (new page) or `/planner` |
| SadaqahHistorySection | Move to `/sadaqah` |
| WeeklyReflectionSection | Move to `/planner` (already partially there) |
| MilestoneProgressSection | Move to `/planner` |
| Recent submissions | Becomes the "রিভিউ বাকি" hero item |
| Quick actions | Stays (in hero zone) |
| Recent stars | Move to `/reports` (it's a report) |

#### C3. Restructure the sidebar

**Current (7 items, missing /review and /challenges):**
```
ড্যাশবোর্ড
প্ল্যানার
সন্তান
চ্যালেঞ্জ (actually /tasks)
পুরস্কার
রিপোর্ট
সেটিংস
```

**New (7 items — sadaqah stays child-side per Sajid's decision, not a parent nav item):**
```
─── আজ ───
ড্যাশবোর্ড
রিভিউ          (NEW)

─── পরিকল্পনা ───
প্ল্যানার
কাজ            (renamed from চ্যালেঞ্জ)
সাপ্তাহিক চ্যালেঞ্জ   (NEW — was orphaned)

─── পরিবার ───
সন্তান
পুরস্কার
ইনসিডেন্ট       (NEW — was on dashboard)

─── ডেটা ───
রিপোর্ট
সেটিংস
```

**Why:**
- `/review` gets its own top-level entry under "আজ" (today).
- `/tasks` renamed from "চ্যালেঞ্জ" to "কাজ" (work) — clearer, avoids confusion with weekly challenges.
- `/challenges` added as "সাপ্তাহিক চ্যালেঞ্জ" (weekly challenge) — no longer orphaned.
- `/sadaqah` is **NOT** a parent nav item — per Sajid's decision, sadaqah stays child-side. The child accesses everything from their dashboard. The parent's role (confirming pending donations) stays as a section on the parent dashboard. The sadaqah settings (pledge config, cause management) stay in `/settings`.
- `/incidents` gets its own page (currently it's a section on the dashboard) — declutters dashboard.

#### C4. Planner page becomes a real weekly planner

**Current:** Today-focused. No week grid.

**New:** Add a 7-day week grid at the top.

```
┌────────────────────────────────────────────────────────┐
│  পরিবারিক প্ল্যানার    [এই সপ্তাহ ◀ ▶]                  │
│                                                        │
│  ┌──┬──┬──┬──┬──┬──┬──┐                                │
│  │রো│সো│ম │ব │বি│শু│শ │  ← day columns               │
│  ├──┼──┼──┼──┼──┼──┼──┤                                │
│  │  │  │  │  │  │  │  │  ← tasks (drag-to-reorder)    │
│  │  │  │  │  │  │  │  │                                │
│  └──┴──┴──┴──┴──┴──┴──┘                                │
│                                                        │
│  ─── এই সপ্তাহর রিফ্লেকশন ───                          │
│  [রিফ্লেকশন ফর্ম]                                       │
│                                                        │
│  ─── এই মাসের মাইলস্টোন ───                             │
│  [per-child milestone cards]                           │
│                                                        │
│  ─── পরিবারিক উদযাপন ───                                │
│  [family achievement badges]                           │
│                                                        │
└────────────────────────────────────────────────────────┘
```

The week grid is the new home for: missed tasks (visible per-day), today's schedule, and the start-small guidance. Reflection + milestone + achievements stay where they are.

#### C5. Review page — add filters + batch approve

**Current:** Flat list, no filters, no batch actions.

**New:**
- Filter chips: সব সন্তান / [জায়েদ] / [মরিয়ম] / ... (per-child filter).
- Filter chips: সব ক্যাটাগরি / [নামাজ] / [চরিত্র] / ... (per-category filter).
- Sort dropdown: নতুন প্রথমে (default) / পুরোনো প্রথমে.
- "সব অনুমোদন করুন" (Approve all) button — batch-approves all visible items.
- "সব ফেরত পাঠান" (Return all) button — batch-returns.

---

### Phase D — Activate the achievement + sadaqah systems for kids (1-2 sessions)

> **Goal:** Make the "অর্জন" section on the child dashboard actually work. Make the sadaqah flow a delightful, visible, celebrated experience.

#### D1. Define child-level achievements

**Current state:** `Achievement` and `ChildAchievement` models exist in schema but are empty. `FamilyAchievement` (separate model) has 8 family-wide achievements but is parent-only.

**New:** Define a `CHILD_ACHIEVEMENT_LIBRARY` in `src/lib/constants.ts` — child-level achievements awarded automatically. Examples:

| key | name | description | iconKey | trigger |
|-----|------|-------------|--------|---------|
| `first_task` | প্রথম পদক্ষেপ | তোমার প্রথম কাজ সম্পন্ন! যাত্রা শুরু হলো। | sparkles | first APPROVED task |
| `ten_tasks` | দশ পদক্ষেপ | ১০টি কাজ সম্পন্ন। ধারাবাহিকতা শুরু! | check | 10 cumulative APPROVED |
| `first_sadaqah` | ছোট দাতা | প্রথম সাদাকাহ নিবেদন! আল্লাহ কবুল করুন। | heart | first sadaqah request |
| `first_streak_3` | ৩ দিন ধারাবাহিক | টানা ৩ দিন কাজ সম্পন্ন! 🔥 | flame | 3-day streak |
| `first_streak_7` | ৭ দিন ধারাবাহিক | এক সপ্তাহ! অভ্যাস হয়ে ওঠছে। | flame | 7-day streak |
| `first_milestone` | মাসিক মাইলস্টোন | এই মাসের মাইলস্টোন অর্জিত! 🏆 | trophy | first monthly milestone qualified |
| `quran_7_days` | কুরআন প্রেমিক | টানা ৭ দিন কুরআন তিলাওয়াত! | book-open | 7 consecutive days of any Quran task APPROVED |
| `salah_5_a_day` | এক দিনে ৫ নামাজ | এক দিনে সব নামাজ সম্পন্ন! | mosque | all 5 daily salah tasks APPROVED in one day |
| `kindness_week` | কোমল সপ্তাহ | এই সপ্তাহে ৩ দিন কোমল আচরণ! | heart | 3 days of any Character & Manners task APPROVED in a week |
| `helping_hand` | সাহায্যকারী হাত | ১০ বার বাবা-মাকে সাহায্য করেছ! | hand-heart | 10 cumulative Family Responsibilities tasks APPROVED |
| `honest_tongue` | সত্যবাদী | ২০ বার সত্য কথা বলেছ! | shield-check | 20 cumulative honesty tasks APPROVED |

Each trigger has a corresponding check function in `src/server/actions/achievement-actions.ts` (new file) that runs after every APPROVED review.

#### D2. Re-enable the অর্জন card on the child dashboard (the one we hid in Phase A)

**Visual spec:**

```
┌──────────────────────────────────────┐
│  🏆 আমার অর্জন              [৩ / ১২] │
│  ──────────────────────────────────  │
│                                      │
│  [✨]  [✓]   [💝]  [🔥]              │
│  প্রথম  দশ   ছোট   ৩ দিন             │  ← earned (full color)
│  পদক্ষেপ পদক্ষেপ দাতা  ধারাবাহিক     │
│                                      │
│  [🔒]  [🔒]  [🔒]  [🔒]              │
│  ৭ দিন  মাইল কুরআন ৫ নামাজ          │  ← locked (greyed)
│  ধারা  স্টোন প্রেমিক এক দিন         │
│                                      │
│  [সব অর্জন দেখুন →]                  │  → full achievements page
└──────────────────────────────────────┘
```

- Header shows progress: `[৩ / ১২]` (3 of 12 earned).
- Earned badges: full color, icon + name.
- Locked badges: greyed Lock icon + name. **No description by default** (avoid spoiler), but on long-press/hover show a tooltip: `"এই অর্জন আনলক করতে টানা ৭ দিন কাজ সম্পন্ন করো।"`
- "সব অর্জন দেখুন →" links to a new `/child/[id]/achievements` page with full details.

#### D3. Achievement unlock celebration

When a child earns a new achievement:
1. **Full-screen overlay** appears (modal-style, tap-anywhere-to-dismiss).
2. **Nūr xl-size, proud mood**, with sparkles around.
3. **Big badge icon** in the center, with a "reveal" animation (scale + rotate + glow).
4. **Text:** `"🎉 নতুন অর্জন আনলক! তুমি পেয়েছ: {name}"`
5. **Description:** `"{description}"`
6. **Confetti** rains down.
7. **Sound:** a 1-second celebratory chime.
8. **Button:** `"চমৎকার!"` (dismiss).
9. After dismiss, the badge appears in the অর্জন card on the dashboard.

#### D4. Sadaqah flow redesign

**Current:** Tiny pill button → dialog with dropdown + number input.

**New sadaqah card on child dashboard (replaces the pill):**

```
┌──────────────────────────────────────┐
│  💝 সাদাকাহ                           │
│  ──────────────────────────────────  │
│                                      │
│  ⭐ ১২৩ তারা আমার                    │
│                                      │
│  🤲 এই সপ্তাহয় নিবেদিত: ৫ তারা       │
│  ✅ বাবা-মা নিশ্চিত করেছেন: ৫ তারা   │
│                                      │
│  একটি কারণ বেছে নাও:                 │
│  ┌──────┐ ┌──────┐ ┌──────┐         │
│  │[🕌]   │ │[📖]   │ │[🤲]   │        │  ← cause cards (not dropdown)
│  │মাদ্রাসা│ │গরিব  │ │অসহায় │        │
│  │সাহায্য │ │শিশু   │ │পরিবার │        │
│  └──────┘ └──────┘ └──────┘         │
│  ...                                 │
│                                      │
│  কত তারা নিবেদন করবে?                │
│  [- ১০ +]  বা  [সব দাও]              │  ← stepper + quick-select
│                                      │
│  নিবেদনের পর ব্যালেন্স: ১১৩ ⭐       │
│                                      │
│  [✨ নিবেদন করো]                     │
└──────────────────────────────────────┘
```

**Key changes:**
- **Cause cards** instead of dropdown. Each card shows the cause icon + name. Tap to select (selected card gets a border + check).
- **Stepper** (`- ১০ +`) instead of bare number input. Default 10. Min 1, max balance.
- **Quick-select chips:** `[১০] [২৫] [৫০] [সব দাও]`.
- **Live balance-after preview** updates as the stepper changes.
- **Big primary button:** `"✨ নিবেদন করো"`.

**After donation:**

```
┌──────────────────────────────────────┐
│                                      │
│            [Nūr xl, proud]            │
│                                      │
│      🤲 জাযাকাল্লাহু খাইরান           │
│                                      │
│   তুমি ১০ তারা সাদাকাহর জন্য         │
│   নিবেদন করেছ। আল্লাহ তোমার          │
│   নিয়ামত বাড়িয়ে দিন।               │
│                                      │
│   বাবা-মা শীঘ্রই প্রকৃত দান          │
│   নিশ্চিত করবেন।                     │
│                                      │
│   [চমৎকার ✨]                         │
│                                      │
└──────────────────────────────────────┘
```

- Full-screen overlay (modal).
- Nūr xl-size, proud mood.
- "জাযাকাল্লাহু খাইরান" headline.
- Confetti (emerald-tinted).
- Sound: a soft "ping" + ambient nature sound.
- Dismiss button: "চমৎকার ✨".

#### D5. Sadaqah tracker on the child dashboard

A persistent card (or a section within the sadaqah card from D4) showing:
- ⏳ অপেক্ষমান: N তারা (pending parent confirmation)
- ✅ নিশ্চিত হয়েছে: M তারা (this month)
- 🌍 মোট দান: K তারা (lifetime)

This gives the child a sense of their charitable impact over time.

---

### Phase E — Polish (1-2 sessions)

> **Goal:** Add the delight layer. Animations, sounds, micro-interactions.

#### E1. Animation system

Use `framer-motion` (already a dep? if not, add it). Define a small set of reusable animations:

| Animation | When used | Duration | Easing |
|-----------|-----------|----------|--------|
| `pop-in` | Badges appearing, achievement unlock | 300ms | spring |
| `confetti` | Task approved, achievement unlocked, sadaqah confirmed | 1500ms | gravity |
| `count-up` | Star balance updating | 600ms | ease-out |
| `slide-down` | Done-pile expanding | 250ms | ease-in-out |
| `wiggle` | Nūr's "thinking" state | 2s loop | ease-in-out |
| `glow-pulse` | Milestone progress bar when ≥80% | 2s loop | ease-in-out |
| `shimmer` | Locked achievement badge hint | 3s loop | linear |

All animations respect `prefers-reduced-motion` (the media query is already in `globals.css:251`).

#### E2. Sound system

Add a small sound utility (`src/lib/sounds.ts`) with:

| Sound | When | File |
|-------|------|------|
| `task-approved` | Task approved | A 0.5s soft "ta-da" chime |
| `task-submitted` | Task submitted | A 0.3s gentle "whoosh" |
| `achievement-unlocked` | Achievement earned | A 1s celebratory chime |
| `sadaqah-confirmed` | Sadaqah donated | A 0.8s soft "ping" + ambient |
| `reward-unlocked` | Reward eligible | A 0.6s "sparkle" |
| `error` | Any error | A 0.3s soft "thud" |

Sounds are:
- **Off by default** for children under 6 (parent setting).
- **On by default** for children 6+.
- Toggleable in parent settings (`FamilySettings.soundsEnabled` — new field).
- Respect the device's mute switch.

Files: small MP3s, ~5-20KB each. Place in `public/sounds/`.

#### E3. Nūr mascot integration

Wire Nūr into every child screen:
- **Child dashboard header:** Nūr sm, mood based on today's progress (proud if ≥1 task done, happy otherwise).
- **Task cards:** Nūr doesn't appear here (too cluttered).
- **Task approved overlay:** Nūr xl, proud mood.
- **Task needs-revision state:** Nūr md, encouraging mood, with speech bubble.
- **Ledger page header:** Nūr sm, happy.
- **Achievements page:** Nūr md, proud.
- **Sadaqah confirmation:** Nūr xl, proud.

Speech bubbles: small rounded card next to Nūr with a tail. Text is short, Bengali, warm. Examples:
- `"আলহামদুলিল্লাহ! +১০ তারা!"`
- `"কোনো সমস্যা নেই — আবার চেষ্টা করো!"`
- `"তুমি অসাধারণ! এগিয়ে যাও।"`
- `"বাবা-মা তোমার কথা শুনবেন।"`

#### E4. Micro-interactions

- **Star count in header:** when it increases, the new number pops in with a `+N` floating up animation.
- **Streak flame:** grows taller as the streak gets longer. 1-day = small flame, 7-day = big flame, 30-day = roaring flame with sparkles.
- **Progress bars:** animate fill on page load (don't just appear full).
- **Locked achievement badges:** subtle shimmer animation on hover/tap to hint "you can unlock this."
- **Today's mission hero:** the progress bar has a glow-pulse when ≥80% complete.
- **Sadaqah card:** the heart icon gently beats (scale 1.0 → 1.05 → 1.0, 2s loop).

---

## 5. Per-screen specifications

### 5.1 Child dashboard (`/child/[id]`)

**Above the fold (mobile):**
1. Sticky header: [← পরিবার] [logo] [Nūr sm] [Salam, {name}]
2. Today's Mission hero (Nūr md, greeting, X/Y progress, stars + streak chips)
3. Two action cards: সাদাকাহ | সাহায্য চাই

**Below the fold:**
4. আজকের কাজ (active tasks, count in heading)
5. ✅ সম্পন্ন (done pile, collapsed by default, count in heading)
6. আমার পুরস্কার (rewards preview, 3 cards max, "সব দেখুন →")
7. আমার অর্জন (achievements, 6 badges max, "সব দেখুন →")

**Sticky bottom nav:**
- [⭐ তারার হিসাব] [🏆 অর্জন] [🎁 পুরস্কার]

### 5.2 Child ledger (`/child/[id]/ledger`)

(See Phase B5 above.)

### 5.3 Child achievements (`/child/[id]/achievements`) — NEW

- Header: [← পরিবার] আমার অর্জন [Nūr md, proud]
- Progress hero: `[৩ / ১২] অর্জন আনলক` with a progress bar
- Grid of all 12 achievements (4-up on desktop, 3-up on mobile):
  - Earned: full color, icon + name + date earned
  - Locked: greyed Lock + name + "কিভাবে আনলক করবে" hint on tap

### 5.4 Parent dashboard (`/dashboard`)

(See Phase C1 above.)

### 5.5 Parent planner (`/planner`)

(See Phase C4 above.)

### 5.6 Parent review (`/review`)

(See Phase C5 above.)

### 5.7 Parent rewards (`/rewards`)

- Add category filter tabs: সব | অভিজ্ঞতা | শেখা | সুবিধা | খাবার
- Each reward card shows: icon, title, points, category badge, **estimated cost** (if set), **cooldown status** (if cooling down, show "আর X দিন")
- Pending tab: same as current but with batch-approve
- History tab: same as current but Bengali status labels

### 5.8 Parent reports (`/reports`)

- Full Bengali translation (Phase A2).
- Add date range picker (last 7 days / last 30 days / this month / last month).
- Add "PDF ডাউনলোড" button.
- Keep the safety note (translate it carefully).

### 5.9 Parent sadaqah (`/sadaqah`) — NEW

- Tab 1: অপেক্ষমান (pending donations from kids) — same as current SadaqahReviewSection
- Tab 2: ইতিহাস (history) — same as current SadaqahHistorySection
- Tab 3: কজ ক্যাটালগ (causes) — same as current sadaqah-settings cause management
- Tab 4: প্লেজ সেটিংস (pledge config) — same as current sadaqah-settings pledge section

### 5.10 Parent incidents (`/incidents`) — NEW

- Tab 1: খোলা ইনসিডেন্ট (open) — same as current IncidentsSection
- Tab 2: সমাধান হওয়া (resolved) — same as current ResolvedIncidentsSection

---

## 6. Design system updates

### 6.1 Palette — promote the warm palette to the child shell

**Parent shell:** Keep the current emerald-slate palette. It's professional and calm.

**Child shell:** Use the warm redesign palette (already in `globals.css:186-216`):
- Background: `bg-cream` (warm off-white)
- Primary surfaces: `bg-emerald-soft`, `bg-sunshine`, `bg-sky-soft`, `bg-mint`
- Text: `text-emerald-deep`, `text-sunshine-deep`
- Accents: `bg-warm-cream`, `bg-warm-sky`, `bg-warm-mint`
- Patterns: `pattern-dots` on hero backgrounds
- Gradients: `text-gradient-emerald` on big numbers

### 6.2 Typography — bigger, rounder, friendlier for kids

**Current:** Hind Siliguri (Bengali body), Plus Jakarta Sans (display), Geist (Latin).

**Keep these**, but:
- Bump child-shell body text from `text-sm` (14px) to `text-base` (16px).
- Bump child-shell headings up one step (e.g., hero title from `text-3xl` to `text-4xl`).
- Use `font-extrabold` (not `font-bold`) for child-shell hero numbers.
- Consider adding a third display font for celebration moments — something rounder and more playful (e.g., Baloo Da 2 — a Bengali rounded font). Use only on celebration overlays, not on regular UI.

### 6.3 Mascot system

(See Phase B1 + E3.)

### 6.4 Motion

(See Phase E1.)

### 6.5 Sounds

(See Phase E2.)

### 6.6 Touch targets

- Child shell: 44×44px minimum, 56×56px for primary actions.
- Parent shell: 36×36px minimum (adults can manage smaller), 44×44px for primary actions.

### 6.7 Spacing

- Child shell: more generous padding (24px between cards, 16px inside cards).
- Parent shell: keep current tight spacing (16px between, 12px inside).

---

## 7. Implementation order

> **Recommended sequence. Each phase is independently shippable.**

### Phase A — Quick wins (1 session, ~2 hours)

Files to touch:
- `src/app/child/[id]/page.tsx` (hide dead অর্জন card)
- `src/app/(app)/reports/page.tsx` (full Bengali translation)
- `src/app/(app)/dashboard/page.tsx` (fix ChildCard English leaks)
- `src/app/(app)/review/page.tsx` (fix English leaks)
- `src/app/(app)/rewards/page.tsx` (fix status labels, remove dead RewardCard)
- `src/components/deensteps/child-task-list.tsx` (fix toast language)
- `src/components/deensteps/app-shell.tsx` (add /review to sidebar, optionally /challenges)
- `src/components/deensteps/sadaqah-button.tsx` (fix silent-vanish)

**Ship it.** The app already feels 30% better.

### Phase B — Child dashboard redesign (2-3 sessions)

Sub-phases (each can ship independently):
- B1: Mascot design (SVG assets) — half session
- B2: Child shell + Today's Mission hero — 1 session
- B3: Task card redesign — half session
- B4: Done-pile + celebration on approval — 1 session
- B5: Ledger redesign — half session
- B6: Touch target audit — quarter session

**Ship after each sub-phase.** By end of Phase B, the child dashboard feels like a game.

### Phase C — Parent IA cleanup (1-2 sessions)

Sub-phases:
- C1: Dashboard de-clutter — 1 session
- C2: Move sections to their new homes — half session
- C3: Sidebar restructure — quarter session
- C4: Planner week grid — half session
- C5: Review filters + batch — half session

### Phase D — Achievement + sadaqah activation (1-2 sessions)

Sub-phases:
- D1: Define CHILD_ACHIEVEMENT_LIBRARY + achievement-actions.ts — half session
- D2: Re-enable অর্জন card on child dashboard — quarter session
- D3: Achievement unlock celebration — half session
- D4: Sadaqah flow redesign — 1 session
- D5: Sadaqah tracker — quarter session

### Phase E — Polish (1-2 sessions)

Sub-phases:
- E1: Animation system (framer-motion) — 1 session
- E2: Sound system — half session
- E3: Nūr mascot integration everywhere — half session
- E4: Micro-interactions — half session

### Total estimate: 6-8 sessions

But you can ship value at every phase. Don't wait for "everything to be done" — ship Phase A this week.

---

## 8. Out of scope (what we are NOT doing)

- **No leaderboard / sibling comparison.** Guardrails §2.2 forbids it. The "family celebration" achievements are family-wide, not comparative.
- **No public/social features.** Guardrails §2.5 forbids it.
- **No pricing/subscription.** Guardrails §2.5 forbids it.
- **No AI-generated religious content.** Guardrails §2.1 forbids it without scholar review.
- **No point deduction for missed worship.** Guardrails §2.3 forbids it. (Already implemented correctly — just noting we won't change this.)
- **No Arabic RTL support in this redesign.** Bengali-only for now. RTL is a future scope.
- **No PostgreSQL switch.** SQLite is fine for family-scale. Prisma makes a future switch easy.
- **No multi-caregiver UI.** The schema supports it; the UI doesn't. Future scope.
- **No automated tests in this redesign.** The audit noted this gap; we're not adding tests as part of the UI work. Separate effort.

---

## 9. Open questions for Sajid

Before we start Phase B, I need answers to these:

1. **Mascot name + look.** I proposed "Nūr" (lantern-star hybrid). Are you happy with this, or do you have a different character in mind? (Options: a star, a lantern, a cat, a bird, a tree, a small child character.) The mascot will appear hundreds of times across the app — worth getting right.

2. **Sounds on by default?** I proposed "on for 6+, off for under 6." Is that the right cutoff? Or should sounds be off by default for everyone, with a parent toggle?

3. **Phase A scope.** Do you want me to ship Phase A (quick wins) immediately as a single PR, or batch it with Phase B? My recommendation: ship Phase A immediately. It's 2 hours of work for a 30% improvement in felt quality.

4. **Reports page translation.** The safety note on the reports page is critical messaging. Do you want to review the Bengali translation before it ships, or trust me to translate it carefully?

5. **Sidebar restructure (Phase C3).** Adding `/sadaqah` and `/incidents` as top-level nav items is a significant IA change. Are you happy with 8 nav items (grouped), or do you want to keep it to 7 and find another home for sadaqah/incidents?

6. **Week grid in planner (Phase C4).** A real 7-day drag-to-reorder grid is a meaningful build. Is that worth it, or is a simpler "today + tomorrow" list enough?

7. **Achievement library (Phase D1).** I proposed 12 child achievements. Do you want to review the list, or trust me to ship it and iterate?

8. **Celebration overlay frequency.** Every task approved = confetti + sound. Is that too much? Should we celebrate only every Nth task, or every milestone, or every task? My recommendation: every task for the first week, then taper to every 5th task + every milestone. But this is a product feel decision — your call.

---

## 10. Next step

Review this document. Mark which open questions (§9) you have answers to. Then I will start Phase A.

**No code will be written until you approve this plan.**
