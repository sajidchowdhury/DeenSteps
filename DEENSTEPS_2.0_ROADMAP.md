# DeenSteps 2.0 — রোডম্যাপ ও বাস্তবায়ন গাইড

> **এই ফাইলটি কী:** DeenSteps 2.0 স্পেসিফিকেশন বনাম বর্তমান কোডবেসের গ্যাপ অ্যানালাইসিস, ফেজ-ভিত্তিক সেশন প্ল্যান, এবং কী করা যাবে না তার নির্দেশিকা। প্রতিটি সেশন স্বাধীনভাবে করা যাবে — আগের সেশনের কনটেক্সট ছাড়াই।

---

## ০. এক্সিকিউটিভ সারসংক্ষেপ

DeenSteps 2.0 হলো একটি **parent-guided Islamic tarbiyah প্ল্যাটফর্ম** — শুধু পয়েন্ট-চেজিং অ্যাপ নয়। লক্ষ্য হলো সন্তানকে এমন মানুষ হিসেবে গড়ে তোলা যে:
- আল্লাহকে ভালোবাসে
- রাসূলুল্লাহ ﷺ-এর শিক্ষা অনুসরণ করে
- সুন্দর চরিত্রের অধিকারী
- ধীরে ধীরে দায়িত্বশীল মুসলিম হয়ে ওঠে

**ফাইনাল নীতি:** *The stars are a tool. Tarbiyah is the goal.*

বর্তমান কোডবেস (~১.৫ মাসের কাজ) একটি শক্তিশালী ভিত্তি দিয়েছে। 2.0 সেই ভিত্তির উপর নির্মাণ করবে — কোনো কিছু ভাঙবে না, শুধু গভীর ও অর্থপূর্ণ হবে।

---

## 📊 Progress Tracker

> **Last updated:** Session S5.3 complete — Phase 5 finished, all 20 sessions delivered

### Phase 0 — Audit & Foundation

| Session | Scope | Status | Deliverable |
|---------|-------|--------|-------------|
| **S0.1** | Codebase audit — ledger, task lifecycle, auth, rewards | ✅ **DONE** | `AUDIT.md` |
| **S0.2** | Schema migration plan — new models/fields, migration order | ✅ **DONE** | `SCHEMA_PLAN.md` |

### Phase 1 — Core Integrity (5 sessions) — COMPLETE

| Session | Scope | Status |
|---------|-------|--------|
| **S1.1** | Amal Library expansion — 6 categories, Tier 1-5, age filter, spec points | ✅ **DONE** |
| **S1.2** | Tier & age UI — badges, filters, grouping in import dialog | ✅ **DONE** |
| **S1.3** | Missed task policy — mark missed, encouraging messages, parent follow-up | ✅ **DONE** |
| **S1.4** | Child ledger — "আমার তারার হিসাব" full view with filters | ✅ **DONE** |
| **S1.5** | Parent customization — per-child selection, restore defaults | ✅ **DONE** |

### Phase 2 — Responsible Rewards (4 sessions) — COMPLETE

| Session | Scope | Status |
|---------|-------|--------|
| **S2.1** | Reward categories — Experiences, Learning, Privileges, Food | ✅ **DONE** |
| **S2.2** | Frequency limits & cooldown — maxPerWeek, maxPerMonth, cooldownDays | ✅ **DONE** |
| **S2.3** | Family budget — monthly limit, committed/remaining tracking | ✅ **DONE** |
| **S2.4** | Non-food & low-cost alternatives — category tabs, promotion | ✅ **DONE** |

### Phase 3 — Character & Reconciliation (3 sessions) — COMPLETE

| Session | Scope | Status |
|---------|-------|--------|
| **S3.1** | Incident schema & child report — "আমি একটি সমস্যায় সাহায্য চাই" | ✅ **DONE** |
| **S3.2** | Parent mediation workflow — perspectives, follow-up records | ✅ **DONE** |
| **S3.3** | Restorative follow-up & audit — optional adjustment with reason | ✅ **DONE** |

### Phase 4 — Sadaqah & Charitable Giving (3 sessions)

| Session | Scope | Status |
|---------|-------|--------|
| **S4.1** | Sadaqah schema & cause catalog | ✅ **DONE** |
| **S4.2** | Child sadaqah flow — dedicate stars, parent review | ✅ **DONE** |
| **S4.3** | Parent pledge & real donation confirmation | ✅ **DONE** |

### Phase 5 — Family Growth (3 sessions) — COMPLETE

| Session | Scope | Status |
|---------|-------|--------|
| **S5.1** | Weekly reflection & streak gentleness | ✅ **DONE** |
| **S5.2** | Flexible milestone & learning prompts | ✅ **DONE** |
| **S5.3** | Parent weekly planner & family celebration | ✅ **DONE** |

### Summary

| Phase | Sessions | Completed | Remaining |
|-------|----------|-----------|-----------|
| Phase 0 | 2 | 2 | 0 |
| Phase 1 | 5 | 5 | 0 |
| Phase 2 | 4 | 4 | 0 |
| Phase 3 | 3 | 3 | 0 |
| Phase 4 | 3 | 3 | 0 |
| Phase 5 | 3 | 3 | 0 |
| **Total** | **20** | **20** | **0** ✅ |

### Key Audit Findings (from S0.1)

**Solid foundation (don't break):**
- ✅ Points ledger with `balanceAfter` on every transaction
- ✅ Atomic transactions for all balance changes
- ✅ Family isolation on every query (no IDOR)
- ✅ Idempotent occurrence generation (unique constraints)
- ✅ Idempotent submission/review (decision check)
- ✅ Safe redemption refund (status check before refund)

**Critical gaps to address:** (all RESOLVED in DeenSteps 2.0 — see session worklog)
- ✅ "Mark as missed" workflow delivered in S1.3 (no point deduction, encouraging messages)
- ✅ Child-facing full ledger view delivered in S1.4 (`/child/[id]/ledger`)
- ✅ Reward frequency limits, cooldown, family budget delivered in S2.2 + S2.3
- ✅ Incident + Sadaqah + Reflection models all delivered across Phases 3-5
- ✅ AuditLog actively written from S3.3 onward (point adjustments, sadaqah confirmations, incident resolutions)
- ✅ Library now has 6 categories, Tier 1-5, age filter (S1.1 + S1.2)
- ⚠️ Automated tests still not added — see "Remaining / future" section below

**Status:** Project complete. All 20 sessions delivered. 🎉

**Remaining / future (out of original 2.0 scope):**
- ⚠️ Automated tests (unit + e2e) — not yet added
- 🔄 Email notifications (currently in-app only)
- 🔄 Arabic RTL support
- 🔄 PostgreSQL production switch (currently SQLite)
- 🔄 Multi-caregiver support (currently single-parent workspace)

---

## ১. বর্তমান অবস্থা অডিট (কী ইতিমধ্যে আছে)

### ✅ সম্পূর্ণ করা হয়েছে

| ক্ষেত্র | বর্তমান অবস্থা |
|--------|---------------|
| অথেনটিকেশন | NextAuth credentials, family-aware session, IDOR প্রতিরোধ (`assertFamilyAccess`, `assertChildAccess`) |
| পরিবার ওয়ার্কস্পেস | প্যারেন্ট + একাধিক সন্তান, পরিবার আইসোলেশন |
| চ্যালেঞ্জ (কাজ) | একটি সেকশন, create/edit/archive, library import (২৫টি টেমপ্লেট, ৪ ক্যাটাগরি) |
| কাজের অকারেন্স | ডেট-ভিত্তিক, ইউনিক `[taskId, scheduledDate]` কনস্ট্রেইন্ট |
| সাবমিশন ওয়ার্কফ্লো | Assigned → Submitted → Approved/Needs Revision/Rejected |
| পয়েন্ট লেজার | `PointsTransaction` (amount, type, balanceAfter), অ্যাটমিক, অডিটযোগ্য |
| পুরস্কার | ক্যাটালগ + রিডিম্পশন ওয়ার্কফ্লো (request → approve/decline → fulfill), অ্যাটমিক পয়েন্ট কর্তন, ফেরত |
| প্যারেন্ট ড্যাশবোর্ড | ইনলাইন রিভিউ, চার্ট (৭-দিন ট্রেন্ড, ক্যাটাগরি ডোনাট, চাইল্ড প্রগ্রেস বার) |
| চাইল্ড ড্যাশবোর্ড | আজকের কাজ, তারা ব্যালেন্স, স্ট্রিক, পুরস্কার প্রগ্রেস |
| সেটআপ প্রগ্রেস | ৩-ধাপ (সন্তান → পুরস্কার → চ্যালেঞ্জ) |
| রিপোর্ট | দৈনিক/সাপ্তাহিক/মাসিক, Recharts |
| সেটিংস | পরিবার, প্রোফাইল, পয়েন্ট, নোটিফিকেশন, প্রাইভেসি (এক্সপোর্ট/ডিলিট) |
| লোকালাইজেশন | সম্পূর্ণ বাংলা (Hind Siliguri) |
| মার্কেটিং পেইজ | ৬ সেকশন, ভিজ্যুয়াল-ফার্স্ট, কোনো pricing/FAQ নেই |
| ডিপ্লয় | Docker + Nginx + SSL |
| অর্জন মডেল | `Achievement` + `ChildAchievement` (schema তৈরি, ক্যালকুলেশন ইঞ্জিন নেই) |
| সাজেশন সিস্টেম | কাজ ও পুরস্কারের জন্য এক-ক্লিক ইম্পোর্ট |

### ⚠️ আংশিক / সীমিত

| ক্ষেত্র | অভাব |
|--------|------|
| আমল লাইব্রেরি | মাত্র ৪ ক্যাটাগরি, Tier সিস্টেম নেই, বয়স-ফিল্টার নেই, পয়েন্ট স্পেক অনুযায়ী নয় |
| মিসড টাস্ক পলিসি | স্পষ্ট "mark as missed" ওয়ার্কফ্লো নেই, উৎসাহজনক বার্তা নেই, প্যারেন্ট ফলোআপ রেকর্ড নেই |
| চাইল্ড লেজার | সাম্প্রতিক তারা লিস্ট আছে, কিন্তু সম্পূর্ণ লেজার ভিউ (ফিল্টার সহ) নেই |
| পুরস্কার ফ্রিকোয়েন্সি | কোনো লিমিট/কুলডাউন/বাজেট নেই |
| স্ট্রিক | দেখানো হয়, কিন্তু ভাঙলে "কোনো সমস্যা নেই—আবার শুরু করি" বার্তা নেই |
| মাসিক মাইলস্টোন | schema আছে, ক্যালকুলেশন ইঞ্জিন নেই |

### ❌ একেবারে নেই

- Health & Self-Discipline ক্যাটাগরি
- Generosity & Community ক্যাটাগরি
- Tier 1-5 প্রায়োরিটি সিস্টেম
- বয়স-উপযোগী কনফিগারেশন (age-appropriate filtering)
- পুরস্কার ক্যাটাগরি (Experiences, Learning, Privileges, Food Treats)
- পুরস্কার ফ্রিকোয়েন্সি লিমিট, কুলডাউন, পারিবারিক বাজেট
- চাইল্ড টু প্যারেন্ট ইনসিডেন্ট রিপোর্ট ("আমি একটি সমস্যায় সাহায্য চাই")
- প্যারেন্ট মেডিয়েশন ওয়ার্কফ্লো
- রেস্টোরেটিভ ফলোআপ রেকর্ড
- সাদাকাহ সঞ্চয় ও চ্যারিটেবল গিভিং
- প্যারেন্ট প্লেজ কনফিগ (stars → cash)
- উইকলি ফ্যামিলি রিফ্লেকশন
- প্যারেন্ট-চাইল্ড লার্নিং প্রম্পট
- প্যারেন্ট উইকলি প্ল্যানার
- অটোমেটেড টেস্ট

---

## ২. কী করা যাবে না — গার্ডরেইলস

এই নিয়মগুলো প্রতিটি সেশনে মাথায় রাখতে হবে:

### ২.১ ধর্মীয় সংবেদনশীলতা

- ❌ **পয়েন্ট কখনোই ঈমান, তাকওয়া, বা ধর্মীয় মূল্য মাপবে না** — শুধু উৎসাহ জোগাবে।
- ❌ **বিতর্কিত ধর্মীয় মত সর্বজনীন সত্য হিসেবে উপস্থাপন করা যাবে না।**
- ❌ **কুরআনের আয়াত/হাদিস যাচাই ছাড়া প্রকাশ করা যাবে না** — qualified scholar রিভিউ দরকার।
- ❌ **পূর্ব-প্রাপ্তবয়স্ক সন্তানকে পাপী বলা যাবে না** শুধু কাজ মিসড হলে।
- ❌ **ইবাদতকে পয়েন্টের লেনদেনে পরিণত করা যাবে না।**

### ২.২ শিশু সুরক্ষা

- ❌ **সন্তান নিজের পয়েন্ট অনুমোদন করতে পারবে না।**
- ❌ **সন্তান অন্য সন্তানের পয়েন্ট কাটতে পারবে না** (এমনকি ইনসিডেন্টেও)।
- ❌ **সন্তান নিজের রিওয়ার্ড রিডিম্পশন অনুমোদন করতে পারবে না।**
- ❌ **ইনসিডেন্ট রিপোর্ট সর্বজনীনভাবে দেখানো যাবে না** — শুধু প্যারেন্ট দেখবে।
- ❌ **সন্তানকে রিপোর্ট করার জন্য শাস্তি দেওয়া যাবে না।**
- ❌ **ভাই-বোনের তুলনা বা লিডারবোর্ড থাকবে না** (default)।
- ❌ **স্ট্রিক ভাঙলে লজ্জিত করা যাবে না** — "কোনো সমস্যা নেই—আবার শুরু করি!"

### ২.৩ ফাইন্যান্সিয়াল অখণ্ডতা

- ❌ **পয়েন্ট কখনোই স্বয়ংক্রিয়ভাবে নিশ্চিত নগদ মূল্য বহন করবে না** — প্যারেন্ট প্লেজ আলাদা।
- ❌ **মিসড ইবাদতের জন্য স্বয়ংক্রিয় পয়েন্ট কর্তন হবে না** — শুধু "পয়েন্ট অর্জিত হবে না"।
- ❌ **লেজার ট্রানজেকশন মুছে ফেলা যাবে না** — শুধু adjustment যোগ করা যায়।
- ❌ **সাদাকাহ পয়েন্ট সরাসরি নগদ হিসেবে গণ্য হবে না** — প্যারেন্ট রিয়েল-ওয়ার্ল্ড ডোনেশন কনফার্ম করবে।
- ❌ **রিওয়ার্ড বাজেট ছাড়িয়ে স্বয়ংক্রিয় অনুমোদন হবে না।**

### ২.৪ টেকনিক্যাল অখণ্ডতা

- ❌ **প্রতিটি ব্যালেন্স-পরিবর্তনকারী অপারেশন অ্যাটমিক ট্রানজেকশন ছাড়া করা যাবে না।**
- ❌ **ডুপ্লিকেট সাবমিশন/পুরস্কার প্রদান করা যাবে না** — idempotent হতে হবে।
- ❌ **পরিবার আইসোলেশন ভাঙা যাবে না** — প্রতিটি কুয়েরি `familyId` ফিল্টার করবে।
- ❌ **বর্তমান কার্যকর� ফাংশনালিটি ভাঙা যাবে না** — শুধু গভীর করা হবে।
- ❌ **AI-জেনারেটেড ধর্মীয় কনটেন্ট যাচাই ছাড়া শিপ করা যাবে না।**
- ❌ **`balanceAfter` ফিল্ড স্কিপ করা যাবে না** — প্রতিটি ট্রানজেকশনে থাকতে হবে।

### ২.৫ কনটেন্ট নীতি

- ❌ **Pricing/subscription/সাবস্ক্রিপশন সেকশন যোগ করা যাবে না** (চিরকাল ফ্রি)।
- ❌ **FAQ সেকশন যোগ করা যাবে না** (ল্যান্ডিং পেইজে)।
- ❌ **শিশুদের সোশ্যাল ফিচার যোগ করা যাবে না** — প্যারেন্ট-ম্যানেজড পরিবেশ।
- ❌ **থার্ড-পার্টি বিজ্ঞাপন/ট্র্যাকিং যোগ করা যাবে না।**

---

## ৩. ফেজ প্ল্যান (৫টি ফেজ + ১টি ফাউন্ডেশন)

মোট **৬টি ফেজ, ২০টি সেশন**। প্রতিটি সেশন ~১-২ ঘণ্টার কাজ।

### Phase 0 — অডিট ও ফাউন্ডেশন (২ সেশন)

| সেশন | স্কোপ | ডেলিভারেবল |
|------|-------|------------|
| S0.1 | বর্তমান কোড অডিট — পয়েন্ট লেজার, টাস্ক লাইফসাইকেল, অথোরাইজেশন রিভিউ | `AUDIT.md` — প্রতিটি মডেল/অ্যাকশনের বর্তমান অবস্থা, গ্যাপ, ঝুঁকি |
| S0.2 | schema মাইগ্রেশন প্ল্যান — নতুন মডেল/ফিল্ড তালিকা, মাইগ্রেশন ক্রম | `SCHEMA_PLAN.md` — প্রতিটি ফেজের schema পরিবর্তন |

---

### Phase 1 — কোর ইন্টিগ্রিটি (৫ সেশন)

**লক্ষ্য:** আমল লাইব্রেরি, ডেট-ভিত্তিক লাইফসাইকেল, চাইল্ড লেজার, মিসড টাস্ক পলিসি।

| সেশন | স্কোপ | ডেলিভারেবল | নির্ভরতা |
|------|-------|------------|---------|
| S1.1 | **আমল লাইব্রেরি সম্প্রসারণ** — ৬ ক্যাটাগরি (Salah/Akhlaq/Family/Education/Health/Generosity), Tier 1-5, বয়স-ফিল্টার, স্পেক অনুযায়ী পয়েন্ট | `TASK_LIBRARY` আপডেট, `TASK_CATEGORIES` ৬-এ, `TIER` ফিল্ড, `minAge`/`maxAge` ফিল্ড | S0.2 |
| S1.2 | **টিয়ার ও বয়স UI** — লাইব্রেরি ইম্পোর্ট ডায়ালগে টিয়ার ব্যাজ, বয়স ফিল্টার, ক্যাটাগরি গ্রুপিং | ImportTasksDialog আপডেট, টিয়ার ব্যাজ কম্পোনেন্ট | S1.1 |
| S1.3 | **মিসড টাস্ক পলিসি** — সিডিউল শেষে "missed" মার্ক, উৎসাহজনক বার্তা, প্যারেন্ট ফলোআপ রেকর্ড, স্বয়ংক্রিয় পয়েন্ট কর্তন নয় | `markAsMissed` অ্যাকশন, `TaskExcusal` সম্প্রসারণ, চাইল্ড ড্যাশবোর্ডে "কোনো সমস্যা নেই" বার্তা | S0.2 |
| S1.4 | **চাইল্ড লেজার** — "আমার তারার হিসাব" বাটন, সম্পূর্ণ লেজার ভিউ (তারিখ, বিবরণ, পরিবর্তন, ব্যালেন্স, স্ট্যাটাস), ফিল্টার (আজ/সপ্তাহ/মাস/সব) | `/child/[id]/ledger` রুট, `PointsLedger` কম্পোনেন্ট | S0.2 |
| S1.5 | **প্যারেন্ট কাস্টমাইজেশন** — প্রতি সন্তানে আলাদা কাজ নির্বাচন, পয়েন্ট সমন্বয়, ডিফল্ট লাইব্রেরি রিস্টোর, আর্কাইভ ছাড়া হিস্ট্রি সংরক্ষণ | `perChildOverrides` ফিল্ড, "রিস্টোর ডিফল্ট" বাটন, আর্কাইভ পলিসি রিভিউ | S1.1, S1.2 |

---

### Phase 2 — রেসপন্সিবল রিওয়ার্ডস (৪ সেশন)

**লক্ষ্য:** ফ্রিকোয়েন্সি লিমিট, কুলডাউন, পারিবারিক বাজেট, নন-ফুড সাজেশন।

| সেশন | স্কোপ | ডেলিভারেবল | নির্ভরতা |
|------|-------|------------|---------|
| S2.1 | **রিওয়ার্ড ক্যাটাগরি** — Experiences, Learning, Privileges, Food Treats; ক্যাটাগরি-ভিত্তিক সাজেশন | `Reward.category` ফিল্ড, `REWARD_LIBRARY` পুনর্গঠন, ক্যাটাগরি ফিল্টার | S0.2 |
| S2.2 | **ফ্রিকোয়েন্সি লিমিট ও কুলডাউন** — `maxPerWeek`, `maxPerMonth`, `cooldownDays` ফিল্ড; রিডিম্পশন চেক লজিক | schema আপডেট, `requestRedemption` অ্যাকশনে চেক, UI-তে লিমিট দেখানো | S2.1 |
| S2.3 | **পারিবারিক বাজেট** — `FamilySettings.monthlyRewardBudget`, কমিটেড/বাকি বাজেট ট্র্যাকিং, বাজেট ছাড়ালে ব্লক | `monthlyRewardBudget` ফিল্ড, বাজেট ড্যাশবোর্ড উইজেট, রিডিম্পশন ব্লক লজিক | S2.2 |
| S2.4 | **নন-ফুড ও লো-কস্ট অল্টারনেটিভ** — সাজেশন ডায়ালগে ক্যাটাগরি ট্যাব, "লো-কস্ট" ফিল্টার, এক্সপেরিয়েন্স প্রমোশন | RewardQuickAdd আপডেট, "অভিজ্ঞতা" হাইলাইট | S2.1, S2.3 |

---

### Phase 3 — ক্যারেক্টার ও রিকনসিলিয়েশন (৩ সেশন)

**লক্ষ্য:** প্রাইভেট চাইল্ড-টু-প্যারেন্ট ইনসিডেন্ট রিপোর্ট, প্যারেন্ট মেডিয়েশন, রেস্টোরেটিভ ফলোআপ।

| সেশন | স্কোপ | ডেলিভারেবল | নির্ভরতা |
|------|-------|------------|---------|
| S3.1 | **ইনসিডেন্ট স্কিমা ও চাইল্ড রিপোর্ট** — `Incident`, `IncidentReport` মডেল; "আমি একটি সমস্যায় সাহায্য চাই" বাটন; প্রাইভেট রিপোর্ট ফর্ম | schema মাইগ্রেশন, `/child/[id]/report-incident` ফর্ম, `submitIncident` অ্যাকশন | S0.2 |
| S3.2 | **প্যারেন্ট মেডিয়েশন ওয়ার্কফ্লো** — প্যারেন্ট নোটিফিকেশন, প্রতিটি সন্তানের পারস্পেক্টিভ আলাদা, ফলোআপ রেকর্ড (apology/return/repair/helpful action) | `/dashboard/incidents` প্যানেল, `IncidentResolution` মডেল, মেডিয়েশন UI | S3.1 |
| S3.3 | **রেস্টোরেটিভ ফলোআপ ও অডিট** — অপশনাল পয়েন্ট অ্যাডজাস্টমেন্ট (reason + audit সহ), সন্তানকে কোমল ভাষায় জানানো, রিপোর্টারকে শাস্তি না দেওয়া | `adjustPoints` অ্যাকশন (reason সহ), অডিট লগ, চাইল্ড নোটিফিকেশন | S3.2 |

---

### Phase 4 — সাদাকাহ ও চ্যারিটেবল গিভিং (৩ সেশন)

**লক্ষ্য:** ভার্চুয়াল পয়েন্ট ডোনেশন, প্যারেন্ট প্লেজ, রিয়েল-ওয়ার্ল্ড ডোনেশন কনফার্মেশন।

| সেশন | স্কোপ | ডেলিভারেবল | নির্ভরতা |
|------|-------|------------|---------|
| S4.1 | **সাদাকাহ স্কিমা ও কজ ক্যাটালগ** — `SadaqahCause`, `SadaqahPledge`, `SadaqahDonation` মডেল; প্যারেন্ট-অনুমোদিত কজ ক্যাটালগ | schema মাইগ্রেশন, `/settings/sadaqah` কজ ম্যানেজমেন্ট, `SADAQAH_CAUSES` লাইব্রেরি | S0.2 |
| S4.2 | **চাইল্ড সাদাকাহ ফ্লো** — "আমার সাদাকাহ সঞ্চয়" বাটন, কজ নির্বাচন, তারা ডেডিকেট, প্যারেন্ট রিভিউ | `/child/[id]/sadaqah` ফর্ম, `requestSadaqah` অ্যাকশন (অ্যাটমিক রিজার্ভ), প্যারেন্ট নোটিফিকেশন | S4.1 |
| S4.3 | **প্যারেন্ট প্লেজ ও রিয়েল ডোনেশন** — প্লেজ কনফিগ (stars → cash), রিয়েল ডোনেশন কনফার্মেশন, ডোনেশন হিস্ট্রি, ক্যান্সেল/রিফান্ড | `FamilySettings.sadaqahPledgeRate`, `confirmSadaqahDonation` অ্যাকশন, ডোনেশন হিস্ট্রি ভিউ, রিফান্ড লজিক | S4.2 |

---

### Phase 5 — ফ্যামিলি গ্রোথ (৩ সেশন)

**লক্ষ্য:** উইকলি রিফ্লেকশন, ফ্লেক্সিবল মাইলস্টোন, লার্নিং প্রম্পট, উইকলি প্ল্যানার।

| সেশন | স্কোপ | ডেলিভারেবল | নির্ভরতা |
|------|-------|------------|---------|
| S5.1 | **উইকলি রিফ্লেকশন ও স্ট্রিক কোমলতা** — সপ্তাহ শেষে সামারি (কী ভালো/কঠিন/পরের সপ্তাহ), স্ট্রিক ভাঙলে "কোনো সমস্যা নেই" বার্তা | `WeeklyReflection` মডেল, `/dashboard/reflection` প্যানেল, স্ট্রিক বার্তা আপডেট | S0.2 |
| S5.2 | **ফ্লেক্সিবল মাইলস্টোন ও লার্নিং প্রম্পট** — ৩/৪ সপ্তাহ কোয়ালিফাই → মাইলস্টোন, কাজে অপশনাল লার্নিং প্রম্পট (কেন নামাজ/সত্য/দয়া) | `MonthlyMilestone` ক্যালকুলেশন ইঞ্জিন, `TaskTemplate.learningPrompt` ফিল্ড, চাইল্ড ড্যাশবোর্ডে প্রম্পট | S5.1 |
| S5.3 | **প্যারেন্ট উইকলি প্ল্যানার ও ফ্যামিলি সেলিব্রেশন** — এক পেইজে কাজ/সিডিউল/রিভিউ/রিওয়ার্ড কনফিগ, ৩-৫ কাজে শুরু, প্রাইভেট ফ্যামিলি অ্যাচিভমেন্ট | `/dashboard/planner` পেইজ, `FamilyAchievement` মডেল, প্ল্যানার UI | S5.2 |

---

## ৪. সেশন প্রোটোকল

প্রতিটি সেশনে এই প্রোটোকল অনুসরণ করা হবে:

### শুরুতে
1. **পূর্ববর্তী সেশন রিভিউ** — `worklog.md` পড়ে কী হয়েছে দেখা।
2. **স্কোপ কনফার্মেশন** — এই সেশনে ঠিক কী করা হবে তা টু-ডু লিস্টে লেখা।
3. **গার্ডরেইলস রিভিউ** — §২ এর নিয়মগুলো মাথায় রাখা।

### কাজের সময়
4. **ছোট কমিট** — প্রতিটি লজিক্যাল ইউনিটে আলাদা কমিট।
5. **লিন্ট চেক** — প্রতিটি কমিটের আগে `bun run lint`।
6. **বাংলা কনটেন্ট** — সব নতুন UI টেক্সট বাংলায়।
7. **অথোরাইজেশন** — প্রতিটি নতুন অ্যাকশনে `assertFamilyAccess`/`assertChildAccess`।

### শেষে
8. **এজেন্ট ব্রাউজার ভেরিফিকেশন** — নতুন ফিচার কাজ করছে কিনা দেখা।
9. **worklog আপডেট** — `worklog.md`-এ সেশন সারসংক্ষেপ।
10. **পুশ** — GitHub-এ পুশ, টোকেন রিমুভ।
11. **পরবর্তী সেশন প্রিভিউ** — পরের সেশনে কী করা হবে তার সংক্ষিপ্ত নোট।

---

## ৫. টেকনিক্যাল প্রিন্সিপল

### ৫.১ লেজার সত্যের উৎস

> **Daily tasks reset; earned points do not.**

- `PointsTransaction` টেবিল হলো একমাত্র সত্য।
- `balanceAfter` ফিল্ড প্রতিটি ট্রানজেকশনে থাকবে।
- বর্তমান ব্যালেন্স = সর্বশেষ ট্রানজেকশনের `balanceAfter`।
- কখনোই আলাদা `balance` ফিল্ড রাখা হবে নার্সিং হোম বা ক্যাশিং করা হবে না।

### ৫.২ অ্যাটমিক ট্রানজেকশন

প্রতিটি ব্যালেন্স-পরিবর্তনকারী অপারেশন:
```
db.$transaction(async (tx) => {
  // 1. বর্তমান ব্যালেন্স কম্পিউট
  // 2. নতুন ব্যালেন্স কম্পিউট
  // 3. PointsTransaction তৈরি (balanceAfter সহ)
  // 4. সম্পর্কিত রেকর্ড আপডেট (submission/redemption/etc.)
  // 5. নোটিফিকেশন তৈরি
})
```

### ৫.৩ Idempotency

- `[taskId, scheduledDate]` ইউনিক — ডুপ্লিকেট অকারেন্স প্রতিরোধ।
- `[submissionId]` একবার অনুমোদন — ডুপ্লিকেট পয়েন্ট প্রতিরোধ।
- `[rewardId, childId, status]` চেক — ডুপ্লিকেট রিডিম্পশন প্রতিরোধ।

### ৫.৪ পরিবার আইসোলেশন

প্রতিটি কুয়েরি:
```typescript
db.someModel.findMany({
  where: { familyId: family.id, ... }
})
```

প্রতিটি মিউটেশন:
```typescript
await assertFamilyAccess(familyId, userId)
// তারপর মিউটেট
```

### ৫.৫ মাইগ্রেশন নিরাপত্তা

- `prisma db push` ব্যবহার (dev), প্রোডাকশনে `prisma migrate`।
- নতুন ফিল্ড যোগ করার সময় default দেওয়া।
- কখনোই `--accept-data-loss` প্রোডাকশনে নয়।

---

## ৬. স্কিমা পরিবর্তন প্রিভিউ (ফেজ অনুযায়ী)

### Phase 1 (S1.1-S1.5)
```
TaskTemplate:
  + tier          Int     // 1-5
  + minAge        Int?    // 3, 6, 9, 13
  + maxAge        Int?
  + learningPrompt String? // (Phase 5 এ ব্যবহৃত)

TaskExcusal:
  + followUpType   String?  // practice_wudu | learn_about_salah | plan_routine | etc.
  + followUpNote   String?
```

### Phase 2 (S2.1-S2.4)
```
Reward:
  + category        String   // EXPERIENCE | LEARNING | PRIVILEGE | FOOD
  + maxPerWeek      Int?
  + maxPerMonth     Int?
  + cooldownDays    Int?
  + estimatedCost   Decimal? // প্যারেন্ট বাজেট ট্র্যাকিংয়ের জন্য

FamilySettings:
  + monthlyRewardBudget Decimal?
```

### Phase 3 (S3.1-S3.3)
```
Incident:
  id, familyId, status, createdAt, resolvedAt

IncidentReport:
  id, incidentId, childId, whatHappened, whoInvolved,
  howFelt, helpNeeded, createdAt

IncidentResolution:
  id, incidentId, outcomeType, description,
  pointsAdjusted Int?, reason String?, resolvedById, createdAt
```

### Phase 4 (S4.1-S4.3)
```
SadaqahCause:
  id, familyId, title, description, iconKey, active

SadaqahPledge:
  id, familyId, starsPerUnit, currency, active

SadaqahDonation:
  id, familyId, childId, causeId, starsDedicated,
  pointsTxnId, status, parentConfirmedAt,
  realAmount Decimal?, realDate DateTime?, confirmationNote String?
```

### Phase 5 (S5.1-S5.3)
```
WeeklyReflection:
  id, familyId, childId, weekStart, whatWentWell,
  whatWasHard, easier, nextWeekPlan

FamilyAchievement:
  id, familyId, key, name, description, iconKey, criteria
```

---

## ৭. ঝুঁকি রেজিস্টার

| ঝুঁকি | সম্ভাবনা | প্রভাব | প্রশমন |
|------|--------|------|------|
| ধর্মীয় কনটেন্ট ভুল | মধ্যম | উচ্চ | qualified scholar রিভিউ, যাচাই ছাড়া শিপ নয় |
| পয়েন্ট লেজার অসঙ্গতি | কম | উচ্চ | অ্যাটমিক ট্রানজেকশন, অটোমেটেড টেস্ট |
| শিশু প্রাইভেসি লঙ্ঘন | কম | উচ্চ | পরিবার আইসোলেশন, ইনসিডেন্ট প্রাইভেসি |
| বর্তমান ফিচার ভাঙা | মধ্যম | মধ্যম | ছোট কমিট, এজেন্ট ব্রাউজার ভেরিফিকেশন |
| স্কিমা মাইগ্রেশন সমস্যা | মধ্যম | উচ্চ | ডিফল্ট ভ্যালু, প্রোডাকশনে migrate |
| সাদাকাহ পয়েন্ট ভুল বোঝাপড়া | মধ্যম | মধ্যম | স্পষ্ট UI, "প্যারেন্ট প্লেজ" ভাষা |
| বাজেট অসঙ্গতি | কম | মধ্যম | বাজেট চেক রিডিম্পশনে |

---

## ৮. সফলতার মেট্রিক

প্রতিটি ফেজ শেষে এই প্রশ্নগুলোর উত্তর "হ্যাঁ" হতে হবে:

### Phase 1
- [ ] প্যারেন্ট ৬ ক্যাটাগরির আমল লাইব্রেরি থেকে বয়স অনুযায়ী কাজ বাছাই করতে পারে?
- [ ] সন্তান তার সম্পূর্ণ তারার হিসাব দেখতে পারে (ফিল্টার সহ)?
- [ ] মিসড সালাহর জন্য স্বয়ংক্রিয় পয়েন্ট কর্তন হয় না?
- [ ] সন্তানকে লজ্জিত করা হয় না?

### Phase 2
- [ ] পুরস্কারে ফ্রিকোয়েন্সি লিমিট ও কুলডাউন কাজ করছে?
- [ ] পারিবারিক বাজেট ছাড়ালে রিডিম্পশন ব্লক হয়?
- [ ] নন-ফুড রিওয়ার্ড প্রমোট করা হচ্ছে?

### Phase 3
- [ ] সন্তান প্রাইভেটে প্যারেন্টকে সমস্যা জানাতে পারে?
- [ ] সন্তান অন্য সন্তানের পয়েন্ট কাটতে পারে না?
- [ ] ইনসিডেন্ট রিপোর্ট সর্বজনীন নয়?
- [ ] রেস্টোরেটিভ ফলোআপ রেকর্ড করা যায়?

### Phase 4
- [ ] সন্তান তারা সাদাকাহয় দিতে পারে?
- [ ] প্যারেন্ট রিয়েল ডোনেশন কনফার্ম করে?
- [ ] পয়েন্ট = নগদ স্বয়ংক্রিয়ভাবে গণ্য হয় না?
- [ ] ভাই-বোনের দানের তুলনা নেই?

### Phase 5
- [ ] উইকলি রিফ্লেকশন প্যারেন্টকে সাহায্য করে?
- [ ] স্ট্রিক ভাঙলে কোমল বার্তা দেখায়?
- [ ] লার্নিং প্রম্পট সন্তানকে শেখায়?
- [ ] উইকলি প্ল্যানারে ৩-৫ কাজে শুরু করা যায়?

---

## ৯. ফাইনাল রিমাইন্ডার

প্রতিটি সেশন শুরুতে এই তিনটি বাক্য মাথায় রাখুন:

> **১. তারা হলো টুল, তরবিয়ত হলো লক্ষ্য।**
>
> **২. দৈনিক কাজ রিসেট হয়, অর্জিত তারা হয় না।**
>
> **৩. প্যারেন্ট নিয়ন্ত্রণে, সন্তান নিরাপদে।**

---

## ১০. সেশন শুরু করার নিয়ম

যখন আপনি একটি সেশন শুরু করবেন, আমাকে বলুন:

```
"সেশন S1.1 শুরু করি — আমল লাইব্রেরি সম্প্রসারণ"
```

আমি তখন:
1. এই ফাইলটি পুনরায় পড়ব।
2. `worklog.md` পড়ে পূর্ববর্তী অবস্থা দেখব।
3. সেই সেশনের স্কোপ কনফার্ম করব।
4. গার্ডরেইলস মাথায় রেখে কাজ শুরু করব।

---

**🌙 এই ফাইলটি DeenSteps 2.0-এর সম্পূর্ণ রোডম্যাপ। প্রতিটি সেশন স্বাধীনভাবে করা যাবে। কোনো তাড়াহুড়ো নয় — এক সেশন, এক ফোকাস, এক সম্পূর্ণ ডেলিভারেবল।**
