'use server'

import { db } from '@/lib/db'
import { requireFamily } from '@/lib/auth/session'

export type SetupStep = {
  key: 'children' | 'rewards' | 'tasks'
  label: string
  description: string
  href: string
  done: boolean
  count: number
}

export type SetupProgress = {
  steps: SetupStep[]
  completedSteps: number
  totalSteps: number
  isComplete: boolean
  percent: number
}

/**
 * চেক করে পরিবারের সেটআপ কতটা হয়েছে:
 * ১. অন্তত ১টি সন্তান প্রোফাইল
 * ২. অন্তত ১টি পুরস্কার
 * ৩. অন্তত ১টি চ্যালেঞ্জ (কাজ)
 */
export async function getSetupProgress(): Promise<SetupProgress> {
  const { family } = await requireFamily()

  const [childCount, rewardCount, taskCount] = await Promise.all([
    db.childProfile.count({ where: { familyId: family.id, status: 'ACTIVE' } }),
    db.reward.count({ where: { familyId: family.id, status: 'ACTIVE' } }),
    db.taskTemplate.count({ where: { familyId: family.id, status: 'ACTIVE' } }),
  ])

  const steps: SetupStep[] = [
    {
      key: 'children',
      label: 'সন্তান যোগ করুন',
      description: 'আপনার সন্তানের প্রোফাইল তৈরি করুন',
      href: '/children',
      done: childCount > 0,
      count: childCount,
    },
    {
      key: 'rewards',
      label: 'পুরস্কার সেট করুন',
      description: 'সন্তানের জন্য পুরস্কার যোগ করুন',
      href: '/rewards',
      done: rewardCount > 0,
      count: rewardCount,
    },
    {
      key: 'tasks',
      label: 'চ্যালেঞ্জ সেট করুন',
      description: 'দৈনিক ও সাপ্তাহিক কাজ তৈরি করুন',
      href: '/tasks',
      done: taskCount > 0,
      count: taskCount,
    },
  ]

  const completedSteps = steps.filter((s) => s.done).length
  const totalSteps = steps.length
  const isComplete = completedSteps === totalSteps
  const percent = Math.round((completedSteps / totalSteps) * 100)

  return { steps, completedSteps, totalSteps, isComplete, percent }
}
