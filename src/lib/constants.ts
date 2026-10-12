/**
 * DeenSteps domain constants — task categories, library, icon mapping.
 * Centralized so the rest of the app references consistent keys.
 * সব টেক্সট বাংলায় — বাবা-মা ও সন্তানের জন্য সহজবোধ্য।
 *
 * Phase 1 (S1.1): Expanded to 6 categories, Tier 1-5, age-appropriate filtering,
 * spec-compliant point values.
 */

export const TASK_CATEGORIES = [
  {
    key: 'Islamic Practices',
    label: 'নামাজ ও ইবাদত',
    color: 'emerald',
    description: 'নামাজ, কুরআন, দোয়া ও ধর্মীয় শিক্ষা।',
    icon: 'mosque',
  },
  {
    key: 'Character & Manners',
    label: 'ইসলামি চরিত্র',
    color: 'amber',
    description: 'সততা, দয়া, সম্মান, ধৈর্য ও ক্ষমা।',
    icon: 'heart',
  },
  {
    key: 'Family Responsibilities',
    label: 'পারিবারিক দায়িত্ব',
    color: 'sage',
    description: 'পরিবারে সাহায্য, নিজের জিনিস গোছানো।',
    icon: 'check',
  },
  {
    key: 'Education & Development',
    label: 'শিক্ষা ও বিকাশ',
    color: 'gold',
    description: 'স্কুল, হোমওয়ার্ক, বই পড়া, দক্ষতা।',
    icon: 'book',
  },
  {
    key: 'Health & Self-Discipline',
    label: 'স্বাস্থ্য ও আত্মনিয়ন্ত্রণ',
    color: 'sky',
    description: 'পরিচ্ছন্নতা, খাদ্যাভ্যাস, ঘুম, স্ক্রিন-টাইম।',
    icon: 'activity',
  },
  {
    key: 'Generosity & Community',
    label: 'দান ও সমাজসেবা',
    color: 'rose',
    description: 'ভাগ করে নেওয়া, সাহায্য করা, সাদাকাহ।',
    icon: 'hand-heart',
  },
] as const

export type TaskCategoryKey = (typeof TASK_CATEGORIES)[number]['key']

/**
 * Tier definitions — educational priority structure (NOT religious ranking).
 * Used for organizing the learning experience, not for declaring Allah's rewards.
 */
export const TASK_TIERS = [
  { tier: 1, label: 'মূল ইবাদত', description: 'নামাজ, কুরআন, ওযু — ইসলামি শেখার ভিত্তি।' },
  { tier: 2, label: 'চরিত্র ও পরিবার', description: 'সততা, দয়া, সম্মান — সুন্দর মানুষ হওয়া।' },
  { tier: 3, label: 'দৈনন্দিন দায়িত্ব', description: 'পরিচ্ছন্নতা, স্কুল, হোমওয়ার্ক।' },
  { tier: 4, label: 'স্বাস্থ্য ও অভ্যাস', description: 'বই পড়া, ব্যায়াম, জিনিস গোছানো।' },
  { tier: 5, label: 'অতিরিক্ত বৃদ্ধি', description: 'অতিরিক্ত শেখা, বিশেষ প্রজেক্ট।' },
] as const

/**
 * ইসলামি আমল লাইব্রেরি — age-appropriate daily and weekly habits.
 * Tier 1-5 priority, spec-compliant point values.
 * Parents enable/disable, adjust points, select per child.
 *
 * IMPORTANT: Point values are illustrative product defaults, NOT Islamic
 * measurements of the comparative spiritual worth of deeds.
 */
export const TASK_LIBRARY = [
  // ─── A. নামাজ ও ইবাদত (Tier 1) ───────────────────────────────────────
  { title: 'ফজরের নামাজ অনুশীলন', category: 'Islamic Practices', subcategory: 'নামাজ', iconKey: 'sunrise', pointsValue: 10, frequency: 'DAILY', dueTime: '05:30', tier: 1, minAge: null, maxAge: null, description: 'সময়মতো ঘুম থেকে উঠে ফজর নামাজ পড়ার অভ্যাস।', learningPrompt: 'দিনের শুরুটা আল্লাহর সাথে করলে পুরো দিন বরকতময় হয় — তুমি কি এটি অনুভব করো?' },
  { title: 'জোহরের নামাজ অনুশীলন', category: 'Islamic Practices', subcategory: 'নামাজ', iconKey: 'sun', pointsValue: 10, frequency: 'DAILY', dueTime: '13:00', tier: 1, minAge: null, maxAge: null, description: 'সময়মতো জোহর নামাজ পড়া।', learningPrompt: 'দুপুরে কাজ থামিয়ে নামাজ পড়া আত্মনিয়ন্ত্রণ শেখায় — তুমি কি এই চেষ্টা করো?' },
  { title: 'আসরের নামাজ অনুশীলন', category: 'Islamic Practices', subcategory: 'নামাজ', iconKey: 'sun', pointsValue: 10, frequency: 'DAILY', dueTime: '16:30', tier: 1, minAge: null, maxAge: null, description: 'সময়মতো আসর নামাজ পড়া।', learningPrompt: 'দুপুরের শেষে নামাজ আমাদের মনে করিয়ে দেয় — দিনভর আল্লাহ আমাদের সাথে আছেন।' },
  { title: 'মাগরিবের নামাজ অনুশীলন', category: 'Islamic Practices', subcategory: 'নামাজ', iconKey: 'sunset', pointsValue: 10, frequency: 'DAILY', dueTime: '18:30', tier: 1, minAge: null, maxAge: null, description: 'সময়মতো মাগরিব নামাজ পড়া।', learningPrompt: 'সূর্যাস্তের সময় আল্লাহর শুকরিয়া আদায় করা একটি সুন্দর অভ্যাস — দিনের শেষে তাঁর কাছে দাঁড়াও।' },
  { title: 'এশার নামাজ অনুশীলন', category: 'Islamic Practices', subcategory: 'নামাজ', iconKey: 'moon', pointsValue: 10, frequency: 'DAILY', dueTime: '20:00', tier: 1, minAge: null, maxAge: null, description: 'সময়মতো এশা নামাজ পড়া।', learningPrompt: 'দিন শেষে আল্লাহর কাছে দাঁড়ানো মনকে শান্ত করে — নিয়মিত অভ্যাস হলে ঘুমও ভালো হয়।' },
  { title: 'জুমার নামাজ অনুশীলন', category: 'Islamic Practices', subcategory: 'নামাজ', iconKey: 'mosque', pointsValue: 10, frequency: 'CUSTOM', scheduledDays: ['FRI'], dueTime: '13:00', tier: 1, minAge: 9, maxAge: 99, description: 'শুক্রবার জুমার নামাজ পড়ার অভ্যাস।', learningPrompt: 'জুমায় মুসলিম ভাই-বোনেরা একসাথে আল্লাহর কাছে দাঁড়ায় — এটি ভ্রাতৃত্বের প্রতীক।' },
  { title: 'নামাজ শেখা ও অনুশীলন', category: 'Islamic Practices', subcategory: 'নামাজ', iconKey: 'sparkles', pointsValue: 5, frequency: 'DAILY', tier: 1, minAge: 3, maxAge: 8, description: 'নামাজের নিয়ম শেখা ও অনুশীলন করা।', learningPrompt: 'নামাজ হলো যখন আমরা সরাসরি আল্লাহর সাথে কথা বলি — এটি খুব বিশেষ মুহূর্ত!' },
  { title: 'ওযু শেখা ও অনুশীলন', category: 'Islamic Practices', subcategory: 'পবিত্রতা', iconKey: 'droplet', pointsValue: 3, frequency: 'DAILY', tier: 1, minAge: 3, maxAge: 8, description: 'ওযু করার সঠিক নিয়ম শেখা ও অনুশীলন।', learningPrompt: 'পানি দিয়ে পরিচ্ছন্ন হলে শরীর ও মন উভয় পবিত্র হয় — আল্লাহ পবিত্রতা পছন্দ করেন।' },
  { title: 'কুরআন তিলাওয়াত', category: 'Islamic Practices', subcategory: 'কুরআন', iconKey: 'book-open', pointsValue: 5, frequency: 'DAILY', dueTime: '06:30', tier: 1, minAge: null, maxAge: null, description: 'প্রতিদিন সামান্য কুরআন তিলাওয়াত।', learningPrompt: 'কুরআন আল্লাহর বার্তা — পড়ার সময় মনে রেখো তিনি তোমার সাথে কথা বলছেন।' },
  { title: 'দৈনিক দোয়া শেখা', category: 'Islamic Practices', subcategory: 'দোয়া', iconKey: 'sparkles', pointsValue: 3, frequency: 'DAILY', tier: 1, minAge: null, maxAge: null, description: 'আজ একটি ছোট দোয়া শিখে পড়া।', learningPrompt: 'দোয়া হলো ছোট প্রার্থনা — আল্লাহ প্রতিটি দোয়া শোনেন, তাঁকে ডাকলে তিনি উত্তর দেন।' },
  { title: 'সকালের আজকার', category: 'Islamic Practices', subcategory: 'আজকার', iconKey: 'sunrise', pointsValue: 3, frequency: 'DAILY', dueTime: '07:00', tier: 1, minAge: 9, maxAge: 99, description: 'সকালের আজকার পড়ার অভ্যাস।', learningPrompt: 'সকালে আল্লাহর স্মরণ দিনের শুরুতেই তাঁর আশ্রয় চায় — এটি মনকে প্রশান্ত রাখে।' },
  { title: 'সন্ধ্যার আজকার', category: 'Islamic Practices', subcategory: 'আজকার', iconKey: 'sunset', pointsValue: 3, frequency: 'DAILY', dueTime: '18:30', tier: 1, minAge: 9, maxAge: 99, description: 'সন্ধ্যার আজকার পড়ার অভ্যাস।', learningPrompt: 'সন্ধ্যায় আজকার পড়লে আল্লাহর হেফাজতে রাত কাটে — মন ভয়মুক্ত থাকে।' },
  { title: 'ছোট সূরা মুখস্থ', category: 'Islamic Practices', subcategory: 'কুরআন মুখস্থ', iconKey: 'brain', pointsValue: 5, frequency: 'DAILY', tier: 1, minAge: null, maxAge: null, description: 'ছোট একটি সূরা মুখস্থ করার অনুশীলন।', learningPrompt: 'মুখস্থ করা সূরা অন্তরে থাকে — যখন মনে পড়ে তখনই পড়তে পারো, আল্লাহর কালাম সবসময় সাথে থাকে।' },
  { title: 'ইসলামি গল্প পড়া/শোনা', category: 'Islamic Practices', subcategory: 'ইসলামি শিক্ষা', iconKey: 'graduation-cap', pointsValue: 3, frequency: 'DAILY', tier: 1, minAge: null, maxAge: null, description: 'একটি ইসলামি গল্প বা শিক্ষা শোনা।', learningPrompt: 'গল্প থেকে শেখা জ্ঞান সহজে মনে থাকে — বিশেষ করে সত্য গল্প থেকে আদর্শ নেওয়া যায়।' },

  // ─── B. ইসলামি চরিত্র (Tier 2) ───────────────────────────────────────
  { title: 'সত্য কথা বলা', category: 'Character & Manners', subcategory: 'সততা', iconKey: 'shield-check', pointsValue: 4, frequency: 'DAILY', tier: 2, minAge: null, maxAge: null, description: 'সারাদিন সব কথায় সত্য বলা।', learningPrompt: 'সত্য কথা বললে আল্লাহ ও মানুষ উভয়ের কাছে সম্মান বাড়ে — নবীজি সবসময় সত্য বলতেন।' },
  { title: 'কোমল ভাষায় কথা বলা', category: 'Character & Manners', subcategory: 'আদব', iconKey: 'heart', pointsValue: 3, frequency: 'DAILY', tier: 2, minAge: null, maxAge: null, description: 'কঠোর বা আঘাতমূলক কথা এড়িয়ে কোমল কথা বলা।', learningPrompt: 'কোমল কথা অন্যের মনকে ভালো করে — নবীজি বলেছেন এটি একটি সাদাকাহ।' },
  { title: 'বাবা-মা ও বয়োজ্যেষ্ঠদের সম্মান', category: 'Character & Manners', subcategory: 'সম্মান', iconKey: 'hand-heart', pointsValue: 4, frequency: 'DAILY', tier: 2, minAge: null, maxAge: null, description: 'বাবা-মা ও বয়োজ্যেষ্ঠদের সম্মান করা।', learningPrompt: 'বাবা-মা আল্লাহর পরেই আমাদের সবচেয়ে বড় উপকারী — তাদের সম্মান করা আল্লাহর নির্দেশ।' },
  { title: 'ভাই-বোনের সাথে দয়া', category: 'Character & Manners', subcategory: 'দয়া', iconKey: 'heart', pointsValue: 4, frequency: 'DAILY', tier: 2, minAge: null, maxAge: null, description: 'ভাই-বোনের প্রতি দয়া ও ভালোবাসা দেখানো।', learningPrompt: 'ভাই-বোন আল্লাহর দান — তাদের সাথে দয়া করলে আল্লাহও তোমাকে দয়া করেন।' },
  { title: 'রাগ নিয়ন্ত্রণ', category: 'Character & Manners', subcategory: 'ধৈর্য', iconKey: 'hourglass', pointsValue: 3, frequency: 'DAILY', tier: 2, minAge: null, maxAge: null, description: 'কঠিন মুহূর্তে রাগ নিয়ন্ত্রণে রাখা।', learningPrompt: 'রাগের সময় চুপ থাকা শক্তিশালী মানুষের কাজ — নবীজি বলেছেন সত্যিকারের বীর সে যে নিজেকে নিয়ন্ত্রণ করে।' },
  { title: 'ভুল হলে ক্ষমা চাওয়া', category: 'Character & Manners', subcategory: 'ক্ষমা', iconKey: 'handshake', pointsValue: 4, frequency: 'DAILY', tier: 2, minAge: null, maxAge: null, description: 'কাউকে কষ্ট দিলে আন্তরিকভাবে ক্ষমা চাওয়া।', learningPrompt: 'ভুল স্বীকার করে ক্ষমা চাওয়া বীরত্ব — আল্লাহ তওবা কবুল করেন এবং ভালোবাসেন।' },
  { title: 'ক্ষমা করা ও শান্তি স্থাপন', category: 'Character & Manners', subcategory: 'ক্ষমা', iconKey: 'handshake', pointsValue: 4, frequency: 'DAILY', tier: 2, minAge: null, maxAge: null, description: 'অন্যকে ক্ষমা করা ও শান্তি স্থাপন করা।', learningPrompt: 'ক্ষমা করলে মন হালকা হয় এবং সম্পর্ক মজবুত হয় — আল্লাহ ক্ষমাশীলদের ভালোবাসেন।' },
  { title: 'ওয়াদা রাখা ও জিনিস ফেরত দেওয়া', category: 'Character & Manners', subcategory: 'আমানত', iconKey: 'shield-check', pointsValue: 3, frequency: 'DAILY', tier: 2, minAge: null, maxAge: null, description: 'ওয়াদা রাখা এবং ধার নেওয়া জিনিস ফেরত দেওয়া।', learningPrompt: 'ওয়াদা রাখা মুমিনের চিহ্ন — অন্যের উপর ভরসা রাখা যায় এবং আল্লাহ আমানতদারদের পছন্দ করেন।' },

  // ─── C. পারিবারিক দায়িত্ব (Tier 3) ──────────────────────────────────
  { title: 'বাবা-মাকে সাহায্য করা', category: 'Family Responsibilities', subcategory: 'পারিবারিক', iconKey: 'hand-heart', pointsValue: 3, frequency: 'DAILY', tier: 3, minAge: null, maxAge: null, description: 'বয়স-উপযোগী একটি কাজে বাবা-মাকে সাহায্য করা।', learningPrompt: 'বাবা-মাকে সাহায্য করা জান্নাতের রাস্তা — প্রতিটি ছোট সাহায্য আল্লাহর কাছে গণ্য।' },
  { title: 'নিজের জিনিস গোছানো', category: 'Family Responsibilities', subcategory: 'পরিচ্ছন্নতা', iconKey: 'package', pointsValue: 2, frequency: 'DAILY', tier: 3, minAge: null, maxAge: null, description: 'নিজের জিনিসপত্র গুছিয়ে রাখা।', learningPrompt: 'পরিচ্ছন্নতা ঈমানের অংশ — আল্লাহ পরিচ্ছন্নতা পছন্দ করেন, তাই নিজের জিনিস গোছানো ইবাদত।' },
  { title: 'খেলা/খাওয়ার পর পরিষ্কার করা', category: 'Family Responsibilities', subcategory: 'পরিচ্ছন্নতা', iconKey: 'broom', pointsValue: 2, frequency: 'DAILY', tier: 3, minAge: null, maxAge: null, description: 'খেলা বা খাওয়ার পর জায়গা পরিষ্কার করা।', learningPrompt: 'নিজের ব্যবহৃত জায়গা পরিষ্কার রাখা অন্যের প্রতি ভালোবাসা — পরিবারের সবার কাজ সহজ হয়।' },
  { title: 'ছোট ভাই-বোনকে সাহায্য', category: 'Family Responsibilities', subcategory: 'পারিবারিক', iconKey: 'hand-heart', pointsValue: 3, frequency: 'DAILY', tier: 3, minAge: 6, maxAge: 99, description: 'ছোট ভাই-বোনকে কোনো কাজে সাহায্য করা।', learningPrompt: 'ছোট ভাই-বোনকে সাহায্য করা আল্লাহর কাছে প্রিয় — তুমি তাদের জন্য রোল মডেল।' },
  { title: 'পারিবারিক দায়িত্ব পালন', category: 'Family Responsibilities', subcategory: 'পারিবারিক', iconKey: 'check', pointsValue: 3, frequency: 'DAILY', tier: 3, minAge: null, maxAge: null, description: 'নির্ধারিত পারিবারিক দায়িত্ব সম্পন্ন করা।', learningPrompt: 'পরিবারের দায়িত্ব নেওয়া পরিণত মানুষের লক্ষণ — প্রতিটি সদস্য একে অপরের উপর নির্ভরশীল।' },

  // ─── D. শিক্ষা ও বিকাশ (Tier 3-4) ────────────────────────────────────
  { title: 'স্কুল/মাদ্রাসার প্রস্তুতি', category: 'Education & Development', subcategory: 'স্কুল', iconKey: 'backpack', pointsValue: 2, frequency: 'WEEKDAYS', dueTime: '20:30', tier: 3, minAge: null, maxAge: null, description: 'পরের দিনের জন্য ব্যাগ ও প্রস্তুতি নেওয়া।', learningPrompt: 'আগামীকালের প্রস্তুতি আজ নিলে কাল সকালে শান্ত থাকা যায় — আল্লাহ পরিকল্পনাকারীদের ভালোবাসেন।' },
  { title: 'হোমওয়ার্ক সম্পন্ন করা', category: 'Education & Development', subcategory: 'হোমওয়ার্ক', iconKey: 'pencil', pointsValue: 3, frequency: 'WEEKDAYS', dueTime: '17:00', tier: 3, minAge: null, maxAge: null, description: 'আজকের হোমওয়ার্ক সম্পন্ন করা।', learningPrompt: 'জ্ঞান অর্জন প্রতিটি মুসলিমের উপর ফরজ — হোমওয়ার্ক সেই জ্ঞানের অংশ, তাই ইবাদত।' },
  { title: 'উপকারী বই পড়া', category: 'Education & Development', subcategory: 'পড়া', iconKey: 'book', pointsValue: 3, frequency: 'DAILY', dueTime: '18:00', tier: 4, minAge: null, maxAge: null, description: 'অন্তত ২০ মিনিট উপকারী বই পড়া।', learningPrompt: 'বই পড়লে মন প্রশস্ত হয় এবং নতুন জগত খোলে — যে জ্ঞান অর্জন করে সে আল্লাহর কাছে সম্মানিত।' },
  { title: 'নতুন কিছু শেখা', category: 'Education & Development', subcategory: 'শেখা', iconKey: 'graduation-cap', pointsValue: 3, frequency: 'DAILY', tier: 4, minAge: null, maxAge: null, description: 'আজ নতুন কিছু উপকারী শেখা।', learningPrompt: 'প্রতিদিন একটু নতুন শিখলে জীবন সমৃদ্ধ হয় — আল্লাহ জ্ঞান অর্জনকারীদের উচ্চ মর্যাদা দেন।' },
  { title: 'দক্ষতা অনুশীলন', category: 'Education & Development', subcategory: 'দক্ষতা', iconKey: 'wrench', pointsValue: 3, frequency: 'DAILY', tier: 4, minAge: null, maxAge: null, description: 'যে দক্ষতা শিখছ তার অনুশীলন করা।', learningPrompt: 'যে দক্ষতা বারবার অনুশীলন করলে তা শক্ত হয় — ধৈর্য ধরলে আল্লাহ তার পথ সহজ করেন।' },

  // ─── E. স্বাস্থ্য ও আত্মনিয়ন্ত্রণ (Tier 3-4) ──────────────────────────
  { title: 'দাঁত মাজা ও পরিচ্ছন্নতা', category: 'Health & Self-Discipline', subcategory: 'পরিচ্ছন্নতা', iconKey: 'sparkles', pointsValue: 2, frequency: 'DAILY', dueTime: '07:00', tier: 3, minAge: null, maxAge: null, description: 'দাঁত মাজা ও ব্যক্তিগত পরিচ্ছন্নতা বজায় রাখা।', learningPrompt: 'পরিচ্ছন্নতা স্বাস্থ্য ও আত্মবিশ্বাস দুটোই বাড়ায় — নবীজি মিসওয়াক ব্যবহার করতেন।' },
  { title: 'সঠিক খাবার খাওয়া', category: 'Health & Self-Discipline', subcategory: 'খাদ্যাভ্যাস', iconKey: 'utensils', pointsValue: 2, frequency: 'DAILY', tier: 3, minAge: null, maxAge: null, description: 'পরিমিত ও স্বাস্থ্যকর খাবার খাওয়া।', learningPrompt: 'আল্লাহ আমাদের শরীর আমানত দিয়েছেন — এর যত্ন নেওয়া দায়িত্ব, পরিমিত খাওয়া সুন্নাহ।' },
  { title: 'পর্যাপ্ত পানি পান করা', category: 'Health & Self-Discipline', subcategory: 'স্বাস্থ্য', iconKey: 'droplet', pointsValue: 2, frequency: 'DAILY', tier: 3, minAge: null, maxAge: null, description: 'দিনে পর্যাপ্ত পানি পান করা।', learningPrompt: 'পানি জীবনের উৎস — আল্লাহর একটি বড় নিয়ামত, তাঁর শুকরিয়া আদায় করে পরিমিত পান করো।' },
  { title: 'ঘুমের রুটিন মানা', category: 'Health & Self-Discipline', subcategory: 'ঘুম', iconKey: 'moon', pointsValue: 2, frequency: 'DAILY', dueTime: '21:00', tier: 3, minAge: null, maxAge: null, description: 'নির্দিষ্ট সময়ে ঘুমাতে যাওয়ার রুটিন মানা।', learningPrompt: 'সময়মতো ঘুমালে সকালে সতেজ থাকা যায় — ফজরের নামাজের জন্যও সহজ হয়।' },
  { title: 'স্ক্রিন-টাইম নিয়ম মানা', category: 'Health & Self-Discipline', subcategory: 'আত্মনিয়ন্ত্রণ', iconKey: 'monitor', pointsValue: 3, frequency: 'DAILY', tier: 4, minAge: null, maxAge: null, description: 'পরিবারের স্ক্রিন-টাইম নিয়ম মেনে চলা।', learningPrompt: 'স্ক্রিন সীমিত রাখলে সময় ও মন দুটোই উপকারে কাজে লাগে — সময় আল্লাহর আমানত।' },
  { title: 'বাইরে খেলা বা শারীরিক কসরত', category: 'Health & Self-Discipline', subcategory: 'ব্যায়াম', iconKey: 'activity', pointsValue: 3, frequency: 'DAILY', tier: 4, minAge: null, maxAge: null, description: 'অন্তত ৩০ মিনিট বাইরে খেলা বা শারীরিক কসরত।', learningPrompt: 'শরীর সুস্থ রাখলে ইবাদত ও পড়াশোনা দুটোই ভালো হয় — শক্তিশালী মুমিন দুর্বল মুমিন অপেক্ষা উত্তম।' },

  // ─── F. দান ও সমাজসেবা (Tier 4-5) ───────────────────────────────────
  { title: 'খেলনা/জিনিস ভাগ করা', category: 'Generosity & Community', subcategory: 'ভাগ করা', iconKey: 'gift', pointsValue: 4, frequency: 'DAILY', tier: 4, minAge: 3, maxAge: 12, description: 'স্বেচ্ছায় নিজের খেলনা বা জিনিস ভাগ করা।', learningPrompt: 'ভাগ করে নিলে আনন্দ দ্বিগুণ হয় — আল্লাহ দানশীল বান্দাদের ভালোবাসেন।' },
  { title: 'কাউকে সাহায্য করা (স্বেচ্ছায়)', category: 'Generosity & Community', subcategory: 'সাহায্য', iconKey: 'hand-heart', pointsValue: 4, frequency: 'DAILY', tier: 4, minAge: null, maxAge: null, description: 'প্রত্যাশা ছাড়া কাউকে সাহায্য করা।', learningPrompt: 'প্রত্যাশা ছাড়া সাহায্য করা সবচেয়ে উত্তম সাদাকাহ — আল্লাহ তোমার প্রতিটি ছোট সাহায্য দেখেন।' },
  { title: 'সাদাকাহর জন্য তারা সঞ্চয়', category: 'Generosity & Community', subcategory: 'সাদাকাহ', iconKey: 'star', pointsValue: 5, frequency: 'WEEKLY', tier: 5, minAge: 9, maxAge: 99, description: 'সাদাকাহর জন্য কিছু তারা সঞ্চয় করা।', learningPrompt: 'গরিবের জন্য সঞ্চয় করা আল্লাহর কাছে বহুগুণ বৃদ্ধি পায় — তিনি বলেছেন তাঁকে ভালো ঋণ দাও।' },
  { title: 'বয়োজ্যেষ্ঠ আত্মীয়কে সাহায্য', category: 'Generosity & Community', subcategory: 'সাহায্য', iconKey: 'hand-heart', pointsValue: 4, frequency: 'WEEKLY', tier: 5, minAge: 6, maxAge: 99, description: 'বয়োজ্যেষ্ঠ আত্মীয়কে সাহায্য করা।', learningPrompt: 'বয়োজ্যেষ্ঠদের সেবা করা জান্নাতের কাছাকাছি নিয়ে যায় — তাদের অভিজ্ঞতা ও দোয়া পরিবারের জন্য আশীর্বাদ।' },
  { title: 'পারিবারিক দানমূলক কাজে অংশ', category: 'Generosity & Community', subcategory: 'সাদাকাহ', iconKey: 'heart', pointsValue: 5, frequency: 'CUSTOM', scheduledDays: ['FRI'], tier: 5, minAge: null, maxAge: null, description: 'পরিবার-অনুমোদিত দানমূলক কাজে অংশ নেওয়া।', learningPrompt: 'একসাথে দান করলে পরিবারে রহমত নাজিল হয় — এটি শিশুদের দানশীলতা শেখায় এবং সমাজকে বদলায়।' },
] as const

/**
 * Reward categories — per spec §4.2
 */
export const REWARD_CATEGORIES = [
  { key: 'EXPERIENCE', label: 'অভিজ্ঞতা', color: 'emerald', icon: 'map', description: 'পারিবারিক আনন্দ, বেড়াতে যাওয়া, একসাথে সময়।' },
  { key: 'LEARNING', label: 'শেখা ও সৃজন', color: 'amber', icon: 'book', description: 'বই, আর্ট সাপ্লাই, নতুন দক্ষতা।' },
  { key: 'PRIVILEGE', label: 'বিশেষ সুবিধা', color: 'sky', icon: 'star', description: 'বেডটাইম স্টোরি, মুভি, অতিরিক্ত সময়।' },
  { key: 'FOOD', label: 'খাবার', color: 'rose', icon: 'utensils', description: 'আইসক্রিম, পিৎজা, রেস্টুরেন্ট — সীমিত।' },
] as const

export const REWARD_LIBRARY = [
  // ─── Experiences ────────────────────────────────────────────────────
  { title: 'ফ্যামিলি গেম নাইট', iconKey: 'dice', requiredPoints: 50, description: 'পরিবার মিলে গেম খেলা।', category: 'EXPERIENCE', maxPerWeek: 2, maxPerMonth: null, cooldownDays: 2, estimatedCost: 0 },
  { title: 'পার্কে খেলতে যাওয়া', iconKey: 'map', requiredPoints: 35, description: 'পার্কে খেলতে যাওয়া।', category: 'EXPERIENCE', maxPerWeek: 3, maxPerMonth: null, cooldownDays: 1, estimatedCost: 0 },
  { title: 'পারিবারিক বেড়াতে যাওয়া', iconKey: 'map', requiredPoints: 150, description: 'পরিবারের সাথে বেড়াতে যাওয়া।', category: 'EXPERIENCE', maxPerWeek: null, maxPerMonth: 1, cooldownDays: 7, estimatedCost: 500 },
  { title: 'সাইকেল চালানো / বাইরে খেলা', iconKey: 'activity', requiredPoints: 30, description: 'বাইরে সাইকেল চালানো বা খেলা।', category: 'EXPERIENCE', maxPerWeek: 3, maxPerMonth: null, cooldownDays: 1, estimatedCost: 0 },
  { title: 'বাবা-মায়ের সাথে গল্পের সময়', iconKey: 'book', requiredPoints: 25, description: 'বাবা-মায়ের সাথে গল্প পড়ার বিশেষ সময়।', category: 'EXPERIENCE', maxPerWeek: 5, maxPerMonth: null, cooldownDays: 0, estimatedCost: 0 },
  { title: 'পরিবারের সাথে কার্যক্রম বেছে নেওয়া', iconKey: 'calendar', requiredPoints: 60, description: 'সপ্তাহের শেষে একটি কার্যক্রম বেছে নেওয়া।', category: 'EXPERIENCE', maxPerWeek: 1, maxPerMonth: null, cooldownDays: 3, estimatedCost: 200 },
  { title: 'সিনেমা/কার্টুন দেখা', iconKey: 'star', requiredPoints: 45, description: 'পছন্দের সিনেমা বা কার্টুন দেখা।', category: 'EXPERIENCE', maxPerWeek: 1, maxPerMonth: 4, cooldownDays: 3, estimatedCost: 0 },

  // ─── Learning & Creativity ──────────────────────────────────────────
  { title: 'নতুন একটি বই', iconKey: 'book', requiredPoints: 70, description: 'নতুন একটি বই।', category: 'LEARNING', maxPerWeek: null, maxPerMonth: 2, cooldownDays: 7, estimatedCost: 300 },
  { title: 'আর্ট সাপ্লাই', iconKey: 'palette', requiredPoints: 80, description: 'নতুন আর্ট সাপ্লাই বেছে নেওয়া।', category: 'LEARNING', maxPerWeek: null, maxPerMonth: 1, cooldownDays: 14, estimatedCost: 400 },
  { title: 'ক্রাফট কার্যক্রম', iconKey: 'palette', requiredPoints: 40, description: 'পরিবারের সাথে ক্রাফট বানানো।', category: 'LEARNING', maxPerWeek: 2, maxPerMonth: null, cooldownDays: 3, estimatedCost: 100 },
  { title: 'পারিবারিক শেখার প্রজেক্ট', iconKey: 'graduation-cap', requiredPoints: 100, description: 'একসাথে নতুন কিছু শেখার প্রজেক্ট।', category: 'LEARNING', maxPerWeek: null, maxPerMonth: 1, cooldownDays: 14, estimatedCost: 200 },

  // ─── Privileges ─────────────────────────────────────────────────────
  { title: 'বেডটাইম স্টোরি বেছে নেওয়া', iconKey: 'book', requiredPoints: 20, description: 'রাতের গল্প নিজে বেছে নেওয়া।', category: 'PRIVILEGE', maxPerWeek: 3, maxPerMonth: null, cooldownDays: 1, estimatedCost: 0 },
  { title: 'ফ্যামিলি মুভি বেছে নেওয়া', iconKey: 'star', requiredPoints: 35, description: 'পরিবারের মুভি নাইটে মুভি বেছে নেওয়া।', category: 'PRIVILEGE', maxPerWeek: 1, maxPerMonth: null, cooldownDays: 3, estimatedCost: 0 },
  { title: 'অতিরিক্ত খেলার সময়', iconKey: 'star', requiredPoints: 25, description: '৩০ মিনিট অতিরিক্ত খেলার সময়।', category: 'PRIVILEGE', maxPerWeek: 3, maxPerMonth: null, cooldownDays: 1, estimatedCost: 0 },
  { title: 'শখের জন্য অতিরিক্ত সময়', iconKey: 'star', requiredPoints: 30, description: 'পছন্দের শখের জন্য অতিরিক্ত সময়।', category: 'PRIVILEGE', maxPerWeek: 2, maxPerMonth: null, cooldownDays: 2, estimatedCost: 0 },

  // ─── Food Treats (limited) ──────────────────────────────────────────
  { title: 'আইসক্রিম', iconKey: 'gift', requiredPoints: 20, description: 'পছন্দের আইসক্রিম।', category: 'FOOD', maxPerWeek: 1, maxPerMonth: 2, cooldownDays: 4, estimatedCost: 100 },
  { title: 'চকলেট', iconKey: 'gift', requiredPoints: 15, description: 'একটি চকলেট।', category: 'FOOD', maxPerWeek: 1, maxPerMonth: 2, cooldownDays: 4, estimatedCost: 50 },
  { title: 'বাসায় পিৎজা', iconKey: 'utensils', requiredPoints: 40, description: 'বাসায় পিৎজা অর্ডার করা হবে।', category: 'FOOD', maxPerWeek: 1, maxPerMonth: 2, cooldownDays: 5, estimatedCost: 400 },
  { title: 'বাসায় বার্গার', iconKey: 'utensils', requiredPoints: 30, description: 'বাসায় বার্গার বানানো হবে।', category: 'FOOD', maxPerWeek: 1, maxPerMonth: 2, cooldownDays: 5, estimatedCost: 200 },
  { title: 'বিকেলের নাস্তা রেস্টুরেন্টে', iconKey: 'utensils', requiredPoints: 60, description: 'বিকেলে রেস্টুরেন্টে নাস্তা।', category: 'FOOD', maxPerWeek: null, maxPerMonth: 1, cooldownDays: 14, estimatedCost: 300 },
  { title: 'রেস্টুরেন্টে ডিনার', iconKey: 'utensils', requiredPoints: 100, description: 'পরিবারের সাথে রেস্টুরেন্টে রাতের খাবার।', category: 'FOOD', maxPerWeek: null, maxPerMonth: 1, cooldownDays: 14, estimatedCost: 800 },
] as const

/**
 * সাপ্তাহিক চ্যালেঞ্জ সাজেশন — বাবা-মা এক ক্লিকে যোগ করতে পারবেন।
 */
export const CHALLENGE_SUGGESTIONS = [
  {
    name: 'ধারাবাহিক সকালের রুটিন',
    description: 'এই সপ্তাহে প্রতিদিন সকালের কাজগুলো (নামাজ, কুরআন, বিছানা গোছানো) সম্পন্ন করো।',
    targetPercent: 80,
    rewardTitle: 'বাসায় পিৎজা',
  },
  {
    name: 'প্রতিদিন কুরআন পড়া',
    description: 'এই সপ্তাহে প্রতিদিন কুরআন তিলাওয়াত করো।',
    targetPercent: 80,
    rewardTitle: 'আইসক্রিম',
  },
  {
    name: 'সততা সপ্তাহ',
    description: 'এই সপ্তাহে প্রতিদিন সত্য কথা বলার অভ্যাস গড়ো।',
    targetPercent: 80,
    rewardTitle: 'ফ্যামিলি গেম নাইট',
  },
  {
    name: 'পরিবারে সাহায্য',
    description: 'প্রতিদিন পরিবারের কাউকে একটি কাজে সাহায্য করো।',
    targetPercent: 80,
    rewardTitle: 'পার্কে খেলতে যাওয়া',
  },
  {
    name: 'পড়াশোনার ধারাবাহিকতা',
    description: 'প্রতিদিন অন্তত ২০ মিনিট বই পড়ো।',
    targetPercent: 80,
    rewardTitle: 'নতুন একটি বই',
  },
  {
    name: 'ধৈর্যের অনুশীলন',
    description: 'কঠিন মুহূর্তে ধৈর্য ধরে শান্ত থাকার চেষ্টা করো।',
    targetPercent: 80,
    rewardTitle: 'সিনেমা/কার্টুন দেখা',
  },
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
  droplet: 'Droplet',
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
  // স্বাস্থ্য
  monitor: 'MonitorSmartphone',
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

/**
 * Sadaqah causes — parent-approved charitable causes for children.
 * Per spec §6.1: examples include supporting madrasa, educational materials,
 * helping a family, food/relief initiative, or parent-approved project.
 */
export const SADAQAH_CAUSES = [
  { title: 'মাদ্রাসা সহায়তা', description: 'একটি মাদ্রাসাকে সাহায্য করা।', iconKey: 'mosque' },
  { title: 'গরিব শিশুদের শিক্ষা', description: 'অসহায় শিশুদের শিক্ষার জন্য অবদান।', iconKey: 'graduation-cap' },
  { title: 'অসহায় পরিবার', description: 'অসহায় একটি পরিবারকে সাহায্য করা।', iconKey: 'heart' },
  { title: 'খাদ্য সহায়তা', description: 'খাদ্য বিতরণ বা ত্রাণ কর্মসূচিতে অবদান।', iconKey: 'utensils' },
  { title: 'প্রাকৃতিক দুর্যোগ ত্রাণ', description: 'বন্যা/ঘূর্ণিঝড় বা দুর্যোগ-আক্রান্তদের সাহায্য।', iconKey: 'gift' },
  { title: 'মসজিদ নির্মাণ/সংস্কার', description: 'মসজিদ নির্মাণ বা সংস্কারে অবদান।', iconKey: 'mosque' },
  { title: 'স্বাস্থ্য সেবা', description: 'অসহায় রোগীদের চিকিৎসায় সাহায্য।', iconKey: 'activity' },
  { title: 'অন্যান্য (পরিবার-অনুমোদিত)', description: 'পরিবার কর্তৃক অনুমোদিত অন্য যেকোনো কারণ।', iconKey: 'star' },
] as const

/**
 * Phase 5 (S5.3): Family Achievement Library
 *
 * Family-wide achievements — private to each family, not a leaderboard.
 * Awarded automatically when the family crosses a meaningful threshold.
 *
 * Per spec §7C: celebrate progress privately. No public scoreboard, no
 * comparison with other families. Each badge is a memory of a moment
 * the family grew together.
 *
 * `key` is the unique identifier stored in FamilyAchievement.key.
 * `trigger` describes the auto-award condition (evaluated in planner-actions).
 */
export const FAMILY_ACHIEVEMENT_LIBRARY = [
  {
    key: 'first_week',
    name: 'প্রথম সপ্তাহ',
    description: 'পরিবার হিসেবে প্রথম সপ্তাহ আমল চর্চা করেছেন। শুরুটাই সবচেয়ে কঠিন — আল্লাহ আপনাদের বরকত দিন।',
    iconKey: 'sparkles',
    trigger: 'first_approved_task' as const,
  },
  {
    key: 'first_reflection',
    name: 'প্রথম রিফ্লেকশন',
    description: 'প্রথম সাপ্তাহিক রিফ্লেকশন সম্পন্ন করেছেন — একসাথে থেমে চিন্তা করার সুন্দর অভ্যাস।',
    iconKey: 'book-open',
    trigger: 'first_reflection' as const,
  },
  {
    key: 'first_sadaqah',
    name: 'প্রথম সাদাকাহ',
    description: 'পরিবার হিসেবে প্রথম সাদাকাহ নিশ্চিত করেছেন। আল্লাহ আপনাদের নিয়ামত বাড়িয়ে দিন।',
    iconKey: 'heart',
    trigger: 'first_sadaqah_confirmed' as const,
  },
  {
    key: 'all_milestone_month',
    name: 'একসাথে মাইলস্টোন',
    description: 'এই মাসে পরিবারের সব সন্তান মাইলস্টোন অর্জন করেছে। এটি দলগত ধারাবাহিকতার প্রমাণ।',
    iconKey: 'trophy',
    trigger: 'all_children_milestone' as const,
  },
  {
    key: 'family_service',
    name: 'পরিবারিক সেবা',
    description: 'একসাথে কোনো দানমূলক কাজে অংশ নিয়েছেন — এটি সন্তানদের জন্য জীবনের শিক্ষা।',
    iconKey: 'hand-heart',
    trigger: 'family_service_task' as const,
  },
  {
    key: 'first_incident_resolved',
    name: 'মীমাংসার পথ',
    description: 'প্রথম সমস্যা মীমাংসা করেছেন — ভুল থেকে শেখা এবং একে অপরকে ক্ষমা করার সাহস দেখিয়েছেন।',
    iconKey: 'handshake',
    trigger: 'first_incident_resolved' as const,
  },
  {
    key: 'three_reflections',
    name: 'তিন সপ্তাহ রিফ্লেকশন',
    description: 'টানা তিন সপ্তাহ রিফ্লেকশন সম্পন্ন করেছেন — অভ্যাসে পরিণত হচ্ছে।',
    iconKey: 'book',
    trigger: 'three_consecutive_reflections' as const,
  },
  {
    key: 'first_challenge_completed',
    name: 'প্রথম চ্যালেঞ্জ',
    description: 'পরিবারের প্রথম সাপ্তাহিক চ্যালেঞ্জ সম্পন্ন হয়েছে — একসাথে লক্ষ্য পূরণের আনন্দ।',
    iconKey: 'target',
    trigger: 'first_challenge_completed' as const,
  },
] as const

/**
 * Phase D (D1): Child Achievement Library
 *
 * 12 child-level achievements, auto-awarded based on actions.
 * Each has a `trigger` that determines when the evaluation engine checks it.
 *
 * Triggers:
 *   task_approved    — evaluated after every APPROVED task review
 *   sadaqah_requested — evaluated after a child requests sadaqah
 *   milestone_qualified — evaluated after monthly milestone engine runs
 *
 * The engine (achievement-actions.ts) checks the condition and awards
 * the badge if satisfied + not already awarded (idempotent via
 * @@unique([achievementId, childId])).
 *
 * Per spec §7C: celebrate progress privately. No leaderboard, no
 * sibling comparison. Each badge is a personal milestone.
 */
export const CHILD_ACHIEVEMENT_LIBRARY = [
  {
    key: 'first_task',
    name: 'প্রথম পদক্ষেপ',
    description: 'তোমার প্রথম কাজ সম্পন্ন! যাত্রা শুরু হলো। 🌟',
    iconKey: 'sparkles',
    trigger: 'task_approved' as const,
    condition: { type: 'total_approved', min: 1 },
  },
  {
    key: 'ten_tasks',
    name: 'দশ পদক্ষেপ',
    description: '১০টি কাজ সম্পন্ন। ধারাবাহিকতা শুরু! ✨',
    iconKey: 'check',
    trigger: 'task_approved' as const,
    condition: { type: 'total_approved', min: 10 },
  },
  {
    key: 'first_streak_3',
    name: '৩ দিন ধারাবাহিক',
    description: 'টানা ৩ দিন কাজ সম্পন্ন! 🔥',
    iconKey: 'flame',
    trigger: 'task_approved' as const,
    condition: { type: 'streak', min: 3 },
  },
  {
    key: 'first_streak_7',
    name: 'এক সপ্তাহ!',
    description: 'টানা ৭ দিন কাজ সম্পন্ন! অভ্যাস হয়ে ওঠছে। 🔥🔥',
    iconKey: 'flame',
    trigger: 'task_approved' as const,
    condition: { type: 'streak', min: 7 },
  },
  {
    key: 'salah_5_a_day',
    name: 'এক দিনে ৫ নামাজ',
    description: 'এক দিনে সব নামাজ সম্পন্ন! আল্লাহ তোমাকে বরকত দিন। 🕌',
    iconKey: 'mosque',
    trigger: 'task_approved' as const,
    condition: { type: 'category_in_day', category: 'Islamic Practices', subcategory: 'নামাজ', min: 5 },
  },
  {
    key: 'quran_7_days',
    name: 'কুরআন প্রেমিক',
    description: 'টানা ৭ দিন কুরআন তিলাওয়াত! 📖',
    iconKey: 'book-open',
    trigger: 'task_approved' as const,
    condition: { type: 'subcategory_streak', subcategory: 'কুরআন', min: 7 },
  },
  {
    key: 'kindness_week',
    name: 'কোমল সপ্তাহ',
    description: 'এই সপ্তাহে ৩ দিন কোমল আচরণ করেছ! 💛',
    iconKey: 'heart',
    trigger: 'task_approved' as const,
    condition: { type: 'category_in_week', category: 'Character & Manners', min: 3 },
  },
  {
    key: 'helping_hand',
    name: 'সাহায্যকারী হাত',
    description: '১০ বার বাবা-মাকে সাহায্য করেছ! 🤝',
    iconKey: 'hand-heart',
    trigger: 'task_approved' as const,
    condition: { type: 'category_total', category: 'Family Responsibilities', min: 10 },
  },
  {
    key: 'honest_tongue',
    name: 'সত্যবাদী',
    description: '২০ বার সত্য কথা বলেছ! নবীজি সবসময় সত্য বলতেন। 🛡️',
    iconKey: 'shield-check',
    trigger: 'task_approved' as const,
    condition: { type: 'subcategory_total', subcategory: 'সততা', min: 20 },
  },
  {
    key: 'first_sadaqah',
    name: 'ছোট দাতা',
    description: 'প্রথম সাদাকাহ নিবেদন! আল্লাহ কবুল করুন। 🤲',
    iconKey: 'gift',
    trigger: 'sadaqah_requested' as const,
    condition: { type: 'sadaqah_count', min: 1 },
  },
  {
    key: 'first_milestone',
    name: 'মাসিক মাইলস্টোন',
    description: 'এই মাসের মাইলস্টোন অর্জিত! ধারাবাহিকতার জয়! 🏆',
    iconKey: 'trophy',
    trigger: 'milestone_qualified' as const,
    condition: { type: 'milestone_qualified' },
  },
  {
    key: 'fifty_tasks',
    name: 'অভ্যাস পাওয়া',
    description: '৫০টি কাজ সম্পন্ন! তুমি এখন একজন অভ্যাসবান মানুষ। ⭐',
    iconKey: 'star',
    trigger: 'task_approved' as const,
    condition: { type: 'total_approved', min: 50 },
  },
] as const

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
