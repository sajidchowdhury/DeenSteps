# DeenSteps — Android App Conversion Master Plan

> **Live web app:** https://inventoryos.xyz/deensteps
> **Source repo:** https://github.com/sajidchowdhury/DeenSteps
> **Approach:** Capacitor (hybrid WebView, remote-loaded)
> **Plan created:** 2026-10-16
> **Owner:** Sajid Chowdhury
> **Working timezone:** Asia/Dhaka (UTC+6)

---

## 0. TL;DR — How this works in one paragraph

DeenSteps is a **server-dependent Next.js app** (NextAuth + Prisma + 20 server actions). It cannot run standalone on a phone. Instead, we wrap your *already-hosted* web app inside a thin native Android shell built with **Capacitor**. The shell gives it an app icon, splash screen, biometric unlock, push notifications, haptics, offline detection, and deep links — while the actual logic stays on your VPS, unchanged. You keep 100% of your code. The Android project lives on a separate `android` branch so the web app is never disturbed.

---

## 1. Why Capacitor (and not React Native / native Kotlin)

| Approach | Effort | Reuse web code | Native feel | Verdict |
|---|---|---|---|---|
| **Capacitor (chosen)** | Low | ~100% | High | ✅ Best fit — your app already runs on VPS |
| React Native rewrite | Very high | ~30% (logic only) | Highest | ❌ Would mean rebuilding 170 files |
| Native Kotlin + Compose | Extreme | 0% | Highest | ❌ Months of work for same UX |
| PWA only | Lowest | 100% | Low | ❌ Not a "real" app, no push/biometric |

Capacitor is the same approach used by Twitter Lite, Instagram Lite, bKash, Chorki, and many production Bengali apps.

---

## 2. Final Architecture

```
┌──────────────────────────────────────────────────────────┐
│  Android APK (built from `android` branch)                │
│  ┌────────────────────────────────────────────────────┐  │
│  │  WebView → loads https://inventoryos.xyz/deensteps │  │
│  │  (your full Next.js app, byte-for-byte identical)  │  │
│  └────────────────────────────────────────────────────┘  │
│  + Native plugins (Capacitor):                             │
│    • Splash screen + app icon                             │
│    • Biometric login (replaces/augments parent PIN)        │
│    • Push notifications (FCM)                              │
│    • Haptics on approve / redeem                           │
│    • Offline banner + auto-retry                          │
│    • Deep links (deensteps://...)                          │
│    • Status bar / safe area / notch handling               │
└──────────────────────────────────────────────────────────┘
                  │ HTTPS
                  ▼
┌──────────────────────────────────────────────────────────┐
│  Your VPS — already running                               │
│  Next.js 16 + NextAuth + Prisma + 20 server actions       │
│  Served at https://inventoryos.xyz/deensteps               │
│  basePath: "/deensteps" (stays as-is — works fine)        │
└──────────────────────────────────────────────────────────┘
```

**Important correction to my earlier message:** the `basePath: "/deensteps"` in `next.config.ts` is **fine** and should stay. Since the Capacitor WebView loads the remote URL directly (not bundled local files), basePath causes zero problems. ✅

---

## 3. Branch Strategy

```
main          ← production web app (untouched, currently deployed on VPS)
  └── android ← branched from main; adds Capacitor shell + native plugins
```

### Rules

1. **`main`** = web only. Never receives Capacitor files. Your VPS deployment always builds from this branch (or whichever branch you currently deploy from).
2. **`android`** = contains the *same* web source + Capacitor scaffolding (`capacitor.config.ts`, `android/` folder, native plugin wrappers, mobile-only hooks/components). Capacitor files don't run on your server — they're only used when building the APK locally.
3. **Sync cadence:** whenever you ship a new web feature to `main`, you run `git merge main` into `android` to keep them in sync. Conflicts should be rare because Capacitor files live in new paths.
4. **Never push the `android/` build artifacts** (`android/app/build/`, `android/.gradle/`). Add them to `.gitignore`.

---

## 4. Prerequisites (gather these before Session 1)

### On your local machine (for building APKs)
- [ ] **Node.js 20+** and **Bun**
- [ ] **Android Studio** (Hedgehog or newer) → includes Android SDK + emulator
- [ ] **JDK 17** (Android Studio bundles it)
- [ ] A real Android phone (for final testing) — optional but recommended

### Accounts you'll need
- [ ] **Google account** (for Firebase + Play Console)
- [ ] **Google Play Console** — $25 one-time fee (only needed by Session 10)
- [ ] **Firebase project** — free (created in Session 5)

### Access
- [ ] **Push permission** to `sajidchowdhury/DeenSteps` GitHub repo
- [ ] **SSH access** to your VPS (to add env vars in Session 5)
- [ ] GitHub token revoked & regenerated (the one you accidentally shared earlier — please confirm it's gone)

### Mobile UX constraints to be aware of
- Minimum Android version we'll target: **Android 8.0 (API 26)** — covers ~95% of active devices
- WebView engine: Chrome WebView (auto-updated via Play Store on most devices)
- Status bar / notch: handled in Session 3
- Back button: Android hardware back button → handled in Session 2 (navigates React Router history)

---

## 5. Session-by-Session Roadmap

Each session is a discrete, independently-verifiable chunk. We do one session at a time, in order. After each session, you confirm it works before we move on.

---

### 🗂 **Session 0 — Repo setup & branch creation**

**Goal:** Get the `android` branch created and pushed.

**What I do:**
1. Clone DeenSteps to my workspace
2. Verify current state (clean main, latest commits)
3. Create `android` branch off `main`
4. Commit this plan document as `ANDROID_CONVERSION_PLAN.md` into the branch root
5. Add `.gitignore` rules for Capacitor/Android build artifacts
6. Push `android` branch to `origin`

**What you do:** Nothing — just confirm.

**Deliverables:**
- `android` branch exists on GitHub
- Plan doc committed

**Verification:**
```bash
git fetch origin
git branch -a   # should show remotes/origin/android
```

**Estimated time:** 5 minutes.

---

### 🗂 **Session 1 — Capacitor scaffolding**

**Goal:** A working Capacitor project structure that builds.

**What I do:**
1. Install packages on the `android` branch:
   - `@capacitor/core`
   - `@capacitor/cli`
   - `@capacitor/android`
2. Create `capacitor.config.ts`:
   - `appId: com.deensteps.app`
   - `appName: DeenSteps`
   - `webDir: www` (fallback folder)
   - `server.url: https://inventoryos.xyz/deensteps` ← this is the magic line that makes the WebView load your live site
   - `android.backgroundColor: #047857` (emerald)
3. Create minimal `www/index.html` — used only as offline fallback if VPS unreachable
4. Run `npx cap add android` → generates `android/` folder
5. Edit `android/app/src/main/AndroidManifest.xml`:
   - Set package name
   - Add `android:usesCleartextTraffic="false"` (force HTTPS)
   - Add basic permissions (INTERNET, ACCESS_NETWORK_STATE)
6. First `npx cap sync android`
7. Commit everything (except build artifacts)

**What you do:** Nothing yet.

**Deliverables:**
- `capacitor.config.ts`
- `android/` folder (full Gradle project)
- Updated `.gitignore`

**Verification:**
- `npx cap sync` runs without errors
- `android/` opens in Android Studio without Gradle sync failures *(you do this in Session 9)*

**Estimated time:** 30 minutes.

---

### 🗂 **Session 2 — Mobile web optimizations on VPS**

**Goal:** The hosted app behaves perfectly inside an Android WebView.

**What I do (small patches to the `android` branch):**
1. Audit `src/app/layout.tsx` viewport meta — add `viewport-fit=cover` for notch support
2. Add CSS safe-area insets in `globals.css`:
   ```css
   body { padding-top: env(safe-area-inset-top); }
   ```
3. Create `src/hooks/use-capacitor.ts` — detects if running inside Capacitor via `window.Capacitor`
4. Create `src/hooks/use-android-back.ts` — wires Android hardware back button to React Router history
5. Audit all uses of `window.open` / `target="_blank"` (Capacitor can't open browser tabs the same way — convert to internal navigation or use `@capacitor/browser`)
6. Verify `next/font/google` loads correctly through the WebView (fonts should work since the page is served from your VPS)

**What you do:** Deploy the `android` branch's small web tweaks to a staging URL on your VPS (or test on `main` directly — these changes are web-safe).

**Deliverables:**
- `use-capacitor.ts` hook
- `use-android-back.ts` hook
- Safe-area CSS
- Viewport meta fix

**Verification:**
- Open Chrome DevTools → mobile emulation → no layout breaks on notch devices
- *(Full verification happens in Session 9 when APK is built)*

**Estimated time:** 45 minutes.

---

### 🗂 **Session 3 — Splash screen + app icon**

**Goal:** Branded launch experience matching DeenSteps' emerald theme.

**What I do:**
1. **Generate app icon** using AI image generation:
   - Concept: emerald green background + gold crescent moon + three ascending steps + Arabic calligraphic touch
   - Multiple variations → you pick the best
2. **Generate splash screen image** — full-bleed emerald with centered logo
3. Install plugins:
   - `@capacitor/splash-screen`
   - `@capacitor/status-bar`
4. Configure `capacitor.config.ts`:
   - Splash background: `#047857` (emerald-700)
   - Splash duration: 2000ms
   - Status bar color: `#047857`
   - Status bar style: light (white icons)
5. Use `@capacitor/assets` CLI to generate all icon densities:
   - `mdpi`, `hdpi`, `xhdpi`, `xxhdpi`, `xxxhdpi`
   - Adaptive icon (foreground + background layers for Play Store)
6. Commit icons + config

**What you do:** Pick your favorite AI-generated icon from the variations I'll show you.

**Deliverables:**
- App icon in all densities
- Splash screen image
- Splash + status bar config

**Verification:**
- *(Visible in Session 9)* — app launches → splash shows for 2s → fades to web app → status bar is emerald

**Estimated time:** 1 hour (mostly waiting on AI image gen).

---

### 🗂 **Session 4 — Biometric login for parents**

**Goal:** Parents unlock the app with fingerprint or face unlock.

**What I do:**
1. Install `@capacitor-community/biometric-auth`
2. Add Android permission in `AndroidManifest.xml`:
   ```xml
   <uses-permission android:name="android.permission.USE_BIOMETRIC"/>
   ```
3. Create `src/hooks/use-biometric.ts`:
   - `isAvailable()` → check if device has biometric hardware
   - `authenticate(reason)` → trigger system biometric prompt
   - Returns `{ ok, error }`
4. Modify `src/app/login/page.tsx`:
   - On Capacitor devices, show a "🔐 Unlock with fingerprint" button above the email/password form
   - On success → load saved credentials from `@capacitor/preferences` (encrypted) → auto-submit
   - On failure → fall back to manual email/password form
5. Modify `src/app/child/[id]/page.tsx` (child dashboard): when parent switches to "parent mode" (existing parent PIN flow), offer biometric instead of PIN
6. **Web fallback:** hook returns `{ available: false }` on browser, so the biometric button simply doesn't render — zero impact on web UX

**What you do:** Test on a real Android phone with enrolled fingerprint.

**Deliverables:**
- `use-biometric.ts` hook
- Login page changes
- Preferences storage for credentials
- AndroidManifest permission

**Verification:**
- Build APK in Session 9 → tap biometric button → system fingerprint prompt appears → scan → app unlocks

**Estimated time:** 1.5 hours.

---

### 🗂 **Session 5 — Push notifications (child submits task → parent notified)**

**Goal:** When a child submits a task, the parent's phone buzzes within 5 seconds.

This is the most complex session. Split into sub-tasks.

**5a. Firebase setup (YOU do this, ~15 min)**
1. Go to https://console.firebase.google.com
2. Create new project → name it `DeenSteps`
3. Add Android app → package name: `com.deensteps.app`
4. Download `google-services.json`
5. Send me the file (or place it in `android/app/` yourself)
6. In Firebase → Project Settings → Cloud Messaging → copy **Server Key**

**5b. VPS env (YOU do this, ~5 min)**
Add to your VPS `.env`:
```
FCM_SERVER_KEY=AAAAxxxxxx:APA91bH...
NEXT_PUBLIC_APP_DEEPLINK_BASE=deensteps://
```
Restart Next.js on VPS.

**5c. Capacitor side (I do this)**
1. Install `@capacitor/push-notifications`
2. Add `google-services.json` to `android/app/`
3. Add to `android/build.gradle` (top-level): `classpath 'com.google.gms:google-services:4.4.2'`
4. Add to `android/app/build.gradle`: `apply plugin: 'com.google.gms.google-services'`
5. Add Firebase messaging dependencies
6. Update `AndroidManifest.xml` with POST_NOTIFICATIONS permission (Android 13+)

**5d. Web app side (I do this — committed to `android` branch, also safe for `main`)**
1. Create `src/app/api/devices/register/route.ts`:
   - POST → stores `(userId, fcmToken, deviceInfo)` in a new Prisma model `DeviceToken`
2. Add to `prisma/schema.prisma`:
   ```prisma
   model DeviceToken {
     id        String   @id @default(cuid())
     userId    String
     fcmToken  String
     platform  String   // "android" | "ios" | "web"
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt
     user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
     @@unique([userId, fcmToken])
   }
   ```
3. Run `bun run db:push` on VPS to create the table
4. Create `src/lib/push.ts`:
   - `sendPushNotification(token, { title, body, data })` — calls FCM HTTP v1 API with server key
5. Modify `src/server/actions/task-actions.ts`:
   - In `submitTask` (child-side action), after creating the submission:
     - Fetch parent's registered FCM tokens
     - Send push: title "📝 Task submitted", body "{childName} submitted '{taskTitle}'", data `{ url: 'deensteps://review' }`
6. Add registration flow:
   - Create `src/hooks/use-push-notifications.ts`
   - On app launch (Capacitor only), request permission → get token → POST to `/api/devices/register`
7. Wire hook into `src/app/(app)/layout.tsx` (authenticated area)

**Deliverables:**
- `DeviceToken` Prisma model
- `/api/devices/register` endpoint
- `sendPushNotification` util
- `submitTask` modified to fire push
- `use-push-notifications.ts` hook
- Firebase config in `android/`

**Verification:**
- Open APK as parent → grant notification permission
- Switch to child dashboard → submit a task
- Parent device receives push within ~5 seconds
- Tap notification → app opens to review page (deep link works after Session 8)

**Estimated time:** 3 hours (longest session).

---

### 🗂 **Session 6 — Haptics on approve / redeem**

**Goal:** Tactile feedback on key moments.

**What I do:**
1. Install `@capacitor/haptics`
2. Create `src/hooks/use-haptics.ts`:
   ```ts
   export function useHaptics() {
     const isCapacitor = useCapacitor();
     return {
       light: () => isCapacitor && Haptics.impact({ style: ImpactStyle.Light }),
       medium: () => isCapacitor && Haptics.impact({ style: ImpactStyle.Medium }),
       heavy: () => isCapacitor && Haptics.impact({ style: ImpactStyle.Heavy }),
       success: () => isCapacitor && Haptics.notification({ type: NotificationType.Success }),
       warning: () => isCapacitor && Haptics.notification({ type: NotificationType.Warning }),
     };
   }
   ```
3. Wire into existing components (find them by grep):
   - `src/server/actions/review-actions.ts` → on parent approve → `success` haptic (via client-side toast handler)
   - `src/server/actions/reward-actions.ts` → on redeem → `medium`
   - `src/components/deensteps/reward-dialogs.tsx` → on redemption confirmed → `heavy`
   - Achievement badge unlock → `heavy` + `success`
   - Parent reject task → `warning`
4. Web fallback: hook no-ops, zero impact

**Deliverables:**
- `use-haptics.ts` hook
- 5+ integration points

**Verification:**
- Approve a task on phone → feel short vibration
- Reject a task → feel warning vibration pattern
- Redeem reward → feel medium vibration

**Estimated time:** 1 hour.

---

### 🗂 **Session 7 — Offline detection banner**

**Goal:** Graceful UX when VPS is unreachable.

**What I do:**
1. Install `@capacitor/network`
2. Create `src/components/deensteps/offline-banner.tsx`:
   - Sticky amber bar at top: "📡 No internet connection — showing last loaded content"
   - Dismissible? No — auto-shows/hides based on network status
3. Listen to `Network.addListener('networkStatusChange', ...)`
4. On reconnect → reload current page (with debounce to avoid hammering)
5. Add banner to root layout (gated by Capacitor — hidden on web)
6. Also handle: WebView loaded but server returned 5xx → show "Server unreachable" variant

**Deliverables:**
- `offline-banner.tsx` component
- Network status hook
- Wired into layout

**Verification:**
- Toggle airplane mode → banner appears within 2s
- Toggle off → banner disappears + page reloads

**Estimated time:** 45 minutes.

---

### 🗂 **Session 8 — Deep links**

**Goal:** `deensteps://review` and `deensteps://child/{id}` open the right screen.

**What I do:**
1. Install `@capacitor/app`
2. Add intent-filter to `AndroidManifest.xml`:
   ```xml
   <intent-filter>
     <action android:name="android.intent.action.VIEW" />
     <category android:name="android.intent.category.DEFAULT" />
     <category android:name="android.intent.category.BROWSABLE" />
     <data android:scheme="deensteps" />
   </intent-filter>
   ```
3. Create `src/hooks/use-deep-links.ts`:
   - Listen to `App.addListener('appUrlOpen', ({ url }) => ...)`
   - Parse URL: `deensteps://child/abc123` → `router.push('/child/abc123')`
   - Parse: `deensteps://review` → `router.push('/review')`
   - Parse: `deensteps://rewards` → `router.push('/rewards')`
4. Wire into `src/app/(app)/layout.tsx`
5. Update `src/lib/push.ts` (from Session 5) → include `data.url` in push payload so tapping a notification deep-links correctly
6. **Test command** (you run via `adb`):
   ```bash
   adb shell am start -W -a android.intent.action.VIEW -d "deensteps://review" com.deensteps.app
   ```

**Deliverables:**
- Intent filter in AndroidManifest
- `use-deep-links.ts` hook
- Push payload includes `url` field

**Verification:**
- Run the `adb` command above → app opens to /review
- Tap a push notification → app opens to the right page

**Estimated time:** 1 hour.

---

### 🗂 **Session 9 — Build debug APK on your machine**

**Goal:** A real `.apk` file you can install on your phone.

**What YOU do (with my live guidance):**
1. Install Android Studio + JDK 17 (if not already)
2. On your local machine:
   ```bash
   git clone -b android https://github.com/sajidchowdhury/DeenSteps.git
   cd DeenSteps
   bun install
   npx cap sync android
   ```
3. Open Android Studio → "Open" → select the `android/` folder
4. Wait for Gradle sync (first time takes ~5 min — downloads SDK components)
5. Build → Build Bundle(s) / APK(s) → Build APK(s)
6. Once built, Android Studio shows a "locate" link → find `app-debug.apk`
7. Plug in your Android phone with USB debugging on
8. `adb install app-debug.apk` (or drag-drop APK to phone)
9. Open app on phone

**What I do:** Help you debug any Gradle / sync errors live.

**Deliverables:**
- `app-debug.apk` on your phone
- Full end-to-end test run

**Verification checklist (we run this together):**
- [ ] App icon shows on home screen
- [ ] Splash screen appears for 2s
- [ ] Status bar is emerald
- [ ] Login page renders correctly (no layout breaks)
- [ ] Biometric unlock works
- [ ] Parent can approve a task → haptic fires
- [ ] Child submits task → parent gets push notification
- [ ] Tap push notification → app opens to review page
- [ ] Toggle airplane mode → offline banner appears
- [ ] Hardware back button navigates history (doesn't exit app immediately)
- [ ] All existing web features work identically

**Estimated time:** 1.5–2 hours (mostly Gradle downloads).

---

### 🗂 **Session 10 — Play Store release**

**Goal:** App live on Google Play Store.

**What YOU do (with my guidance):**

1. **Generate signed release AAB:**
   - In Android Studio: Build → Generate Signed Bundle / APK → Android App Bundle
   - Create new keystore (⚠️ **back this up forever** — losing it means you can't update the app)
   - Save keystore password securely (1Password / Bitwarden / printed paper in safe)
   - Build variant: release
   - Output: `app-release.aab`

2. **Play Console setup:**
   - Pay $25 one-time fee at https://play.google.com/console
   - Create new app → "DeenSteps"
   - Default language: Bengali (বাংলা) + English

3. **Store listing assets (I help generate):**
   - App icon: 512×512 PNG
   - Feature graphic: 1024×500 PNG
   - 3 phone screenshots (I'll guide you to capture via Android Studio)
   - 1 tablet screenshot (optional)
   - Short description (80 chars): "পরিবারের সাথে ইসলামি অভ্যাস গড়ুন — ছোট ছোট কাজ, বড় পরিবর্তন"
   - Full description (I'll draft)

4. **Privacy policy URL** (REQUIRED by Google):
   - I'll write a privacy policy doc
   - Host at https://inventoryos.xyz/deensteps/privacy (or as a static page)

5. **Content rating:**
   - Fill out IARC questionnaire → likely rated "Everyone"
   - No ads, no in-app purchases, no user-generated public content

6. **Target audience:**
   - Target age: 13+ (parents use it, but children interact)
   - Actually: this app is designed FOR families with kids → Google has specific policies on apps that collect data from children. We'll need to mark it as **not directed to children under 13** (COPPA compliance), since DeenSteps has accounts for parents.

7. **Submit for review:**
   - Upload AAB
   - Click "Send for review"
   - Review takes 1–3 days

**Deliverables:**
- Signed `app-release.aab`
- Play Store listing complete
- Privacy policy URL live

**Verification:**
- App appears on Play Store search
- Can install directly from Play Store on a fresh device

**Estimated time:** 2–4 hours + 1–3 days Google review.

---

## 6. Division of labor — clear split

| Task | Who |
|---|---|
| All Capacitor config files | Me |
| All `src/` code changes (hooks, components, server actions) | Me |
| AndroidManifest, build.gradle edits | Me |
| App icon + splash image (AI generation) | Me |
| Privacy policy draft | Me |
| Play Store listing copy | Me |
| Clone repo, create branch | Me |
| Push branch to GitHub | Me |
| **Install Android Studio + JDK 17** | You |
| **Build APK locally** | You (with live help) |
| **Firebase project creation** | You (with step-by-step guide) |
| **Add env vars to VPS** | You |
| **Run `bun run db:push` on VPS** | You |
| **Pay $25 Play Console fee** | You |
| **Generate + store keystore safely** | You |
| **Test on real device** | You |
| **Submit to Play Store** | You |

---

## 7. Risks & Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| NextAuth session cookie doesn't persist in WebView | Medium | Use `sameSite: 'none'` + `secure: true` (your site is HTTPS already). If still fails, switch to bearer-token auth via localStorage. Will test in Session 9. |
| Push notifications not delivered on Chinese OEMs (Xiaomi/Huawei aggressive battery savers) | High | Document as known limitation; recommend users disable battery optimization for DeenSteps. |
| WebView version fragmentation (old Android System WebView) | Low | Set minSdk 26 (Android 8+). Most devices auto-update WebView via Play Store. |
| VPS downtime = app totally down | Medium | Offline banner (Session 7) handles UX. Consider adding a status page later. |
| Google rejects app for "child-directed content" policy | Medium | Position app as parent tool; do not collect personal data from children under 13 directly. |
| `basePath: /deensteps` causes asset 404s in WebView | Low | Tested in Session 2. Since WebView loads remote URL, basePath works as-is. |
| Capacitor SDK version mismatches with React 19 | Low | Use Capacitor 6+ which supports React 19. Pin versions in `package.json`. |

---

## 8. Cost Estimate

| Item | Cost |
|---|---|
| Firebase Cloud Messaging | $0 (free unlimited) |
| Google Play Console (one-time) | $25 |
| App icon AI generation | $0 (using my image generation tool) |
| Hosting (already paid) | $0 incremental |
| **Total** | **$25 one-time** |

No recurring costs. No per-user fees.

---

## 9. Success Criteria (definition of done)

After Session 10, the project is "done" when:

- [ ] APK installs on any Android 8+ device
- [ ] App launches with branded splash → loads DeenSteps
- [ ] Parent logs in with biometric
- [ ] Push notifications arrive within 10 seconds of trigger
- [ ] Tapping a push notification deep-links to the right page
- [ ] Haptics fire on approve / reject / redeem
- [ ] Offline banner appears when network drops
- [ ] Hardware back button navigates history correctly
- [ ] All existing web features work identically (tasks, rewards, reports, child dashboard, etc.)
- [ ] App is live on Google Play Store

---

## 10. How we'll work together

1. **One session at a time.** I'll explicitly mark "starting Session N" and "ending Session N" — never proceed without your OK.
2. **No big bangs.** Each session's changes are committable on their own — you can stop anytime and the project still works.
3. **You can pause between sessions.** Got a busy week? No problem — the plan waits for you.
4. **If something breaks, we fix it before moving on.** Sessions are sequential, not parallel.
5. **All code goes on the `android` branch.** Your live web app on `main` is never touched.

---

## 11. What to do right now

Reply with one of these:

- ✅ **"Plan looks good, let's start Session 0"** — I'll clone the repo, create the branch, commit this plan, and we begin.
- 📝 **"I want to change X in the plan"** — tell me what to adjust before we start.
- ❓ **"Question about session N"** — ask anything before committing.

Once you confirm, Session 0 takes ~5 minutes and we'll immediately move to Session 1.

---

*Built with care for families. Made for parents, loved by children. 🌙*
