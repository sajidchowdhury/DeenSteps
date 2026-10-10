/**
 * DeenSteps domain constants — task categories, library, icon mapping.
 * Centralized so the rest of the app references consistent keys.
 */

export const TASK_CATEGORIES = [
  {
    key: 'Islamic Practices',
    label: 'Islamic Practices',
    color: 'emerald',
    description: 'Prayer, Quran, dua, and religious learning.',
    icon: 'mosque',
  },
  {
    key: 'Character & Manners',
    label: 'Character & Manners',
    color: 'amber',
    description: 'Honesty, kindness, patience, gratitude.',
    icon: 'heart',
  },
  {
    key: 'Personal Responsibility',
    label: 'Personal Responsibility',
    color: 'sage',
    description: 'Daily routines and household habits.',
    icon: 'check',
  },
  {
    key: 'Learning & Development',
    label: 'Learning & Development',
    color: 'gold',
    description: 'Reading, homework, skills, creativity.',
    icon: 'book',
  },
] as const

export type TaskCategoryKey = (typeof TASK_CATEGORIES)[number]['key']

/**
 * Islamic-inspired habit library — optional suggestions parents can import.
 * Treated as suggestions, never mandatory.
 */
export const TASK_LIBRARY = [
  // Islamic Practices
  { title: 'Morning Prayer (Fajr)', category: 'Islamic Practices', subcategory: 'Daily Prayer', iconKey: 'sunrise', pointsValue: 3, frequency: 'DAILY', dueTime: '05:30', description: 'Practice waking up and praying Fajr on time.' },
  { title: 'Afternoon Prayer (Dhuhr)', category: 'Islamic Practices', subcategory: 'Daily Prayer', iconKey: 'sun', pointsValue: 2, frequency: 'DAILY', dueTime: '13:00', description: 'Pray Dhuhr on time.' },
  { title: 'Evening Prayer (Maghrib)', category: 'Islamic Practices', subcategory: 'Daily Prayer', iconKey: 'sunset', pointsValue: 2, frequency: 'DAILY', dueTime: '18:30', description: 'Pray Maghrib on time.' },
  { title: 'Night Prayer (Isha)', category: 'Islamic Practices', subcategory: 'Daily Prayer', iconKey: 'moon', pointsValue: 2, frequency: 'DAILY', dueTime: '20:00', description: 'Pray Isha on time.' },
  { title: 'Quran Reading (Morning)', category: 'Islamic Practices', subcategory: 'Quran Reading', iconKey: 'book-open', pointsValue: 2, frequency: 'DAILY', dueTime: '06:30', description: 'Read a small portion of the Quran after Fajr.' },
  { title: 'Quran Reading (Evening)', category: 'Islamic Practices', subcategory: 'Quran Reading', iconKey: 'book-open', pointsValue: 2, frequency: 'DAILY', dueTime: '19:00', description: 'Read a small portion of the Quran in the evening.' },
  { title: 'Quran Memorization Practice', category: 'Islamic Practices', subcategory: 'Quran Memorization', iconKey: 'brain', pointsValue: 3, frequency: 'DAILY', description: 'Practice memorizing a short surah or ayah.' },
  { title: 'Daily Dua Learning', category: 'Islamic Practices', subcategory: 'Dua', iconKey: 'sparkles', pointsValue: 1, frequency: 'DAILY', description: 'Learn and recite one short dua today.' },
  { title: 'Islamic Learning', category: 'Islamic Practices', subcategory: 'Islamic Learning', iconKey: 'graduation-cap', pointsValue: 2, frequency: 'DAILY', description: 'Read or listen to an Islamic story or lesson.' },
  // Character & Manners
  { title: 'Speak Truthfully', category: 'Character & Manners', subcategory: 'Honesty', iconKey: 'shield-check', pointsValue: 2, frequency: 'DAILY', description: 'Tell the truth in all conversations today.' },
  { title: 'Show Kindness', category: 'Character & Manners', subcategory: 'Kindness', iconKey: 'heart', pointsValue: 2, frequency: 'DAILY', description: 'Do one act of kindness for someone today.' },
  { title: 'Practice Patience', category: 'Character & Manners', subcategory: 'Patience', iconKey: 'hourglass', pointsValue: 2, frequency: 'DAILY', description: 'Stay calm in a difficult moment today.' },
  { title: 'Express Gratitude', category: 'Character & Manners', subcategory: 'Gratitude', iconKey: 'smile', pointsValue: 1, frequency: 'DAILY', description: 'Share three things you are grateful for today.' },
  { title: 'Help a Family Member', category: 'Character & Manners', subcategory: 'Helpfulness', iconKey: 'hand-heart', pointsValue: 2, frequency: 'DAILY', description: 'Find one way to help someone in the family.' },
  { title: 'Apologize When Needed', category: 'Character & Manners', subcategory: 'Manners', iconKey: 'handshake', pointsValue: 1, frequency: 'DAILY', description: 'Apologize and make amends if you hurt someone.' },
  // Personal Responsibility
  { title: 'Make My Bed', category: 'Personal Responsibility', subcategory: 'Morning Routine', iconKey: 'bed', pointsValue: 1, frequency: 'DAILY', dueTime: '07:30', description: 'Make the bed neatly after waking up.' },
  { title: 'Organize Books', category: 'Personal Responsibility', subcategory: 'Tidiness', iconKey: 'library', pointsValue: 1, frequency: 'DAILY', description: 'Put books back on the shelf neatly.' },
  { title: 'Put Toys Away', category: 'Personal Responsibility', subcategory: 'Evening Routine', iconKey: 'package', pointsValue: 1, frequency: 'DAILY', dueTime: '20:00', description: 'Put away toys and games before bed.' },
  { title: 'Prepare School Materials', category: 'Personal Responsibility', subcategory: 'School', iconKey: 'backpack', pointsValue: 1, frequency: 'WEEKDAYS', dueTime: '20:30', description: 'Pack school bag and prepare for tomorrow.' },
  { title: 'Help with a Chore', category: 'Personal Responsibility', subcategory: 'Household', iconKey: 'broom', pointsValue: 2, frequency: 'DAILY', description: 'Complete an age-appropriate household task.' },
  // Learning & Development
  { title: 'Reading Practice', category: 'Learning & Development', subcategory: 'Reading', iconKey: 'book', pointsValue: 2, frequency: 'DAILY', dueTime: '18:00', description: 'Read a book for at least 20 minutes.' },
  { title: 'Homework Time', category: 'Learning & Development', subcategory: 'Homework', iconKey: 'pencil', pointsValue: 3, frequency: 'WEEKDAYS', dueTime: '17:00', description: 'Complete today\u2019s homework assignments.' },
  { title: 'Skill Development', category: 'Learning & Development', subcategory: 'Skills', iconKey: 'wrench', pointsValue: 2, frequency: 'DAILY', description: 'Practice a skill you are learning.' },
  { title: 'Creative Activity', category: 'Learning & Development', subcategory: 'Creativity', iconKey: 'palette', pointsValue: 2, frequency: 'DAILY', description: 'Spend 20 minutes on a creative activity.' },
  { title: 'Physical Activity', category: 'Learning & Development', subcategory: 'Health', iconKey: 'activity', pointsValue: 2, frequency: 'DAILY', description: 'Be active for at least 30 minutes.' },
] as const

export const REWARD_LIBRARY = [
  { title: 'Choose a Family Restaurant', iconKey: 'utensils', requiredPoints: 80, description: 'Pick where the family eats out this week.' },
  { title: 'Family Outing', iconKey: 'map', requiredPoints: 120, description: 'Choose a place to visit together.' },
  { title: 'Special Game Night', iconKey: 'dice', requiredPoints: 50, description: 'Choose the game for family game night.' },
  { title: 'Choose a Family Activity', iconKey: 'calendar', requiredPoints: 90, description: 'Plan an activity for the family this weekend.' },
  { title: 'Art Supplies', iconKey: 'palette', requiredPoints: 100, description: 'Pick out new art supplies.' },
  { title: 'A New Book', iconKey: 'book', requiredPoints: 80, description: 'Choose a new book to add to your library.' },
  { title: 'A Toy', iconKey: 'gift', requiredPoints: 200, description: 'Pick a small toy you have been wanting.' },
  { title: 'New Clothes', iconKey: 'shirt', requiredPoints: 150, description: 'Pick a new outfit.' },
  { title: 'Special Family Experience', iconKey: 'star', requiredPoints: 250, description: 'A special day planned together.' },
] as const

/**
 * Map icon keys to Lucide icon names. Keys are stable across DB/seed/library.
 */
export const ICON_KEY_TO_LUCIDE: Record<string, string> = {
  // Islamic
  sunrise: 'Sunrise',
  sun: 'Sun',
  sunset: 'Sunset',
  moon: 'Moon',
  'book-open': 'BookOpen',
  brain: 'Brain',
  sparkles: 'Sparkles',
  'graduation-cap': 'GraduationCap',
  mosque: 'Landmark',
  // Character
  heart: 'Heart',
  'shield-check': 'ShieldCheck',
  hourglass: 'Hourglass',
  smile: 'Smile',
  'hand-heart': 'HeartHandshake',
  handshake: 'Handshake',
  // Responsibility
  bed: 'Bed',
  library: 'Library',
  package: 'Package',
  backpack: 'Backpack',
  broom: 'Brush' as string,
  check: 'CheckCheck',
  // Learning
  book: 'Book',
  pencil: 'Pencil',
  wrench: 'Wrench',
  palette: 'Palette',
  activity: 'Activity',
  // Rewards / generic
  gift: 'Gift',
  dice: 'Dices',
  map: 'Map',
  calendar: 'CalendarDays',
  shirt: 'Shirt',
  utensils: 'Utensils',
  star: 'Star',
  trophy: 'Trophy',
  target: 'Target',
  award: 'Award',
  flame: 'Flame',
  footprints: 'Footprints',
}

export const APPROVAL_POLICIES = [
  { value: 'MANUAL', label: 'Manual review', description: 'You approve each submission before points are awarded.' },
  { value: 'AUTO', label: 'Automatic approval', description: 'Points are awarded instantly when the child submits the task.' },
] as const

export const FREQUENCIES = [
  { value: 'ONCE', label: 'One-time', description: 'Happens once on the start date.' },
  { value: 'DAILY', label: 'Daily', description: 'Every day.' },
  { value: 'WEEKDAYS', label: 'Weekdays (Mon–Fri)', description: 'Monday through Friday.' },
  { value: 'WEEKLY', label: 'Weekly', description: 'On selected days each week.' },
  { value: 'CUSTOM', label: 'Custom days', description: 'Pick specific weekdays.' },
] as const

export const WEEKDAYS = [
  { value: 'SUN', label: 'Sun' },
  { value: 'MON', label: 'Mon' },
  { value: 'TUE', label: 'Tue' },
  { value: 'WED', label: 'Wed' },
  { value: 'THU', label: 'Thu' },
  { value: 'FRI', label: 'Fri' },
  { value: 'SAT', label: 'Sat' },
] as const

export const AGE_RANGES = [
  { value: '3-5', label: '3–5 years' },
  { value: '6-8', label: '6–8 years' },
  { value: '9-12', label: '9–12 years' },
  { value: '13+', label: '13+ years' },
] as const

export const AVATAR_COLORS = [
  { value: 'emerald', label: 'Emerald', class: 'bg-emerald-600 text-white' },
  { value: 'amber', label: 'Amber', class: 'bg-amber-500 text-white' },
  { value: 'sage', label: 'Sage', class: 'bg-teal-500 text-white' },
  { value: 'rose', label: 'Rose', class: 'bg-rose-500 text-white' },
  { value: 'violet', label: 'Violet', class: 'bg-violet-500 text-white' },
  { value: 'sky', label: 'Sky', class: 'bg-sky-500 text-white' },
] as const

export const TASK_STATUS_META: Record<string, { label: string; tone: string }> = {
  ASSIGNED: { label: 'Not started', tone: 'bg-muted text-muted-foreground' },
  SUBMITTED: { label: 'Submitted', tone: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200' },
  NEEDS_ATTENTION: { label: 'Needs attention', tone: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200' },
  APPROVED: { label: 'Approved', tone: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200' },
  MISSED: { label: 'Missed', tone: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200' },
  EXCUSED: { label: 'Excused', tone: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
}

export const PRICING_PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Everything you need to start building habits with your family.',
    features: [
      '1 family workspace',
      'Up to 3 child profiles',
      'Unlimited daily tasks',
      'Manual approval workflow',
      'Basic weekly challenge',
      'Mobile + desktop access',
    ],
    cta: 'Start free',
    highlight: false,
  },
  {
    name: 'Family Plus',
    price: '$6',
    period: 'per month',
    description: 'Advanced reporting, more customization, and deeper insights.',
    features: [
      'Everything in Free',
      'Up to 8 child profiles',
      'Automatic approval policies',
      'Monthly milestone rewards',
      'Advanced family reports',
      'Custom achievement badges',
      'Priority email support',
    ],
    cta: 'Start 14-day trial',
    highlight: true,
  },
  {
    name: 'Premium',
    price: 'Soon',
    period: '',
    description: 'Advanced family planning, analytics, and collaboration.',
    features: [
      'Everything in Family Plus',
      'Multiple caregivers',
      'Extended family sharing',
      'Advanced habit analytics',
      'Future premium templates',
      'Early access to new features',
    ],
    cta: 'Join waitlist',
    highlight: false,
    comingSoon: true,
  },
] as const

export const FAQS = [
  {
    q: 'How does DeenSteps work?',
    a: 'Parents create a family workspace, add child profiles, assign age-appropriate daily and weekly tasks, then review and approve completed tasks. Children earn points and unlock meaningful, parent-configured rewards.',
  },
  {
    q: 'Can I add multiple children?',
    a: 'Yes. One family workspace can hold multiple child profiles, each with their own tasks, points, and rewards. Siblings never see each other\u2019s private history unless you explicitly enable a shared view.',
  },
  {
    q: 'How does task approval work?',
    a: 'By default, a child submits a completed task and a parent reviews it before points are awarded. You can also enable automatic approval for tasks you trust, like simple daily routines.',
  },
  {
    q: 'What are weekly and monthly rewards?',
    a: 'Weekly challenges let children aim for a target completion percentage over a week. Monthly milestones aggregate weekly results — for example, qualifying in 3 of 4 weeks earns a milestone reward.',
  },
  {
    q: 'How is my child\u2019s privacy protected?',
    a: 'All family data is isolated to your account. Children do not need their own email. The app never shows one family\u2019s data to another, and we never use third-party advertising or behavioral tracking.',
  },
  {
    q: 'Are the Islamic habit templates mandatory?',
    a: 'No. Every template is an optional suggestion. You configure tasks based on your child\u2019s age, ability, and your family\u2019s practices. Nothing in the app measures your child\u2019s religious worth.',
  },
  {
    q: 'What subscription plans are available?',
    a: 'Free gives you a full family workspace with up to 3 children. Family Plus unlocks advanced reporting and more customization. Premium is coming soon — join the waitlist to be notified.',
  },
  {
    q: 'What if I forget my password?',
    a: 'You can reset your password from the sign-in page. If email delivery is not yet configured for your deployment, an administrator can assist with the reset workflow.',
  },
] as const
