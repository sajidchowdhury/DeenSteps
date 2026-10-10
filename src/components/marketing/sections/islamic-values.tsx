import { Heart, BookOpen, HandHeart, Sparkles, ShieldCheck } from 'lucide-react'

const VALUES = [
  {
    icon: BookOpen,
    title: 'নামাজ ও কুরআন',
    description: 'অপশনাল টেমপ্লেট সন্তানকে উৎসাহিত করে প্রতিদিন নামাজ আর কুরআন পড়তে — আপনার সন্তানের বয়স ও সক্ষমতা অনুযায়ী।',
  },
  {
    icon: Heart,
    title: 'সুন্দর চরিত্র',
    description: 'সততা, দয়া, ধৈর্য আর কৃতজ্ঞতাও একটি অভ্যাস। দৈনিক রুটিনের মতোই সেগুলোকেও উদযাপন করুন।',
  },
  {
    icon: HandHeart,
    title: 'সাহায্য ও দায়িত্ব',
    description: 'সন্তানকে উৎসাহিত করুন পরিবারে সাহায্য করতে আর বয়স-উপযোগী দৈনন্দিন দায়িত্ব নিতে।',
  },
  {
    icon: Sparkles,
    title: 'অন্তর্নিহিত উৎসাহ',
    description: 'পুরস্কার হলো উৎসাহ আর অভ্যাস গড়ার টুল — কখনোই আন্তরিক নিয়ত বা বাবা-মায়ের পথনির্দেশনার বিকল্প নয়।',
  },
]

export function IslamicValuesSection() {
  return (
    <section id="islamic-values" className="relative overflow-hidden border-t border-border bg-emerald-950 py-20 text-emerald-50">
      <div
        className="absolute inset-0 opacity-10"
        aria-hidden="true"
        style={{
          backgroundImage:
            'radial-gradient(circle at 25% 25%, oklch(0.85 0.14 85) 2px, transparent 2px), radial-gradient(circle at 75% 75%, oklch(0.85 0.14 85) 2px, transparent 2px)',
          backgroundSize: '40px 40px',
          backgroundPosition: '0 0, 20px 20px',
        }}
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-amber-300">ইসলামি মূল্যবোধ</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            ঈমান, চরিত্র আর দায়িত্বশীলতা গড়ে তুলি
          </h2>
          <p className="mt-4 text-lg text-emerald-100/80">
            দীনস্টেপস বাবা-মাকে সাহায্য করে সন্তানের মধ্যে নামাজের অভ্যাস, কুরআন শেখা, সততা, দয়া, কৃতজ্ঞতা, সাহায্য আর ব্যক্তিগত দায়িত্বশীলতা গড়তে — প্রতিটি পরিবারের রীতি অনুযায়ী।
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v) => {
            const Icon = v.icon
            return (
              <div
                key={v.title}
                className="rounded-2xl border border-emerald-800/50 bg-emerald-900/40 p-6 backdrop-blur-sm"
              >
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-amber-400/20 text-amber-300">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-emerald-50">{v.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-emerald-100/75">{v.description}</p>
              </div>
            )
          })}
        </div>

        <div className="mx-auto mt-12 max-w-3xl rounded-2xl border border-amber-400/30 bg-amber-400/5 p-6 text-center">
          <ShieldCheck className="mx-auto h-8 w-8 text-amber-300" />
          <p className="mt-3 text-base leading-relaxed text-emerald-50">
            <strong className="font-semibold text-amber-200">পয়েন্ট কখনোই ঈমান মাপে না।</strong>{' '}
            দীনস্টেপস সন্তানের ধর্মপ্রাণতা, আধ্যাত্মিক মূল্য বা আল্লাহর কাছে তার অবস্থান মাপে না। পুরস্কার হলো উৎসাহ আর অভ্যাস গড়ার টুল — আন্তরিক নিয়ত, বাবা-মায়ের পথনির্দেশনা বা ইসলামি শিক্ষার বিকল্প নয়।
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-emerald-700/50 bg-emerald-900/30 p-6 text-center">
          <p className="text-sm leading-relaxed text-emerald-100/90">
            রাসূলুল্লাহ ﷺ বলেছেন, <span className="font-medium text-amber-200">&ldquo;সবচেয়ে প্রিয় কাজ আল্লাহর কাছে তা-ই, যা ধারাবাহিকতার সাথে করা হয় — যদিও তা সামান্য হয়।&rdquo;</span> (বুখারি, মুসলিম)
          </p>
          <p className="mt-3 text-sm leading-relaxed text-emerald-100/80">
            দীনস্টেপস সেই ধারাবাহিকতা গড়ে তুলতে সাহায্য করে — একেকটি ছোট ভালো কাজ, একেকটি পদক্ষেপ। আজকের ছোট ভালো কাজ আখিরাতে বড় পুরস্কার আনে, দুনিয়ায় সুন্দর জীবন গড়ে, আর আল্লাহর ভালোবাসা অর্জন করে।
          </p>
        </div>
      </div>
    </section>
  )
}
