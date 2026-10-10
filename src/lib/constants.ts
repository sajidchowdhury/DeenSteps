/**
 * DeenSteps domain constants — task categories, library, icon mapping.
 * Centralized so the rest of the app references consistent keys.
 * সব টেক্সট বাংলায় — বাবা-মা ও সন্তানের জন্য সহজবোধ্য।
 */

export const TASK_CATEGORIES = [
  {
    key: 'Islamic Practices',
    label: 'ইসলামি অভ্যাস',
    color: 'emerald',
    description: 'নামাজ, কুরআন, দোয়া আর ধর্মীয় শিক্ষা।',
    icon: 'mosque',
  },
  {
    key: 'Character & Manners',
    label: 'চরিত্র ও আদব',
    color: 'amber',
    description: 'সততা, দয়া, ধৈর্য, কৃতজ্ঞতা।',
    icon: 'heart',
  },
  {
    key: 'Personal Responsibility',
    label: 'ব্যক্তিগত দায়িত্ব',
    color: 'sage',
    description: 'দৈনিক রুটিন আর পারিবারিক অভ্যাস।',
    icon: 'check',
  },
  {
    key: 'Learning & Development',
    label: 'শেখা ও বিকাশ',
    color: 'gold',
    description: 'পড়া, হোমওয়ার্ক, দক্ষতা, সৃজনশীলতা।',
    icon: 'book',
  },
] as const

export type TaskCategoryKey = (typeof TASK_CATEGORIES)[number]['key']

/**
 * ইসলামি অভ্যাস লাইব্রেরি — অপশনাল সাজেশন যা বাবা-মা ইমপোর্ট করতে পারেন।
 * কখনোই বাধ্যতামূলক নয়।
 */
export const TASK_LIBRARY = [
  // ইসলামি অভ্যাস
  { title: 'সকালের নামাজ (ফজর)', category: 'Islamic Practices', subcategory: 'দৈনিক নামাজ', iconKey: 'sunrise', pointsValue: 3, frequency: 'DAILY', dueTime: '05:30', description: 'সময়মতো ঘুম থেকে উঠে ফজর নামাজ পড়ার অভ্যাস।' },
  { title: 'দুপুরের নামাজ (জোহর)', category: 'Islamic Practices', subcategory: 'দৈনিক নামাজ', iconKey: 'sun', pointsValue: 2, frequency: 'DAILY', dueTime: '13:00', description: 'সময়মতো জোহর নামাজ পড়া।' },
  { title: 'সন্ধ্যার নামাজ (মাগরিব)', category: 'Islamic Practices', subcategory: 'দৈনিক নামাজ', iconKey: 'sunset', pointsValue: 2, frequency: 'DAILY', dueTime: '18:30', description: 'সময়মতো মাগরিব নামাজ পড়া।' },
  { title: 'রাতের নামাজ (এশা)', category: 'Islamic Practices', subcategory: 'দৈনিক নামাজ', iconKey: 'moon', pointsValue: 2, frequency: 'DAILY', dueTime: '20:00', description: 'সময়মতো এশা নামাজ পড়া।' },
  { title: 'সকালে কুরআন পড়া', category: 'Islamic Practices', subcategory: 'কুরআন পড়া', iconKey: 'book-open', pointsValue: 2, frequency: 'DAILY', dueTime: '06:30', description: 'ফজরের পর সামান্য কুরআন তিলাওয়াত।' },
  { title: 'সন্ধ্যায় কুরআন পড়া', category: 'Islamic Practices', subcategory: 'কুরআন পড়া', iconKey: 'book-open', pointsValue: 2, frequency: 'DAILY', dueTime: '19:00', description: 'সন্ধ্যায় সামান্য কুরআন তিলাওয়াত।' },
  { title: 'কুরআন মুখস্থ অনুশীলন', category: 'Islamic Practices', subcategory: 'কুরআন মুখস্থ', iconKey: 'brain', pointsValue: 3, frequency: 'DAILY', description: 'ছোট একটি সূরা বা আয়াত মুখস্থ করার অনুশীলন।' },
  { title: 'দৈনিক দোয়া শেখা', category: 'Islamic Practices', subcategory: 'দোয়া', iconKey: 'sparkles', pointsValue: 1, frequency: 'DAILY', description: 'আজ একটি ছোট দোয়া শিখে পড়া।' },
  { title: 'ইসলামি শিক্ষা', category: 'Islamic Practices', subcategory: 'ইসলামি শিক্ষা', iconKey: 'graduation-cap', pointsValue: 2, frequency: 'DAILY', description: 'একটি ইসলামি গল্প পড়া বা শোনা।' },
  // চরিত্র ও আদব
  { title: 'সত্য কথা বলা', category: 'Character & Manners', subcategory: 'সততা', iconKey: 'shield-check', pointsValue: 2, frequency: 'DAILY', description: 'সারাদিন সব কথায় সত্য বলা।' },
  { title: 'দয়া দেখানো', category: 'Character & Manners', subcategory: 'দয়া', iconKey: 'heart', pointsValue: 2, frequency: 'DAILY', description: 'আজ কাউকে একটি দয়ার কাজ করা।' },
  { title: 'ধৈর্য অনুশীলন', category: 'Character & Manners', subcategory: 'ধৈর্য', iconKey: 'hourglass', pointsValue: 2, frequency: 'DAILY', description: 'কঠিন মুহূর্তে শান্ত থাকা।' },
  { title: 'কৃতজ্ঞতা প্রকাশ', category: 'Character & Manners', subcategory: 'কৃতজ্ঞতা', iconKey: 'smile', pointsValue: 1, frequency: 'DAILY', description: 'আজ তিনটি জিনিস বলা যার জন্য কৃতজ্ঞ।' },
  { title: 'পরিবারকে সাহায্য করা', category: 'Character & Manners', subcategory: 'সাহায্যশীলতা', iconKey: 'hand-heart', pointsValue: 2, frequency: 'DAILY', description: 'পরিবারের কাউকে একটি উপায়ে সাহায্য করা।' },
  { title: 'ভুল হলে ক্ষমা চাওয়া', category: 'Character & Manners', subcategory: 'আদব', iconKey: 'handshake', pointsValue: 1, frequency: 'DAILY', description: 'কাউকে কষ্ট দিলে ক্ষমা চাওয়া আর শুধরে নেওয়া।' },
  // ব্যক্তিগত দায়িত্ব
  { title: 'বিছানা গুছিয়ে নেওয়া', category: 'Personal Responsibility', subcategory: 'সকালের রুটিন', iconKey: 'bed', pointsValue: 1, frequency: 'DAILY', dueTime: '07:30', description: 'ঘুম থেকে উঠে বিছানা সুন্দর করে গুছিয়ে নেওয়া।' },
  { title: 'বই গুছিয়ে রাখা', category: 'Personal Responsibility', subcategory: 'পরিচ্ছন্নতা', iconKey: 'library', pointsValue: 1, frequency: 'DAILY', description: 'বইগুলো সুন্দর করে তাকে রাখা।' },
  { title: 'খেলনা গুছিয়ে রাখা', category: 'Personal Responsibility', subcategory: 'সন্ধ্যার রুটিন', iconKey: 'package', pointsValue: 1, frequency: 'DAILY', dueTime: '20:00', description: 'ঘুমাতে যাওয়ার আগে খেলনা গুছিয়ে রাখা।' },
  { title: 'স্কুলের প্রস্তুতি', category: 'Personal Responsibility', subcategory: 'স্কুল', iconKey: 'backpack', pointsValue: 1, frequency: 'WEEKDAYS', dueTime: '20:30', description: 'ব্যাগ গুছিয়ে আগামীকালের প্রস্তুতি নেওয়া।' },
  { title: 'পরিবারের কাজে সাহায্য', category: 'Personal Responsibility', subcategory: 'পারিবারিক', iconKey: 'broom', pointsValue: 2, frequency: 'DAILY', description: 'বয়স-উপযোগী একটি পারিবারিক কাজ করা।' },
  // শেখা ও বিকাশ
  { title: 'বই পড়ার অনুশীলন', category: 'Learning & Development', subcategory: 'পড়া', iconKey: 'book', pointsValue: 2, frequency: 'DAILY', dueTime: '18:00', description: 'অন্তত ২০ মিনিট বই পড়া।' },
  { title: 'হোমওয়ার্কের সময়', category: 'Learning & Development', subcategory: 'হোমওয়ার্ক', iconKey: 'pencil', pointsValue: 3, frequency: 'WEEKDAYS', dueTime: '17:00', description: 'আজকের হোমওয়ার্ক সম্পন্ন করা।' },
  { title: 'দক্ষতা বিকাশ', category: 'Learning & Development', subcategory: 'দক্ষতা', iconKey: 'wrench', pointsValue: 2, frequency: 'DAILY', description: 'যে দক্ষতা শিখছ তার অনুশীলন করা।' },
  { title: 'সৃজনশীল কাজ', category: 'Learning & Development', subcategory: 'সৃজনশীলতা', iconKey: 'palette', pointsValue: 2, frequency: 'DAILY', description: '২০ মিনিট সৃজনশীল কাজে কাটানো।' },
  { title: 'শারীরিক কসরত', category: 'Learning & Development', subcategory: 'স্বাস্থ্য', iconKey: 'activity', pointsValue: 2, frequency: 'DAILY', description: 'অন্তত ৩০ মিনিট শারীরিক কসরত করা।' },
] as const

export const REWARD_LIBRARY = [
  { title: 'রেস্টুরেন্ট বেছে নেওয়া', iconKey: 'utensils', requiredPoints: 80, description: 'এই সপ্তাহে পরিবার কোথায় খাবে তা বেছে নাও।' },
  { title: 'পরিবারের সাথে বেড়াতে যাওয়া', iconKey: 'map', requiredPoints: 120, description: 'একসাথে বেড়াতে যাওয়ার জায়গা বেছে নাও।' },
  { title: 'ফ্যামিলি গেম নাইট', iconKey: 'dice', requiredPoints: 50, description: 'ফ্যামিলি গেম নাইটের গেম বেছে নাও।' },
  { title: 'পারিবারিক কার্যক্রম বেছে নেওয়া', iconKey: 'calendar', requiredPoints: 90, description: 'এই সপ্তাহের শেষে একটি কার্যক্রম পরিকল্পনা করো।' },
  { title: 'আর্ট সাপ্লাই', iconKey: 'palette', requiredPoints: 100, description: 'নতুন আর্ট সাপ্লাই বেছে নাও।' },
  { title: 'নতুন একটি বই', iconKey: 'book', requiredPoints: 80, description: 'তোমার সংগ্রহে নতুন একটি বই যোগ করো।' },
  { title: 'একটি খেলনা', iconKey: 'gift', requiredPoints: 200, description: 'কাঙ্ক্ষিত একটি ছোট খেলনা বেছে নাও।' },
  { title: 'নতুন পোশাক', iconKey: 'shirt', requiredPoints: 150, description: 'নতুন একটি পোশাক বেছে নাও।' },
  { title: 'বিশেষ পারিবারিক অভিজ্ঞতা', iconKey: 'star', requiredPoints: 250, description: 'একসাথে পরিকল্পিত একটি বিশেষ দিন।' },
] as const

/**
 * আইকন কি-কে Lucide আইকন নামে ম্যাপ করে।
 */
export const ICON_KEY_TO_LUCIDE: Record<string, string> = {
  // ইসলামি
  sunrise: 'Sunrise',
  sun: 'Sun',
  sunset: 'Sunset',
  moon: 'Moon',
  'book-open': 'BookOpen',
  brain: 'Brain',
  sparkles: 'Sparkles',
  'graduation-cap': 'GraduationCap',
  mosque: 'Landmark',
  // চরিত্র
  heart: 'Heart',
  'shield-check': 'ShieldCheck',
  hourglass: 'Hourglass',
  smile: 'Smile',
  'hand-heart': 'HeartHandshake',
  handshake: 'Handshake',
  // দায়িত্ব
  bed: 'Bed',
  library: 'Library',
  package: 'Package',
  backpack: 'Backpack',
  broom: 'Brush' as string,
  check: 'CheckCheck',
  // শেখা
  book: 'Book',
  pencil: 'Pencil',
  wrench: 'Wrench',
  palette: 'Palette',
  activity: 'Activity',
  // পুরস্কার / সাধারণ
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
  { value: 'MANUAL', label: 'ম্যানুয়াল রিভিউ', description: 'পয়েন্ট দেওয়ার আগে আপনি প্রতিটি সাবমিশন অনুমোদন করেন।' },
  { value: 'AUTO', label: 'অটোমেটিক অনুমোদন', description: 'সন্তান সাবমিট করলেই পয়েন্ট যোগ হয়ে যায়।' },
] as const

export const FREQUENCIES = [
  { value: 'ONCE', label: 'একবারি', description: 'শুরুর তারিখে একবার ঘটবে।' },
  { value: 'DAILY', label: 'প্রতিদিন', description: 'প্রতিদিন।' },
  { value: 'WEEKDAYS', label: 'সপ্তাহের দিন (শনি-বৃহ)', description: 'শনিবার থেকে বৃহস্পতিবার।' },
  { value: 'WEEKLY', label: 'সাপ্তাহিক', description: 'সপ্তাহের নির্বাচিত দিনগুলোতে।' },
  { value: 'CUSTOM', label: 'কাস্টম দিন', description: 'নির্দিষ্ট সপ্তাহের দিন বেছে নিন।' },
] as const

export const WEEKDAYS = [
  { value: 'SUN', label: 'রবি' },
  { value: 'MON', label: 'সোম' },
  { value: 'TUE', label: 'মঙ্গল' },
  { value: 'WED', label: 'বুধ' },
  { value: 'THU', label: 'বৃহ' },
  { value: 'FRI', label: 'শুক্র' },
  { value: 'SAT', label: 'শনি' },
] as const

export const AGE_RANGES = [
  { value: '3-5', label: '৩–৫ বছর' },
  { value: '6-8', label: '৬–৮ বছর' },
  { value: '9-12', label: '৯–১২ বছর' },
  { value: '13+', label: '১৩+ বছর' },
] as const

export const AVATAR_COLORS = [
  { value: 'emerald', label: 'সবুজ', class: 'bg-emerald-600 text-white' },
  { value: 'amber', label: 'অ্যাম্বার', class: 'bg-amber-500 text-white' },
  { value: 'sage', label: 'সেজ', class: 'bg-teal-500 text-white' },
  { value: 'rose', label: 'গোলাপি', class: 'bg-rose-500 text-white' },
  { value: 'violet', label: 'বেগুনি', class: 'bg-violet-500 text-white' },
  { value: 'sky', label: 'আকাশি', class: 'bg-sky-500 text-white' },
] as const

export const TASK_STATUS_META: Record<string, { label: string; tone: string }> = {
  ASSIGNED: { label: 'শুরু হয়নি', tone: 'bg-muted text-muted-foreground' },
  SUBMITTED: { label: 'জমা হয়েছে', tone: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200' },
  NEEDS_ATTENTION: { label: 'মনোযোগ দরকার', tone: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200' },
  APPROVED: { label: 'অনুমোদিত', tone: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200' },
  MISSED: { label: 'মিসড', tone: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200' },
  EXCUSED: { label: '�্ষমত', tone: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
}

export const PRICING_PLANS = [
  {
    name: 'ফ্রি',
    price: '৳০',
    period: 'চিরকাল',
    description: 'পরিবারের সাথে অভ্যাস গড়া শুরু করতে যা যা দরকার।',
    features: [
      '১টি পারিবারিক ওয়ার্কস্পেস',
      '৩টি পর্যন্ত সন্তান প্রোফাইল',
      'সীমাহীন দৈনিক কাজ',
      'ম্যানুয়াল অনুমোদন',
      'বেসিক সাপ্তাহিক চ্যালেঞ্জ',
      'মোবাইল + ডেস্কটপ অ্যাক্সেস',
    ],
    cta: 'ফ্রি শুরু করুন',
    highlight: false,
  },
  {
    name: 'ফ্যামিলি প্লাস',
    price: '৳১০০',
    period: 'প্রতি মাস',
    description: 'অ্যাডভান্সড রিপোর্ট, আরও কাস্টমাইজেশন আর গভীর ইনসাইট।',
    features: [
      'ফ্রি-এর সবকিছু',
      '৮টি পর্যন্ত সন্তান প্রোফাইল',
      'অটোমেটিক অনুমোদন নীতি',
      'মাসিক মাইলস্টোন পুরস্কার',
      'অ্যাডভান্সড পারিবারিক রিপোর্ট',
      'কাস্টম অর্জন ব্যাজ',
      'প্রায়োরিটি ইমেইল সাপোর্ট',
    ],
    cta: '১৪ দিনের ট্রায়াল শুরু করুন',
    highlight: true,
  },
  {
    name: 'প্রিমিয়াম',
    price: 'শীঘ্রই',
    period: '',
    description: 'অ্যাডভান্সড পারিবারিক পরিকল্পনা, অ্যানালিটিক্স আর সহযোগিতা।',
    features: [
      'ফ্যামিলি প্লাস-এর সবকিছু',
      'একাধিক অভিভাবক',
      'বড় পরিবারের শেয়ারিং',
      'অ্যাডভান্সড অভ্যাস অ্যানালিটিক্স',
      'ভবিষ্যতের প্রিমিয়াম টেমপ্লেট',
      'নতুন ফিচারে আগে অ্যাক্সেস',
    ],
    cta: 'ওয়েটলিস্টে যুক্ত হন',
    highlight: false,
    comingSoon: true,
  },
] as const

export const FAQS = [
  {
    q: 'দীনস্টেপস কীভাবে কাজ করে?',
    a: 'বাবা-মা একটি পারিবারিক ওয়ার্কস্পেস তৈরি করেন, সন্তানের প্রোফাইল যোগ করেন, বয়স-উপযোগী দৈনিক ও সাপ্তাহিক কাজ নির্ধারণ করেন, তারপর সম্পন্ন কাজ রিভিউ ও অনুমোদন করেন। সন্তান তারা অর্জন করে আর অর্থপূর্ণ, বাবা-মা-কনফিগার করা পুরস্কার আনলক করে।',
  },
  {
    q: 'একাধিক সন্তান যোগ করতে পারব কি?',
    a: 'হ্যাঁ। একটি পারিবারিক ওয়ার্কস্পেসে একাধিক সন্তানের প্রোফাইল থাকতে পারে — প্রত্যেকটির নিজস্ব কাজ, তারা আর পুরস্কার। ভাই-বোন কখনোই একে অপরের প্রাইভেট ইতিহাস দেখতে পায় না — যদি না আপনি স্পষ্টভাবে একটি শেয়ার্ড ভিউ চালু করেন।',
  },
  {
    q: 'কাজের অনুমোদন কীভাবে কাজ করে?',
    a: 'ডিফল্টভাবে, সন্তান একটি সম্পন্ন কাজ জমা দেয় আর বাবা-মা পয়েন্ট দেওয়ার আগে রিভিউ করেন। আপনি বিশ্বস্ত কাজের জন্য অটোমেটিক অনুমোদনও চালু করতে পারেন — যেমন সহজ দৈনিক রুটিন।',
  },
  {
    q: 'সাপ্তাহিক ও মাসিক পুরস্কার কী?',
    a: 'সাপ্তাহিক চ্যালেঞ্জে সন্তান সপ্তাহজুড়ে একটি লক্ষ্য পূরণের চেষ্টা করে। মাসিক মাইলস্টোন সাপ্তাহিক ফলাফল একত্রিত করে — যেমন, ৪ সপ্তাহের মধ্যে ৩-এ কোয়ালিফাই করলে মাসিক মাইলস্টোন পুরস্কার অর্জিত হয়।',
  },
  {
    q: 'আমার সন্তানের প্রাইভেসি কীভাবে সুরক্ষিত?',
    a: 'সমস্ত পারিবারিক ডেটা আপনার অ্যাকাউন্টে আইসোলেটেড। সন্তানের নিজস্ব ইমেইল লাগে না। অ্যাপ কখনোই এক পরিবারের ডেটা অন্য পরিবারকে দেখায় না, আর আমরা কখনোই থার্ড-পার্টি বিজ্ঞাপন বা বিহেভিয়ারাল ট্র্যাকিং ব্যবহার করি না।',
  },
  {
    q: 'ইসলামি অভ্যাস টেমপ্লেটগুলো কি বাধ্যতামূলক?',
    a: 'না। প্রতিটি টেমপ্লেট একটি অপশনাল সাজেশন। আপনি আপনার সন্তানের বয়স, সক্ষমতা আর পরিবারের রীতি অনুযায়ী কাজ কনফিগার করেন। অ্যাপের কিছুই আপনার সন্তানের ধর্মীয় মূল্য মাপে না।',
  },
  {
    q: 'কোন সাবস্ক্রিপশন প্ল্যান আছে?',
    a: 'ফ্রি প্ল্যানে সম্পূর্ণ পারিবারিক ওয়ার্কস্পেস পাবেন — ৩টি সন্তান পর্যন্ত। ফ্যামিলি প্লাস আনলক করে অ্যাডভান্সড রিপোর্ট আর আরও কাস্টমাইজেশন। প্রিমিয়াম শীঘ্রই আসছে — ওয়েটলিস্টে যুক্ত হয়ে নোটিফিকেশন পান।',
  },
  {
    q: 'পাসওয়ার্ড ভুলে গেলে কী করব?',
    a: 'সাইন-ইন পেইজ থেকে পাসওয়ার্ড রিসেট করতে পারবেন। আপনার ডেপ্লয়মেন্টে ইমেইল ডেলিভারি কনফিগার করা না থাকলে, একজন অ্যাডমিনিস্ট্রেটর রিসেটে সাহায্য করতে পারবেন।',
  },
] as const
