import { redirect } from 'next/navigation'
import { Users, User, Star, Bell, Palette, ShieldAlert, Heart } from 'lucide-react'

import { getCurrentUser, getUserFamily } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { AppShell } from '@/components/deensteps/app-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  FamilySettingsForm,
  ParentProfileForm,
  PointsSettingsForm,
  NotificationsForm,
  ThemePicker,
  ExportDataButton,
  DeleteFamilyButton,
} from '@/components/deensteps/settings-forms'
import { SadaqahSettings } from '@/components/deensteps/sadaqah-settings'
import { getSadaqahCauses } from '@/server/actions/sadaqah-actions'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  const family = await getUserFamily(user.id)
  if (!family) redirect('/onboarding')

  const [settings, childrenList, pendingCount] = await Promise.all([
    db.familySettings.findUnique({ where: { familyId: family.id } }),
    db.childProfile.findMany({
      where: { familyId: family.id, status: 'ACTIVE' },
      select: { id: true, displayName: true, avatarColor: true },
    }),
    db.taskSubmission.count({
      where: { child: { familyId: family.id }, decision: null },
    }),
  ])

  const theme = (settings?.theme as 'light' | 'dark') ?? 'light'
  const sadaqahCauses = await getSadaqahCauses()
  const notifInitial = {
    notifyOnSubmission: settings?.notifyOnSubmission ?? true,
    notifyOnRedemption: settings?.notifyOnRedemption ?? true,
    notifyOnChallengeEnd: settings?.notifyOnChallengeEnd ?? true,
    notifyOnMilestone: settings?.notifyOnMilestone ?? true,
    emailNotifications: settings?.emailNotifications ?? false,
  }
  const pointsInitial = {
    pointsName: settings?.pointsName ?? 'Points',
    defaultApprovalPolicy: (settings?.defaultApprovalPolicy as 'MANUAL' | 'AUTO') ?? 'MANUAL',
    weeklyStartDay:
      (settings?.weeklyStartDay as 'SUNDAY' | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY') ??
      'SUNDAY',
    monthlyPlanType: (settings?.monthlyPlanType as 'FOUR_WEEK' | 'CALENDAR_MONTH') ?? 'FOUR_WEEK',
    monthlyQualifyingWeeks: settings?.monthlyQualifyingWeeks ?? 3,
  }

  return (
    <AppShell familyName={family.name} pendingCount={pendingCount} childrenList={childrenList}>
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your family workspace, parent profile, and preferences.
          </p>
        </div>

        <Tabs defaultValue="family" className="w-full">
          <TabsList className="flex-wrap">
            <TabsTrigger value="family" className="gap-1.5">
              <Users className="h-3.5 w-3.5" /> Family
            </TabsTrigger>
            <TabsTrigger value="parent" className="gap-1.5">
              <User className="h-3.5 w-3.5" /> Parent
            </TabsTrigger>
            <TabsTrigger value="points" className="gap-1.5">
              <Star className="h-3.5 w-3.5" /> Points &amp; rewards
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-1.5">
              <Bell className="h-3.5 w-3.5" /> Notifications
            </TabsTrigger>
            <TabsTrigger value="theme" className="gap-1.5">
              <Palette className="h-3.5 w-3.5" /> Theme
            </TabsTrigger>
            <TabsTrigger value="privacy" className="gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5" /> Privacy &amp; data
            </TabsTrigger>
            <TabsTrigger value="sadaqah" className="gap-1.5">
              <Heart className="h-3.5 w-3.5" /> সাদাকাহ
            </TabsTrigger>
          </TabsList>

          {/* Family */}
          <TabsContent value="family" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-display">Family details</CardTitle>
                <CardDescription>
                  Your family workspace name and regional settings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FamilySettingsForm
                  initial={{ name: family.name, timezone: family.timezone, locale: family.locale }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Parent */}
          <TabsContent value="parent" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-display">Parent profile</CardTitle>
                <CardDescription>
                  Your name as it appears in the app.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ParentProfileForm initial={{ name: user.name ?? '' }} email={user.email} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Points & rewards */}
          <TabsContent value="points" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-display">Points &amp; rewards</CardTitle>
                <CardDescription>
                  Customize how points and milestones work for your family.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PointsSettingsForm initial={pointsInitial} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-display">Notifications</CardTitle>
                <CardDescription>
                  Choose which events trigger an in-app or email notification.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NotificationsForm initial={notifInitial} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Theme */}
          <TabsContent value="theme" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-display">Theme</CardTitle>
                <CardDescription>
                  Switch between light and dark mode. Your choice is saved to your family settings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ThemePicker initial={theme} />
                <Separator className="my-4" />
                <p className="text-xs text-muted-foreground">
                  Tip: theme toggles are also available in the sidebar and top bar.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy & data */}
          <TabsContent value="privacy" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-display">Export your data</CardTitle>
                <CardDescription>
                  Download a full JSON snapshot of your family workspace — children, tasks, submissions, points, rewards, and history.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ExportDataButton />
              </CardContent>
            </Card>

            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle className="font-display text-destructive">Danger zone</CardTitle>
                <CardDescription>
                  Permanently delete this family workspace and all related data. This cannot be undone.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DeleteFamilyButton />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sadaqah */}
          <TabsContent value="sadaqah" className="mt-4">
            <SadaqahSettings
              initial={{
                sadaqahPledgeEnabled: settings?.sadaqahPledgeEnabled ?? false,
                sadaqahStarsPerUnit: settings?.sadaqahStarsPerUnit ?? 100,
                sadaqahCurrency: settings?.sadaqahCurrency ?? 'BDT',
                sadaqahAmountPerUnit: settings?.sadaqahAmountPerUnit ?? 100,
                monthlyRewardBudget: settings?.monthlyRewardBudget ?? null,
              }}
              causes={sadaqahCauses}
              familyName={family.name}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}
